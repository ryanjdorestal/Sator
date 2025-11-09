/*************************************************************
 * ESP32 DHT22 + Grove Light + Grove Air Quality -> ThingSpeak
 * - Wi-Fi creds and ThingSpeak WRITE KEY are in arduino_secrets.h
 * - Uses only ADC1 pins so Wi-Fi works (GPIO33, GPIO35).
 * - ThingSpeak free tier: 15 s min interval; we use 20 s.
 *************************************************************/

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include "arduino_secrets_top.h"  // defines: SECRET_WIFI_SSID, SECRET_WIFI_PASS, SECRET_TS_WRITE_KEY

// ---------------- Pins & Sensors ----------------
#define PIN_DHT    4        // DHT22 data
#define PIN_LIGHT  33       // Grove Light SIG  -> ADC1 (ok with Wi-Fi)
#define PIN_AIR    35       // Grove Air SIG    -> ADC1 (ok with Wi-Fi)
#define DHTTYPE    DHT22
DHT dht(PIN_DHT, DHTTYPE);

// ---------------- ADC / Calibration --------------
static const int   ADC_BITS    = 12;      // 0..4095
static const float EMA_ALPHA   = 0.25f;   // smoothing 0..1
static const uint32_t SAMPLE_MS   = 1000; // sensor sample period
static const uint32_t UPLOAD_MS   = 20000;// ThingSpeak min 15 s

struct Calib {
  int  rawMin;    // maps to 0%
  int  rawMax;    // maps to 100%
  bool invert;    // if true, pct = 100 - pct
};

// Tune these after watching RAW values in your environment
Calib CAL_LIGHT = { 200, 3500, false };   // more light -> higher voltage
Calib CAL_AIR   = { 100, 3000, false };   // treat larger voltage as “higher %/worse”

// ---------------- Helpers ----------------
int clampi(int v, int lo, int hi) { return v < lo ? lo : (v > hi ? hi : v); }

float rawToPercent(int raw, const Calib& c) {
  int lo = min(c.rawMin, c.rawMax);
  int hi = max(c.rawMin, c.rawMax);
  raw    = clampi(raw, lo, hi);
  float span = float(c.rawMax - c.rawMin);
  if (fabs(span) < 1.0f) return 0.0f;
  float pct = (raw - c.rawMin) * 100.0f / span;
  pct = (float)clampi((int)(pct + 0.5f), 0, 100);
  if (c.invert) pct = 100.0f - pct;
  return pct;
}

struct Ema {
  float value = NAN;
  float alpha = EMA_ALPHA;
  float update(float x) {
    if (isnan(value)) value = x;
    else value = alpha * x + (1.0f - alpha) * value;
    return value;
  }
};

Ema emaLightRaw, emaAirRaw;

// ---------------- Networking ----------------
void wifiConnect() {
  Serial.printf("Connecting to Wi-Fi SSID \"%s\" ...\n", SECRET_WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);

  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print('.');
    if (millis() - t0 > 20000) { // 20 s timeout
      Serial.println("\nWi-Fi connect timeout. Retrying...");
      WiFi.disconnect(true);
      delay(1000);
      WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);
      t0 = millis();
    }
  }
  Serial.printf("\nWi-Fi connected. IP: %s RSSI: %d dBm\n",
                WiFi.localIP().toString().c_str(), WiFi.RSSI());
}

// Send to ThingSpeak using HTTP POST (JSON)
bool sendToThingSpeak(float tC, float hR, float lightPct, int rawAir) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi not connected; skip upload.");
    return false;
  }

  HTTPClient http;
  // You can also use http://api.thingspeak.com/update?api_key=KEY&field1=...
  String url = "http://api.thingspeak.com/update.json";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Map your data into ThingSpeak fields (change as you like)
  // field1: temperature, field2: humidity, field3: light %, field4: air %,
  // field5: raw light,   field6: raw air
  String payload = String("{\"api_key\":\"") + SECRET_TS_WRITE_KEY + "\","
                   "\"field1\":" + String(isnan(tC) ? 0 : tC, 2) + ","
                   "\"field2\":" + String(isnan(hR) ? 0 : hR, 2) + ","
                   "\"field3\":" + String(lightPct, 2) + ","
                   "\"field4\":" + String(airPct, 2) + ","
                   "\"field5\":" + String(rawLight) + ","
                   "\"field6\":" + String(rawAir) +
                   "}";

  int code = http.POST(payload);
  bool ok = (code == 200 || code == 202);
  if (ok) {
    String resp = http.getString();
    Serial.printf("ThingSpeak OK (HTTP %d). Response: %s\n", code, resp.c_str());
  } else {
    Serial.printf("ThingSpeak upload failed. HTTP %d\n", code);
  }
  http.end();
  return ok;
}

// ---------------- Setup / Loop ----------------
uint32_t lastSample = 0;
uint32_t lastUpload = 0;

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n=== ESP32 Env -> ThingSpeak ===");

  // Sensors
  dht.begin();

  analogReadResolution(ADC_BITS);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db); // ~0–3.6 V
  analogSetPinAttenuation(PIN_AIR,   ADC_11db);

  Serial.println("Calibration:");
  Serial.printf("  LIGHT rawMin=%d rawMax=%d invert=%d\n", CAL_LIGHT.rawMin, CAL_LIGHT.rawMax, CAL_LIGHT.invert);
  Serial.printf("  AIR   rawMin=%d rawMax=%d invert=%d\n", CAL_AIR.rawMin,   CAL_AIR.rawMax,   CAL_AIR.invert);

  // Wi-Fi
  wifiConnect();
}

void loop() {
  uint32_t now = millis();

  // --- Sampling block (every 1 s) ---
  if (now - lastSample >= SAMPLE_MS) {
    lastSample = now;

    float tC = dht.readTemperature();  // °C
    float hR = dht.readHumidity();     // %RH
    if (isnan(tC) || isnan(hR)) {
      Serial.println("DHT22 read failed (NaN). Check wiring/power.");
    }

    int rawLight = analogRead(PIN_LIGHT);
    int rawAir   = analogRead(PIN_AIR);

    float rawLightSm = emaLightRaw.update((float)rawLight);
    float rawAirSm   = emaAirRaw.update((float)rawAir);

    float lightPct = rawToPercent((int)(rawLightSm + 0.5f), CAL_LIGHT);
    float airPct   = rawToPercent((int)(rawAirSm + 0.5f),   CAL_AIR);

    Serial.println("---- Readings ----");
    Serial.printf("Wi-Fi: %s  IP:%s  RSSI:%d dBm\n",
                  (WiFi.status() == WL_CONNECTED ? "OK" : "DISCONNECTED"),
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
    Serial.printf("DHT22: Temp: %.2f °C   Humidity: %.2f %%RH\n", tC, hR);
    Serial.printf("Light: RAW=%4d (sm=%.0f)  ->  %6.2f %%\n", rawLight, rawLightSm, lightPct);
    Serial.printf("AirQ : RAW=%4d (sm=%.0f)  ->  %6.2f %%\n", rawAir,   rawAirSm,   airPct);
    Serial.println();

    // --- Upload block (>= 20 s to respect TS rate limit) ---
    if (now - lastUpload >= UPLOAD_MS) {
      lastUpload = now;

      // Reconnect if needed
      if (WiFi.status() != WL_CONNECTED) wifiConnect();

      sendToThingSpeak(tC, hR, lightPct, airPct, rawLight, rawAir);
    }
  }
}
