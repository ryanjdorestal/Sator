#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include "arduino_secrets_bottom.h"   // SECRET_WIFI_SSID, SECRET_WIFI_PASS, SECRET_TS_WRITE_KEY

// ----- RS-485 pins -----
constexpr int PIN_TX  = 17;     // UART2 TX
constexpr int PIN_RX  = 16;     // UART2 RX
constexpr int PIN_DE  = 27;     // Driver Enable (HIGH=TX)
constexpr int PIN_REN = 26;     // Receiver Enable (LOW=RX)
HardwareSerial RS485(2);

// ----- Soil moisture ADC -----
constexpr int SOIL_ADC_PIN = 33;

// ----- Modbus / probe settings -----
constexpr uint32_t MODBUS_BAUD       = 4800;  // (try 9600 if your probe uses that)
constexpr uint8_t  SLAVE_ID          = 1;
constexpr uint32_t MODBUS_TIMEOUT_MS = 400;

// Calibrate these for your probe:
int SOIL_RAW_DRY = 3206;   // raw when DRY
int SOIL_RAW_WET = 1326;   // raw when WET

// ----- WiFi + ThingSpeak -----
static const char* WIFI_SSID = SECRET_WIFI_SSID;
static const char* WIFI_PASS = SECRET_WIFI_PASS;
static const char* TS_KEY    = SECRET_TS_WRITE_KEY;
static const char* TS_URL    = "https://api.thingspeak.com/update";

bool wifiEnsureConnected(uint32_t timeoutMs = 15000) {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < timeoutMs) { delay(200); }
  return WiFi.status() == WL_CONNECTED;
}

bool sendToThingSpeak(uint16_t N, uint16_t P, uint16_t K, int soilPct) {
  if (!wifiEnsureConnected()) return false;
  HTTPClient http;
  http.begin(TS_URL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  String body = String("api_key=") + TS_KEY +
                "&field1=" + String(N) +
                "&field2=" + String(P) +
                "&field3=" + String(K) +
                "&field4=" + String(soilPct);

  int code = http.POST(body);
  int id   = http.getString().toInt();
  http.end();

  if (code > 0 && id > 0) {
    Serial.printf("ThingSpeak OK: HTTP %d, entry %d\n", code, id);
    return true;
  } else {
    Serial.printf("ThingSpeak FAIL: HTTP %d\n", code);
    return false;
  }
}

// ----- RS-485 helpers -----
inline void rs485SetTX() { digitalWrite(PIN_DE, HIGH); digitalWrite(PIN_REN, HIGH); }  // disable RX while TX
inline void rs485SetRX() { digitalWrite(PIN_DE, LOW);  digitalWrite(PIN_REN, LOW);  }  // enable RX

// CRC16 (Modbus RTU)
uint16_t crc16(const uint8_t *buf, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= buf[i];
    for (int b = 0; b < 8; b++) crc = (crc & 1) ? (crc >> 1) ^ 0xA001 : (crc >> 1);
  }
  return crc;
}

// Send 03/04 request and read reply
bool modbusReadRegs(uint8_t id, uint8_t func, uint16_t start, uint16_t count,
                    uint8_t *resp, size_t &respLen, uint32_t timeoutMs = MODBUS_TIMEOUT_MS) {
  uint8_t req[8] = {
    id, func, uint8_t(start >> 8), uint8_t(start & 0xFF),
    uint8_t(count >> 8), uint8_t(count & 0xFF), 0, 0
  };
  uint16_t c = crc16(req, 6);
  req[6] = (c & 0xFF);
  req[7] = (c >> 8);

  while (RS485.available()) RS485.read();

  rs485SetTX();
  RS485.write(req, sizeof(req));
  RS485.flush();           // wait for TX shift register empty
  rs485SetRX();

  uint32_t t0 = millis();
  size_t idx = 0;
  while (millis() - t0 < timeoutMs) {
    while (RS485.available()) {
      if (idx < respLen) resp[idx++] = RS485.read();
      else RS485.read();
    }
  }
  if (idx < 5) return false;

  uint16_t crcGot  = resp[idx - 2] | (resp[idx - 1] << 8);
  uint16_t crcCalc = crc16(resp, idx - 2);
  if (crcGot != crcCalc) return false;

  if (resp[0] != id) return false;
  if (resp[1] != func && resp[1] != (uint8_t)(func | 0x80)) return false;

  respLen = idx;
  return true;
}

// Try common register maps for NPK; return first success
bool readNPK(uint16_t &N, uint16_t &P, uint16_t &K, String &whichMap, String &hexFrame) {
  uint8_t buf[64]; size_t len = sizeof(buf);
  struct Query { uint8_t func; uint16_t addr; } tries[] = {
    {0x03, 0x001E},   // Holding: 0x001E..0x0020
    {0x03, 0x0068},   // Holding: 0x0068..0x006A
    {0x04, 0x0032},   // Input:   0x0032..0x0034
  };

  for (auto &q : tries) {
    len = sizeof(buf);
    bool ok = modbusReadRegs(SLAVE_ID, q.func, q.addr, 3, buf, len);
    if (!ok) continue;

    // hex frame (debug)
    hexFrame = "";
    for (size_t i = 0; i < len; i++) {
      if (i) hexFrame += ' ';
      if (buf[i] < 16) hexFrame += '0';
      hexFrame += String(buf[i], HEX);
    }
    hexFrame.toUpperCase();

    if (len >= 11 && (buf[1] == q.func) && buf[2] == 6) {
      N = (buf[3] << 8) | buf[4];
      P = (buf[5] << 8) | buf[6];
      K = (buf[7] << 8) | buf[8];
      whichMap = (q.func == 0x03)
               ? (q.addr == 0x001E ? "0x03 @ 0x001E..0x0020" : "0x03 @ 0x0068..0x006A")
               : "0x04 @ 0x0032..0x0034";
      return true;
    }
  }
  return false;
}

// Soil moisture utilities
uint16_t readSoilRawAvg(uint8_t samples = 10) {
  uint32_t acc = 0;
  for (uint8_t i = 0; i < samples; i++) { acc += analogRead(SOIL_ADC_PIN); delay(2); }
  return (uint16_t)(acc / samples);
}
int soilPercentFromRaw(uint16_t raw) {
  int wet = SOIL_RAW_WET, dry = SOIL_RAW_DRY;
  if (wet > dry) { int t = wet; wet = dry; dry = t; }
  int pct = map((int)raw, dry, wet, 0, 100);
  return constrain(pct, 0, 100);
}

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("== ESP32 RS-485 NPK + Soil → ThingSpeak ==");

  pinMode(PIN_DE, OUTPUT);
  pinMode(PIN_REN, OUTPUT);
  rs485SetRX();

  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_ADC_PIN, ADC_11db);

  Serial.printf("UART2: TX=%d RX=%d  DE=%d RE=%d\n", PIN_TX, PIN_RX, PIN_DE, PIN_REN);
  RS485.begin(MODBUS_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);
  delay(300);

  Serial.printf("WiFi SSID: %s\n", WIFI_SSID);
  if (wifiEnsureConnected()) {
    Serial.print("Connected. IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connect failed (will retry in loop).");
  }
}

void loop() {
  // ---- Read NPK ----
  uint16_t N=0, P=0, K=0;
  String usedMap, frame;
  bool ok = readNPK(N, P, K, usedMap, frame);
  if (ok) {
    Serial.printf("ID=%u %s -> %s\n", SLAVE_ID, usedMap.c_str(), frame.c_str());
    Serial.printf("N=%u  P=%u  K=%u\n", N, P, K);
  } else {
    Serial.println("NPK read failed (check baud/ID/wiring/power/termination).");
  }

  // ---- Soil moisture ----
  uint16_t raw = readSoilRawAvg(10);
  int soilPct = soilPercentFromRaw(raw);
  Serial.printf("Soil raw=%u  approx=%d%%\n", raw, soilPct);

  // ---- Publish ----
  sendToThingSpeak(N, P, K, soilPct);

  Serial.println("------------------------------");
  delay(15000); // respect ThingSpeak minimum update interval
}
