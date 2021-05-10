const crypto = require('crypto');
function createSHA1(string) {
    let sha1calc = crypto.createHash("sha1");
    sha1calc = sha1calc.update(string);
    sha1calc = sha1calc.digest();
    return sha1calc; //returns buffer
}
function createSHA256(string) {
    let sha256calc = crypto.createHash("sha256");
    sha256calc = sha256calc.update(string);
    sha256calc = sha256calc.digest();
    return sha256calc; //returns buffer
}
function base64Encode(string) {
    return Buffer.from(string, "utf-8").toString("base64");
}
function base64Decode(string) {
    return Buffer.from(string, "base64").toString("utf-8");
}
function xorCrypto(key, string) {
    let deobfs_val = "";
    for(let a = 0, b = 0; a < string.length; a++, b++) {
        if(b >= key.length) {b = 0};
        deobfs_val += String.fromCharCode(string.charCodeAt(a) ^ key[b].charCodeAt(0));
    }
    return deobfs_val;
}
module.exports.createSHA1 = function(string) { return createSHA1(string) }
module.exports.createSHA256 = function(string) { return createSHA256(string) }
module.exports.xorCrypto = function(key, string) { return xorCrypto(key, string) }
module.exports.base64Encode = function(string) { return base64Encode(string) }
module.exports.base64Decode = function(string) { return base64Decode(string) }