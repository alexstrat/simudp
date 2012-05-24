//client
module.exports.createSocket = require('./simupd').createSocket;
module.exports.Socket       = require('./simupd').Socket;

//server
module.exports.listen = require('./server').listen;
