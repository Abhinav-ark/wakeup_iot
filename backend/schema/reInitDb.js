import fs from 'fs';

const reInitDb = async (db) => {
    try {
        fs.readFile('./schema/data.sql', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                db.query(data, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(`[MESSAGE]: Database Initialized Successfully.`);
                    }
                });
            }
        });
    } catch (err) {
        console.error(err);
    }
};


export default reInitDb;