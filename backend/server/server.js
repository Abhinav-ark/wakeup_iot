
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import queryString from 'query-string'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import {WebSocketServer} from 'ws'
import http from 'http'

// const WebSocketServer = require("ws").Server;

import DB from '../schema/connection.js'

const config = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  redirectUrl: process.env.REDIRECT_URL,
  clientUrl: process.env.CLIENT_URL,
  tokenSecret: process.env.TOKEN_SECRET,
  tokenExpiration: 36000
}

const authParams = queryString.stringify({
    client_id: config.clientId,
    redirect_uri: config.redirectUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    state: 'standard_oauth',
    prompt: 'consent',
})

const getTokenParams = (code) =>
    queryString.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUrl,
})

const app = express()

// Resolve CORS
app.use(
    cors({
      origin: [config.clientUrl],
      credentials: true,
    }),
  )
  
// Parse Cookie
app.use(cookieParser())

app.use(express.json())
  
  // Verify auth
const auth = (req, res, next) => {
    try {
      console.log("bb",req.body);
      const token = req.cookies.token
      if (!token) return res.status(401).json({ message: 'Unauthorized' })
      const decoded = jwt.verify(token, config.tokenSecret);
      if (!req.body) {
        req.body = {};
      }
      req.body["userEmail"] = decoded.user.email;
      return next()
    } catch (err) {
      console.error('Error: ', err)
      res.status(401).json({ message: 'Unauthorized' })
    }
}

app.get('/api/auth/url', (_, res) => {
    res.json({
      url: `${config.authUrl}?${authParams}`,
    })
})

app.get('/api/auth/token', async (req, res) => {
    const { code } = req.query
    if (!code) return res.status(400).json({ message: 'Authorization code must be provided' })
    try {
      // Get all parameters needed to hit authorization server
      const tokenParam = getTokenParams(code)
      // Exchange authorization code for access token (id token is returned here too)
      const {
        data: { id_token },
      } = await axios.post(`${config.tokenUrl}?${tokenParam}`)
      if (!id_token) return res.status(400).json({ message: 'Auth error' })
      // Get user info from id token
      const { email, name, picture } = jwt.decode(id_token)
      const user = { name, email, picture }
      // Sign a new token
      const token = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration })
      // Set cookies for user
      res.cookie('token', token, { maxAge: config.tokenExpiration, httpOnly: true })
      // You can choose to store user in a DB instead
      res.json({
        user,
      })
    } catch (err) {
      console.error('Error: ', err)
      res.status(500).json({ message: err.message || 'Server error' })
    }
})



app.get('/api/auth/logged_in', (req, res) => {
    try {
      // Get token from cookie
      const token = req.cookies.token
      if (!token) return res.json({ loggedIn: false })
      const { user } = jwt.verify(token, config.tokenSecret)
      const newToken = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration })
      // Reset token in cookie
      res.cookie('token', newToken, { maxAge: config.tokenExpiration, httpOnly: true })
      res.json({ loggedIn: true, user })
    } catch (err) {
      res.json({ loggedIn: false })
    }
})

app.post('/api/auth/logout', (_, res) => {
    // clear cookie
    res.clearCookie('token').json({ message: 'Logged out' })
})


app.get('/api/user/sleep', auth,async (req, res) => {
  let db_connection = await DB.promise().getConnection();
  try{
    let data = {
        totalSleepTime:"",
        deepSleepTime:"",
        outOfBedDayX:[],
        outOfBedDayY:[],
        outOfBedWeekX:[],
        outOfBedWeekY:[],
        sleepQualityX:[],
        sleepQualityY:[],
        secret:false
    }
    
    await db_connection.query(`LOCK TABLES sleepData READ`);
    const [rows] = await db_connection.query(`SELECT * FROM sleepData WHERE userEmail = ?`, [req.body.userEmail]);
    await db_connection.query(`UNLOCK TABLES`);

    data = rows.map(sleep => ({
      totalSleepTime: sleep.totalSleepTime,
      deepSleepTime: sleep.deepSleepTime,
      outOfBedDayX: sleep.outOfBedDayX,
      outOfBedDayY: sleep.outOfBedDayY,
      outOfBedWeekX: sleep.outOfBedWeekX,
      outOfBedWeekY: sleep.outOfBedWeekY,
      sleepQualityX: sleep.sleepQualityX,
      sleepQualityY: sleep.sleepQualityY,
      secret:true
    }));

    res.json(data) 
  } catch (err) {
    console.error('Error: ', err)
    res.status(500).send({"message":"Error fetching sleep data"})
  }
  finally {
    db_connection.release();
  }   
})

app.get('/api/user/weight',auth, async (req, res) => {
  try {
    let db_connection = await DB.promise().getConnection();
    let data = {
      weightCurrent: 0,
      weightPrevious: 0,
      weekX:[],
      weekY:[],
      monthX:[],
      monthY:[],
      secret:false
    }
    await db_connection.query(`LOCK TABLES weightData READ`);
    const [rows] = await db_connection.query(`SELECT * FROM weightData WHERE userEmail = ?`, [req.body.userEmail]);
    await db_connection.query(`UNLOCK TABLES`);

    data = rows.map(weight => ({
      weightCurrent: weight.weightCurrent,
      weightPrevious: weight.weightPrevious,
      weekX: weight.weekX,
      weekY: weight.weekY,
      monthX: weight.monthX,
      monthY: weight.monthY,
      secret:true
    }));

    res.json(data)
  } catch (err) {
    console.error('Error: ', err)
    res.status(500).send({"message":"Error fetching weight data"})
  }
   
})


app.get('/api/user/alarms', auth, async (req, res) => {
    let db_connection = await DB.promise().getConnection();
    try {
      
      await db_connection.query(`LOCK TABLES alarms READ`);
      const [rows] = await db_connection.query(`SELECT * FROM alarms WHERE userEmail = ?`, [req.body.userEmail]);
      await db_connection.query(`UNLOCK TABLES`);

      const formattedAlarms = rows.map(alarm => ({
        alarmId: alarm.alarmID,
        time: new Date(alarm.alarmTime).getTime(), // or Date.now() if you want current time
        desc: alarm.alarmDescription
      }));

      let data2 = {
        wakeUpTime: null,
        wakeUpScore: null,
        sleepTime: null
      }
      await db_connection.query(`LOCK TABLES sleepData READ`);
      const [rows2] = await db_connection.query(`SELECT * FROM sleepData WHERE userEmail = ?`, [req.body.userEmail]);
      await db_connection.query(`UNLOCK TABLES`);

      if(rows2.length > 0){
        data2 = {
          wakeUpTime: rows2[0].wakeUpTime,
          wakeUpScore: rows2[0].wakeUpScore,
          sleepTime: rows2[0].sleepTime
        }
      }

      res.json({alarms: formattedAlarms, stats: data2})
    } catch (err) {
      console.error('Error: ', err)
      res.status(500).send({"message":"Error fetching alarms"})
    } finally {
      db_connection.release();
    }
})

app.post('/api/user/createAlarm', auth, async (req, res) => {
  let db_connection = await DB.promise().getConnection();
  try {
    await db_connection.query(`LOCK TABLES alarms WRITE`);
    await db_connection.query(`INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES (?, ?, ?)`, [req.body.userEmail, req.body.time, req.body.desc]);
    await db_connection.query(`UNLOCK TABLES`);
    await sendMessageToClients(req.body.userEmail);
    res.status(200).send({"message":"Alarm created Successfully"})
  } catch (err) {
    console.error('Error: ', err)
    res.status(500).send({"message":"Error creating alarm"})
  } finally {
    db_connection.release();
  }
})

app.post('/api/user/editAlarm', auth, async (req, res) => {
  let db_connection = await DB.promise().getConnection();
  try {
    console.log(req.body);
    await db_connection.query(`LOCK TABLES alarms WRITE`);
    await db_connection.query(`UPDATE alarms SET alarmTime = ?, alarmDescription = ? WHERE alarmId = ? AND userEmail = ?`, [req.body.time, req.body.desc, req.body.alarmId, req.body.userEmail]);
    await db_connection.query(`UNLOCK TABLES`);
    await sendMessageToClients(req.body.userEmail);
    res.status(200).send({"message":"Alarm Edited Successfully"})
  } catch (err) {
    console.error('Error: ', err)
    res.status(500).send({"message":"Error Editing alarm"})
  } finally {
    db_connection.release();
  }
})

app.post('/api/user/deleteAlarm', auth, async (req, res) => {
  let db_connection = await DB.promise().getConnection();
  try {
    await db_connection.query(`LOCK TABLES alarms WRITE`);
    await db_connection.query(`DELETE FROM alarms WHERE alarmId = ? AND userEmail = ?`, [req.body.alarmId, req.body.userEmail]);
    await db_connection.query(`UNLOCK TABLES`);
    await sendMessageToClients(req.body.userEmail);
    res.status(200).send({"message":"Alarm Deleted Successfully"})
  } catch (err) {
    console.error('Error: ', err)
    res.status(500).send({"message":"Error Deleting alarm"})
  } finally {
    db_connection.release();
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, (err) => {
  if (err) {
      console.log('[ERROR]: Error starting server.');
  } else {
      console.log(`[MESSAGE]: 🚀 Server listening on port ${PORT}`);
  }


})

const server = http.createServer(app);

// Set up a WebSocket server on a specific path
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  console.log("New connection established");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    // Echo the message back to the client
    ws.send(`You said: ${message}`);
  });

  ws.on("close", () => {
    console.log("Connection closed");
  });
});

console.log("WebSocket server is running on ws://localhost:8000");

const sendMessageToClients = async (userEmail) => {
  let formattedAlarms = [];
  let db_connection = await DB.promise().getConnection();
  try {
    await db_connection.query(`LOCK TABLES alarms READ`);
    const [rows] = await db_connection.query(`SELECT * FROM alarms WHERE userEmail = ?`, [userEmail]);
    await db_connection.query(`UNLOCK TABLES`);

    formattedAlarms = rows.map(alarm => {
      const alarmTime = new Date(alarm.alarmTime);
      const istTime = alarmTime.toLocaleString('en-UK', { timeZone: 'GMT' });
      return { time: istTime };
    });
  } catch (err) {
    console.error('Error: ', err);
  } finally {
    db_connection.release();
  }

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(formattedAlarms));
      console.log("Message sent to client", formattedAlarms);
    }
  });
};

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(8000, () => {
  console.log('HTTP server is running on http://localhost:8000');
});


