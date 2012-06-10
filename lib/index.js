//client
module.exports.createSocket = require('./simudp').createSocket;
module.exports.Socket       = require('./simudp').Socket;

//server
module.exports.listen = require('./server').listen;
