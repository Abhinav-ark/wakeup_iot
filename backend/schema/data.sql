DROP TABLE IF EXISTS alarms;

DROP TABLE IF EXISTS stats;

CREATE TABLE alarms (alarmID INT PRIMARY KEY AUTO_INCREMENT, userEmail VARCHAR(255), alarmTime TIMESTAMP, alarmDescription VARCHAR(500));

INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES ('shivajivayilajilebi@gmail.com', '2021-06-01 12:00:00', 'Wake up');
INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES ('shivajivayilajilebi@gmail.com', '2021-06-01 12:30:00', 'Go to sleep');
INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES ('shivajivayilajilebi@gmail.com', '2021-06-01 13:00:00', 'Eat food');

INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES ('abhinavramki2@gmail.com', '2024-05-20 07:00:00', 'Teams Meeting With Swami Ji');
INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES ('abhinavramki2@gmail.com', '2024-05-21 14:00:00', 'Online Doctor Consultation');

