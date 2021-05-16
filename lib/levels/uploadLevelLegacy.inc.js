const fs = require('fs');
const querystring = require('querystring');
const cryptoUtils = require('../utils/cryptoUtils.inc.js');
function genericResponse(httpRes, response) {
    if(!response) { response = "1" }
    httpRes.writeHead(200, {'Content-Type':'text/plain', 'Server':"gdserv/0.1a"});
    httpRes.end(response.toString());
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
        let levelKeys; //unused? for now
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
        if(!qs["udid"]) { genericResponse(httpRes, "-1"); return; }
        if(!qs["userName"]) { genericResponse(httpRes, "-1"); return; }
        if(!qs["secret"]) { genericResponse(httpRes, "-1"); return; }
        if(!qs["levelID"] || isNaN(qs["levelID"])) { genericResponse(httpRes, "-1"); return; }
        if(!qs["levelName"]) { genericResponse(httpRes, "-1"); return; }
        if(!qs["levelDesc"]) { qs["levelDesc"] = ""; }
        if(!qs["levelString"]) { genericResponse(httpRes, "-1"); return; }
        if(!qs["levelVersion"] || isNaN(qs["levelVersion"])) { genericResponse(httpRes, "-1"); return; }
        if(!qs["levelLength"] || isNaN(qs["levelLength"])) { genericResponse(httpRes, "-1"); return; }
        if(!qs["audioTrack"] || isNaN(qs["audioTrack"])) { genericResponse(httpRes, "-1"); return; }
        if(!qs["gameVersion"] || isNaN(qs["gameVersion"])) { genericResponse(httpRes, "-1"); return; }
        for(let c = 0; c < Object.keys(qs).length; c++) {
            //that dirty regex detection smh
            qs[Object.keys(qs)[c]] = qs[Object.keys(qs)[c]].toString().replace(/[^a-zA-Z0-9\d\s@.\-_,()\[\]; ]/g, "");
        }
        if(qs["secret"] != "Wmfd2893gb7") { genericResponse(httpRes, "-1") }
        //well let's say that we passed all the checks, now what :v
        //where do we store the levels? in a JSON ofc
        //NOTE: implement MySQL or MongoDB you lazy fuck
        //
        // ok so let's start by saving all level data into db
        let levelIDreturn = "-1";
        if(!!levelDb["levelDatabaseData"][qs["levelID"]]) {
            //we are updating the level
            levelDb["levelDatabaseData"][qs["levelID"]] = {
                "name": qs["levelName"],
                "description": qs["levelDesc"],
                "levelData": qs["levelString"],
                "version": qs["levelVersion"],
                "length": qs["levelLength"],
                "officialAudioTrackNumber": qs["audioTrack"],
                "gameVersion": qs["gameVersion"],
                ownerData: {
                    udid: qs["udid"],
                    userName: qs["userName"]
                }
            }
            levelIDreturn = qs["levelID"];
        } else if(qs["levelID"] == "0") {
            //we are storing a new level
            levelDb["levelDatabaseData"][levelDb["lastLevelID"]] = {
                "name": qs["levelName"],
                "description": qs["levelDesc"],
                "levelData": qs["levelString"],
                "version": qs["levelVersion"],
                "length": qs["levelLength"],
                "officialAudioTrackNumber": qs["audioTrack"],
                "gameVersion": qs["gameVersion"],
                ownerData: {
                    udid: qs["udid"],
                    userName: qs["userName"]
                }
            }
            levelIDreturn = levelDb["lastLevelID"];
            levelDb["lastLevelID"]++;
        }
        try {
            fs.writeFileSync(__dirname + "/../../etc/serverData/levels.db.json", JSON.stringify(levelDb, null, "\t"));
        } catch(error) {
            console.log("[ERROR] Couldn't write new level to levels database, level registration rejected.");
            genericResponse(httpRes, "-1");
            return;
        }
        genericResponse(httpRes, levelIDreturn);
        return;
    });
    return;
}