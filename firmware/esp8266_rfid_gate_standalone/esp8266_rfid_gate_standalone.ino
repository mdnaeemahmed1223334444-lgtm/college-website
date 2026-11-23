/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — RFID ATTENDANCE & CARD WRITER (DUAL-MODE STANDALONE)
 * ==============================================================================
 * Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 13.56MHz RFID Reader
 *   - 13.56 MHz RFID Cards / Keyfobs (Mifare Classic 1K)
 *   - USB Cable (Serial Monitor at 115200 baud)
 *
 * Current Hardware Note:
 *   Requires ONLY ESP8266, RC522, and RFID Cards. No LEDs, buzzers,
 *   or external displays are required or assumed.
 *
 * Wiring Connections:
 *   RC522 SDA / SS -> ESP8266 D2 (GPIO4)
 *   RC522 SCK      -> ESP8266 D5 (GPIO14)
 *   RC522 MOSI     -> ESP8266 D7 (GPIO13)
 *   RC522 MISO     -> ESP8266 D6 (GPIO12)
 *   RC522 RST      -> ESP8266 D1 (GPIO5)
 *   RC522 3.3V     -> ESP8266 3V3 (3.3V only! NEVER CONNECT TO 5V/VIN!)
 *   RC522 GND      -> ESP8266 GND
 *
 * OPERATING MODES (Controlled via Serial Monitor):
 *   1. ATTENDANCE MODE (Default): Automatic gate scanner that records attendance.
 *   2. WRITE MODE: Type 'WRITE <StudentCode>' in Serial Monitor and tap card
 *                  to burn data directly into Card Memory (Block 4).
 *   3. READ MODE:  Type 'READ' in Serial Monitor to inspect card UID + Block 4 data.
 *   4. DUMP MODE:  Type 'DUMP' in Serial Monitor to inspect all 16 card sectors.
 * ==============================================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ------------------------------------------------------------------------------
// USER CONFIGURATION (Set your Wi-Fi and Backend URL)
// ------------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // 2.4 GHz Wi-Fi Name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // Wi-Fi Password

const char* DEVICE_ID     = "GATE-01";                // Registered Scanner ID
const char* DEVICE_TOKEN  = "dmc_gate01_secret_key_2026"; // Device Secret Key

// Attendance Backend URL:
// Option A: Your deployed college website (e.g. "https://yourcollege.edu.bd/api/attendance/scan")
// Option B: Local development IP (e.g. "http://192.168.0.105:3000/api/attendance/scan")
// Option C: Supabase Edge Function (e.g. "https://<ref>.supabase.co/functions/v1/rfid-attendance")
const char* BACKEND_URL   = "https://hrmdc.vercel.app/api/attendance/scan";

// ------------------------------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ------------------------------------------------------------------------------
#define SS_PIN  D2   // GPIO4 - Connected to RC522 SDA
#define RST_PIN D1   // GPIO5 - Connected to RC522 RST

// Constants
const unsigned long HTTP_TIMEOUT_MS  = 8000;
const unsigned long DEBOUNCE_TIME_MS = 4000;
const byte TARGET_DATA_BLOCK         = 4;     // Sector 1, Block 0 (Block 4)

// Operational Modes
enum OperationMode {
    MODE_ATTENDANCE,
    MODE_WRITE_PENDING,
    MODE_READ_INSPECT,
    MODE_DUMP_CARD
};

// Global State
MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key defaultKey;
OperationMode currentMode = MODE_ATTENDANCE;
String pendingWriteText = "";

String lastScannedUID = "";
unsigned long lastScanMillis = 0;
unsigned long lastReconnectAttempt = 0;

// ------------------------------------------------------------------------------
// HELPER: Normalize UID to Uppercase Hex String
// ------------------------------------------------------------------------------
String getNormalizedUID(MFRC522::Uid *uid) {
    String hexUID = "";
    for (byte i = 0; i < uid->size; i++) {
        if (uid->uidByte[i] < 0x10) hexUID += "0";
        hexUID += String(uid->uidByte[i], HEX);
    }
    hexUID.toUpperCase();
    return hexUID;
}

// ------------------------------------------------------------------------------
// HELPER: Write 16 Bytes to Card Memory Block
// ------------------------------------------------------------------------------
bool writeBlockData(byte blockAddr, const String& text) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    // Authenticate with Key A
    MFRC522::StatusCode status = rfid.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(rfid.uid)
    );

    if (status != MFRC522::STATUS_OK) {
        Serial.print("AUTH ERROR: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return false;
    }

    byte buffer[16];
    memset(buffer, ' ', 16);
    size_t len = text.length();
    if (len > 16) len = 16;
    memcpy(buffer, text.c_str(), len);

    status = rfid.MIFARE_Write(blockAddr, buffer, 16);
    if (status != MFRC522::STATUS_OK) {
        Serial.print("WRITE ERROR: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return false;
    }

    return true;
}

// ------------------------------------------------------------------------------
// HELPER: Read 16 Bytes from Card Memory Block
// ------------------------------------------------------------------------------
String readBlockData(byte blockAddr) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    MFRC522::StatusCode status = rfid.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(rfid.uid)
    );

    if (status != MFRC522::STATUS_OK) {
        return "";
    }

    byte buffer[18];
    byte byteCount = sizeof(buffer);

    status = rfid.MIFARE_Read(blockAddr, buffer, &byteCount);
    if (status != MFRC522::STATUS_OK) {
        return "";
    }

    String result = "";
    for (byte i = 0; i < 16; i++) {
        if (buffer[i] >= 32 && buffer[i] <= 126) {
            result += (char)buffer[i];
        }
    }
    result.trim();
    return result;
}

// ------------------------------------------------------------------------------
// HELPER: Test Backend Connection
// ------------------------------------------------------------------------------
bool testBackendConnection() {
    String url = String(BACKEND_URL);
    bool isHttps = url.startsWith("https://");
    HTTPClient http;
    int httpCode = -1;

    if (isHttps) {
        WiFiClientSecure clientSecure;
        clientSecure.setInsecure();
        clientSecure.setTimeout(HTTP_TIMEOUT_MS);
        http.setTimeout(HTTP_TIMEOUT_MS);
        if (http.begin(clientSecure, url)) {
            http.addHeader("X-Device-Id", DEVICE_ID);
            http.addHeader("X-Device-Token", DEVICE_TOKEN);
            httpCode = http.GET();
            http.end();
        }
    } else {
        WiFiClient client;
        client.setTimeout(HTTP_TIMEOUT_MS);
        http.setTimeout(HTTP_TIMEOUT_MS);
        if (http.begin(client, url)) {
            http.addHeader("X-Device-Id", DEVICE_ID);
            http.addHeader("X-Device-Token", DEVICE_TOKEN);
            httpCode = http.GET();
            http.end();
        }
    }

    return (httpCode >= 200 && httpCode < 400);
}

// ------------------------------------------------------------------------------
// HELPER: Print Startup Banner
// ------------------------------------------------------------------------------
void printStartupBanner(bool rfidOk, bool wifiOk, bool backendOk) {
    Serial.println();
    Serial.println("====================================");
    Serial.println("COLLEGE RFID ATTENDANCE & WRITER");
    Serial.println("====================================");
    Serial.print("Device ID: ");
    Serial.println(DEVICE_ID);
    Serial.print("RFID Reader: ");
    Serial.println(rfidOk ? "INITIALIZED" : "FAILED (Check wiring)");
    Serial.print("Wi-Fi: ");
    Serial.println(wifiOk ? "CONNECTED" : "FAILED (Check credentials)");
    Serial.print("Backend: ");
    Serial.println(backendOk ? "CONNECTED" : "OFFLINE (Will retry)");
    Serial.print("Current Mode: ");
    Serial.println("ATTENDANCE (Gate Scanner)");
    Serial.println("System Status: READY");
    Serial.println("====================================");
    Serial.println("COMMANDS (Type in Serial Monitor):");
    Serial.println("  WRITE <DATA>  -> Burn Student ID to Card (e.g. WRITE DMC-2026-102)");
    Serial.println("  READ          -> Inspect Card UID & Block Data");
    Serial.println("  DUMP          -> Dump all 16 Sectors of Card");
    Serial.println("  ATTEND        -> Return to Gate Attendance Scanner");
    Serial.println("====================================");
    Serial.println();
}

// ------------------------------------------------------------------------------
// HELPER: Process Attendance HTTP POST
// ------------------------------------------------------------------------------
void processCardScan(const String& uid) {
    Serial.println("------------------------------------");
    Serial.println("CARD SCANNED");
    Serial.print("UID: ");
    Serial.println(uid);

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Attendance could not be confirmed");
        Serial.println("------------------------------------");
        return;
    }

    String url = String(BACKEND_URL);
    bool isHttps = url.startsWith("https://");
    HTTPClient http;
    int httpCode = -1;
    String responseBody = "";

    String requestJson = "{\"device_id\":\"" + String(DEVICE_ID) + "\",\"card_uid\":\"" + uid + "\"}";

    bool initOk = false;
    std::unique_ptr<WiFiClientSecure> secureClient;
    std::unique_ptr<WiFiClient> plainClient;

    if (isHttps) {
        secureClient.reset(new WiFiClientSecure());
        secureClient->setInsecure();
        secureClient->setTimeout(HTTP_TIMEOUT_MS);
        http.setTimeout(HTTP_TIMEOUT_MS);
        initOk = http.begin(*secureClient, url);
    } else {
        plainClient.reset(new WiFiClient());
        plainClient->setTimeout(HTTP_TIMEOUT_MS);
        http.setTimeout(HTTP_TIMEOUT_MS);
        initOk = http.begin(*plainClient, url);
    }

    if (!initOk) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Attendance could not be confirmed");
        Serial.println("------------------------------------");
        return;
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Id", DEVICE_ID);
    http.addHeader("X-Device-Token", DEVICE_TOKEN);

    httpCode = http.POST(requestJson);

    if (httpCode <= 0 || httpCode >= 500) {
        http.end();
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Attendance could not be confirmed");
        Serial.println("------------------------------------");
        return;
    }

    responseBody = http.getString();
    http.end();

#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<768> doc;
#endif

    DeserializationError err = deserializeJson(doc, responseBody);
    if (err) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Attendance could not be confirmed");
        Serial.println("------------------------------------");
        return;
    }

    const char* status = doc["status"] | "UNKNOWN";
    const char* message = doc["message"] | "";
    const char* studentName = doc["student_name"] | "";

    Serial.print("STATUS: ");
    Serial.println(status);

    if (strlen(studentName) > 0) {
        Serial.print("STUDENT: ");
        Serial.println(studentName);
    }

    if (strlen(message) > 0) {
        Serial.print("MESSAGE: ");
        Serial.println(message);
    }

    Serial.println("------------------------------------");
}

// ------------------------------------------------------------------------------
// SERIAL COMMAND PARSER (Type into Serial Monitor)
// ------------------------------------------------------------------------------
void handleSerialCommands() {
    if (!Serial.available()) return;

    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.length() == 0) return;

    String upperCmd = cmd;
    upperCmd.toUpperCase();

    if (upperCmd.startsWith("WRITE")) {
        // Extract parameter after 'WRITE '
        String param = "";
        int spaceIdx = cmd.indexOf(' ');
        if (spaceIdx > 0 && spaceIdx < (int)cmd.length() - 1) {
            param = cmd.substring(spaceIdx + 1);
            param.trim();
        }

        if (param.length() == 0) {
            Serial.println("USAGE: WRITE <StudentCode> (e.g. WRITE DMC-2026-102)");
            return;
        }

        pendingWriteText = param;
        currentMode = MODE_WRITE_PENDING;

        Serial.println();
        Serial.println("====================================");
        Serial.println(">>> MODE: READY TO WRITE CARD <<<");
        Serial.print("Data to write (Block 4): [");
        Serial.print(pendingWriteText);
        Serial.println("]");
        Serial.println("Action: TAP THE RFID CARD ON THE READER NOW...");
        Serial.println("====================================");
    } 
    else if (upperCmd == "READ") {
        currentMode = MODE_READ_INSPECT;
        Serial.println();
        Serial.println(">>> MODE: CARD INSPECTOR <<<");
        Serial.println("Tap card to read factory UID and written Block 4 data...");
    } 
    else if (upperCmd == "DUMP") {
        currentMode = MODE_DUMP_CARD;
        Serial.println();
        Serial.println(">>> MODE: MEMORY DUMP <<<");
        Serial.println("Tap card to dump all 16 sectors to Serial Monitor...");
    } 
    else if (upperCmd == "ATTEND" || upperCmd == "EXIT") {
        currentMode = MODE_ATTENDANCE;
        Serial.println();
        Serial.println(">>> MODE: ATTENDANCE SCANNER ACTIVE <<<");
        Serial.println("Ready for student gate scans.");
    } 
    else if (upperCmd == "HELP") {
        Serial.println();
        Serial.println("AVAILABLE COMMANDS:");
        Serial.println("  WRITE <DATA>  -> Example: WRITE DMC-2026-102");
        Serial.println("  READ          -> Inspect Card UID and Block 4 data");
        Serial.println("  DUMP          -> Dump entire 1KB memory of card");
        Serial.println("  ATTEND        -> Return to Gate Attendance Scanner");
    } 
    else {
        Serial.print("Unknown command: ");
        Serial.println(cmd);
        Serial.println("Type 'HELP' for instructions.");
    }
}

// ------------------------------------------------------------------------------
// SETUP
// ------------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(500);

    // Initialize Onboard Blue LED (GPIO2 / LED_BUILTIN)
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH); // Built-in LED on ESP8266 is active LOW (HIGH = OFF)

    // Initialize Default Factory Key (FF FF FF FF FF FF)
    for (byte i = 0; i < 6; i++) {
        defaultKey.keyByte[i] = 0xFF;
    }

    // 1. SPI & MFRC522 Initialization
    SPI.begin();
    rfid.PCD_Init();
    delay(50);

    byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
    bool rfidOk = (version != 0x00 && version != 0xFF);

    // 2. Wi-Fi Initialization
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long wifiStart = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - wifiStart < 15000)) {
        delay(250);
    }
    bool wifiOk = (WiFi.status() == WL_CONNECTED);

    // 3. Backend Handshake Check
    bool backendOk = false;
    if (wifiOk) {
        backendOk = testBackendConnection();
    }

    // 4. Print Startup Status
    printStartupBanner(rfidOk, wifiOk, backendOk);
}

// ------------------------------------------------------------------------------
// MAIN LOOP
// ------------------------------------------------------------------------------
void loop() {
    // 1. Check for commands from user in Serial Monitor
    handleSerialCommands();

    // 2. Wi-Fi auto-reconnection in attendance mode
    if (currentMode == MODE_ATTENDANCE && WiFi.status() != WL_CONNECTED) {
        unsigned long now = millis();
        if (now - lastReconnectAttempt > 5000) {
            lastReconnectAttempt = now;
            WiFi.disconnect();
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        }
    }

    // 3. Check for RFID card present
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(20);
        return;
    }

    // 4. Read serial from card
    if (!rfid.PICC_ReadCardSerial()) {
        delay(20);
        return;
    }

    // Blink onboard blue LED on EVERY card scan!
    digitalWrite(LED_BUILTIN, LOW);  // Turn ON
    delay(120);
    digitalWrite(LED_BUILTIN, HIGH); // Turn OFF

    String currentUID = getNormalizedUID(&(rfid.uid));

    // --------------------------------------------------------------------------
    // ACTION BRANCH ACCORDING TO CURRENT MODE
    // --------------------------------------------------------------------------
    if (currentMode == MODE_WRITE_PENDING) {
        Serial.println("------------------------------------");
        Serial.println("WRITING TO CARD...");
        Serial.print("Card UID: ");
        Serial.println(currentUID);

        bool success = writeBlockData(TARGET_DATA_BLOCK, pendingWriteText);

        if (success) {
            String verifyText = readBlockData(TARGET_DATA_BLOCK);
            Serial.println("STATUS: WRITE_SUCCESS");
            Serial.print("Data Written to Block ");
            Serial.print(TARGET_DATA_BLOCK);
            Serial.print(": ");
            Serial.println(verifyText);
            Serial.println("Card is programmed and ready!");
            Serial.println("------------------------------------");
        } else {
            Serial.println("STATUS: WRITE_FAILED");
            Serial.println("Failed to write to card block.");
            Serial.println("------------------------------------");
        }

        // Return to Attendance Scanner mode after writing
        currentMode = MODE_ATTENDANCE;
        Serial.println(">>> Switched back to ATTENDANCE GATE SCANNER <<<");
        Serial.println();
    }
    else if (currentMode == MODE_READ_INSPECT) {
        Serial.println("------------------------------------");
        Serial.println("CARD INSPECTION");
        Serial.print("Card UID: ");
        Serial.println(currentUID);

        String blockData = readBlockData(TARGET_DATA_BLOCK);
        Serial.print("Block ");
        Serial.print(TARGET_DATA_BLOCK);
        Serial.print(" Data: ");
        if (blockData.length() > 0) {
            Serial.print("\"");
            Serial.print(blockData);
            Serial.println("\"");
        } else {
            Serial.println("[Empty or Unauthenticated]");
        }
        Serial.println("------------------------------------");
    }
    else if (currentMode == MODE_DUMP_CARD) {
        Serial.println("------------------------------------");
        Serial.print("FULL MEMORY DUMP FOR UID: ");
        Serial.println(currentUID);
        rfid.PICC_DumpToSerial(&(rfid.uid));
        Serial.println("------------------------------------");
    }
    else {
        // MODE_ATTENDANCE (Default Gate Scanner)
        unsigned long now = millis();
        if (currentUID == lastScannedUID && (now - lastScanMillis < DEBOUNCE_TIME_MS)) {
            rfid.PICC_HaltA();
            rfid.PCD_StopCrypto1();
            delay(50);
            return;
        }

        lastScannedUID = currentUID;
        lastScanMillis = now;

        processCardScan(currentUID);
    }

    // Halt card and release encryption
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    yield();
}
