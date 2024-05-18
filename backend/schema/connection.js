import 'dotenv/config'

import mysql from 'mysql2';
import os from 'os';

const connectionLimit = os.cpus().length;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: connectionLimit,
    queueLimit: 0
});

export default db;