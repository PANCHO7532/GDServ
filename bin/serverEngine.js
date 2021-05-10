const http = require('http');
let configFile;
try {
    configFile = JSON.parse(require('fs').readFileSync(__dirname + "/../etc/config.inc.json").toString());
} catch(error) {
    console.log("[ERROR] Config file missing, error: " + error);
    process.exit(1);
}
function httpFunctions(req, res) {
    console.log(req.method + " " + req.url + " - " + new Date().toUTCString());
    for(let c = 0; c < configFile["endpoints"].length; c++) {
        if(req.url == configFile["endpoints"][c]["pointName"]) {
            require(__dirname + "/../lib/" + configFile["endpoints"][c]["pointDest"]).init(req, res, configFile);
            return;
        }
    }
    res.writeHead(404, {'Content-Type':'text/html'});
    res.end("<html><head><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The requested resource \"" + req.url + "\" was not found in this server.</p></body></html>");
    return;
}
module.exports.start = function(httpHost, httpPort) {
    const httpServer = http.createServer(httpFunctions);
    httpServer.listen(httpPort, httpHost, function() {
        if(!!httpHost || httpHost.length > 1) {
            console.log("[INFO] Server running on " + httpHost + " at port " + httpPort);
        } else {
            console.log("[INFO] Server running on port " + httpPort);
        }
    }); 
}