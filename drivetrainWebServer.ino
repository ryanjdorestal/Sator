#include <Wire.h>
#include <Adafruit_MotorShield.h>
#include "utility/Adafruit_MS_PWMServoDriver.h"
#include <Servo.h>
#include <UnoR4WiFi_WebServer.h>
#include "index.h"

#define CMD_STOP          0
#define CMD_FORWARD       1
#define CMD_BACKWARD      2
#define CMD_LEFT          4
#define CMD_RIGHT         8
#define CMD_SERVOA_UP     16
#define CMD_SERVOA_DOWN   32
#define CMD_SERVOB_UP     64
#define CMD_SERVOB_DOWN   128

const char WIFI_SSID[]     = "baloney";
const char WIFI_PASSWORD[] = "bigchunky";

UnoR4WiFi_WebServer server(80);
UnoR4WiFi_WebSocket *webSocket = nullptr;


Adafruit_MotorShield AFMS = Adafruit_MotorShield();  
Adafruit_DCMotor *mL1 = AFMS.getMotor(1);
Adafruit_DCMotor *mL2 = AFMS.getMotor(2);
Adafruit_DCMotor *mR1 = AFMS.getMotor(3);
Adafruit_DCMotor *mR2 = AFMS.getMotor(4);

// ---- CR Servos (continuous rotation) ----
const uint8_t SERVOA_PIN = 9;   // Soil Moisture drop
const uint8_t SERVOB_PIN = 10;  // NPK + pH drop

Servo servoA, servoB;

int CR_STOP_US_A = 1500;  
int CR_STOP_US_B = 1500; 

int CR_UP_US_A   = 2000;   
int CR_DOWN_US_A = 1000; 
int CR_UP_US_B   = 2000; 
int CR_DOWN_US_B = 1000;  

unsigned long A_MS_PER_REV = 1000;  
unsigned long B_MS_PER_REV = 1000;  

const int ROTATIONS_PER_PRESS = 5;

const uint8_t DEFAULT_SPEED = 170;
const uint8_t TURN_SPEED    = 170;

void setAllSpeeds(uint8_t lSpeed, uint8_t rSpeed) {
  mL1->setSpeed(lSpeed); mL2->setSpeed(lSpeed);
  mR1->setSpeed(rSpeed); mR2->setSpeed(rSpeed);
}
void runLeft(uint8_t dir)  { mL1->run(dir); mL2->run(dir); }
void runRight(uint8_t dir) { mR1->run(dir); mR2->run(dir); }
void releaseAll() {
  mL1->run(RELEASE); mL2->run(RELEASE);
  mR1->run(RELEASE); mR2->run(RELEASE);
}

void CAR_moveForward(){ setAllSpeeds(DEFAULT_SPEED, DEFAULT_SPEED); runLeft(FORWARD);  runRight(FORWARD); }
void CAR_moveBackward(){setAllSpeeds(DEFAULT_SPEED, DEFAULT_SPEED); runLeft(BACKWARD); runRight(BACKWARD); }
void CAR_turnLeft()   { setAllSpeeds(TURN_SPEED, TURN_SPEED);      runLeft(BACKWARD); runRight(FORWARD); }
void CAR_turnRight()  { setAllSpeeds(TURN_SPEED, TURN_SPEED);      runLeft(FORWARD);  runRight(BACKWARD); }
void CAR_stop()       { releaseAll(); }

enum SpinState { IDLE, SPIN_UP, SPIN_DOWN };

struct CRTask {
  Servo* s;
  int stopUs, upUs, downUs;
  unsigned long msPerRev;
  SpinState state = IDLE;
  unsigned long endAt = 0;

  void attach(uint8_t pin){ s->attach(pin); stop(); }
  void stop(){ s->writeMicroseconds(stopUs); state = IDLE; endAt = 0; }

  void startUp(int revs){
    s->writeMicroseconds(upUs);
    state = SPIN_UP;
    endAt = millis() + (unsigned long)revs * msPerRev;
  }
  void startDown(int revs){
    s->writeMicroseconds(downUs);
    state = SPIN_DOWN;
    endAt = millis() + (unsigned long)revs * msPerRev;
  }
  void update(){
    if(state != IDLE && (long)(millis() - endAt) >= 0) stop();
  }
};

CRTask taskA{ &servoA, CR_STOP_US_A, CR_UP_US_A, CR_DOWN_US_A, A_MS_PER_REV };
CRTask taskB{ &servoB, CR_STOP_US_B, CR_UP_US_B, CR_DOWN_US_B, B_MS_PER_REV };

void handleHome(WiFiClient& client, const String& method, const String& request,
                const QueryParams& params, const String& jsonData) {
  server.sendResponse(client, HTML_CONTENT);
}

void onWebSocketOpen(net::WebSocket& ws) { Serial.println("WS open"); }

void onWebSocketMessage(net::WebSocket& ws, const net::WebSocket::DataType dataType,
                        const char* message, uint16_t length) {
  int command = String(message).toInt();
  Serial.print("command: "); Serial.println(command);

  switch (command) {
    case CMD_STOP:        CAR_stop(); taskA.stop(); taskB.stop(); break;
    case CMD_FORWARD:     CAR_moveForward();  break;
    case CMD_BACKWARD:    CAR_moveBackward(); break;
    case CMD_LEFT:        CAR_turnLeft();     break;
    case CMD_RIGHT:       CAR_turnRight();    break;
    case CMD_SERVOA_UP:   taskA.startUp(ROTATIONS_PER_PRESS);   break;
    case CMD_SERVOA_DOWN: taskA.startDown(ROTATIONS_PER_PRESS); break;
    case CMD_SERVOB_UP:   taskB.startUp(ROTATIONS_PER_PRESS);   break;
    case CMD_SERVOB_DOWN: taskB.startDown(ROTATIONS_PER_PRESS); break;
    default: Serial.println("Unknown command");
  }
}

void onWebSocketClose(net::WebSocket& ws, const net::WebSocket::CloseCode code,
                      const char* reason, uint16_t length) {
  Serial.println("WS close");
}

void handlePing(WiFiClient& client, const String& method, const String& request,
                const QueryParams& params, const String& jsonData) {
  server.sendResponse(client, "pong");
}

void setup() {
  Serial.begin(9600);
  delay(300);

  if (!AFMS.begin()) {
    Serial.println("Motor Shield not found (I2C).");
    while (1) { delay(10); }
  }
  setAllSpeeds(0, 0);
  releaseAll();

  taskA.attach(SERVOA_PIN);
  taskB.attach(SERVOB_PIN);

  server.addRoute("/", handleHome);
  server.addRoute("/ping", handlePing);
  server.begin(WIFI_SSID, WIFI_PASSWORD);

  webSocket = server.enableWebSocket(81);
  if (webSocket) {
    webSocket->onOpen(onWebSocketOpen);
    webSocket->onMessage(onWebSocketMessage);
    webSocket->onClose(onWebSocketClose);
  } else {
    Serial.println("Failed to start WebSocket");
  }

  Serial.println("Rover ready: http://<uno-r4-wifi-ip>/");
}

void loop() {
  server.handleClient();
  server.handleWebSocket();
  taskA.update();
  taskB.update();
  delay(1);
}
