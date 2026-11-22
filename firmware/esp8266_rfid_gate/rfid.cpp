#include "rfid.h"
#include "config.h"

RFIDReader::RFIDReader(uint8_t ssPin, uint8_t rstPin)
    : mfrc522(ssPin, rstPin), lastScannedUID(""), lastScanMillis(0) {
    // Standard default factory key (FF FF FF FF FF FF)
    for (byte i = 0; i < 6; i++) {
        defaultKey.keyByte[i] = 0xFF;
    }
}

bool RFIDReader::begin() {
    SPI.begin();
    mfrc522.PCD_Init();
    delay(50);

    // Verify SPI communication with RC522.
    byte version = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
    if (version == 0x00 || version == 0xFF) {
        return false;
    }
    return true;
}

bool RFIDReader::isCardAvailable() {
    if (!mfrc522.PICC_IsNewCardPresent()) {
        return false;
    }
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
    if (currentUID == lastScannedUID && (now - lastScanMillis < CARD_DEBOUNCE_MS)) {
        return true;
    }
    lastScannedUID = currentUID;
    lastScanMillis = now;
    return false;
}

/**
 * Write 16 bytes of custom ASCII text into a Mifare Classic block.
 * Block 4 (Sector 1, Block 0) is recommended as Block 0-3 is Sector 0.
 */
bool RFIDReader::writeDataBlock(byte blockAddr, const String& text) {
    // Determine trailer block for authentication (each sector has 4 blocks: 0-3, 4-7, 8-11...)
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    // Authenticate with Key A
    MFRC522::StatusCode status = mfrc522.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(mfrc522.uid)
    );

    if (status != MFRC522::STATUS_OK) {
        Serial.print("Auth failed: ");
        Serial.println(mfrc522.GetStatusCodeName(status));
        return false;
    }

    // Prepare 16-byte buffer padded with nulls/spaces
    byte buffer[16];
    memset(buffer, ' ', 16);
    size_t len = text.length();
    if (len > 16) len = 16;
    memcpy(buffer, text.c_str(), len);

    // Write buffer to block
    status = mfrc522.MIFARE_Write(blockAddr, buffer, 16);
    if (status != MFRC522::STATUS_OK) {
        Serial.print("Write failed: ");
        Serial.println(mfrc522.GetStatusCodeName(status));
        return false;
    }

    return true;
}

/**
 * Read 16 bytes from a Mifare Classic block and return as ASCII String.
 */
String RFIDReader::readDataBlock(byte blockAddr) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    MFRC522::StatusCode status = mfrc522.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(mfrc522.uid)
    );

    if (status != MFRC522::STATUS_OK) {
        return "";
    }

    byte buffer[18];
    byte byteCount = sizeof(buffer);

    status = mfrc522.MIFARE_Read(blockAddr, buffer, &byteCount);
    if (status != MFRC522::STATUS_OK) {
        return "";
    }

    String result = "";
    for (byte i = 0; i < 16; i++) {
        if (buffer[i] >= 32 && buffer[i] <= 126) {
            result += (char)buffer[i];
        }
    }
    result.trim();
    return result;
}

void RFIDReader::dumpCardMemory() {
    mfrc522.PICC_DumpToSerial(&(mfrc522.uid));
}
