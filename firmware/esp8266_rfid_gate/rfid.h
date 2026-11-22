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

    // RFID Write & Read Sector Data Functions (Mifare Classic 1K)
    bool writeDataBlock(byte blockAddr, const String& text);
    String readDataBlock(byte blockAddr);
    void dumpCardMemory();

private:
    MFRC522 mfrc522;
    MFRC522::MIFARE_Key defaultKey;
    String lastScannedUID;
    unsigned long lastScanMillis;
};

#endif // RFID_MODULE_H
