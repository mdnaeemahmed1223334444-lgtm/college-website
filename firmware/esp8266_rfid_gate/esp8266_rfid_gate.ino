/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — RFID ATTENDANCE GATE SCANNER FIRMWARE
 * Target Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 RFID Reader (13.56 MHz SPI)
 *   - 13.56 MHz RFID Cards / Keyfobs
 *
 * Current Hardware Note:
 *   Operates strictly with ESP8266 and RC522 over USB. No LEDs, buzzers,
 *   or external displays are required or assumed.
 *   All user feedback is delivered via Serial Monitor at 115200 baud.
 *
 * Wiring Connections:
 *   RC522 SDA / SS -> ESP8266 D2 (GPIO4)
 *   RC522 SCK      -> ESP8266 D5 (GPIO14)
 *   RC522 MOSI     -> ESP8266 D7 (GPIO13)
 *   RC522 MISO     -> ESP8266 D6 (GPIO12)
 *   RC522 RST      -> ESP8266 D1 (GPIO5)
 *   RC522 3.3V     -> ESP8266 3V3 (DO NOT USE 5V/VIN!)
 *   RC522 GND      -> ESP8266 GND
 * ==============================================================================
 */

#include <Arduino.h>
#include "config.h"
#include "rfid.h"
#include "wifi_mgr.h"
#include "api_client.h"
#include "response_handler.h"

// Instantiate RFID reader
RFIDReader reader(RFID_SS_PIN, RFID_RST_PIN);

void setup() {
    // 1. Initialize Serial Monitor
    Serial.begin(SERIAL_BAUD_RATE);
    delay(500);

    // Initialize Onboard Blue LED (GPIO2 / LED_BUILTIN)
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH); // Built-in LED on ESP8266 is active LOW (HIGH = OFF)

    // 2. Initialize RFID Reader
    bool rfidOk = reader.begin();

    // 3. Connect to Wi-Fi
    bool wifiOk = WiFiManager::connect(WIFI_SSID, WIFI_PASSWORD, WIFI_TIMEOUT_MS);

    // 4. Test Backend Reachability
    bool backendOk = false;
    if (wifiOk) {
        backendOk = APIClient::testBackendConnection(BACKEND_URL, DEVICE_ID, DEVICE_TOKEN, HTTP_TIMEOUT_MS);
    }

    // 5. Output Startup Banner matching user specification
    ResponseHandler::printStartupBanner(DEVICE_ID, rfidOk, wifiOk, backendOk);
}

void loop() {
    // 1. Maintain Wi-Fi connectivity in background (non-blocking)
    WiFiManager::maintainConnection(WIFI_SSID, WIFI_PASSWORD);

    // 2. Poll for RFID card
    if (!reader.isCardAvailable()) {
        delay(20);
        return;
    }

    // Blink onboard blue LED on EVERY card scan!
    digitalWrite(LED_BUILTIN, LOW);  // Turn ON
    delay(120);
    digitalWrite(LED_BUILTIN, HIGH); // Turn OFF

    // 3. Read and normalize UID
    String uid = reader.readCardUID();

    // 4. Prevent spamming if card remains resting on reader
    if (reader.isDuplicateScan(uid)) {
        reader.haltCard();
        delay(50);
        return;
    }

    // 5. Check network readiness
    if (!WiFiManager::isConnected()) {
        reader.haltCard();
        ResponseHandler::handleScanResponse(uid, "", 0, false);
        return;
    }

    // 6. Submit scan event to backend over HTTPS/HTTP
    String responseBody = "";
    int httpCode = -1;
    bool requestOk = APIClient::sendScanEvent(
        BACKEND_URL,
        DEVICE_ID,
        DEVICE_TOKEN,
        uid,
        responseBody,
        httpCode,
        HTTP_TIMEOUT_MS
    );

    // 7. Process response and print formatted results to Serial Monitor
    ResponseHandler::handleScanResponse(uid, responseBody, httpCode, requestOk);

    // 8. Safely halt card
    reader.haltCard();

    // Small yield for ESP8266 background tasks & watchdog timer
    yield();
}
