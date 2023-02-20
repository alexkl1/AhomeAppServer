/**
 * camera snapshot router
 * in this implementation returns jpeg snapshot from camera on request
 */
const express = require('express');
const fs = require("fs");
const router = express.Router();
const getAuth = require("./auth/auth").getAuth;
const axios = require("axios").default;

const getDemoFile = (cameraId, fileIndex) => {
    const demoFolder  = 'demo/';
    return `${demoFolder}${cameraId}_${fileIndex}.jpeg`;
}

/**
 * TODO: refactor to better storage ?
 * @type {Map<any, any>}
 */
let demoFileMap = new Map(); // map holds last queried file index of screenshot for given camera. reset to 1 if no more sample screenshots
/**
 * Iteractively return screenshots from demo cameras
 * @param camerdId - cameraid (example: cam1)
 * @return buffer | null
 */
function demoScreenShot(cameraId) {
    const fs = require ('fs');
    while (true) {
        //const cameraId  = yield;
        let fcontent = null; // buffer to read
        let fileIdx = 1; // default file index
        let fileExists = false;

        if (demoFileMap.has(cameraId)) {
            // got last cached screenshot
            fileIdx = Number(demoFileMap.get(cameraId))+1;
            fileExists = fs.existsSync(getDemoFile(cameraId, fileIdx));
            if (!fileExists)
            {
                // reset to first file
                fileIdx = 1;
            }
        }

        // check first index file
        fileExists = fs.existsSync(getDemoFile(cameraId, fileIdx));

        if (fileExists) {
            fcontent = fs.readFileSync(getDemoFile(cameraId, fileIdx), {encoding: 'binary'});
            demoFileMap.set(cameraId, fileIdx);
            return fcontent;
        }
        else return null;
    }
};

/**
 * @TODO use authentication middleware
 */

/**
 * Get snapshot from camera (according to config in configuration database)
 * if snapshoturl is 'demo' then snapshots are taken from local folder
 */
const get = getDemoFile()
router.get('/', async function (req, res, next) {
    //console.log("Snapshot ", req?.headers);
    if (req?.query?.id) {
        if (req?.headers?.authorization) {
            try {
                const token = await getAuth(req?.headers?.authorization);
                try {
                    const camconfig = JSON.parse(token?.cameraconfig).find(i => i?.id === req?.query?.id);
                    //console.log("Cam config = ", camconfig);

                    // check if demo account
                    if (camconfig?.snapshotUrl == 'demo')
                    {
                        const fcontent = demoScreenShot(camconfig?.id);
                        if (fcontent !== null)
                        {
                            res.status(200).contentType("image/jpeg").end(fcontent,"binary");
                        }
                        else
                        {
                            res.status(404).send("Screenshot not found");
                        }
                        return;
                    }

                    const axres = await axios.get(camconfig?.snapshotUrl,{
                        responseType: 'arraybuffer',
                        timeout: 60000,
                        headers: {...(process?.env?.AUTHKEY && {'AUTHKEY': process?.env?.AUTHKEY})}}).catch((err)=>{
                            //console.log("Axios catch error: ",err);
                    })
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