/**
 * Authorization functions
 * all authorization tokens are stored in sqlite database
 */

const sqlite3 = require('sqlite3').verbose();


/**
 * check current authorization status
 * returns promise which is resolved to the current userid if token is valid
 * @param token
 */
const getAuth = (token) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(process.env?.CONFIG_DB);
        const sToken = token?.replace('Bearer ','');
        //console.log("Check token = ",token, sToken);
        db.get("SELECT `users`.userid, `users`.login, `users`.cameraconfig, `users`.sensorconfig  FROM `tokens` LEFT JOIN `users` USING (userid) WHERE token=? ", [sToken], (err, dbres) => {
            //console.log("db result  =", dbres);

            if (dbres?.userid > 0) {
                //console.log("valid user id")
                resolve(dbres);
            } else {
                reject("Wrong token")
            }})
        });
}
module.exports = {getAuth};