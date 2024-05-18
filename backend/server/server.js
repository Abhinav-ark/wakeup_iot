import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import queryString from 'query-string'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

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

      const data2 = {wakeUpTime: "10s", wakeUpScore: "8/8", sleepTime: "5h 23m"}

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
    await db_connection.query(`INSERT INTO alarms (userEmail, alarmTime, alarmDescription) VALUES (?, ?, ?)`, [req.body.userEmail, new Date(req.body.time), req.body.desc]);
    await db_connection.query(`UNLOCK TABLES`);

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
    await db_connection.query(`UPDATE alarms SET alarmTime = ?, alarmDescription = ? WHERE alarmId = ? AND userEmail = ?`, [new Date(req.body.time), req.body.desc, req.body.alarmId, req.body.userEmail]);
    await db_connection.query(`UNLOCK TABLES`);

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