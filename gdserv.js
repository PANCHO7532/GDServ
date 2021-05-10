const fs = require("fs");
var showHelp = false;
var serverHost = "";
var serverPort = 0;
if(!fs.existsSync(__dirname + "/bin")) {
    console.log("[ERROR] Missing \"bin\" directory");
    process.exit(1);
} else if(!fs.existsSync(__dirname + "/etc")) {
    console.log("[ERROR] Missing \"etc\" directory");
    process.exit(1);
}
for(let c = 0; c < process.argv.length; c++) {
    switch(process.argv[c]) {
        case "--ip":
            serverHost = process.argv[c + 1];
            break;
        case "--port":
            serverPort = process.argv[c + 1];
            break;
        case "--help":
        case "-h":
            showHelp = true;
            break;
    }
}
if(showHelp) {
    const helpContent = [
        "GDServ 0.0.1",
        "Copyright PANCHO7532 - P7COMunications LLC",
        "Usage: node script.js [--args, -a]",

        "[--help, -h] Show this help",
        "[--ip] IP Address where the server should be listening",
        "[--port] Port number where the web server should bind"
    ];
    for(let c = 0; c < helpContent.length; c++) {
        console.log(helpContent[c]);
    }
    process.exit(0);
}
require(__dirname + "/bin/serverEngine.js").start(serverHost, serverPort);