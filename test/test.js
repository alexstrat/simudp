var http = require('http');
var server = require('../lib/server');
var sio = require('socket.io');
var client = require('socket.io-client');

var app = http.createServer();
server.listen(app);
//sio.listen(app);

server.listen(8080, '127.0.0.1');

//s = client.connect('http://127.0.0.1:8080');
//s.send('messsage', 'foo')

var simudp = require('../lib/simudp');
var client = simudp.createSocket('udp4', '127.0.0.1:8080/simudp');

client.on('error', function(d) {console.log(d);});
client.on('listening', function() {console.log('listening', client.address());});
client.on('message', function(d,e) {console.log(d, e);});


client.bind();