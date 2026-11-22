#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>

class APIClient {
public:
    static bool testBackendConnection(const String& url, const String& deviceId, const String& token, unsigned long timeoutMs = 8000);
    static bool sendScanEvent(const String& url, const String& deviceId, const String& token, const String& uid, String& responsePayload, int& httpCode, unsigned long timeoutMs = 8000);
};

#endif // API_CLIENT_H
