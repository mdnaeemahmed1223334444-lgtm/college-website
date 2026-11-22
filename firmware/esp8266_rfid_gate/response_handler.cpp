#include "response_handler.h"
#include <ArduinoJson.h>

void ResponseHandler::printStartupBanner(const String& deviceId, bool rfidOk, bool wifiOk, bool backendOk) {
    Serial.println();
    Serial.println("====================================");
    Serial.println("COLLEGE RFID ATTENDANCE SYSTEM");
    Serial.println("====================================");
    Serial.print("Device ID: ");
    Serial.println(deviceId);
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

void ResponseHandler::handleScanResponse(const String& uid, const String& jsonPayload, int httpCode, bool networkSuccess) {
    Serial.println("------------------------------------");
    Serial.println("CARD SCANNED");
    Serial.print("UID: ");
    Serial.println(uid);

    if (!networkSuccess || httpCode <= 0 || httpCode >= 500) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Attendance could not be confirmed");
        Serial.println("------------------------------------");
        return;
    }

    // Support both ArduinoJson v6 and v7 transparently
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<768> doc;
#endif

    DeserializationError error = deserializeJson(doc, jsonPayload);

    if (error) {
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
