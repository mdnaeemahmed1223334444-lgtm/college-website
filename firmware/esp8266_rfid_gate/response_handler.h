#ifndef RESPONSE_HANDLER_H
#define RESPONSE_HANDLER_H

#include <Arduino.h>

class ResponseHandler {
public:
    static void printStartupBanner(const String& deviceId, bool rfidOk, bool wifiOk, bool backendOk);
    static void handleScanResponse(const String& uid, const String& jsonPayload, int httpCode, bool networkSuccess);
};

#endif // RESPONSE_HANDLER_H
