const fs = require('fs');
const querystring = require('querystring');
const cryptoUtils = require('../utils/cryptoUtils.inc.js');
module.exports.init = function(httpReq, httpRes, configFile) {
    /*
    * REQUEST PARAMETERS:
    * userName - the username
    * password - the password
    * email - the email
    * secret - Must be Wmfv3899gc9
    * 
    * RESPONSE CODES:
    * 1 Everything went well
    * -1 Something went wrong (generic error)
    * -2 Username in use
    * -3 Email in use
    * -4 Invalid Username
    * -5 Invalid Password
    * -6 Invalid Email
    * -7 Password mismatch
    * -8 Password too short
    * -9 Username too short
    * Anything more than that is a generic "Something went wrong"
    */
    if(httpReq.method != "POST") {
        httpRes.writeHead(200, {'Content-Type':'text/plain'});
        httpRes.end("-1");
        return;
    }
    httpReq.on("data", function(data) {
        let playerDb;
        let playerKeys;
        try {
            playerDb = JSON.parse(fs.readFileSync(__dirname + "/../../etc/serverData/players.db.json").toString());
            playerKeys = Object.keys(playerDb["playerData"]);
        } catch(error) {
            console.log("[ERROR] There was an error while reading player database. Data loss may happen!");
        }
        let qs = querystring.parse(data.toString());
        for(let c = 0; c < Object.keys(qs).length; c++) {
            //that dirty regex detection smh
            qs[Object.keys(qs)[c]] = qs[Object.keys(qs)[c]].toString().replace(/[^a-zA-Z0-9\d\s@. ]/g, "");
        }
        //let regxp = "[^a-zA-Z0-9\d\s@. ]";
        //just to be clear, i'm not a "else if" person but for this situation i can't find something more suitable
        if(!qs["userName"]) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-1");
            return
        } else if(!qs["password"]) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-1");
            return
        } else if(!qs["email"]) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-1");
            return
        } else if(!qs["secret"]) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-1");
            return
        } else if(qs["secret"] != "Wmfv3899gc9") {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-1");
            return
        } else if(!!playerDb["playerData"][qs["userName"]]) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-2");
            return
        }
        /* legacy code i guess 
        else if(qs["userName"].match(regxp) != null) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-4");
            return
        } else if(qs["password"].match(regxp) != null) {
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-5");
            return
        } else if(qs["email"].match(regxp) != null) {
            console.log("regxp");
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-6");
            return
        }*/
        for(let c = 0; c < configFile["emailBlacklist"].length; c++) {
            if(qs["email"].indexOf(configFile["emailBlacklist"][c]) != -1) {
                console.log("xd");
                httpRes.writeHead(200, {'Content-Type':'text/plain'});
                httpRes.end("-6");
                return;
            }
        }
        for(let c = 0; c < playerKeys.length; c++) {
            // a really really dirty implementation, might modify later when i figure out a more lightweight implementation.
            if(playerDb["playerData"][playerKeys[c]] && playerDb["playerData"][playerKeys[c]]["email"] == qs["email"]) {
                httpRes.writeHead(200, {'Content-Type':'text/plain'});
                httpRes.end("-3");
                return;
            }
        }
        playerDb["playerData"][qs["userName"]] = {
            "accID": playerDb["accID_counter"],
            "userID": playerDb["userID_counter"],
            "udid": "",
            "linkedSteamID": "",
            "email": qs["email"],
            "password": cryptoUtils.createSHA256(qs["password"]).toString("hex"), //gotta encrypt those passwords xd
            "enabled": true
        }
        playerDb["accID_counter"]++;
        playerDb["userID_counter"]++;
        try {
            fs.writeFileSync(__dirname + "/../../etc/serverData/players.db.json", JSON.stringify(playerDb, null, "\t"));
        } catch(error) {
            console.log("[ERROR] Couldn't write to player database, account registration rejected.");
            httpRes.writeHead(200, {'Content-Type':'text/plain'});
            httpRes.end("-1");
            return;
        }
        httpRes.writeHead(200, {'Content-Type':'text/plain'});
        httpRes.end("1");
    });
    return;
}