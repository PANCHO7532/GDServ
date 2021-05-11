const fs = require('fs');
const querystring = require('querystring');
const cryptoUtils = require('../utils/cryptoUtils.inc.js');
function genericError(httpRes) {
    httpRes.writeHead(200, {'Content-Type':'text/plain'});
    httpRes.end("-1");
    return;
}
module.exports.init = function(httpReq, httpRes, configFile) {
    /*
     * REQUEST PARAMETERS:
     * udid - Unique Device ID (probably any number combination or a random integer)
     * userName - the username
     * password - the password
     * sID - Account SteamID (minus 3 digits) where the game is running now
     * secret - Must be Wmfv3899gc9
     * 
     * RESPONSE CODES:
     * (accountID,userID) Everything went well, example: 12345,67890 and so on
     * -1 Login Failed
     * -12 Account disabled/banned
     * -13 Account linked to a different Steam Account (sID mismatch)
     * Anything more than that is a generic "Login Failed"
     */
    if(httpReq.method != "POST") {
        httpRes.writeHead(200, {'Content-Type':'text/plain'});
        httpRes.end("-1");
    }
    httpReq.on("data", function(data) {
        let playerDb;
        let playerKeys;
        let writePlayerDb;
        try {
            playerDb = JSON.parse(fs.readFileSync(__dirname + "/../../etc/serverData/players.db.json").toString());
            playerKeys = Object.keys(playerDb["playerData"]);
        } catch(error) {
            console.log("[ERROR] There was an error while reading player database. Data loss may happen!");
        }
        let qs = querystring.parse(data.toString());
        for(let c = 0; c < Object.keys(qs).length; c++) {
            //that dirty regex detection smh
            qs[Object.keys(qs)[c]] = qs[Object.keys(qs)[c]].toString().replace(/[^a-zA-Z0-9\d\s@.\- ]/g, "");
        }
        if(!qs["userName"]) { genericError(httpRes); return; }
        if(!qs["password"]) { genericError(httpRes); return; }
        if(!qs["secret"]) { genericError(httpRes); return; }
        if(qs["secret"] != "Wmfv3899gc9") { genericError(httpRes); return; }
        if(!playerDb["playerData"][qs["userName"]]) {
            //i couldn't find the user xD
            genericError(httpRes);
            return
        } else if(playerDb["playerData"][qs["userName"]]["password"] != cryptoUtils.createSHA256(qs["password"]).toString("hex")) {
            //password mismatch or something
            genericError(httpRes);
            return
        }
        if(!playerDb["playerData"][qs["userName"]]["enabled"]) {
            //account is disabled
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-12");
            return
        }
        if(configFile["enforceSteamCheck"] && !!qs["sID"]) {
            if(!!playerDb["playerData"][qs["userName"]]["linkedSteamID"] && qs["sID"] != playerDb["playerData"][qs["userName"]]["linkedSteamID"]) {
                httpRes.writeHead(200, {'Content-Type':'text/plain'});
                httpRes.end("-13");
                return;
            }
        } else {
            genericError(httpRes);
            return
        }
        if(!!qs["sID"] && qs["sID"].length > 0) {
            if(playerDb["playerData"][qs["userName"]]["linkedSteamID"].length < 1) {
                playerDb["playerData"][qs["userName"]]["linkedSteamID"] = qs["sID"];
                writePlayerDb = true;
            }
        }
        if(!!qs["udid"] && qs["udid"].length > 0) {
            if(playerDb["playerData"][qs["userName"]]["udid"].length < 1) {
                playerDb["playerData"][qs["userName"]]["udid"] = qs["udid"];
                writePlayerDb = true;
            }
        }
        try {
            if(writePlayerDb) {
                fs.writeFileSync(__dirname + "/../../etc/serverData/players.db.json", JSON.stringify(playerDb, null, "\t"));
            }
        } catch(error) {
            console.log("[ERROR] Couldn't write to player database, account registration rejected.");
            genericError(httpRes);
            return;
        }
        httpRes.writeHead(200, {'Content-Type':'text/plain'});
        httpRes.end(playerDb["playerData"][qs["userName"]]["accID"] + "," + playerDb["playerData"][qs["userName"]]["userID"]);
    });
    return; //note for later: should i return here?
}