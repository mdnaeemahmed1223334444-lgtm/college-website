#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ==============================================================================
// 1. HARDWARE PIN DEFINITIONS (NodeMCU V3 ESP8266 + RC522 RFID)
// ==============================================================================
// Hardware SPI Pins on ESP8266 (Predefined):
// - SCK  -> D5 (GPIO14)
// - MISO -> D6 (GPIO12)
// - MOSI -> D7 (GPIO13)
//
// Dedicated Control Pins:
#define RFID_SS_PIN         D2   // GPIO4 - Connected to RC522 SDA / SS
#define RFID_RST_PIN        D1   // GPIO5 - Connected to RC522 RST

// ==============================================================================
// 2. NETWORK & BACKEND CONFIGURATION
// ==============================================================================
// Replace with your 2.4 GHz Wi-Fi credentials
#define WIFI_SSID           "YOUR_WIFI_SSID"
#define WIFI_PASSWORD       "YOUR_WIFI_PASSWORD"

// Identity of this gate scanner device
#define DEVICE_ID           "GATE-01"
#define DEVICE_TOKEN        "dmc_gate01_secret_key_2026"

// Attendance Backend URL:
// Option 1: College Website API endpoint (Production or local IP)
//   e.g. "https://yourcollege.edu.bd/api/attendance/scan"
//   e.g. "http://192.168.0.105:3000/api/attendance/scan" (Local testing)
// Option 2: Supabase Edge Function
//   e.g. "https://<project-ref>.supabase.co/functions/v1/rfid-attendance"
#define BACKEND_URL         "http://192.168.0.105:3000/api/attendance/scan"

// ==============================================================================
// 3. SYSTEM TIMINGS & SERIAL SETTINGS
// ==============================================================================
#define SERIAL_BAUD_RATE    115200
#define HTTP_TIMEOUT_MS     8000    // 8-second network timeout
#define CARD_DEBOUNCE_MS    4000    // Ignore same card resting on reader within 4s
#define WIFI_TIMEOUT_MS     15000   // 15-second Wi-Fi connection timeout

// ==============================================================================
// 4. FUTURE HARDWARE EXPANSION HOOKS
// ==============================================================================
// Set these to 1 ONLY when physical components are wired in the future.
// When 0, no extra hardware pins are reserved or required.
#define ENABLE_HARDWARE_LEDS    0
#define ENABLE_HARDWARE_BUZZER  0
#define ENABLE_HARDWARE_OLED    0

#endif // CONFIG_H
