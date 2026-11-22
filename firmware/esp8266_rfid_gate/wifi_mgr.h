#ifndef WIFI_MGR_H
#define WIFI_MGR_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class WiFiManager {
public:
    static bool connect(const char* ssid, const char* password, unsigned long timeoutMs = 15000);
    static bool isConnected();
    static void maintainConnection(const char* ssid, const char* password);
};

#endif // WIFI_MGR_H
