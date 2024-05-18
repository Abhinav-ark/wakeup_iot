import 'dotenv/config'

import mysql from 'mysql2';

const establishConnection = () => {

    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    db.connect((err) => {
        if (err) {
            console.log("[ERROR]: Failed to connect to MySQL");
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Connected to MySQL...");
        }
    });

    return [db];

}

export default establishConnection;