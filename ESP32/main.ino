#include <WiFiClientSecure.h>
#include <MQTT.h>        
#include <SPI.h>
#include <Wire.h>
#include "Adafruit_VL53L0X.h"
#include <Arduino.h>
#include "HX711.h"
#include "soc/rtc.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "time.h"
#include "sntp.h"
#include <ArduinoWebsockets.h>

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 4;
const int LOADCELL_SCK_PIN = 2;

HX711 scale;
Adafruit_VL53L0X lox = Adafruit_VL53L0X();

const char* ntpServer1 = "pool.ntp.org";
const char* ntpServer2 = "time.nist.gov";
const long gmtOffset_sec = 5 * 3600 + 30 * 60; // GMT offset for IST (UTC+5:30)
const int daylightOffset_sec = 0; // No daylight saving time in India

int hrs=0;
int mins=0;
int secs=0;

Adafruit_SSD1306 display(128, 64, &Wire, -1);

const int NUM_POINTS = 60;
const int RADIUS = 28;
int pointsX[NUM_POINTS];
int pointsY[NUM_POINTS];

#define DEBUG   //If you comment this line, the DPRINT & DPRINTLN lines are defined as blank.

#ifdef DEBUG
   #define DBEGIN(x)      Serial.begin(x) 
   #define DPRINT(...)    Serial.print(__VA_ARGS__)     
   #define DPRINTLN(...)  Serial.println(__VA_ARGS__)
#else
   #define DBEGIN(x)
   #define DPRINT(...)     
   #define DPRINTLN(...)
#endif

////

const char ssid[] = "<Wifi_SSID>";
const char pass[] = "<Password>";
const char* webSocketServerAddress = "ws://wakeup.abhinavramakrishnan.tech:8000/ws";


// HiveMQ Broker - Secure connection

#define BROKER_ADDRESS "<Broker_address>"
#define BROKER_PORT 8883
#define BROKER_USER "<Broker_User>"
#define BROKER_PASSWORD "<Broker_Password>"

WiFiClientSecure net;
MQTTClient mqttClient;

bool routeIncomingMessage = true;

const int pingPin = 14;
const int buzzerPin = 12; // Buzzer pin

unsigned long lastBeepTime = 0; // To track the last beep time
unsigned long beepInterval = 5000; // Initial beep interval (5 seconds)
bool buzzerActive = false; // Flag to track if buzzer is active
bool buzzerContinuous = false; // Flag to track continuous beep
using namespace websockets;
WebsocketsClient webSocket;

// Alarm time variables
int alarmHour = 0;
int alarmMinute = 0;
bool alarmTimeSet = false;

unsigned long lastMessageTime = 0;
const unsigned long MESSAGE_BEEP_DURATION = 1000; // 1 second

void onMessageCallback(WebsocketsMessage message) {
  Serial.print("Received message: ");
  String messageData = message.data();
  Serial.println(messageData);

  // Parse the message to get the alarm time
  
  if (messageData.startsWith("[{\"time\":\"")) {
    String alarmTimeStr = messageData.substring(10, 22);
    int alarmDay = alarmTimeStr.substring(0, 2).toInt();
    int alarmMonth = alarmTimeStr.substring(3, 5).toInt();
    int alarmYear = alarmTimeStr.substring(6, 10).toInt();
    int alarmHourTemp = alarmTimeStr.substring(11, 13).toInt();
    int alarmMinuteTemp = alarmTimeStr.substring(14, 16).toInt();

    // Check if the date matches the current date
    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      if (alarmDay == timeinfo.tm_mday && alarmMonth == timeinfo.tm_mon + 1 && alarmYear == timeinfo.tm_year + 1900) {
        if (alarmHourTemp >= 0 && alarmHourTemp <= 23 && alarmMinuteTemp >= 0 && alarmMinuteTemp <= 59) {
          alarmHour = alarmHourTemp;
          alarmMinute = alarmMinuteTemp;
          alarmTimeSet = true;
          Serial.print("Alarm set for ");
          Serial.print(alarmHour);
          Serial.print(":");
          Serial.println(alarmMinute);
        } else {
          Serial.println("Invalid alarm time received");
        }
      } else {
        Serial.println("Alarm date does not match current date");
      }
    } else {
      Serial.println("Failed to get local time");
    }
  }

  // Beep the buzzer for 1 second
  tone(buzzerPin, 100);
  lastMessageTime = millis();
}
void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("Connection Opened");
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("Connection Closed");
  } else if (event == WebsocketsEvent::GotPing) {
    Serial.println("Got a Ping!");
  } else if (event == WebsocketsEvent::GotPong) {
    Serial.println("Got a Pong!");
  }
}

void setup() {
  DBEGIN(115200);
  DPRINTLN("Start");

  sntp_set_time_sync_notification_cb(timeavailable);
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2);

  rtc_cpu_freq_config_t config;
  rtc_clk_cpu_freq_get_config(&config);
  rtc_clk_cpu_freq_to_config(RTC_CPU_FREQ_80M, &config);
  rtc_clk_cpu_freq_set_config_fast(&config);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(-471.497);  // Calibration value obtained by calibrating the scale with known weights
  scale.tare();               // Reset the scale to 0

  // WiFi Initialization
  WiFi.begin(ssid, pass);
  DPRINT("Connecting to WiFi ...");
  while (WiFi.status() != WL_CONNECTED) {
    DPRINT(".");
    delay(500);
  }
  DPRINTLN(" connected!");

  net.setInsecure();

  // Initialize VL53L0X sensor
  if (!lox.begin()) {
    Serial.println(F("Failed to boot VL53L0X"));
    while (1);
  }

  // MQTT Initialization
  mqttClient.begin(BROKER_ADDRESS, BROKER_PORT, net);
  mqttClient.setOptions(60, false, 500);
  mqttClient.setWill("Smart_clock/gateway", "Disconnected", true, LWMQTT_QOS0);

  connectToBroker();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // Initialize the display with I2C address 0x3C
  display.clearDisplay();                     // Clear the display buffer
  display.display();                          // Update the display

  // Pre-calculate points for clock hands
  for (int i = 0; i < NUM_POINTS; i++) {
    pointsX[i] = 64 + RADIUS * cos(i * 6.28 / NUM_POINTS);
    pointsY[i] = 32 + RADIUS * sin(i * 6.28 / NUM_POINTS);
  }  

  // Initialize buzzer pin
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
  // Connect to WebSocket server
  webSocket.onMessage(onMessageCallback);
  webSocket.onEvent(onEventsCallback);
  bool connected = webSocket.connect(webSocketServerAddress);

  if (connected) {
    Serial.println("Connected to WebSocket server");
  } else {
    Serial.println("Failed to connect to WebSocket server");
  }
}



void registerDevice(String address, String device_input_property) {
  String topic = "Smart_clock/" + address + "/" + device_input_property;
  mqttClient.subscribe(topic);
}

void connectToBroker() {
  DPRINT("Connecting to MQTT Broker ...");
  while (!mqttClient.connect("ESP32", BROKER_USER, BROKER_PASSWORD)) {
    DPRINT("MQTT Client Disconnected! ");
    DPRINT(mqttClient.lastError()); DPRINTLN(" Return Code");
    DPRINTLN(mqttClient.returnCode());
    delay(500);
  }
  DPRINTLN(" connected!");

  // Registration of each input property of each device
  registerDevice("ab", "S");

  // Last Will initialization
  mqttClient.publish("Smart_clock/gateway", "Ready", true, LWMQTT_QOS0);
}

void loop() {
  webSocket.poll();
  mqttClient.loop();
  if (routeIncomingMessage) {
    VL53L0X_RangingMeasurementData_t measure;
    lox.rangingTest(&measure, false);
    
    // Ultrasonic sensor distance calculation
    long duration, inches, cm;
    int weight;
    pinMode(pingPin, OUTPUT);
    digitalWrite(pingPin, LOW);
    delayMicroseconds(2);
    digitalWrite(pingPin, HIGH);
    delayMicroseconds(5);
    digitalWrite(pingPin, LOW);
    pinMode(pingPin, INPUT);
    duration = pulseIn(pingPin, HIGH);
    inches = microsecondsToInches(duration);
    cm = microsecondsToCentimeters(duration);

    // Weight measurement
    weight = scale.get_units();
    weight = abs(weight);
    scale.power_down();   
    delay(100);
    scale.power_up();
    
    // Publish sensor data to MQTT topics
    String topic1 = "VL53L0X/distance";
    String topic2 = "HC-SR04/distance";
    String topic3 = "HX711/weight";
    DPRINT("Sending Topic: ["); DPRINT(topic1); DPRINT("] Payload: "); DPRINTLN(measure.RangeMilliMeter);
    mqttClient.publish(topic1, String(measure.RangeMilliMeter), true, LWMQTT_QOS0);
    DPRINT("Sending Topic: ["); DPRINT(topic2); DPRINT("] Payload: "); DPRINTLN(cm);
    mqttClient.publish(topic2, String(cm), true, LWMQTT_QOS0);
    DPRINT("Sending Topic: ["); DPRINT(topic3); DPRINT("] Payload: "); DPRINTLN(weight);
    mqttClient.publish(topic3, String(weight), true, LWMQTT_QOS0);
    
    // mqttClient.subscribe(topic1,LWMQTT_QOS0);
    // mqttClient.subscribe(topic2,LWMQTT_QOS0);
    // mqttClient.subscribe(topic3,LWMQTT_QOS0);
    

    // Check if buzzer needs to be activated
    //if (weight > 5.00 && measure.RangeMilliMeter < 100 && cm < 100) {
    if ((weight > 300) && (measure.RangeMilliMeter < 300 && cm < 300)) {
      // Check if alarm time is set and matches the current time
      //if (alarmTimeSet && hrs == alarmHour && mins == alarmMinute) {
        activateBuzzer();
      //} else {
        //deactivateBuzzer();
      }
     else {
      deactivateBuzzer();
    }
  }
  
  setLocalTime();
  
  // Calculate the angle for each clock hand
  float secAngle = map(secs, 0, 60, 0, 360);
  float minAngle = map(mins, 0, 60, 0, 360);
  float hrAngle = map(hrs % 12, 0, 12, 0, 360);
  
  // Calculate the positions of the clock hands
  int hrX = 64 + (RADIUS - 11) * cos((hrAngle - 90) * PI / 180);
  int hrY = 32 + (RADIUS - 11) * sin((hrAngle - 90) * PI / 180);
  int minX = 64 + (RADIUS - 6) * cos((minAngle - 90) * PI / 180);
  int minY = 32 + (RADIUS - 6) * sin((minAngle - 90) * PI / 180);
  int secX = 64 + (RADIUS) * cos((secAngle - 90) * PI / 180);
  int secY = 32 + (RADIUS) * sin((secAngle - 90) * PI / 180);
  
  // Clear the display buffer
  display.clearDisplay();
  
  // Draw the clock face
  display.drawCircle(64, 32, 32, WHITE);
  
  // Draw clock points
  for (int i = 0; i < NUM_POINTS; i += 5) {
    display.fillCircle(pointsX[i], pointsY[i], 1, WHITE);
  }
  
  // Display Numbers 12-3-6-9
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  for (int i = 12; i > 1; i -= 3) {
    float angle = map(i, 1, 12, 30, 360);
    int xPos = 64 + (RADIUS - 7) * cos((angle - 90) * PI / 180) - 3;
    int yPos = 32 + (RADIUS - 7) * sin((angle - 90) * PI / 180) - 3;
    display.setCursor(xPos, yPos);
    display.print(i);
  }
  
  // Draw the hour hand
  display.drawLine(64, 32, hrX, hrY, WHITE);
  
  // Draw the minute hand
  display.drawLine(64, 32, minX, minY, WHITE);
  
  // Draw the second hand
  display.drawLine(64, 32, secX, secY, WHITE);
  
  // Update the display
  display.display();
  if (millis() - lastMessageTime >= MESSAGE_BEEP_DURATION && lastMessageTime != 0) {
    noTone(buzzerPin);
    lastMessageTime = 0;
  }
  
  
}

void setLocalTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("No time available (yet)");
    return;
  }
  
  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  
  hrs = timeinfo.tm_hour;
  mins = timeinfo.tm_min;
  secs = timeinfo.tm_sec;
}

void timeavailable(struct timeval* t) {
  Serial.println("Got time adjustment from NTP!");
  setLocalTime();
}

long microsecondsToInches(long microseconds) {
  return microseconds / 74 / 2;
}

long microsecondsToCentimeters(long microseconds) {
  return microseconds / 29 / 2;
}

void activateBuzzer() {
  unsigned long currentTime = millis();
  if (currentTime - lastBeepTime >= beepInterval) {
    if (!buzzerActive) {
      buzzerActive = true;
      tone(buzzerPin, 1000); // Start with a low frequency
    } else {
      noTone(buzzerPin);
      tone(buzzerPin, 1000); // Double the frequency
    }
    lastBeepTime = currentTime;
    beepInterval *= 2; // Double the beep interval
  }
}

void deactivateBuzzer() {
  if (buzzerActive) {
    noTone(buzzerPin);
    beepInterval = 5000; // Reset beep interval
    buzzerActive = false;
  }
}
