var http = require('http');
var server = require('../lib/server');
var sio = require('socket.io');
var browser = require('socket.io-client');

var app = http.createServer();
server.listen(app);
//sio.listen(app);

server.listen(8080, '127.0.0.1');

//s = client.connect('http://127.0.0.1:8080');
//s.send('messsage', 'foo')

var browser = require('../lib/simudp').createSocket('udp4', '127.0.0.1:8080/simudp');
browser.bind();
var udp = require('dgram').createSocket('udp4');
udp.bind();

browser.on('error', function(d) {console.log('Browser : error ' + d);});
udp.on('error', function(d) {console.log('udp : error ' + d);});

browser.on('listening', function() {
  var address = browser.address();
  console.log('Browser : listening on', address);

  console.log('udp : listening on', address);
  var salut = new Buffer('Salut');
  udp.send(salut, 0, salut.length, address.port, address.address);
});

browser.on('message', function(msg, from) {
  console.log('Browser : receive '+msg.toString()+' from ', from);
  console.log('Browser : sending Re:'+msg.toString());

  var salut = new Buffer('Re:Salut');
  browser.send(salut, 0, salut.length, from.port, from.address);
});

udp.on('message', function(msg) {
  console.log('udp : receive ', msg.toString());
});

