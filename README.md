<div align="left" style="display:flex; align-items: center; justify: center; text-decoration: none ">
    <a href="https://github.com/Abhinav-ark/wakeup_iot/blob/main/LICENSE" target="_blank" rel="noreferrer">
      <img align='center' src="https://img.shields.io/badge/LICENSE-MIT-green"/>
    </a>
    <a href="https://github.com/Abhinav-ark/wakeup_iot" target="_blank" rel="noreferrer">
      <img align='center' src="https://img.shields.io/github/created-at/Abhinav-ark/wakeup_iot"/>
    </a>  
</div>

# WakeUp IOT Smart Alarm, Weight and Sleep Monitoring

<div align="center">
    <img src="./Assets/Labelled_image.jpeg" width="600px">
</div>
<br>

A cloud based smart alarm clock using IoT sensors. This system aims to integrate various hardware and software components to provide an efficient and user-friendly alarm clock that leverages cloud connectivity for enhanced functionality. The main goals were to improve user experience, enable advanced features like smart weight tracking and provide valuable insights into sleep patterns.

## Demonstration
- This alarm system is designed to help you stay on top of your meetings.
- You input all your `meetings` into the app, and the hardware detects if you're still in bed before a meeting starts.
- If you're in bed `5 minutes` before a scheduled meeting, the alarm will ring continuously until you get up.
- The alarm detects your presence by measuring an increase in `weight` reading through a load cell and a decrease in `distance` reading using a TOF and ultrasound sensor.

https://github.com/user-attachments/assets/0b9d8c76-09d8-47bc-ae6c-5a132773f79e

> [!IMPORTANT]  
> For Demonstration purposes, A 20kg loadcell was used only for the head. However for the actual Project a combination of four 20 kg load cells were placed under the bed to weigh the whole body.

## UI Screens
https://github.com/user-attachments/assets/1fc1a6ed-43d6-4194-8b75-5fb851d9eb4a

## Data Flow
<div align="center">
    <img src="./Assets/architecture.jpeg" width="600px">
</div>

1. `ESP32` Microcontroller connects to WebApplication Server `websocket`, gets alarm data in realTime
2. During NightTime, User Weight and Movement data from TOF, Ultrasound and HX711 Weight Sensors are sent to `InfluxDB` via `Telegraf`, `HiveMQ`.
3. Live real time monitoring of data and database data are available through the cloud `Grafana` dashboard
4. Data from `InfluxDB` is read by `AWS Sage Maker` for model based data Analytics using Machine Learning Models
5. All User Alarms and Aggregated Statistics are stored in `MYSQL Database` in `Azure`.
6. NextJS Frontend Server and NodeJS(ExpressJS) Backend Server are passed through a reverse proxy for user Abstraction and Security.
7. `Google OAuth 2.0` with `JSON Web Token` is implemented for authenticating users.

https://github.com/user-attachments/assets/c124c573-dad5-4181-9e5f-c7c184a81f08

<br>

## IOT System Design
<div align="center">
    <img src="https://github.com/user-attachments/assets/b77a345a-c80c-429a-914a-e2adacbb22d0" width="600px">
</div>
<br>

- By leveraging sensors, microcontrollers, communication modules, `MQTT` brokers, and `real-time` data processing, we have developed a cohesive system that offers valuable insights and enhanced user interaction.
- The project highlights the potential of IoT technology in everyday applications, transforming a traditional clock into a multifunctional device capable of improving user awareness and decision-making.
- Our system integrates various components seamlessly. The end devices, represented by the `ESP32 microcontroller`, ensure accurate data collection using sensors like the `HX711` for weight measurement and the `VL53L0X` for distance measurement.
- These devices collect essential data, which is then transmitted to the MQTT broker for real-time processing and analytics.
- The `OLED` display and buzzer provide immediate feedback to users, enhancing the interactivity and functionality of the system.
- The integration of `WebSocket` communication further enables `real-time` updates and `remote monitoring` capabilities.

## Circuit Diagram
<div align="center">
    <img src="./Assets/circuit_diagram.png" width="600px">
</div>

### Sensors:
- **HX711**: This sensor is an `analog-to-digital converter` (ADC) which is used for `weight sensing` features, switching off the alarm only when weight is removed from the bed.
- **VL53LOX**: VL53L0X is a `Time-of-Flight` (ToF) ranging sensor. It is used for movement recognition, which gives the sleep scores based on `user’s movement` during sleep.
- **HC-SR04**: This sensor provides `2cm - 400cm` non-contact measurement function. It measures distances using `ultrasonic waves`. This is used to detect if someone is there, magnitude of change in conjuction with the TOF sensor for double check(since the frequency of waves are different in both).

### Actuators:
- **OLED Display**: An `OLED` (Organic Light Emitting Diodes) display shows time information. OLEDs have a much higher contrast ratio compared to traditional displays, making them visible from all angles and even in low-light situations.
- **Buzzer**: The component that generates the alarm sound. It's the crucial part of the alarm clock, notifying or waking the user at the designated times.

### Controller:
**ESP32 Microcontroller**: ESP32 is a feature-rich `SoC` with integrated `Wi-Fi` and `Bluetooth` connectivity for a wide-range of `IoT` applications. In the given circuit it is connected to the sensors, collects sensor data, transmits it using the WiFi to the `Cloud`.

## Analytics

https://github.com/user-attachments/assets/05f6a328-7e01-4265-a6ba-704ec8b60719

- We have used `AWS Sagemaker` for deploying, training and modelling of several models and datasets.
- We have added few attributes such as Start time the user’s sleep, End time of the User’s sleep, sleep quality, time in bed, weight and Distance (Movement of the person).
- We have calculated the User’s time in bed by the start and end time of sleep by the user.
- Weight monitoring is done by the `loadcell` which is placed under the bed.
- The tof sensor, `VL53LOX` and Ultrasound sensor `HC-SR04` which is placed near the bed measures the distance of the User moving and tracking the percentage of deep sleep he/she is in.
- The sleep quality of the user is trained by models to give a precise quality by checking the total time duration of the sleep and the movement the user while sleeping.
- For modelling, we have used, `Preprocessing`, `Visualization`, `EDA`, `Linear regression`, `KNN`, `Logistic regression`, `Decision tree`, `Random Forest` and `SVM` for better accuracy and got successful results.

> [!NOTE]
> We have used our sleep data from *10.4.2024* to *10.5.2024* to train and test the models. 

## Libraries needed for ESP32 main.ino file

| Name | URL |
| --- | --- |
| Websocket | https://github.com/gilmaimon/ArduinoWebsockets?tab=readme-ov-file |
| WiFi | https://github.com/esp8266/Arduino/tree/master/libraries/ESP8266WiFi/src |
| WiFiClientSecure | https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/src/WiFiClientSecure.h |
| MQTT | https://github.com/adafruit/Adafruit_MQTT_Library |
| Adafruit_VL53L0X | https://github.com/adafruit/Adafruit_VL53L0X |
| ArduinoHTTPClient | https://github.com/arduino-libraries/ArduinoHttpClient |
| HX711 | https://github.com/bogde/HX711 |
| Adafruit_SSD1306 | https://github.com/adafruit/Adafruit_SSD1306 |
| NTPClient | https://github.com/arduino-libraries/NTPClient |
| Time | http://playground.arduino.cc/Code/Time/ |
| Adafruit_GFX | https://github.com/adafruit/Adafruit-GFX-Library |

