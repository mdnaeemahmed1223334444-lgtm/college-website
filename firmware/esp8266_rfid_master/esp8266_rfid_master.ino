/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — RFID ATTENDANCE & WEB CARD WRITER MASTER FIRMWARE
 * ==============================================================================
 * Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 13.56 MHz RFID Reader
 *   - 13.56 MHz RFID Cards (Mifare Classic 1K)
 *   - USB Cable (Serial Monitor at 115200 baud)
 *   - Status LEDs:
 *       * Green LED on D0 (GPIO16): Active HIGH - Attendance Accepted
 *       * Blue LED on D3 (GPIO0):  Active LOW  - RC522 Communication OK
 *       * Red LED on D4 (GPIO2):   Active LOW  - Attendance Failure / Error (Blinks 3x)
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
 * Status LEDs Wiring:
 *   Green LED: D0 -> 220Ω resistor -> LED Anode (+) -> LED Cathode (-) -> GND (Active HIGH)
 *   Blue LED:  3V3 -> 220Ω resistor -> LED Anode (+) -> LED Cathode (-) -> D3  (Active LOW)
 *   Red LED:   3V3 -> 220Ω resistor -> LED Anode (+) -> LED Cathode (-) -> D4  (Active LOW)
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
 *   8. Tri-Color Status LEDs:
 *        - BLUE: Steady ON when RC522 is communicating, OFF if disconnected.
 *        - GREEN: Lights for ~700ms ONLY when backend confirms attendance.
 *        - RED: Blinks 3 times on unregistered card, rejection, or network error.
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
#include <Ticker.h>
#include "web_page.h"

// ------------------------------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ------------------------------------------------------------------------------
#define SS_PIN    D2   // GPIO4  - RC522 SDA/SS
#define RST_PIN   D1   // GPIO5  - RC522 RST
const byte TARGET_DATA_BLOCK = 4; // Sector 1, Block 0 (Block 4)

// Three External Status LEDs
#define LED_GREEN D0   // GPIO16 - Active HIGH (Attendance Success)
#define LED_BLUE  D3   // GPIO0  - Active LOW  (RFID Reader Communication Status)
#define LED_RED   D4   // GPIO2  - Active LOW  (Attendance Failure / Server Error)

// Logic Levels for Active HIGH / Active LOW wiring
#define LED_GREEN_ON   HIGH
#define LED_GREEN_OFF  LOW
#define LED_BLUE_ON    LOW
#define LED_BLUE_OFF   HIGH
#define LED_RED_ON     LOW
#define LED_RED_OFF    HIGH

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

// Non-blocking Status LED State Variables
// volatile: these are also touched by ledTicker, which runs even while
// the main loop is blocked inside a slow HTTPS request.
volatile bool isGreenLedActive = false;
volatile unsigned long greenLedStartTime = 0;

volatile int redBlinksRemaining = 0;
volatile bool redLedState = false;
volatile unsigned long lastRedToggleMillis = 0;

Ticker ledTicker;   // drives green/red LED timing independently of loop()

unsigned long lastRFIDCheckMillis = 0;

// ------------------------------------------------------------------------------
// STATUS LED HELPER FUNCTIONS
// ------------------------------------------------------------------------------

/**
 * Checks whether the MFRC522 RFID reader is communicating properly over SPI.
 * Returns true if VersionReg returns a valid chip identifier (not 0x00 or 0xFF).
 */
bool isRFIDCommunicating() {
    byte v = rfid.PCD_ReadRegister(rfid.VersionReg);
    return (v != 0x00 && v != 0xFF);
}

/**
 * Updates the Blue LED (D3) to reflect actual RC522 communication status.
 * Active LOW: LOW = ON (Communicating), HIGH = OFF (Disconnected/Error).
 */
void setRFIDConnectionStatus(bool connected) {
    digitalWrite(LED_BLUE, connected ? LED_BLUE_ON : LED_BLUE_OFF);
}

/**
 * Turns all three status LEDs OFF safely and resets LED state variables.
 */
void allStatusLEDsOff() {
    digitalWrite(LED_GREEN, LED_GREEN_OFF);
    digitalWrite(LED_BLUE, LED_BLUE_OFF);
    digitalWrite(LED_RED, LED_RED_OFF);
    isGreenLedActive = false;
    redBlinksRemaining = 0;
    redLedState = false;
}

/**
 * Initializes all three LED pins safely with their inactive levels.
 * Ensures external LEDs do not interfere with ESP8266 boot configuration.
 */
void initStatusLEDs() {
    // Write safe inactive levels BEFORE setting pinMode to avoid startup glitches
    digitalWrite(LED_GREEN, LED_GREEN_OFF);
    digitalWrite(LED_BLUE, LED_BLUE_OFF);
    digitalWrite(LED_RED, LED_RED_OFF);

    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_BLUE, OUTPUT);
    pinMode(LED_RED, OUTPUT);

    isGreenLedActive = false;
    redBlinksRemaining = 0;
    redLedState = false;
}

/**
 * Activates the Green LED for ~700 milliseconds upon confirmed attendance.
 * Non-blocking: Uses millis() timing in updateStatusLEDs().
 */
void showAttendanceSuccess() {
    // Immediately stop any red error blinking
    redBlinksRemaining = 0;
    redLedState = false;
    digitalWrite(LED_RED, LED_RED_OFF);

    // Turn ON Green LED
    digitalWrite(LED_GREEN, LED_GREEN_ON);
    isGreenLedActive = true;
    greenLedStartTime = millis();
}

/**
 * Triggers a 3-blink sequence on the Red LED to indicate attendance failure.
 * Non-blocking: Uses millis() timing in updateStatusLEDs() (150ms ON / 150ms OFF x 3).
 */
void showAttendanceError() {
    // Immediately turn OFF Green LED
    isGreenLedActive = false;
    digitalWrite(LED_GREEN, LED_GREEN_OFF);

    // Start 3-blink sequence (1st ON phase active immediately, 5 transitions left)
    // redBlinksRemaining is set LAST so the ticker never sees a half-set state.
    digitalWrite(LED_RED, LED_RED_ON);
    redLedState = true;
    lastRedToggleMillis = millis();
    redBlinksRemaining = 5;
}

/**
 * Non-blocking status LED management called repeatedly inside loop().
 * Handles Green LED auto-turn-off, Red LED blink intervals, and periodic RFID check.
 */
void updateStatusLEDs() {
    unsigned long now = millis();

    // 1. Manage Green LED duration (~700ms)
    if (isGreenLedActive) {
        if (now - greenLedStartTime >= 700) {
            digitalWrite(LED_GREEN, LED_GREEN_OFF);
            isGreenLedActive = false;
        }
    }

    // 2. Manage Red LED 3-blink sequence (150ms intervals)
    if (redBlinksRemaining > 0) {
        if (now - lastRedToggleMillis >= 150) {
            lastRedToggleMillis = now;
            redLedState = !redLedState;
            digitalWrite(LED_RED, redLedState ? LED_RED_ON : LED_RED_OFF);
            redBlinksRemaining--;
            if (redBlinksRemaining == 0) {
                digitalWrite(LED_RED, LED_RED_OFF);
                redLedState = false;
            }
        }
    }

}

/**
 * Periodic RFID reader communication check (every 1000ms) for the Blue LED.
 * Runs from loop() only (NOT from the ticker) because it uses SPI.
 */
void checkRFIDStatus() {
    unsigned long now = millis();
    if (now - lastRFIDCheckMillis >= 1000) {
        lastRFIDCheckMillis = now;
        setRFIDConnectionStatus(isRFIDCommunicating());
    }
}

// Backward compatibility helper
void blinkBuiltinLed(int durationMs = 150) {
    // Kept for legacy compatibility
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

    // Ensure backendUrl always points to the live Vercel production endpoint:
    if (strcmp(settings.backendUrl, DEFAULT_BACKEND) != 0) {
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
    doc["rfid_communicating"] = isRFIDCommunicating();

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
String sendAttendanceScan(const String& uid, const String& writtenData) {
    Serial.println("------------------------------------");
    Serial.println("CARD SCANNED AT GATE");
    Serial.print("Hardware UID:  ");
    Serial.println(uid);
    Serial.print("Card Data:     ");
    Serial.println(writtenData.length() > 0 ? writtenData : "[Blank / Unwritten]");

    lastScannedUID = uid;
    lastScannedData = writtenData;

    // Check Wi-Fi connectivity
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("STATUS: OFFLINE_SCAN");
        Serial.println("MESSAGE: Read successfully. (Connect to Wi-Fi to submit to website)");
        lastScanStatus = "OFFLINE_READ";
        lastStudentName = writtenData;
        Serial.println("------------------------------------");

        // Wi-Fi offline: cannot submit attendance to server
        showAttendanceError();
        return "{\"success\":false,\"status\":\"OFFLINE_SCAN\",\"message\":\"ESP is not connected to Wi-Fi\"}";
    }

    String url = String(settings.backendUrl);
    bool isHttps = url.startsWith("https://");
    HTTPClient http;

    Serial.print("Connecting to backend: ");
    Serial.println(url);

    // card_data is sent as the primary key!
    String requestJson = "{\"device_id\":\"" + String(DEVICE_ID) +
                         "\",\"token\":\"" + String(DEVICE_TOKEN) +
                         "\",\"card_uid\":\"" + uid +
                         "\",\"card_data\":\"" + writtenData + "\"}";

    bool initOk = false;
    std::unique_ptr<WiFiClientSecure> secureClient;
    std::unique_ptr<WiFiClient> plainClient;

    if (isHttps) {
        secureClient.reset(new WiFiClientSecure());
        secureClient->setInsecure(); // Bypass cert checks for dynamic backend URLs
        // Reduce BearSSL buffer from 32KB down to 1.5KB to prevent ESP8266 out-of-memory crash!
        secureClient->setBufferSizes(1024, 512);
        secureClient->setTimeout(8000);
        http.setTimeout(8000);
        http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
        http.setReuse(false);
        initOk = http.begin(*secureClient, url);
    } else {
        plainClient.reset(new WiFiClient());
        plainClient->setTimeout(8000);
        http.setTimeout(8000);
        http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
        http.setReuse(false);
        initOk = http.begin(*plainClient, url);
    }

    if (!initOk) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Could not reach attendance server");
        lastScanStatus = "NETWORK_ERROR";
        Serial.println("------------------------------------");

        // Connection initialization failed
        showAttendanceError();
        return "{\"success\":false,\"status\":\"NETWORK_ERROR\",\"message\":\"Could not initialize connection\"}";
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Id", DEVICE_ID);
    http.addHeader("X-Device-Token", DEVICE_TOKEN);

    int httpCode = http.POST(requestJson);

    if (httpCode <= 0 || httpCode >= 500) {
        Serial.print("HTTP Error code: ");
        Serial.print(httpCode);
        if (httpCode < 0) {
            Serial.print(" (");
            Serial.print(http.errorToString(httpCode));
            Serial.print(")");
        }
        Serial.println();
        http.end();
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Server returned error or timeout");
        lastScanStatus = "NETWORK_ERROR";
        Serial.println("------------------------------------");

        // HTTP error, timeout, or server 5xx crash
        showAttendanceError();
        return "{\"success\":false,\"status\":\"NETWORK_ERROR\",\"message\":\"Server returned error or timeout (code " + String(httpCode) + ")\"}";
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

        // Attendance Accepted conditions:
        // doc["success"] == true OR status is "PRESENT" / "LATE"
        bool isSuccess = (doc["success"] == true) || (strcmp(status, "PRESENT") == 0) || (strcmp(status, "LATE") == 0);

        if (isSuccess) {
            // GREEN LED: Attendance accepted and confirmed by backend!
            showAttendanceSuccess();
        } else {
            // RED LED: Backend rejected (UNREGISTERED_CARD, INACTIVE_CARD, DEVICE_DISABLED, etc.)
            showAttendanceError();
        }
    } else {
        Serial.println("STATUS: UNKNOWN_RESPONSE");
        // Invalid or corrupt server response
        showAttendanceError();
    }

    Serial.println("------------------------------------");
    return responseBody;
}

// ------------------------------------------------------------------------------
// HTTP API ENDPOINT: SUBMIT ATTENDANCE DIRECTLY THROUGH ESP
// ------------------------------------------------------------------------------
void handleApiSubmitAttendance() {
    String cardData = "";
    String uid = "6B452254";

    if (server.hasArg("data")) {
        cardData = server.arg("data");
    } else if (server.hasArg("code")) {
        cardData = server.arg("code");
    } else if (server.hasArg("card_data")) {
        cardData = server.arg("card_data");
    } else if (server.hasArg("plain")) {
        String body = server.arg("plain");
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
        JsonDocument reqDoc;
#else
        StaticJsonDocument<256> reqDoc;
#endif
        if (!deserializeJson(reqDoc, body)) {
            cardData = reqDoc["card_data"] | reqDoc["data"] | reqDoc["student_code"] | "";
            uid = reqDoc["card_uid"] | reqDoc["uid"] | uid;
        }
    }

    cardData.trim();
    if (cardData.length() == 0) {
        server.send(400, "application/json", "{\"success\":false,\"message\":\"Missing student code or card data parameter\"}");
        return;
    }

    Serial.println();
    Serial.println("====================================");
    Serial.println(">>> ATTENDANCE SUBMITTED VIA ESP API <<<");
    Serial.print("Target Code / Card: ");
    Serial.println(cardData);
    Serial.println("====================================");

    String resultJson = sendAttendanceScan(uid, cardData);
    server.send(200, "application/json", resultJson);
}

// ------------------------------------------------------------------------------
// POLL WEBSITE FOR PENDING CARD-WRITE COMMANDS
// ------------------------------------------------------------------------------
void pollWebsiteForCardWrite() {
    if (WiFi.status() != WL_CONNECTED || isWriteArmPending) return;

    // Never start a slow HTTPS poll while a status LED sequence is playing
    if (redBlinksRemaining > 0 || isGreenLedActive) return;

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
        clientSecure.setBufferSizes(1024, 512);
        clientSecure.setTimeout(4000);
        http.setTimeout(4000);
        http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
        http.setReuse(false);
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
        clientSecure.setBufferSizes(1024, 512);
        clientSecure.setTimeout(5000);
        http.setTimeout(5000);
        http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
        http.setReuse(false);
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

    // 1. Initialize Status LEDs safely (Green=OFF, Blue=OFF, Red=OFF)
    initStatusLEDs();

    for (byte i = 0; i < 6; i++) defaultKey.keyByte[i] = 0xFF;

    // 2. Load Stored Wi-Fi & Backend URL Settings
    loadSettings();

    // 3. SPI & RC522 Initialization
    SPI.begin();
    rfid.PCD_Init();
    delay(50);

    // Check actual RC522 communication over SPI
    bool rfidOk = isRFIDCommunicating();
    // Blue LED indicates actual RFID reader communication
    setRFIDConnectionStatus(rfidOk);

    // 4. Start Access Point (AP Mode) Every Restart
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP(AP_SSID); // Open network at 192.168.4.1

    // 5. Register HTTP Web Server Endpoints
    server.on("/", HTTP_GET, handleRoot);
    server.on("/status", HTTP_GET, handleStatus);
    server.on("/scan-wifi", HTTP_GET, handleScanWifi);
    server.on("/connect", HTTP_POST, handleConnect);
    server.on("/set-backend", HTTP_POST, handleSetBackend);
    server.on("/arm-write", HTTP_POST, handleArmWrite);
    server.on("/api/submit-attendance", HTTP_ANY, handleApiSubmitAttendance);
    server.on("/scan", HTTP_ANY, handleApiSubmitAttendance);
    server.begin();

    // 6. Print Startup Banner
    Serial.println();
    Serial.println("====================================");
    Serial.println("COLLEGE RFID ATTENDANCE & WEB WRITER");
    Serial.println("====================================");
    Serial.print("Device ID: ");
    Serial.println(DEVICE_ID);
    Serial.print("RFID Reader: ");
    Serial.println(rfidOk ? "INITIALIZED (BLUE LED ON)" : "FAILED (BLUE LED OFF - Check wiring)");
    Serial.print("Access Point: ");
    Serial.println(AP_SSID);
    Serial.println("Web Portal: http://192.168.4.1");
    Serial.print("Backend Server: ");
    Serial.println(settings.backendUrl);
    if (strlen(settings.ssid) > 0) {
        Serial.print("Saved Wi-Fi: ");
        Serial.println(settings.ssid);
    }
    // Update green/red LED timing every 10ms, even during blocking HTTP calls
    ledTicker.attach_ms(10, updateStatusLEDs);

    Serial.println("LED Status: GREEN(D0)=Success, BLUE(D3)=Reader, RED(D4)=Error");
    Serial.println("System Status: READY");
    Serial.println("====================================");
    Serial.println();
}

// ------------------------------------------------------------------------------
// MAIN LOOP
// ------------------------------------------------------------------------------
void loop() {
    // 1. Green/Red LEDs are handled by ledTicker; only the Blue (RFID) check runs here
    checkRFIDStatus();

    // 2. Handle Web Portal Requests (192.168.4.1)
    server.handleClient();

    // 3. When connected to Wi-Fi, check for remote card-write commands from website
    pollWebsiteForCardWrite();

    // 4. Check for RFID Card Present
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(20);
        return;
    }
    if (!rfid.PICC_ReadCardSerial()) {
        delay(20);
        return;
    }

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
            showAttendanceSuccess();
        } else {
            lastWriteStatus = "FAILED";
            Serial.println("STATUS: [WRITE_FAILED] Failed to burn data into block.");
            Serial.println("------------------------------------");
            showAttendanceError();
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

        // Give the LED blink time to finish before the next background poll
        lastWebPollMillis = millis();
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    yield();
}
