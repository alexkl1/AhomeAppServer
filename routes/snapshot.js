/**
 * camera snapshot router
 * in this implementation returns jpeg snapshot from camera on request
 */
const express = require('express');
const router = express.Router();
const getAuth = require("./auth/auth").getAuth;
const axios = require("axios").default;
/**
 * @TODO use authentication middleware
 */
router.get('/', async function (req, res, next) {
    console.log("Snapshot ", req?.headers);
    if (req?.query?.id) {
        if (req?.headers?.authorization) {
            try {
                const token = await getAuth(req?.headers?.authorization);
                console.log("Token = ", token);
                try {
                    const camconfig = JSON.parse(token?.cameraconfig).find(i => i?.id === req?.query?.id);
                    console.log("Cam config = ", camconfig);
                    const axres = await axios.get(camconfig?.snapshotUrl,{responseType: 'arraybuffer', headers: {...(process?.env?.AUTHKEY && {'AUTHKEY': process?.env?.AUTHKEY})}})
                    res.status(200).contentType("image/jpeg").send(axres?.data);//.send("token="+token);
                } catch (e) {
                    res.status(500).send("Error config "+e.message);
                }

            } catch (e) {
                res.status(401).send("Not authorized (token)");
            }
        } else res.status(401).send("Not authorized");
    }
    else res.status(400).send("No params");

});

module.exports = router;