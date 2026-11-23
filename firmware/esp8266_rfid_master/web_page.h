#ifndef WEB_PAGE_H
#define WEB_PAGE_H

#include <Arduino.h>

// ------------------------------------------------------------------------------
// EMBEDDED WEB INTERFACE (HTML / CSS / JS)
// Stored in PROGMEM (Flash) to preserve RAM.
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
    input:focus, select:focus { border-color: var(--primary); }
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

  <!-- Section 1: Submit Attendance via ESP API -->
  <div class="card" style="border: 1px solid #93c5fd; background: #f0fdf4;">
    <h2 style="color: #166534;">⚡ Submit Attendance via API</h2>
    <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">
      Triggers the ESP to submit an attendance record directly to the college website.
    </p>
    <label>Student Code or Card Data to Submit</label>
    <input type="text" id="apiStudentInput" placeholder="e.g. STU-2026-1003 or HRMDC-26-8503" value="STU-2026-1003">
    <button class="btn" onclick="submitAttendanceApi()" style="background: #16a34a;">⚡ SUBMIT ATTENDANCE VIA API</button>
    <div id="apiResultBox" style="margin-top: 12px; display: none; padding: 10px; border-radius: 8px; font-size: 12px;"></div>
  </div>

  <!-- Section 2: Card Writer (Works Offline!) -->
  <div class="card">
    <h2>✍️ Write Student ID to Card</h2>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
      Burn a student code onto any 13.56 MHz RFID card. Works completely offline!
    </p>
    <label>Student Code to Burn (e.g. HRMDC-26-8503)</label>
    <input type="text" id="writeInput" placeholder="Enter student code (max 16 chars)" maxlength="16">
    <button class="btn" onclick="armWriter()">⚡ ARM CARD WRITER</button>
    <div id="writeStatusBox" style="margin-top: 12px; display: none;">
      <div id="writeBadge" class="status-badge badge-amber">WAITING FOR CARD TAP...</div>
      <p id="writeMsg" style="font-size: 12px; color: #334155;"></p>
    </div>
  </div>

  <!-- Section 3: Last Scanned Card Info -->
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

  <!-- Section 4: Wi-Fi Setup -->
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

  <!-- Section 5: Backend Server URL Configuration -->
  <div class="card">
    <h2>🌐 Attendance Backend URL</h2>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
      Live server endpoint where gate attendance scans are sent.
    </p>
    <label>Backend Endpoint</label>
    <input type="text" id="backendInput" placeholder="https://hrmdc.vercel.app/api/attendance/scan">
    <button class="btn" onclick="saveBackend()">Save Backend URL</button>
  </div>

  <script>
    window.updateStatus = function() {
      fetch('/status')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          document.getElementById('cardUid').innerText = data.last_uid || '--';
          document.getElementById('cardData').innerText = data.last_data || '[Blank]';
          document.getElementById('scanStatus').innerText = data.last_status || 'READY';
          document.getElementById('studentName').innerText = data.student_name || '--';

          if (!document.getElementById('backendInput').value && data.backend_url) {
            document.getElementById('backendInput').value = data.backend_url;
          }

          var badge = document.getElementById('wifiStatusBadge');
          if (data.wifi_connected) {
            badge.className = 'status-badge badge-green';
            badge.innerText = 'CONNECTED TO ' + data.wifi_ssid;
            document.getElementById('wifiIpInfo').innerText = 'Station IP: ' + data.station_ip;
          } else {
            badge.className = 'status-badge badge-amber';
            badge.innerText = 'DISCONNECTED (AP Mode Only)';
            document.getElementById('wifiIpInfo').innerText = 'Connect to College-RFID-AP';
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
        }).catch(function() {});
    };

    window.submitAttendanceApi = function() {
      var code = document.getElementById('apiStudentInput').value.trim();
      if (!code) { alert('Enter student code'); return; }
      var box = document.getElementById('apiResultBox');
      box.style.display = 'block';
      box.style.background = '#fef3c7';
      box.style.color = '#92400e';
      box.innerText = 'Submitting attendance via ESP to website...';

      fetch('/api/submit-attendance?data=' + encodeURIComponent(code))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            box.style.background = '#dcfce7';
            box.style.color = '#166534';
            box.innerHTML = '<strong>✅ STATUS: ' + data.status + '</strong><br>' +
                            (data.student_name ? 'Student: ' + data.student_name + '<br>' : '') +
                            data.message;
          } else {
            box.style.background = '#fee2e2';
            box.style.color = '#991b1b';
            box.innerHTML = '<strong>❌ STATUS: ' + (data.status || 'ERROR') + '</strong><br>' + data.message;
          }
          window.updateStatus();
        })
        .catch(function(err) {
          box.style.background = '#fee2e2';
          box.style.color = '#991b1b';
          box.innerText = 'Error calling ESP API: ' + err.message;
        });
    };

    window.scanWifi = function() {
      var select = document.getElementById('ssidSelect');
      select.innerHTML = '<option>Scanning networks...</option>';
      fetch('/scan-wifi')
        .then(function(res) { return res.json(); })
        .then(function(list) {
          select.innerHTML = '<option value="">-- Choose Wi-Fi --</option>';
          list.forEach(function(net) {
            var opt = document.createElement('option');
            opt.value = net.ssid;
            opt.innerText = net.ssid + ' (' + net.rssi + ' dBm)';
            select.appendChild(opt);
          });
        });
    };

    window.connectWifi = function() {
      var ssid = document.getElementById('ssidInput').value;
      var pass = document.getElementById('passInput').value;
      if (!ssid) { alert('Please enter Wi-Fi SSID'); return; }
      fetch('/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'ssid=' + encodeURIComponent(ssid) + '&pass=' + encodeURIComponent(pass)
      }).then(function(res) { return res.text(); }).then(function(txt) { alert(txt); });
    };

    window.saveBackend = function() {
      var url = document.getElementById('backendInput').value.trim();
      if (!url) { alert('Please enter backend URL'); return; }
      fetch('/set-backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'url=' + encodeURIComponent(url)
      }).then(function(res) { return res.text(); }).then(function(txt) { alert(txt); });
    };

    window.armWriter = function() {
      var val = document.getElementById('writeInput').value.trim();
      if (!val) { alert('Enter a student code to write!'); return; }
      fetch('/arm-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(val)
      }).then(function(res) { return res.text(); }).then(function() {
        document.getElementById('writeStatusBox').style.display = 'block';
        window.updateStatus();
      });
    };

    setInterval(window.updateStatus, 1500);
    window.updateStatus();
  </script>
</body>
</html>
)rawliteral";

#endif // WEB_PAGE_H
