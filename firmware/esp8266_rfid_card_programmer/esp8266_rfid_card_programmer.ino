/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — DESK RFID CARD PROGRAMMER & WRITER TOOL
 * ==============================================================================
 * Purpose:
 *   Use this at the Admin desk via USB to read, write, and burn student
 *   data onto RFID cards. No Wi-Fi required!
 *
 * Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 13.56MHz RFID Reader
 *   - 13.56 MHz RFID Cards / Keyfobs (Mifare Classic 1K)
 *
 * Wiring (Same as Gate Scanner):
 *   RC522 SDA / SS -> ESP8266 D2 (GPIO4)
 *   RC522 SCK      -> ESP8266 D5 (GPIO14)
 *   RC522 MOSI     -> ESP8266 D7 (GPIO13)
 *   RC522 MISO     -> ESP8266 D6 (GPIO12)
 *   RC522 RST      -> ESP8266 D1 (GPIO5)
 *   RC522 3.3V     -> ESP8266 3V3
 *   RC522 GND      -> ESP8266 GND
 *
 * How to Use (Serial Monitor at 115200 baud):
 *   1. Just tap any card to READ its factory UID & stored Student Data.
 *   2. To WRITE, type in Serial Monitor:
 *        WRITE DMC-2026-102
 *      Then tap the card to burn the student code to Block 4!
 * ==============================================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  D2   // GPIO4 - RC522 SDA
#define RST_PIN D1   // GPIO5 - RC522 RST
const byte TARGET_BLOCK = 4; // Sector 1, Block 0

MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key defaultKey;

bool isWriteMode = false;
String pendingWriteData = "";
String lastScannedUID = "";
unsigned long lastScanMillis = 0;

String getNormalizedUID(MFRC522::Uid *uid) {
    String hexUID = "";
    for (byte i = 0; i < uid->size; i++) {
        if (uid->uidByte[i] < 0x10) hexUID += "0";
        hexUID += String(uid->uidByte[i], HEX);
    }
    hexUID.toUpperCase();
    return hexUID;
}

bool writeBlock(byte blockAddr, const String& text) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    MFRC522::StatusCode status = rfid.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(rfid.uid)
    );

    if (status != MFRC522::STATUS_OK) {
        Serial.print("Auth failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return false;
    }

    byte buffer[16];
    memset(buffer, ' ', 16);
    size_t len = text.length();
    if (len > 16) len = 16;
    memcpy(buffer, text.c_str(), len);

    status = rfid.MIFARE_Write(blockAddr, buffer, 16);
    if (status != MFRC522::STATUS_OK) {
        Serial.print("Write failed: ");
        Serial.println(rfid.GetStatusCodeName(status));
        return false;
    }
    return true;
}

String readBlock(byte blockAddr) {
    byte sector = blockAddr / 4;
    byte trailerBlock = (sector * 4) + 3;

    MFRC522::StatusCode status = rfid.PCD_Authenticate(
        MFRC522::PICC_CMD_MF_AUTH_KEY_A,
        trailerBlock,
        &defaultKey,
        &(rfid.uid)
    );

    if (status != MFRC522::STATUS_OK) return "";

    byte buffer[18];
    byte byteCount = sizeof(buffer);
    status = rfid.MIFARE_Read(blockAddr, buffer, &byteCount);
    if (status != MFRC522::STATUS_OK) return "";

    String result = "";
    for (byte i = 0; i < 16; i++) {
        if (buffer[i] >= 32 && buffer[i] <= 126) {
            result += (char)buffer[i];
        }
    }
    result.trim();
    return result;
}

void setup() {
    Serial.begin(115200);
    delay(500);

    for (byte i = 0; i < 6; i++) defaultKey.keyByte[i] = 0xFF;

    SPI.begin();
    rfid.PCD_Init();
    delay(50);

    Serial.println();
    Serial.println("==================================================");
    Serial.println("DHAKA MODEL COLLEGE — RFID CARD WRITER & READER");
    Serial.println("==================================================");
    Serial.println("INSTRUCTIONS:");
    Serial.println("  1. Tap any card to READ its UID and Student Data.");
    Serial.println("  2. To WRITE, type in Serial Monitor:");
    Serial.println("       WRITE <StudentCode>");
    Serial.println("     Example: WRITE DMC-2026-102");
    Serial.println("     Then tap the card to burn the code into memory.");
    Serial.println("==================================================");
    Serial.println("READY. Listening for cards and commands...\n");
}

void loop() {
    // 1. Check Serial input for WRITE command
    if (Serial.available()) {
        String input = Serial.readStringUntil('\n');
        input.trim();

        if (input.startsWith("WRITE ") || input.startsWith("write ")) {
            pendingWriteData = input.substring(6);
            pendingWriteData.trim();

            if (pendingWriteData.length() > 0) {
                isWriteMode = true;
                Serial.println("--------------------------------------------------");
                Serial.println(">>> WRITE MODE ENGAGED <<<");
                Serial.print("Target Data: [");
                Serial.print(pendingWriteData);
                Serial.println("]");
                Serial.println("PLEASE TAP THE RFID CARD ON THE READER NOW...");
                Serial.println("--------------------------------------------------");
            }
        } else if (input.equalsIgnoreCase("HELP")) {
            Serial.println("Type 'WRITE <StudentCode>' to program a card, or tap card to read.");
        }
    }

    // 2. Poll for card
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(20);
        return;
    }
    if (!rfid.PICC_ReadCardSerial()) {
        delay(20);
        return;
    }

    String uid = getNormalizedUID(&(rfid.uid));

    // Handle Write
    if (isWriteMode) {
        Serial.println("--------------------------------------------------");
        Serial.print("CARD DETECTED! UID: ");
        Serial.println(uid);

        bool writeOk = writeBlock(TARGET_BLOCK, pendingWriteData);
        if (writeOk) {
            String verified = readBlock(TARGET_BLOCK);
            Serial.println("STATUS: [SUCCESS] Card successfully programmed!");
            Serial.print("Card UID (Copy to Website): ");
            Serial.println(uid);
            Serial.print("Verified Written Data:      ");
            Serial.println(verified);
        } else {
            Serial.println("STATUS: [FAILED] Could not write to card.");
        }
        Serial.println("--------------------------------------------------\n");

        isWriteMode = false;
        pendingWriteData = "";
    } else {
        // Read Mode
        unsigned long now = millis();
        if (uid == lastScannedUID && (now - lastScanMillis < 3000)) {
            rfid.PICC_HaltA();
            rfid.PCD_StopCrypto1();
            delay(50);
            return;
        }
        lastScannedUID = uid;
        lastScanMillis = now;

        Serial.println("--------------------------------------------------");
        Serial.println("CARD SCANNED:");
        Serial.print("Card UID (Copy this to website): ");
        Serial.println(uid);

        String storedData = readBlock(TARGET_BLOCK);
        Serial.print("Stored Student Data (Block 4):    ");
        if (storedData.length() > 0) {
            Serial.println(storedData);
        } else {
            Serial.println("[Empty / Unwritten Card]");
        }
        Serial.println("--------------------------------------------------\n");
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    yield();
}
