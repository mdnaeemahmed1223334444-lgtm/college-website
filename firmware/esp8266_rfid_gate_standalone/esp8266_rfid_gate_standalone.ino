/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — RFID ATTENDANCE GATE SCANNER (STANDALONE SINGLE-FILE)
 * ==============================================================================
 * Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 13.56MHz RFID Reader
 *   - 13.56 MHz RFID Cards / Tags
 *   - USB Cable to PC (Serial Monitor at 115200 baud)
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
 * Required Libraries (Install via Arduino IDE Library Manager):
 *   1. "MFRC522" by GithubCommunity
 *   2. "ArduinoJson" by Benoit Blanchon (v6 or v7)
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
// USER CONFIGURATION (Change these to match your network and backend)
// ------------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // 2.4 GHz Wi-Fi Name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // Wi-Fi Password

const char* DEVICE_ID     = "GATE-01";                // Registered Scanner ID
const char* DEVICE_TOKEN  = "dmc_gate01_secret_key_2026"; // Device Secret Key

// Backend URL:
// Option A: Your deployed college website (e.g. "https://yourcollege.edu.bd/api/attendance/scan")
// Option B: Local development IP (e.g. "http://192.168.0.105:3000/api/attendance/scan")
// Option C: Supabase Edge Function (e.g. "https://<ref>.supabase.co/functions/v1/rfid-attendance")
const char* BACKEND_URL   = "http://192.168.0.105:3000/api/attendance/scan";

// ------------------------------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ------------------------------------------------------------------------------
#define SS_PIN  D2   // GPIO4 - Connected to RC522 SDA
#define RST_PIN D1   // GPIO5 - Connected to RC522 RST

// Timing Constants
const unsigned long HTTP_TIMEOUT_MS  = 8000;  // 8 seconds timeout
const unsigned long DEBOUNCE_TIME_MS = 4000;  // Ignore same card scan on reader within 4s

// Global Objects
MFRC522 rfid(SS_PIN, RST_PIN);
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
// HELPER: Test Backend Connection at Startup
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
    Serial.println("COLLEGE RFID ATTENDANCE SYSTEM");
    Serial.println("====================================");
    Serial.print("Device ID: ");
    Serial.println(DEVICE_ID);
    Serial.print("RFID Reader: ");
    Serial.println(rfidOk ? "INITIALIZED" : "FAILED");
    Serial.print("Wi-Fi: ");
    Serial.println(wifiOk ? "CONNECTED" : "FAILED");
    Serial.print("Backend: ");
    Serial.println(backendOk ? "CONNECTED" : "OFFLINE");
    Serial.print("System Status: ");
    Serial.println((rfidOk && wifiOk) ? "READY" : "NOT READY");
    Serial.println("====================================");
    Serial.println();
}

// ------------------------------------------------------------------------------
// HELPER: Send Scan Event to Backend and Print Formatted Result
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

    // Parse JSON response
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
// SETUP
// ------------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(500);

    // 1. SPI & MFRC522 Initialization
    SPI.begin();
    rfid.PCD_Init();
    delay(50);

    // Verify SPI communication with RC522
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
    // 1. Non-blocking Wi-Fi auto-reconnection
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long now = millis();
        if (now - lastReconnectAttempt > 5000) {
            lastReconnectAttempt = now;
            WiFi.disconnect();
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        }
    }

    // 2. Check for RFID card present
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(20);
        return;
    }

    // 3. Read serial from card
    if (!rfid.PICC_ReadCardSerial()) {
        delay(20);
        return;
    }

    // 4. Extract and normalize UID
    String currentUID = getNormalizedUID(&(rfid.uid));

    // 5. Debounce repeated scans of same card resting on reader
    unsigned long now = millis();
    if (currentUID == lastScannedUID && (now - lastScanMillis < DEBOUNCE_TIME_MS)) {
        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
        delay(50);
        return;
    }

    lastScannedUID = currentUID;
    lastScanMillis = now;

    // 6. Process attendance with backend
    processCardScan(currentUID);

    // 7. Halt card to release RF field
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    yield(); // Keep ESP8266 background Wi-Fi and watchdog happy
}
