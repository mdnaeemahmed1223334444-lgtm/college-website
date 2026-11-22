#include "wifi_mgr.h"

static unsigned long lastReconnectAttempt = 0;

bool WiFiManager::connect(const char* ssid, const char* password, unsigned long timeoutMs) {
    WiFi.persistent(false);
    WiFi.disconnect(true);
    delay(100);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - start < timeoutMs)) {
        delay(200);
    }

    return WiFi.status() == WL_CONNECTED;
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void WiFiManager::maintainConnection(const char* ssid, const char* password) {
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long now = millis();
        if (now - lastReconnectAttempt > 5000) {
            lastReconnectAttempt = now;
            WiFi.disconnect();
            WiFi.begin(ssid, password);
        }
    }
}
