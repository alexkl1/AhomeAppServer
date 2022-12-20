/**
 * Simple express router logic
 * @type {function(): app}
 */
var express = require('express');
const jwt = require("jsonwebtoken");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * authentication
 */
router.post('/auth', function(req,res,next) {
  console.log("authentication request: ",req?.query);
  //console.log("Config=",process.env?.CONFIG_DB);
  if (req?.query?.login?.length>2 && req?.query?.password?.length>2)
  {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(process.env?.CONFIG_DB);
    const dbres = db.get("SELECT * FROM `users` WHERE login=? and password=? ", [req?.query.login,req?.query.password],(err,dbres)=>{
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
          token: token
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
    res.status(400).send("Invalid login / password");
  }
});

/**
 * Get sensors array
 */
router.get('/sensors',function(req,res,next) {

  const debugSensors = [
    {id: 'ROOM1', value: Math.random()*19, minValue: -100, maxValue: 100, Name:'Room sensor'},
    {id: 'ROOM2', value: Math.random()*19, minValue: -100, maxValue: 100, Name:'Another room sensor'}
  ]

  res.json(debugSensors);
});

/**
 * Get camera array with feed urls
 */
router.get('/cameras', function(req,res,next) {

  const debugCameras = [
    {id: 'CAMERA1', snapshotUrl: 'http://macbook-pro-alexander.local:8096/feed/cam1'},
    {id: 'CAMERA2', snapshotUrl: 'http://macbook-pro-alexander.local:8096/feed/cam2'},
  ]
  res.json(debugCameras);
});

module.exports = router;
