#ifndef RFID_MODULE_H
#define RFID_MODULE_H

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>

class RFIDReader {
public:
    RFIDReader(uint8_t ssPin, uint8_t rstPin);
    bool begin();
    bool isCardAvailable();
    String readCardUID();
    void haltCard();
    bool isDuplicateScan(const String& currentUID);

private:
    MFRC522 mfrc522;
    String lastScannedUID;
    unsigned long lastScanMillis;
};

#endif // RFID_MODULE_H
