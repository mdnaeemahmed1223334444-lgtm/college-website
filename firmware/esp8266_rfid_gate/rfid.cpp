#include "rfid.h"
#include "config.h"

RFIDReader::RFIDReader(uint8_t ssPin, uint8_t rstPin)
    : mfrc522(ssPin, rstPin), lastScannedUID(""), lastScanMillis(0) {}

bool RFIDReader::begin() {
    SPI.begin();
    mfrc522.PCD_Init();
    delay(50);

    // Verify SPI communication with RC522.
    // VersionReg returns 0x91/0x92 for genuine NXP RC522, 0x12 for counterfeit/clones.
    // If it returns 0x00 or 0xFF, communication over SPI is broken (wiring or power issue).
    byte version = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
    if (version == 0x00 || version == 0xFF) {
        return false;
    }
    return true;
}

bool RFIDReader::isCardAvailable() {
    // Detect new card present in RF field
    if (!mfrc522.PICC_IsNewCardPresent()) {
        return false;
    }
    // Select and read serial from card
    if (!mfrc522.PICC_ReadCardSerial()) {
        return false;
    }
    return true;
}

String RFIDReader::readCardUID() {
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) {
            uid += "0";
        }
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    return uid;
}

void RFIDReader::haltCard() {
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
}

bool RFIDReader::isDuplicateScan(const String& currentUID) {
    unsigned long now = millis();
    // If the exact same card was scanned less than CARD_DEBOUNCE_MS ago, ignore it
    if (currentUID == lastScannedUID && (now - lastScanMillis < CARD_DEBOUNCE_MS)) {
        return true;
    }
    lastScannedUID = currentUID;
    lastScanMillis = now;
    return false;
}
