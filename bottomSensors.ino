#include <Arduino.h>
#include <HardwareSerial.h>

// this file has the code for sensors that will be used in the soil
// sensors used are: NPK sensor, and soil moisture sensor
// NPK sensor needs at least 5v, an external arduino uno will be used to provide it 5v vcc

// TODO: add wifi support once server is ready

// pins
constexpr int PIN_TX = 17; 
constexpr int PIN_RX = 16;
constexpr int PIN_DE = 27;
constexpr int PIN_REN = 26;
constexpr int SOIL_ADC_PIN = 33; // soil moisture
// Modbus settings (many NPK probes default to 4800 8N1, ID=1)
constexpr uint32_t MODBUS_BAUD = 4800; // switch to 9600 if needed
constexpr uint8_t  SLAVE_ID = 1;
constexpr uint32_t MODBUS_TIMEOUT_MS = 400; // per request

// Soil moisture calibration
// Put probe DRY in air: note raw -> SOIL_RAW_DRY
// Put probe WET in water/saturated soil: note raw -> SOIL_RAW_WET
int SOIL_RAW_DRY = 3206;  // <-- change after taking measurements with a new sensor
int SOIL_RAW_WET = 1326;  // <-- change after taking measurements with a new sensor

HardwareSerial RS485(2);

// RS-485 driver control
inline void rs485SetTX() { digitalWrite(PIN_DE, HIGH); digitalWrite(PIN_REN, HIGH); }  // disable receiver while TX
inline void rs485SetRX() { digitalWrite(PIN_DE, LOW);  digitalWrite(PIN_REN, LOW);  }  // enable receiver

// CRC16 (Modbus)
uint16_t crc16(const uint8_t *buf, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= buf[i];
    for (int b = 0; b < 8; b++) crc = (crc & 1) ? (crc >> 1) ^ 0xA001 : (crc >> 1);
  }
  return crc;
}

// Send Modbus & read reply
bool modbusReadRegs(uint8_t id, uint8_t func, uint16_t start, uint16_t count,
                    uint8_t *resp, size_t &respLen, uint32_t timeoutMs = MODBUS_TIMEOUT_MS) {
  uint8_t req[8];
  req[0] = id;
  req[1] = func; // 0x03=Holding, 0x04=Input
  req[2] = (start >> 8);
  req[3] = (start & 0xFF);
  req[4] = (count >> 8);
  req[5] = (count & 0xFF);
  uint16_t c = crc16(req, 6);
  req[6] = (c & 0xFF);
  req[7] = (c >> 8);

  while (RS485.available()) RS485.read();
  rs485SetTX();
  RS485.write(req, sizeof(req));
  RS485.flush();
  rs485SetRX();

  uint32_t t0 = millis();
  size_t idx = 0;
  while (millis() - t0 < timeoutMs) {
    while (RS485.available()) {
      if (idx < respLen) resp[idx++] = RS485.read();
      else RS485.read();
    }
    // simple timeout-based receive; Modbus frames are short at 4800 baud
  }
  if (idx < 5) return false; // too short to be valid

  uint16_t crcGot = resp[idx - 2] | (resp[idx - 1] << 8);
  uint16_t crcCalc = crc16(resp, idx - 2);
  if (crcGot != crcCalc) return false;

  // Basic sanity: slave and func match or exception frame (func | 0x80)
  if (resp[0] != id) return false;
  if (resp[1] != func && resp[1] != (uint8_t)(func | 0x80)) return false;

  respLen = idx;
  return true;
}

// Try common NPK maps; returns true on first success with parsed N,P,K
bool readNPK(uint16_t &N, uint16_t &P, uint16_t &K, String &whichMap, String &hexFrame) {
  uint8_t buf[64]; size_t len = sizeof(buf);

  struct Query { uint8_t func; uint16_t addr; } tries[] = {
    {0x03, 0x001E}, // Holding: N,P,K at 0x001E..0x0020
    {0x03, 0x0068}, // Holding: N,P,K at 0x0068..0x006A
    {0x04, 0x0032}, // Input:   N,P,K at 0x0032..0x0034
  };

  for (auto &q : tries) {
    len = sizeof(buf);
    bool ok = modbusReadRegs(SLAVE_ID, q.func, q.addr, 3, buf, len);
    if (!ok) continue;

    // Build hex frame string
    hexFrame = "";
    for (size_t i = 0; i < len; i++) {
      if (i) hexFrame += ' ';
      if (buf[i] < 16) hexFrame += '0';
      hexFrame += String(buf[i], HEX);
    }
    hexFrame.toUpperCase();

    // Expect: [id][func][byteCount=6][hiN loN hiP loP hiK loK][CRClo][CRChi]
    if (len >= 11 && (buf[1] == q.func) && buf[2] == 6) {
      N = (buf[3] << 8) | buf[4];
      P = (buf[5] << 8) | buf[6];
      K = (buf[7] << 8) | buf[8];

      whichMap = (q.func == 0x03)
                 ? (q.addr == 0x001E ? "0x03 @ 0x001E..0x0020"
                                     : "0x03 @ 0x0068..0x006A")
                 : "0x04 @ 0x0032..0x0034";
      return true;
    }
  }
  return false;
}

// Read soil moisture with simple smoothing and percentage mapping
uint16_t readSoilRawAvg(uint8_t samples = 10) {
  uint32_t acc = 0;
  for (uint8_t i = 0; i < samples; i++) {
    acc += analogRead(SOIL_ADC_PIN);
    delay(2);
  }
  return (uint16_t)(acc / samples);
}

int soilPercentFromRaw(uint16_t raw) {
  // Higher raw = drier on most capacitive probes; invert mapping
  int wet = SOIL_RAW_WET;
  int dry = SOIL_RAW_DRY;
  if (wet > dry) { // guard if user inverted calibration
    int tmp = wet; wet = dry; dry = tmp;
  }
  int pct = map((int)raw, dry, wet, 0, 100); // dry->0%, wet->100%
  return constrain(pct, 0, 100);
}

void setup() {
  pinMode(PIN_DE, OUTPUT);
  pinMode(PIN_REN, OUTPUT);
  rs485SetRX();

  analogReadResolution(12); // 0..4095
  analogSetPinAttenuation(SOIL_ADC_PIN, ADC_11db); // up to ~3.3V

  Serial.begin(115200);
  delay(200);
  Serial.println("== ESP32 NPK + Soil Moisture ==");
  Serial.printf("UART2: TX=%d RX=%d  DE=%d RE=%d\n", PIN_TX, PIN_RX, PIN_DE, PIN_REN);
  Serial.printf("Mode %lu 8N1  ID=%u\n", (unsigned long)MODBUS_BAUD, SLAVE_ID);

  RS485.begin(MODBUS_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);
  delay(300);
}

void loop() {
  // NPK 
  uint16_t N=0, P=0, K=0;
  String usedMap, frame;
  bool ok = readNPK(N, P, K, usedMap, frame);

  if (ok) {
    Serial.printf("ID=%u %s -> %s\n", SLAVE_ID, usedMap.c_str(), frame.c_str());
    Serial.printf("N=%u  P=%u  K=%u\n", N, P, K);
  } else {
    Serial.println("NPK read failed (check baud, ID, A/B, power, DE/RE, termination).");
  }

  // Soil moisture
  uint16_t raw = readSoilRawAvg(10);
  int pct = soilPercentFromRaw(raw);
  Serial.printf("Soil raw=%u  approx=%d%%\n", raw, pct);

  Serial.println("------------------------------");
  delay(2000);
}
