#include "api_client.h"

bool APIClient::testBackendConnection(const String& url, const String& deviceId, const String& token, unsigned long timeoutMs) {
    bool isHttps = url.startsWith("https://");
    HTTPClient http;
    int httpCode = -1;

    if (isHttps) {
        WiFiClientSecure clientSecure;
        clientSecure.setInsecure(); // Bypass cert chain verification for ESP8266 RAM efficiency
        clientSecure.setTimeout(timeoutMs);
        http.setTimeout(timeoutMs);
        if (http.begin(clientSecure, url)) {
            http.addHeader("X-Device-Id", deviceId);
            http.addHeader("X-Device-Token", token);
            httpCode = http.GET();
            http.end();
        }
    } else {
        WiFiClient client;
        client.setTimeout(timeoutMs);
        http.setTimeout(timeoutMs);
        if (http.begin(client, url)) {
            http.addHeader("X-Device-Id", deviceId);
            http.addHeader("X-Device-Token", token);
            httpCode = http.GET();
            http.end();
        }
    }

    return (httpCode >= 200 && httpCode < 400);
}

bool APIClient::sendScanEvent(const String& url, const String& deviceId, const String& token, const String& uid, String& responsePayload, int& httpCode, unsigned long timeoutMs) {
    bool isHttps = url.startsWith("https://");
    HTTPClient http;
    httpCode = -1;
    responsePayload = "";

    String requestBody = "{\"device_id\":\"" + deviceId + "\",\"card_uid\":\"" + uid + "\"}";

    bool initialized = false;
    std::unique_ptr<WiFiClientSecure> secureClient;
    std::unique_ptr<WiFiClient> plainClient;

    if (isHttps) {
        secureClient.reset(new WiFiClientSecure());
        secureClient->setInsecure();
        secureClient->setTimeout(timeoutMs);
        http.setTimeout(timeoutMs);
        initialized = http.begin(*secureClient, url);
    } else {
        plainClient.reset(new WiFiClient());
        plainClient->setTimeout(timeoutMs);
        http.setTimeout(timeoutMs);
        initialized = http.begin(*plainClient, url);
    }

    if (!initialized) {
        return false;
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Id", deviceId);
    http.addHeader("X-Device-Token", token);

    httpCode = http.POST(requestBody);

    if (httpCode > 0) {
        responsePayload = http.getString();
        http.end();
        return true;
    } else {
        http.end();
        return false;
    }
}
