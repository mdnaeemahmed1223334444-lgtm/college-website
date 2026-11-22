/**
 * ==============================================================================
 * DHAKA MODEL COLLEGE — RFID ATTENDANCE & WEB CARD WRITER MASTER FIRMWARE
 * ==============================================================================
 * Hardware:
 *   - ESP8266 NodeMCU V3 (CH340)
 *   - MFRC522 RC522 13.56 MHz RFID Reader
 *   - 13.56 MHz RFID Cards (Mifare Classic 1K)
 *   - USB Cable (Serial Monitor at 115200 baud)
 *
 * Current Hardware Note:
 *   Operates strictly with ESP8266, RC522 and USB power.
 *   No LEDs, buzzers, or external displays are required or assumed.
 *
 * Wiring Connections:
 *   RC522 SDA / SS -> ESP8266 D2 (GPIO4)
 *   RC522 SCK      -> ESP8266 D5 (GPIO14)
 *   RC522 MOSI     -> ESP8266 D7 (GPIO13)
 *   RC522 MISO     -> ESP8266 D6 (GPIO12)
 *   RC522 RST      -> ESP8266 D1 (GPIO5)
 *   RC522 3.3V     -> ESP8266 3V3 (3.3V ONLY! Never connect to 5V or VIN!)
 *   RC522 GND      -> ESP8266 GND
 *
 * KEY FEATURES:
 *   1. Access Point on every boot ("College-RFID-AP" at 192.168.4.1).
 *   2. Web portal at 192.168.4.1 to scan Wi-Fi, select SSID, and connect.
 *   3. Remembers Wi-Fi password in EEPROM (does not auto-connect on boot).
 *   4. Offline Card Writer: Write student codes to cards right from your phone
 *      at 192.168.4.1 even when the ESP has no external internet!
 *   5. Online Card Writer: When connected to Wi-Fi, writes cards commanded
 *      directly from the college website admin panel.
 *   6. Attendance by Written Data: The attendance counts what is written
 *      on the card (Sector 1, Block 4), NOT the fixed factory UID.
 *   7. Testing Mode: Unlimited scans allowed for live trial testing.
 * ==============================================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// ------------------------------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ------------------------------------------------------------------------------
#define SS_PIN  D2   // GPIO4 - RC522 SDA/SS
#define RST_PIN D1   // GPIO5 - RC522 RST
const byte TARGET_DATA_BLOCK = 4; // Sector 1, Block 0 (Block 4)

// ------------------------------------------------------------------------------
// EEPROM SETTINGS STORAGE
// ------------------------------------------------------------------------------
#define EEPROM_SIZE   256
#define EEPROM_MAGIC  0x55

struct DeviceSettings {
    uint8_t magic;
    char ssid[33];
    char pass[65];
    char backendUrl[128];
};

DeviceSettings settings;

// Defaults
const char* AP_SSID         = "College-RFID-AP";
const char* DEFAULT_BACKEND = "http://192.168.0.105:3000/api/attendance/scan";
const char* DEVICE_ID       = "GATE-01";
const char* DEVICE_TOKEN    = "dmc_gate01_secret_key_2026";

// Global Instances
MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key defaultKey;
ESP8266WebServer server(80);

// State Variables
bool isWriteArmPending = false;
String pendingWriteData = "";
String lastWriteStatus = "IDLE";
String lastWrittenUID = "";
String lastWrittenData = "";

String lastScannedUID = "";
String lastScannedData = "";
String lastScanStatus = "READY";
String lastStudentName = "";
unsigned long lastScanMillis = 0;
unsigned long lastWebPollMillis = 0;

// ------------------------------------------------------------------------------
// EEPROM LOAD / SAVE
// ------------------------------------------------------------------------------
void loadSettings() {
    EEPROM.begin(EEPROM_SIZE);
    EEPROM.get(0, settings);
    if (settings.magic != EEPROM_MAGIC) {
        settings.magic = EEPROM_MAGIC;
        memset(settings.ssid, 0, sizeof(settings.ssid));
        memset(settings.pass, 0, sizeof(settings.pass));
        strncpy(settings.backendUrl, DEFAULT_BACKEND, sizeof(settings.backendUrl));
        EEPROM.put(0, settings);
        EEPROM.commit();
    }
}

void saveSettings() {
    settings.magic = EEPROM_MAGIC;
    EEPROM.put(0, settings);
    EEPROM.commit();
}

// ------------------------------------------------------------------------------
// RFID HELPERS
// ------------------------------------------------------------------------------
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
        Serial.print("AUTH ERROR: ");
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
        Serial.print("WRITE ERROR: ");
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

// ------------------------------------------------------------------------------
// EMBEDDED WEB INTERFACE (HTML / CSS / JS)
// ------------------------------------------------------------------------------
const char PAGE_INDEX[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>College RFID Scanner & Writer</title>
  <style>
    :root { --primary: #0f766e; --primary-hover: #115e59; --bg: #f8fafc; --card: #ffffff; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: #1e293b; padding: 16px; max-width: 600px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #0f766e, #065f46); color: white; padding: 20px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { font-size: 20px; font-weight: 700; }
    header p { font-size: 12px; opacity: 0.9; margin-top: 4px; }
    .card { background: var(--card); border-radius: 14px; padding: 18px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px; }
    input, select { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; margin-bottom: 12px; outline: none; }
    input:focus, select:focus { border-color: var(--primary); ring: 2px solid #99f6e4; }
    .btn { display: inline-block; width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; }
    .btn:hover { background: var(--primary-hover); }
    .btn-secondary { background: #e2e8f0; color: #334155; margin-top: 8px; }
    .btn-secondary:hover { background: #cbd5e1; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 12px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-blue { background: #e0f2fe; color: #075985; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; }
    .info-item span { color: #64748b; font-size: 11px; display: block; }
    .info-item strong { color: #0f172a; font-size: 13px; word-break: break-all; }
  </style>
</head>
<body>
  <header>
    <h1>Dhaka Model College</h1>
    <p>RFID Gate Attendance & Card Programmer Portal</p>
  </header>

  <!-- Section 1: Card Writer (Works Offline!) -->
  <div class="card">
    <h2>✍️ Write Student ID to Card</h2>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
      Burn a student code onto any 13.56 MHz RFID card. Works even when disconnected from Wi-Fi!
    </p>
    <label>Student Code to Burn (e.g. DMC-2026-102)</label>
    <input type="text" id="writeInput" placeholder="Enter student code (max 16 chars)" maxlength="16">
    <button class="btn" onclick="armWriter()">⚡ ARM CARD WRITER</button>
    <div id="writeStatusBox" style="margin-top: 12px; display: none;">
      <div id="writeBadge" class="status-badge badge-amber">WAITING FOR CARD TAP...</div>
      <p id="writeMsg" style="font-size: 12px; color: #334155;"></p>
    </div>
  </div>

  <!-- Section 2: Last Scanned Card Info -->
  <div class="card">
    <h2>🪪 Live RFID Reader Status</h2>
    <div class="info-grid">
      <div class="info-item">
        <span>Hardware UID:</span>
        <strong id="cardUid">--</strong>
      </div>
      <div class="info-item">
        <span>Burned Student Data:</span>
        <strong id="cardData">--</strong>
      </div>
      <div class="info-item">
        <span>Last Scan Status:</span>
        <strong id="scanStatus">READY</strong>
      </div>
      <div class="info-item">
        <span>Student Name:</span>
        <strong id="studentName">--</strong>
      </div>
    </div>
  </div>

  <!-- Section 3: Wi-Fi Setup -->
  <div class="card">
    <h2>📶 Wi-Fi Configuration</h2>
    <div id="wifiStatusBadge" class="status-badge badge-amber">DISCONNECTED</div>
    <div id="wifiIpInfo" style="font-size: 12px; color: #475569; margin-bottom: 12px;"></div>

    <label>Select Nearby Wi-Fi</label>
    <select id="ssidSelect" onchange="document.getElementById('ssidInput').value = this.value">
      <option value="">-- Click Scan Wi-Fi below --</option>
    </select>
    <button class="btn btn-secondary" onclick="scanWifi()" style="margin-bottom: 12px;">🔍 Scan Nearby Networks</button>

    <label>Or Type Wi-Fi SSID</label>
    <input type="text" id="ssidInput" placeholder="Wi-Fi Name">

    <label>Wi-Fi Password (Saved in Flash)</label>
    <input type="password" id="passInput" placeholder="Wi-Fi Password">

    <button class="btn" onclick="connectWifi()">Connect to Wi-Fi</button>
  </div>

  <script>
    function updateStatus() {
      fetch('/status')
        .then(res => res.json())
        .then(data => {
          document.getElementById('cardUid').innerText = data.last_uid || '--';
          document.getElementById('cardData').innerText = data.last_data || '[Blank]';
          document.getElementById('scanStatus').innerText = data.last_status || 'READY';
          document.getElementById('studentName').innerText = data.student_name || '--';

          const badge = document.getElementById('wifiStatusBadge');
          if (data.wifi_connected) {
            badge.className = 'status-badge badge-green';
            badge.innerText = 'CONNECTED TO ' + data.wifi_ssid;
            document.getElementById('wifiIpInfo').innerText = 'Station IP: ' + data.station_ip;
          } else {
            badge.className = 'status-badge badge-amber';
            badge.innerText = 'DISCONNECTED (AP Mode Only)';
            document.getElementById('wifiIpInfo').innerText = 'Connect your phone to College-RFID-AP';
          }

          if (data.is_write_armed) {
            document.getElementById('writeStatusBox').style.display = 'block';
            document.getElementById('writeBadge').className = 'status-badge badge-amber';
            document.getElementById('writeBadge').innerText = 'ARMED — TAP CARD ON READER NOW...';
            document.getElementById('writeMsg').innerText = 'Target: ' + data.pending_write_data;
          } else if (data.last_write_status === 'SUCCESS') {
            document.getElementById('writeStatusBox').style.display = 'block';
            document.getElementById('writeBadge').className = 'status-badge badge-green';
            document.getElementById('writeBadge').innerText = 'SUCCESS! CARD WRITTEN';
            document.getElementById('writeMsg').innerText = 'UID: ' + data.last_written_uid + ' | Data: ' + data.last_written_data;
          }
        }).catch(() => {});
    }

    function scanWifi() {
      const select = document.getElementById('ssidSelect');
      select.innerHTML = '<option>Scanning networks...</option>';
      fetch('/scan-wifi')
        .then(res => res.json())
        .then(list => {
          select.innerHTML = '<option value="">-- Choose Wi-Fi --</option>';
          list.forEach(net => {
            const opt = document.createElement('option');
            opt.value = net.ssid;
            opt.innerText = net.ssid + ' (' + net.rssi + ' dBm)';
            select.appendChild(opt);
          });
        });
    }

    function connectWifi() {
      const ssid = document.getElementById('ssidInput').value;
      const pass = document.getElementById('passInput').value;
      if (!ssid) { alert('Please enter Wi-Fi SSID'); return; }
      fetch('/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'ssid=' + encodeURIComponent(ssid) + '&pass=' + encodeURIComponent(pass)
      }).then(res => res.text()).then(txt => alert(txt));
    }

    function armWriter() {
      const val = document.getElementById('writeInput').value.trim();
      if (!val) { alert('Enter a student code to write!'); return; }
      fetch('/arm-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(val)
      }).then(res => res.text()).then(() => {
        document.getElementById('writeStatusBox').style.display = 'block';
        updateStatus();
      });
    }

    setInterval(updateStatus, 1500);
    updateStatus();
  </script>
</body>
</html>
)rawliteral";

// ------------------------------------------------------------------------------
// HTTP SERVER ROUTE HANDLERS
// ------------------------------------------------------------------------------
void handleRoot() {
    server.send_P(200, "text/html", PAGE_INDEX);
}

void handleStatus() {
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<512> doc;
#endif

    doc["wifi_connected"] = (WiFi.status() == WL_CONNECTED);
    doc["wifi_ssid"] = (WiFi.status() == WL_CONNECTED) ? WiFi.SSID() : "";
    doc["station_ip"] = (WiFi.status() == WL_CONNECTED) ? WiFi.localIP().toString() : "";
    doc["is_write_armed"] = isWriteArmPending;
    doc["pending_write_data"] = pendingWriteData;
    doc["last_write_status"] = lastWriteStatus;
    doc["last_written_uid"] = lastWrittenUID;
    doc["last_written_data"] = lastWrittenData;
    doc["last_uid"] = lastScannedUID;
    doc["last_data"] = lastScannedData;
    doc["last_status"] = lastScanStatus;
    doc["student_name"] = lastStudentName;

    String jsonStr;
    serializeJson(doc, jsonStr);
    server.send(200, "application/json", jsonStr);
}

void handleScanWifi() {
    int n = WiFi.scanNetworks();
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<1024> doc;
#endif
    JsonArray arr = doc.to<JsonArray>();

    for (int i = 0; i < n; ++i) {
        JsonObject obj = arr.createNestedObject();
        obj["ssid"] = WiFi.SSID(i);
        obj["rssi"] = WiFi.RSSI(i);
    }

    String jsonStr;
    serializeJson(arr, jsonStr);
    server.send(200, "application/json", jsonStr);
}

void handleConnect() {
    if (server.hasArg("ssid")) {
        String newSsid = server.arg("ssid");
        String newPass = server.arg("pass");

        strncpy(settings.ssid, newSsid.c_str(), sizeof(settings.ssid) - 1);
        strncpy(settings.pass, newPass.c_str(), sizeof(settings.pass) - 1);
        saveSettings();

        WiFi.begin(settings.ssid, settings.pass);
        server.send(200, "text/plain", "Credentials saved! Connecting to " + newSsid + ". Check status in a few seconds.");
    } else {
        server.send(400, "text/plain", "Missing SSID parameter");
    }
}

void handleArmWrite() {
    if (server.hasArg("data")) {
        pendingWriteData = server.arg("data");
        pendingWriteData.trim();
        isWriteArmPending = true;
        lastWriteStatus = "ARMED";

        Serial.println();
        Serial.println("====================================");
        Serial.println(">>> CARD WRITER ARMED VIA WEBPAGE <<<");
        Serial.print("Target Code to Burn: [");
        Serial.print(pendingWriteData);
        Serial.println("]");
        Serial.println("TAP THE RFID CARD ON THE READER NOW...");
        Serial.println("====================================");

        server.send(200, "text/plain", "ARMED");
    } else {
        server.send(400, "text/plain", "Missing data parameter");
    }
}

// ------------------------------------------------------------------------------
// SEND ATTENDANCE SCAN EVENT TO WEBSITE API
// ------------------------------------------------------------------------------
void sendAttendanceScan(const String& uid, const String& writtenData) {
    Serial.println("------------------------------------");
    Serial.println("CARD SCANNED AT GATE");
    Serial.print("Hardware UID:  ");
    Serial.println(uid);
    Serial.print("Card Data:     ");
    Serial.println(writtenData.length() > 0 ? writtenData : "[Blank / Unwritten]");

    lastScannedUID = uid;
    lastScannedData = writtenData;

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("STATUS: OFFLINE_SCAN");
        Serial.println("MESSAGE: Read successfully. (Connect to Wi-Fi to submit to website)");
        lastScanStatus = "OFFLINE_READ";
        lastStudentName = writtenData;
        Serial.println("------------------------------------");
        return;
    }

    String url = String(settings.backendUrl);
    bool isHttps = url.startsWith("https://");
    HTTPClient http;

    // Notice: card_data is sent as the primary key!
    String requestJson = "{\"device_id\":\"" + String(DEVICE_ID) +
                         "\",\"card_uid\":\"" + uid +
                         "\",\"card_data\":\"" + writtenData + "\"}";

    bool initOk = false;
    std::unique_ptr<WiFiClientSecure> secureClient;
    std::unique_ptr<WiFiClient> plainClient;

    if (isHttps) {
        secureClient.reset(new WiFiClientSecure());
        secureClient->setInsecure();
        secureClient->setTimeout(8000);
        http.setTimeout(8000);
        initOk = http.begin(*secureClient, url);
    } else {
        plainClient.reset(new WiFiClient());
        plainClient->setTimeout(8000);
        http.setTimeout(8000);
        initOk = http.begin(*plainClient, url);
    }

    if (!initOk) {
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Could not reach attendance server");
        lastScanStatus = "NETWORK_ERROR";
        Serial.println("------------------------------------");
        return;
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Id", DEVICE_ID);
    http.addHeader("X-Device-Token", DEVICE_TOKEN);

    int httpCode = http.POST(requestJson);

    if (httpCode <= 0 || httpCode >= 500) {
        http.end();
        Serial.println("STATUS: NETWORK_ERROR");
        Serial.println("MESSAGE: Server returned error or timeout");
        lastScanStatus = "NETWORK_ERROR";
        Serial.println("------------------------------------");
        return;
    }

    String responseBody = http.getString();
    http.end();

#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
    JsonDocument doc;
#else
    StaticJsonDocument<768> doc;
#endif

    DeserializationError err = deserializeJson(doc, responseBody);
    if (!err) {
        const char* status = doc["status"] | "UNKNOWN";
        const char* studentName = doc["student_name"] | "";
        const char* msg = doc["message"] | "";

        lastScanStatus = String(status);
        lastStudentName = String(studentName);

        Serial.print("STATUS: ");
        Serial.println(status);
        if (strlen(studentName) > 0) {
            Serial.print("STUDENT: ");
            Serial.println(studentName);
        }
        if (strlen(msg) > 0) {
            Serial.print("MESSAGE: ");
            Serial.println(msg);
        }
    } else {
        Serial.println("STATUS: UNKNOWN_RESPONSE");
    }

    Serial.println("------------------------------------");
}

// ------------------------------------------------------------------------------
// POLL WEBSITE FOR PENDING CARD-WRITE COMMANDS
// ------------------------------------------------------------------------------
void pollWebsiteForCardWrite() {
    if (WiFi.status() != WL_CONNECTED || isWriteArmPending) return;

    // Check once every 4 seconds
    unsigned long now = millis();
    if (now - lastWebPollMillis < 4000) return;
    lastWebPollMillis = now;

    // Derives write polling URL from backendUrl: e.g. /api/attendance/write?device_id=GATE-01
    String pollUrl = String(settings.backendUrl);
    int scanPos = pollUrl.indexOf("/scan");
    if (scanPos > 0) {
        pollUrl = pollUrl.substring(0, scanPos) + "/write?device_id=" + String(DEVICE_ID);
    } else {
        return;
    }

    bool isHttps = pollUrl.startsWith("https://");
    HTTPClient http;
    int httpCode = -1;
    String payload = "";

    if (isHttps) {
        WiFiClientSecure clientSecure;
        clientSecure.setInsecure();
        clientSecure.setTimeout(3000);
        http.setTimeout(3000);
        if (http.begin(clientSecure, pollUrl)) {
            httpCode = http.GET();
            if (httpCode == 200) payload = http.getString();
            http.end();
        }
    } else {
        WiFiClient client;
        client.setTimeout(3000);
        http.setTimeout(3000);
        if (http.begin(client, pollUrl)) {
            httpCode = http.GET();
            if (httpCode == 200) payload = http.getString();
            http.end();
        }
    }

    if (httpCode == 200 && payload.length() > 0) {
#if defined(ARDUINOJSON_VERSION_MAJOR) && (ARDUINOJSON_VERSION_MAJOR >= 7)
        JsonDocument doc;
#else
        StaticJsonDocument<256> doc;
#endif
        if (!deserializeJson(doc, payload)) {
            bool pending = doc["pending"] | false;
            if (pending) {
                const char* targetCode = doc["data"] | "";
                if (strlen(targetCode) > 0) {
                    pendingWriteData = String(targetCode);
                    isWriteArmPending = true;
                    lastWriteStatus = "ARMED";

                    Serial.println();
                    Serial.println("====================================");
                    Serial.println(">>> WEBSITE COMMAND: WRITE CARD <<<");
                    Serial.print("Target Code to Burn: [");
                    Serial.print(pendingWriteData);
                    Serial.println("]");
                    Serial.println("TAP THE RFID CARD ON THE READER NOW...");
                    Serial.println("====================================");
                }
            }
        }
    }
}

// ------------------------------------------------------------------------------
// NOTIFY WEBSITE THAT WRITE COMPLETED
// ------------------------------------------------------------------------------
void notifyWebsiteWriteComplete(const String& uid, const String& writtenData) {
    if (WiFi.status() != WL_CONNECTED) return;

    String notifyUrl = String(settings.backendUrl);
    int scanPos = notifyUrl.indexOf("/scan");
    if (scanPos > 0) {
        notifyUrl = notifyUrl.substring(0, scanPos) + "/write";
    } else {
        return;
    }

    bool isHttps = notifyUrl.startsWith("https://");
    HTTPClient http;

    String reqBody = "{\"action\":\"complete\",\"device_id\":\"" + String(DEVICE_ID) +
                     "\",\"uid\":\"" + uid +
                     "\",\"data_to_write\":\"" + writtenData + "\"}";

    if (isHttps) {
        WiFiClientSecure clientSecure;
        clientSecure.setInsecure();
        clientSecure.setTimeout(5000);
        if (http.begin(clientSecure, notifyUrl)) {
            http.addHeader("Content-Type", "application/json");
            http.POST(reqBody);
            http.end();
        }
    } else {
        WiFiClient client;
        client.setTimeout(5000);
        if (http.begin(client, notifyUrl)) {
            http.addHeader("Content-Type", "application/json");
            http.POST(reqBody);
            http.end();
        }
    }
}

// ------------------------------------------------------------------------------
// SETUP
// ------------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(500);

    for (byte i = 0; i < 6; i++) defaultKey.keyByte[i] = 0xFF;

    // 1. Load Stored Wi-Fi Settings
    loadSettings();

    // 2. SPI & RC522 Initialization
    SPI.begin();
    rfid.PCD_Init();
    delay(50);

    byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
    bool rfidOk = (version != 0x00 && version != 0xFF);

    // 3. Start Access Point (AP Mode) Every Restart
    WiFi.mode(WIFI_AP_STA);
    WiFi.softAP(AP_SSID); // Open network at 192.168.4.1

    // Do NOT auto-connect on boot, but settings are remembered!

    // 4. Register HTTP Web Server Endpoints
    server.on("/", HTTP_GET, handleRoot);
    server.on("/status", HTTP_GET, handleStatus);
    server.on("/scan-wifi", HTTP_GET, handleScanWifi);
    server.on("/connect", HTTP_POST, handleConnect);
    server.on("/arm-write", HTTP_POST, handleArmWrite);
    server.begin();

    // 5. Print Startup Banner
    Serial.println();
    Serial.println("====================================");
    Serial.println("COLLEGE RFID ATTENDANCE & WEB WRITER");
    Serial.println("====================================");
    Serial.print("Device ID: ");
    Serial.println(DEVICE_ID);
    Serial.print("RFID Reader: ");
    Serial.println(rfidOk ? "INITIALIZED" : "FAILED (Check wiring)");
    Serial.print("Access Point: ");
    Serial.println(AP_SSID);
    Serial.println("Web Portal: http://192.168.4.1");
    if (strlen(settings.ssid) > 0) {
        Serial.print("Saved Wi-Fi: ");
        Serial.println(settings.ssid);
    }
    Serial.println("System Status: READY");
    Serial.println("====================================");
    Serial.println();
}

// ------------------------------------------------------------------------------
// MAIN LOOP
// ------------------------------------------------------------------------------
void loop() {
    // 1. Handle Web Portal Requests (192.168.4.1)
    server.handleClient();

    // 2. When connected to Wi-Fi, check for remote card-write commands from website
    pollWebsiteForCardWrite();

    // 3. Check for RFID Card Present
    if (!rfid.PICC_IsNewCardPresent()) {
        delay(20);
        return;
    }
    if (!rfid.PICC_ReadCardSerial()) {
        delay(20);
        return;
    }

    String currentUID = getNormalizedUID(&(rfid.uid));

    // --------------------------------------------------------------------------
    // BRANCH A: WRITE MODE ENGAGED (from 192.168.4.1 or Website)
    // --------------------------------------------------------------------------
    if (isWriteArmPending) {
        Serial.println("------------------------------------");
        Serial.println("WRITING DATA TO CARD...");
        Serial.print("Card Hardware UID: ");
        Serial.println(currentUID);
        Serial.print("Data to write:     ");
        Serial.println(pendingWriteData);

        bool writeOk = writeBlock(TARGET_DATA_BLOCK, pendingWriteData);

        if (writeOk) {
            String verifiedData = readBlock(TARGET_DATA_BLOCK);
            lastWriteStatus = "SUCCESS";
            lastWrittenUID = currentUID;
            lastWrittenData = verifiedData;

            Serial.println("STATUS: [WRITE_SUCCESS] Card written and verified!");
            Serial.print("Verified Written Data: ");
            Serial.println(verifiedData);
            Serial.println("------------------------------------");

            // Notify main website if connected
            notifyWebsiteWriteComplete(currentUID, verifiedData);
        } else {
            lastWriteStatus = "FAILED";
            Serial.println("STATUS: [WRITE_FAILED] Failed to burn data into block.");
            Serial.println("------------------------------------");
        }

        isWriteArmPending = false;
        pendingWriteData = "";
    }
    // --------------------------------------------------------------------------
    // BRANCH B: ATTENDANCE SCAN MODE (Reads Block 4 Data as Main Identifier)
    // --------------------------------------------------------------------------
    else {
        // Read Sector 1, Block 4 (The written student identifier)
        String writtenData = readBlock(TARGET_DATA_BLOCK);

        // Debounce: ignore same card if held on reader within 2 seconds
        unsigned long now = millis();
        if (currentUID == lastScannedUID && (now - lastScanMillis < 2000)) {
            rfid.PICC_HaltA();
            rfid.PCD_StopCrypto1();
            delay(50);
            return;
        }

        lastScanMillis = now;

        // Send attendance scan using the written data!
        sendAttendanceScan(currentUID, writtenData);
    }

    // Halt card and release crypto
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    yield();
}
