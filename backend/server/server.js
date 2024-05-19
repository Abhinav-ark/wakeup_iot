
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

import reInitDatabase from "../schema/reInitDb.js"
import establishConnection from '../schema/initializeConnection.js'

const db = establishConnection();

const initialize = () => {
  reInitDatabase(db[0]);
  console.log("[MESSAGE]: DB Initialized done.");
}

initialize();

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
  if (req.body.userEmail === 'abhinavramki2@gmail.com') {
    data = {
      totalSleepTime:"4h 18m",
      deepSleepTime:"2h 26m",
      outOfBedDayX:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      outOfBedDayY:[2, 1, 3, 1, 0, 0],
      outOfBedWeekX:["Week 1", "Week 2", "Week 3"],
      outOfBedWeekY:[2, 8, 7],
      sleepQualityX:["April","May"],
      sleepQualityY:[8.1,6.2],
      secret:true
    }
  }
  else if (req.body.userEmail === 'hariharan.14107@gmail.com'){
    data = {
      totalSleepTime:"5h 36m",
      deepSleepTime:"4h 21m",
      outOfBedDayX:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      outOfBedDayY:[1, 1, 4, 0, 2, 1],
      outOfBedWeekX:["Week 1", "Week 2", "Week 3"],
      outOfBedWeekY:[8, 5, 9],
      sleepQualityX:["April","May"],
      sleepQualityY:[7.8,7.2],
      secret:true
    }
  }
  else if (req.body.userEmail === 'sksseervi@gmail.com'){
    data = {
      totalSleepTime:"5h 36m",
      deepSleepTime:"4h 21m",
      outOfBedDayX:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      outOfBedDayY:[1, 1, 4, 0, 2, 1],
      outOfBedWeekX:["Week 1", "Week 2", "Week 3"],
      outOfBedWeekY:[8, 5, 9],
      sleepQualityX:["April","May"],
      sleepQualityY:[7.8,7.2],
      secret:true
    }
  }
    
  res.json(data)    
})

app.get('/api/user/weight',auth, async (req, res) => {
    let data = {
      weightCurrent: 0,
      weightPrevious: 0,
      weekX:[],
      weekY:[],
      monthX:[],
      monthY:[],
      secret:false
    }
    if (req.body.userEmail === 'abhinavramki2@gmail.com') {
      data = {
        weightCurrent: 52.1,
        weightPrevious: 53.8,
        weekX:["Apr-Week3","Apr-Week4","May-Week1","May-Week2","May-Week3"],
        weekY:[53.9,53.8,52.7,52.7,52.1],
        monthX:["April","May"],
        monthY:[53.85,52.5],
        secret:true
      }
    } else if (req.body.userEmail === 'hariharan.14107@gmail.com'){
      data = {
        weightCurrent: 56.1,
        weightPrevious: 55.8,
        weekX:["Apr-Week3","Apr-Week4","May-Week1","May-Week2","May-Week3"],
        weekY:[55.9,56.1,56.0,56.2,56.1],
        monthX:["April","May"],
        monthY:[56.0,56.1],
        secret:true
      }
    }
    else if (req.body.userEmail === 'sksseervi@gmail.com'){
      data = {
        weightCurrent: 56.1,
        weightPrevious: 55.8,
        weekX:["Apr-Week3","Apr-Week4","May-Week1","May-Week2","May-Week3"],
        weekY:[55.9,56.1,56.0,56.2,56.1],
        monthX:["April","May"],
        monthY:[56.0,56.1],
        secret:true
      }
    }
    
    res.json(data)    
})


app.get('/api/user/alarms', auth, async (req, res) => {
    let db_connection = await DB.promise().getConnection();
    try {
      
      await db_connection.query(`LOCK TABLES alarms READ`);
      const [rows] = await db_connection.query(`SELECT * FROM alarms WHERE userEmail = ?`, [req.body.userEmail]);
      await db_connection.query(`UNLOCK TABLES`);

      // console.log(rows[0].alarmTime, typeof(rows[0].alarmTime));
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
      if (req.body.userEmail === 'abhinavramki2@gmail.com') {
        data2 = {
          wakeUpTime: "10s",
          wakeUpScore: "8/8",
          sleepTime: "5h 23m"
        }
      } else if (req.body.userEmail === 'hariharan.14107@gmail.com'){
        data2 = {
          wakeUpTime: "23s",
          wakeUpScore: "7/8",
          sleepTime: "7h 36m"
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
    // req.body.userEmail = 'shivajivayilajilebi@gmail.com'
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
    //req.body.userEmail = 'shivajivayilajilebi@gmail.com'
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


