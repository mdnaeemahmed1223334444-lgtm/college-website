/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — RFID ATTENDANCE & WEB CARD WRITER MASTER FIRMWARE
 * ==============================================================================
 * Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 13.56 MHz RFID Reader
 *   - 13.56 MHz RFID Cards (Mifare Classic 1K)
 *   - USB Cable (Serial Monitor at 115200 baud)
 *   - Onboard Blue LED: Blinks every time ANY card is scanned!
 *
 * Current Hardware Note:
 *   Operates strictly with ESP8266, RC522 and USB power.
 *   No external LEDs, buzzers, or external displays are required.
 *   Built-in LED on GPIO2 (LED_BUILTIN) is used for instant physical scan feedback.
 *
 * Wiring Connections:
 *   RC522 SDA / SS -> ESP8266 D2 (GPIO4)
 *   RC522 SCK      -> ESP8266 D5 (GPIO14)
 *   RC522 MOSI     -> ESP8266 D7 (GPIO13)
 *   RC522 MISO     -> ESP8266 D6 (GPIO12)
 *   RC522 RST      -> ESP8266 D1 (GPIO5)
 *   RC522 3.3V     -> ESP8266 3V3 (3.3V ONLY! Never connect to 5V or VIN!)
 *   RC522 GND      -> ESP8266 GND
 *
 * KEY FEATURES:
 *   1. Access Point on every boot ("College-RFID-AP" at 192.168.4.1).
 *   2. Web portal at 192.168.4.1 to scan Wi-Fi, select SSID, and connect.
 *   3. Remembers Wi-Fi password & Backend URL in Flash memory (EEPROM).
 *   4. Offline Card Writer: Write student codes to cards right from your phone
 *      at 192.168.4.1 even when the ESP has no external internet!
 *   5. Online Card Writer: When connected to Wi-Fi, writes cards commanded
 *      directly from the college website admin panel.
 *   6. Attendance Counts Written Data: The attendance counts what is written
 *      on the card (Sector 1, Block 4), NOT the fixed factory UID.
 *   7. Testing Mode: Unlimited scans allowed for live trial testing.
 *   8. Built-in LED: Blinks every time ANY card is scanned near the reader.
 * ==============================================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include "web_page.h"

// ------------------------------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ------------------------------------------------------------------------------
#define SS_PIN  D2   // GPIO4 - RC522 SDA/SS
#define RST_PIN D1   // GPIO5 - RC522 RST
const byte TARGET_DATA_BLOCK = 4; // Sector 1, Block 0 (Block 4)

// ------------------------------------------------------------------------------
// EEPROM SETTINGS STORAGE
// ------------------------------------------------------------------------------
#define EEPROM_SIZE   384
#define EEPROM_MAGIC  0x56

struct DeviceSettings {
    uint8_t magic;
    char ssid[33];
    char pass[65];
    char backendUrl[160];
};

DeviceSettings settings;

// Defaults
const char* AP_SSID         = "College-RFID-AP";
const char* DEFAULT_BACKEND = "https://hrmdc.vercel.app/api/attendance/scan";
const char* DEVICE_ID       = "GATE-01";
const char* DEVICE_TOKEN    = "dmc_gate01_secret_key_2026";

// Global Instances
MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key defaultKey;
ESP8266WebServer server(80);

// State Variables
bool isWriteArmPending = false;
String pendingWriteData = "";
String lastWriteStatus = "IDLE";
String lastWrittenUID = "";
String lastWrittenData = "";

String lastScannedUID = "";
String lastScannedData = "";
String lastScanStatus = "READY";
String lastStudentName = "";
unsigned long lastScanMillis = 0;
unsigned long lastWebPollMillis = 0;

// ------------------------------------------------------------------------------
// ONBOARD LED BLINK HELPER (Active LOW on ESP8266)
// ------------------------------------------------------------------------------
void blinkBuiltinLed(int durationMs = 150) {
    digitalWrite(LED_BUILTIN, LOW);  // Turn ON onboard blue LED
    delay(durationMs);
    digitalWrite(LED_BUILTIN, HIGH); // Turn OFF onboard blue LED
}

// ------------------------------------------------------------------------------
// EEPROM LOAD / SAVE
// ------------------------------------------------------------------------------
void saveSettings() {
    settings.magic = EEPROM_MAGIC;
    EEPROM.put(0, settings);
    EEPROM.commit();
}

void loadSettings() {
    EEPROM.begin(EEPROM_SIZE);
    EEPROM.get(0, settings);

    // If magic doesn't match OR if the stored URL is an old local 192.168.x placeholder:
    if (settings.magic != EEPROM_MAGIC || strstr(settings.backendUrl, "192.168.") != NULL || strlen(settings.backendUrl) == 0) {
        settings.magic = EEPROM_MAGIC;
        memset(settings.ssid, 0, sizeof(settings.ssid));
        memset(settings.pass, 0, sizeof(settings.pass));
        strncpy(settings.backendUrl, DEFAULT_BACKEND, sizeof(settings.backendUrl) - 1);
        settings.backendUrl[sizeof(settings.backendUrl) - 1] = '\0';
        saveSettings();
    }
}

// ------------------------------------------------------------------------------
// RFID HELPERS
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

bool writeBlock(byte blockAddr, const String& text) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

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

String readBlock(byte blockAddr) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    MFRC522::StatusCode status = rfid.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(rfid.uid)
    );

    if (status != MFRC522::STATUS_OK) return "";

    byte buffer[18];
    byte byteCount = sizeof(buffer);
    status = rfid.MIFARE_Read(blockAddr, buffer, &byteCount);
    if (status != MFRC522::STATUS_OK) return "";

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
// EMBEDDED WEB INTERFACE (HTML / CSS / JS)
// Note: PAGE_INDEX HTML is declared in web_page.h to prevent Arduino IDE 1.8.x
// preprocessor prototype generation errors with JavaScript function syntax.
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// HTTP SERVER ROUTE HANDLERS
// ------------------------------------------------------------------------------
void handleRoot() {
    server.send_P(200, "text/html", PAGE_INDEX);
}

void handleStatus() {
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<512> doc;
#endif

    doc["wifi_connected"] = (WiFi.status() == WL_CONNECTED);
    doc["wifi_ssid"] = (WiFi.status() == WL_CONNECTED) ? WiFi.SSID() : "";
    doc["station_ip"] = (WiFi.status() == WL_CONNECTED) ? WiFi.localIP().toString() : "";
    doc["backend_url"] = String(settings.backendUrl);
    doc["is_write_armed"] = isWriteArmPending;
    doc["pending_write_data"] = pendingWriteData;
    doc["last_write_status"] = lastWriteStatus;
    doc["last_written_uid"] = lastWrittenUID;
    doc["last_written_data"] = lastWrittenData;
    doc["last_uid"] = lastScannedUID;
    doc["last_data"] = lastScannedData;
    doc["last_status"] = lastScanStatus;
    doc["student_name"] = lastStudentName;

    String jsonStr;
    serializeJson(doc, jsonStr);
    server.send(200, "application/json", jsonStr);
}

void handleScanWifi() {
    int n = WiFi.scanNetworks();
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<1024> doc;
#endif
    JsonArray arr = doc.to<JsonArray>();

    for (int i = 0; i < n; ++i) {
        JsonObject obj = arr.createNestedObject();
        obj["ssid"] = WiFi.SSID(i);
        obj["rssi"] = WiFi.RSSI(i);
    }

    String jsonStr;
    serializeJson(arr, jsonStr);
    server.send(200, "application/json", jsonStr);
}

void handleConnect() {
    if (server.hasArg("ssid")) {
        String newSsid = server.arg("ssid");
        String newPass = server.arg("pass");

        strncpy(settings.ssid, newSsid.c_str(), sizeof(settings.ssid) - 1);
        strncpy(settings.pass, newPass.c_str(), sizeof(settings.pass) - 1);
        saveSettings();

        WiFi.begin(settings.ssid, settings.pass);
        server.send(200, "text/plain", "Credentials saved! Connecting to " + newSsid + ". Check status in a few seconds.");
    } else {
        server.send(400, "text/plain", "Missing SSID parameter");
    }
}

void handleSetBackend() {
    if (server.hasArg("url")) {
        String newUrl = server.arg("url");
        newUrl.trim();
        strncpy(settings.backendUrl, newUrl.c_str(), sizeof(settings.backendUrl) - 1);
        saveSettings();
        server.send(200, "text/plain", "Backend URL saved: " + newUrl);
    } else {
        server.send(400, "text/plain", "Missing URL parameter");
    }
}

void handleArmWrite() {
    if (server.hasArg("data")) {
        pendingWriteData = server.arg("data");
        pendingWriteData.trim();
        isWriteArmPending = true;
        lastWriteStatus = "ARMED";

        Serial.println();
        Serial.println("====================================");
        Serial.println(">>> CARD WRITER ARMED VIA WEBPAGE <<<");
        Serial.print("Target Code to Burn: [");
        Serial.print(pendingWriteData);
        Serial.println("]");
        Serial.println("TAP THE RFID CARD ON THE READER NOW...");
        Serial.println("====================================");

        server.send(200, "text/plain", "ARMED");
    } else {
        server.send(400, "text/plain", "Missing data parameter");
    }
}

// ------------------------------------------------------------------------------
// SEND ATTENDANCE SCAN EVENT TO WEBSITE API
// ------------------------------------------------------------------------------
void sendAttendanceScan(const String& uid, const String& writtenData) {
    Serial.println("------------------------------------");
    Serial.println("CARD SCANNED AT GATE");
    Serial.print("Hardware UID:  ");
    Serial.println(uid);
    Serial.print("Card Data:     ");
    Serial.println(writtenData.length() > 0 ? writtenData : "[Blank / Unwritten]");

    lastScannedUID = uid;
    lastScannedData = writtenData;

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("STATUS: OFFLINE_SCAN");
        Serial.println("MESSAGE: Read successfully. (Connect to Wi-Fi to submit to website)");
        lastScanStatus = "OFFLINE_READ";
        lastStudentName = writtenData;
        Serial.println("------------------------------------");
        return;
    }

    String url = String(settings.backendUrl);
    bool isHttps = url.startsWith("https://");
    HTTPClient http;

    Serial.print("Connecting to backend: ");
    Serial.println(url);

    // card_data is sent as the primary key!
    String requestJson = "{\"device_id\":\"" + String(DEVICE_ID) +
                         "\",\"card_uid\":\"" + uid +
                         "\",\"card_data\":\"" + writtenData + "\"}";

    bool initOk = false;
    std::unique_ptr<WiFiClientSecure> secureClient;
    std::unique_ptr<WiFiClient> plainClient;

    if (isHttps) {
        secureClient.reset(new WiFiClientSecure());
        secureClient->setInsecure(); // Critical for Vercel SSL
        secureClient->setTimeout(10000);
        http.setTimeout(10000);
        initOk = http.begin(*secureClient, url);
    } else {
        plainClient.reset(new WiFiClient());
        plainClient->setTimeout(10000);
        http.setTimeout(10000);
        initOk = http.begin(*plainClient, url);
    }

    if (!initOk) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Could not reach attendance server");
        lastScanStatus = "NETWORK_ERROR";
        Serial.println("------------------------------------");
        return;
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Id", DEVICE_ID);
    http.addHeader("X-Device-Token", DEVICE_TOKEN);

    int httpCode = http.POST(requestJson);

    if (httpCode <= 0 || httpCode >= 500) {
        Serial.print("HTTP Error code: ");
        Serial.println(httpCode);
        if (httpCode < 0) {
            Serial.print("Details: ");
            Serial.println(http.errorToString(httpCode));
        }
        http.end();
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Server returned error or timeout");
        lastScanStatus = "NETWORK_ERROR";
        Serial.println("------------------------------------");
        return;
    }

    String responseBody = http.getString();
    http.end();

#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<768> doc;
#endif

    DeserializationError err = deserializeJson(doc, responseBody);
    if (!err) {
        const char* status = doc["status"] | "UNKNOWN";
        const char* studentName = doc["student_name"] | "";
        const char* msg = doc["message"] | "";

        lastScanStatus = String(status);
        lastStudentName = String(studentName);

        Serial.print("STATUS: ");
        Serial.println(status);
        if (strlen(studentName) > 0) {
            Serial.print("STUDENT: ");
            Serial.println(studentName);
        }
        if (strlen(msg) > 0) {
            Serial.print("MESSAGE: ");
            Serial.println(msg);
        }
    } else {
        Serial.println("STATUS: UNKNOWN_RESPONSE");
    }

    Serial.println("------------------------------------");
}

// ------------------------------------------------------------------------------
// POLL WEBSITE FOR PENDING CARD-WRITE COMMANDS
// ------------------------------------------------------------------------------
void pollWebsiteForCardWrite() {
    if (WiFi.status() != WL_CONNECTED || isWriteArmPending) return;

    unsigned long now = millis();
    if (now - lastWebPollMillis < 4000) return;
    lastWebPollMillis = now;

    String pollUrl = String(settings.backendUrl);
    int scanPos = pollUrl.indexOf("/scan");
    if (scanPos > 0) {
        pollUrl = pollUrl.substring(0, scanPos) + "/write?device_id=" + String(DEVICE_ID);
    } else {
        return;
    }

    bool isHttps = pollUrl.startsWith("https://");
    HTTPClient http;
    int httpCode = -1;
    String payload = "";

    if (isHttps) {
        WiFiClientSecure clientSecure;
        clientSecure.setInsecure();
        clientSecure.setTimeout(4000);
        http.setTimeout(4000);
        if (http.begin(clientSecure, pollUrl)) {
            httpCode = http.GET();
            if (httpCode == 200) payload = http.getString();
            http.end();
        }
    } else {
        WiFiClient client;
        client.setTimeout(4000);
        http.setTimeout(4000);
        if (http.begin(client, pollUrl)) {
            httpCode = http.GET();
            if (httpCode == 200) payload = http.getString();
            http.end();
        }
    }

    if (httpCode == 200 && payload.length() > 0) {
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
        JsonDocument doc;
#else
        StaticJsonDocument<256> doc;
#endif
        if (!deserializeJson(doc, payload)) {
            bool pending = doc["pending"] | false;
            if (pending) {
                const char* targetCode = doc["data"] | "";
                if (strlen(targetCode) > 0) {
                    pendingWriteData = String(targetCode);
                    isWriteArmPending = true;
                    lastWriteStatus = "ARMED";

                    Serial.println();
                    Serial.println("====================================");
                    Serial.println(">>> WEBSITE COMMAND: WRITE CARD <<<");
                    Serial.print("Target Code to Burn: [");
                    Serial.print(pendingWriteData);
                    Serial.println("]");
                    Serial.println("TAP THE RFID CARD ON THE READER NOW...");
                    Serial.println("====================================");
                }
            }
        }
    }
}

// ------------------------------------------------------------------------------
// NOTIFY WEBSITE THAT WRITE COMPLETED
// ------------------------------------------------------------------------------
void notifyWebsiteWriteComplete(const String& uid, const String& writtenData) {
    if (WiFi.status() != WL_CONNECTED) return;

    String notifyUrl = String(settings.backendUrl);
    int scanPos = notifyUrl.indexOf("/scan");
    if (scanPos > 0) {
        notifyUrl = notifyUrl.substring(0, scanPos) + "/write";
    } else {
        return;
    }

    bool isHttps = notifyUrl.startsWith("https://");
    HTTPClient http;

    String reqBody = "{\"action\":\"complete\",\"device_id\":\"" + String(DEVICE_ID) +
                     "\",\"uid\":\"" + uid +
                     "\",\"data_to_write\":\"" + writtenData + "\"}";

    if (isHttps) {
        WiFiClientSecure clientSecure;
        clientSecure.setInsecure();
        clientSecure.setTimeout(5000);
        if (http.begin(clientSecure, notifyUrl)) {
            http.addHeader("Content-Type", "application/json");
            http.POST(reqBody);
            http.end();
        }
    } else {
        WiFiClient client;
        client.setTimeout(5000);
        if (http.begin(client, notifyUrl)) {
            http.addHeader("Content-Type", "application/json");
            http.POST(reqBody);
            http.end();
        }
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

    for (byte i = 0; i < 6; i++) defaultKey.keyByte[i] = 0xFF;

    // 1. Load Stored Wi-Fi & Backend URL Settings
    loadSettings();

    // 2. SPI & RC522 Initialization
    SPI.begin();
    rfid.PCD_Init();
    delay(50);

    byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
    bool rfidOk = (version != 0x00 && version != 0xFF);

    // 3. Start Access Point (AP Mode) Every Restart
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP(AP_SSID); // Open network at 192.168.4.1

    // 4. Register HTTP Web Server Endpoints
    server.on("/", HTTP_GET, handleRoot);
    server.on("/status", HTTP_GET, handleStatus);
    server.on("/scan-wifi", HTTP_GET, handleScanWifi);
    server.on("/connect", HTTP_POST, handleConnect);
    server.on("/set-backend", HTTP_POST, handleSetBackend);
    server.on("/arm-write", HTTP_POST, handleArmWrite);
    server.begin();

    // 5. Print Startup Banner
    Serial.println();
    Serial.println("====================================");
    Serial.println("COLLEGE RFID ATTENDANCE & WEB WRITER");
    Serial.println("====================================");
    Serial.print("Device ID: ");
    Serial.println(DEVICE_ID);
    Serial.print("RFID Reader: ");
    Serial.println(rfidOk ? "INITIALIZED" : "FAILED (Check wiring)");
    Serial.print("Access Point: ");
    Serial.println(AP_SSID);
    Serial.println("Web Portal: http://192.168.4.1");
    Serial.print("Backend Server: ");
    Serial.println(settings.backendUrl);
    if (strlen(settings.ssid) > 0) {
        Serial.print("Saved Wi-Fi: ");
        Serial.println(settings.ssid);
    }
    Serial.println("Onboard LED: ENABLED (Blinks on every scan)");
    Serial.println("System Status: READY");
    Serial.println("====================================");
    Serial.println();
}

// ------------------------------------------------------------------------------
// MAIN LOOP
// ------------------------------------------------------------------------------
void loop() {
    // 1. Handle Web Portal Requests (192.168.4.1)
    server.handleClient();

    // 2. When connected to Wi-Fi, check for remote card-write commands from website
    pollWebsiteForCardWrite();

    // 3. Check for RFID Card Present
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(20);
        return;
    }
    if (!rfid.PICC_ReadCardSerial()) {
        delay(20);
        return;
    }

    // 4. BLINK ONBOARD BLUE LED EVERY TIME ANY CARD IS SCANNED!
    blinkBuiltinLed(150);

    String currentUID = getNormalizedUID(&(rfid.uid));

    // --------------------------------------------------------------------------
    // BRANCH A: WRITE MODE ENGAGED (from 192.168.4.1 or Website)
    // --------------------------------------------------------------------------
    if (isWriteArmPending) {
        Serial.println("------------------------------------");
        Serial.println("WRITING DATA TO CARD...");
        Serial.print("Card Hardware UID: ");
        Serial.println(currentUID);
        Serial.print("Data to write:     ");
        Serial.println(pendingWriteData);

        bool writeOk = writeBlock(TARGET_DATA_BLOCK, pendingWriteData);

        if (writeOk) {
            String verifiedData = readBlock(TARGET_DATA_BLOCK);
            lastWriteStatus = "SUCCESS";
            lastWrittenUID = currentUID;
            lastWrittenData = verifiedData;

            Serial.println("STATUS: [WRITE_SUCCESS] Card written and verified!");
            Serial.print("Verified Written Data: ");
            Serial.println(verifiedData);
            Serial.println("------------------------------------");

            notifyWebsiteWriteComplete(currentUID, verifiedData);
        } else {
            lastWriteStatus = "FAILED";
            Serial.println("STATUS: [WRITE_FAILED] Failed to burn data into block.");
            Serial.println("------------------------------------");
        }

        isWriteArmPending = false;
        pendingWriteData = "";
    }
    // --------------------------------------------------------------------------
    // BRANCH B: ATTENDANCE SCAN MODE (Reads Block 4 Data as Main Identifier)
    // --------------------------------------------------------------------------
    else {
        String writtenData = readBlock(TARGET_DATA_BLOCK);

        unsigned long now = millis();
        if (currentUID == lastScannedUID && (now - lastScanMillis < 2000)) {
            rfid.PICC_HaltA();
            rfid.PCD_StopCrypto1();
            delay(50);
            return;
        }

        lastScanMillis = now;

        sendAttendanceScan(currentUID, writtenData);
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    yield();
}
