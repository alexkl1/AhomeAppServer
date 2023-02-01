/**
 * Simple express router logic
 * @type {function(): app}
 */
const express = require('express');
const jwt = require("jsonwebtoken");
const {default: axios} = require("axios");
const getAuth = require("./auth/auth").getAuth;
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
router.get('/', function(req, res) {
  res.send("AhomeServer");
});


/**
 * authentication
 */
router.post('/auth', function(req,res) {
  console.log("authentication request: ",req?.body);
  console.log("request params: ", req?.body);      // your JSON
  //console.log("Config=",process.env?.CONFIG_DB);
  if (req?.body?.login?.length>2 && req?.body?.password?.length>2)
  {
    const db = new sqlite3.Database(process.env?.CONFIG_DB);
    const dbres = db.get("SELECT * FROM `users` WHERE login=? and password=? ", [req?.body.login.toLowerCase(),req?.body.password],(err,dbres)=>{
      console.log ( "db result  =",dbres);

      if (dbres?.userid>0)
      {
        /**
         * create session/ succeeded auth
         */
        const payload = `${dbres?.userid} - ${dbres?.login}`;
        //const expires = '365d';
        const token = jwt.sign(payload,process.env?.JWT_KEY);
        const now = Date.now();
        const replres= db.run("REPLACE INTO `tokens` (`userid`,`token`,`created`) VALUES (?, ?, ?)",[dbres?.userid, token, now]);
        const result={
          token: token,
          user: dbres?.login
        }
        res.json(result);
      }
      else
      {
        res.status(400).send("Invalid login / password");
      }
    });
  }
  else
  {
    res.status(400).send("No params");
  }
});

/**
 * Get sensors array
 */
router.get('/sensors',async function (req, res) {
    try {
      const token = await getAuth(req?.headers?.authorization);

      if (token) {
        //console.log("Token = ", token);
        const sensorconfig = JSON.parse(token?.sensorconfig);
        const promisesAr = sensorconfig.map(i => new Promise(async resolve => {
          //console.log("Querying sensor: ", i);
          const axres = await axios.get(i?.url, {
            //responseType: 'arraybuffer',
            timeout: 30000,
            headers: {...(process?.env?.AUTHKEY && {'AUTHKEY': process?.env?.AUTHKEY})}
          }).catch((err) => {
            //console.log("Axios catch error: ", err);
          })

          resolve({
            id: i?.id,
            type: 'temp',
            name: i?.name,
            minValue: -50,
            maxValue: 100,
            value: axres?.data?.temp_floor
          });
        }))

        const promisesRes = await Promise.all(promisesAr);
        res.json(promisesRes);
        return;
      }
      else
      {
        res.status(400).send("Not authorized");
      }
    } catch (e) {
      console.log("Exception: ", e);
      res.status(500).send(e.message);
    }

    /*const debugSensors = [
      {id: 'ROOM1', value: Math.random() * 19, minValue: -100, maxValue: 100, Name: 'Room sensor'},
      {id: 'ROOM2', value: Math.random() * 19, minValue: -100, maxValue: 100, Name: 'Another room sensor'}
    ]

    res.json(debugSensors);*/



});

/**
 * Get camera array with feed urls
 */
router.get('/cameras', async function (req, res, next) {

  try {
    const token = await getAuth(req?.headers?.authorization);
    console.log("Token = ", req?.headers?.authorization);
    if (token) {
      if (token?.cameraconfig) {
        // make feed urls
        try {
          const camconfig = JSON.parse(token?.cameraconfig).map(
              i => {
                return {id: i?.id, snapshotUrl: '/feed/?id=' + i?.id}
              });
          //console.log("camconfig=",camconfig);
          res.json(camconfig);
        } catch (e) {
          console.log("Exception: ", e);
          res.status(500).send(e.message);
        }
      } else res.status(204).send("No content");
    } else {
      res.status(401).send("Unauthorized");
    }
  }
  catch (e)
  {
    res.status(401).send("Unauthorized / token");
  }
  /*const debugCameras = [
    {id: 'CAMERA1', snapshotUrl: 'http://macbook-pro-alexander.local:8096/feed/cam1'},
    {id: 'CAMERA2', snapshotUrl: 'http://macbook-pro-alexander.local:8096/feed/cam2'},
  ]*/
  //res.json(debugCameras);
});

router.get('/check', async function (req, res, next) {

  console.log("headers =  ",req?.headers);
  if (req?.headers?.token) {
    try {
      const token = await getAuth(req?.headers?.token);
      res.status(200).send("Valid");
    }
    catch (e) {
      res.status(401).send("Unauthorized");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});


module.exports = router;
