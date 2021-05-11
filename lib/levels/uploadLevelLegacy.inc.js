const fs = require('fs');
const querystring = require('querystring');
const cryptoUtils = require('../utils/cryptoUtils.inc.js');
function genericError(httpRes) {
    httpRes.writeHead(200, {'Content-Type':'text/plain'});
    httpRes.end("-1");
    return;
}
//i'm uploading this as a backup, do not use
module.exports.init = function(httpReq, httpRes, configFile) {
    /*
     * REQUEST PARAMETERS:
     * udid - Unique Device ID (assuming that this legacy endpoint is used only by mobile devices, it should be an UUID format)
     * userName - username of whoever is uploading the level
     * secret - It should be Wmfd2893gb7
     * levelID - If it's 0, then it's a brand new level, if it isn't, we are updating an already published level.
     * levelName - The name of the level
     * levelDesc - The description of the level
     * levelString - The level data (object, placements, colours, etc), the content of the level basically xd
     * levelVersion - The level version (Starting from 1, incremented each time once published for updates)
     * levelLength - The level length (0 = Tiny, 1 = Short, 2 = Medium, 3 = Long, XL is non-existent yet in this endpoint)
     * audioTrack - The audio track number used for the level (0 = Stereo Madness, 1 = Back On Track, etc)
     * gameVersion - Version of the game
     * 
     * RESPONSE CODES:
     * (id of the level) - If the level was successfully uploaded somehow, (ex: 123123123)
     * -1 if something went wrong by any means
     */
    if(httpReq.method != "POST") {
        httpRes.writeHead(200, {'Content-Type':'text/plain'});
        httpRes.end("-1");
    }
    httpReq.on("data", function(data) {
        //should i import these two?
        let playerDb;
        let playerKeys;
        try {
            playerDb = JSON.parse(fs.readFileSync(__dirname + "/../../etc/serverData/players.db.json").toString());
            playerKeys = Object.keys(playerDb["playerData"]);
        } catch(error) {
            console.log("[ERROR] There was an error while reading player database. Data loss may happen!");
        }
        //uploadlevel start
        let levelDb;
        let levelKeys;
        try {
            /*
             * I NEED TO CHANGE THIS LATER
             * We can't load the level database always wherever is required (sorry for bad english btw :v)
             * This could lead to a huge RAM load if the JSON "database" is too big, damaging the server performance.
             * Maybe i should preload this one and pass it as a object across games, writing the file under a considerable interval.
             */
            levelDb = JSON.parse(fs.readFileSync(__dirname + "/../../etc/serverData/levels.db.json").toString());
            levelKeys = Object.keys(levelDb["levelDatabaseData"]);
        } catch(error) {
            console.log("[ERROR] There was an error while reading level database. Data loss may happen!");
        }
        let qs = querystring.parse(data.toString());
        if(!qs["udid"]) { genericError(httpRes); return; }
        if(!qs["userName"]) { genericError(httpRes); return; }
        if(!qs["secret"]) { genericError(httpRes); return; }
        if(!qs["levelID"]) { genericError(httpRes); return; }
        if(!qs["levelName"]) { genericError(httpRes); return; }
        if(!qs["levelDesc"]) { genericError(httpRes); return; }
        if(!qs["levelString"]) { genericError(httpRes); return; }
        if(!qs["levelVersion"]) { genericError(httpRes); return; }
        if(!qs["levelLength"]) { genericError(httpRes); return; }
        if(!qs["audioTrack"]) { genericError(httpRes); return; }
        if(!qs["gameVersion"]) { genericError(httpRes); return; }
        for(let c = 0; c < Object.keys(qs).length; c++) {
            //that dirty regex detection smh
            qs[Object.keys(qs)[c]] = qs[Object.keys(qs)[c]].toString().replace(/[^a-zA-Z0-9\d\s@.\- ]/g, "");
        }
        if(qs["secret"] != "Wmfd2893gb7") { genericError(httpRes) }

    });
    return;
}