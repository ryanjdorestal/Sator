#include <Arduino.h>
#include <DHT.h>

// this file has the code for the sensors that don't need to be in soil
// sensors used in this device: DHT22, Grove Light v1.1, Flying Fish MQ Air Quality 
// flying fish sensor may need a 5v vcc

// TODO: add wifi support once server is ready

// pins
#define PIN_DHT 4 // DHT22 return to Khurram 
#define PIN_LIGHT 33 // Grove Light return to MLH
#define PIN_AIR 35 // Grove Air Quality return to MLH 

#define DHTTYPE    DHT22
DHT dht(PIN_DHT, DHTTYPE);

// ADC config
// ESP32 default ADC: 12-bit (0..4095)
static const int ADC_BITS = 12; // 0..4095
static const float EMA_ALPHA = 0.25f; // smoothing factor for display (0..1)

// Calibration (if produced again, would need new calibrations)
// 1) Open Serial Monitor, watch RAW values for each sensor in your min/max conditions.
// 2) Put those RAW numbers here and re-upload.
struct Calib {
  int rawMin;   // maps to 0%
  int rawMax;   // maps to 100%
  bool invert;  // set true if higher raw should mean lower %
};

// Grove Light: higher voltage with more light (no invert)
Calib CAL_LIGHT = { 200, 3500, false };
// Grove Air Quality: treat higher as “worse” (programmer decides). Here we keep it “more voltage = higher %”, so invert=false
Calib CAL_AIR   = { 100, 3000, false };

// Helpers
int clampi(int v, int lo, int hi) { return v < lo ? lo : (v > hi ? hi : v); }

float rawToPercent(int raw, const Calib& c) {
  raw = clampi(raw, min(c.rawMin, c.rawMax), max(c.rawMin, c.rawMax));
  float span = float(c.rawMax - c.rawMin);
  if (fabs(span) < 1.0f) return 0.0f;  // avoid divide-by-zero
  float pct = (raw - c.rawMin) * 100.0f / span;
  pct = clampi(int(pct + 0.5f), 0, 100); // clamp & round
  if (c.invert) pct = 100.0f - pct;
  return pct;
}

// Simple exponential moving average
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

// Setup
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n=== ESP32 Sensor % Mapping Demo ===");

  dht.begin();

  analogReadResolution(ADC_BITS);
  // Set attenuation to improve usable range at 3.3V (11dB ≈ 0–3.6V range)
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  analogSetPinAttenuation(PIN_AIR,   ADC_11db);

  // print of calibration
  Serial.println("Calibration:");
  Serial.printf("  LIGHT rawMin=%d rawMax=%d invert=%d\n", CAL_LIGHT.rawMin, CAL_LIGHT.rawMax, CAL_LIGHT.invert);
  Serial.printf("  AIR   rawMin=%d rawMax=%d invert=%d\n", CAL_AIR.rawMin,   CAL_AIR.rawMax,   CAL_AIR.invert);
  Serial.println("Tip: Watch RAW values below, then adjust calib constants.");
}

void loop() {
  // DHT22
  float tC = dht.readTemperature(); // °C
  float hR = dht.readHumidity(); // %RH

  // If DHT read fails, serial print is NaN
  if (isnan(tC) || isnan(hR)) {
    Serial.println("DHT22 read failed (NaN). Check wiring/power.");
  }

  // RAW analog reads
  int rawLight = analogRead(PIN_LIGHT); 
  int rawAir   = analogRead(PIN_AIR); 

  // Smooth RAW (nicer for the user)
  float rawLightSm = emaLightRaw.update((float)rawLight);
  float rawAirSm   = emaAirRaw.update((float)rawAir);

  // Map to % using calibration
  float lightPct = rawToPercent((int)(rawLightSm + 0.5f), CAL_LIGHT); // %
  float airPct   = rawToPercent((int)(rawAirSm + 0.5f),   CAL_AIR);   // %

  // Print
  Serial.println("---- Readings ----");
  Serial.printf("DHT22:  Temp: %.2f °C   Humidity: %.2f %%RH\n", tC, hR);
  Serial.printf("Light:  RAW=%4d (sm=%.0f)  ->  %6.2f %%\n", rawLight, rawLightSm, lightPct);
  Serial.printf("AirQ:   RAW=%4d (sm=%.0f)  ->  %6.2f %%\n", rawAir,   rawAirSm,   airPct);
  Serial.println();

  delay(1000);
}
