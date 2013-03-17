var path = require('path');

//static file server
var connect = require('connect');
var static = connect()
                .use('/simudp', connect.static(path.resolve(__dirname, '..')))
                .use(connect.static(__dirname));

//create http server
var http = require('http');
var app = http.createServer(static);


//simudp proxy server
var proxy = require('../lib/server'); //require('simudp')
proxy.listen(app);

//listen
app.listen(8080);


//UDP echo server
var dgram = require('dgram');
var echo = dgram.createSocket('udp4');

echo.bind(3456);

echo.on('error', function(d) {
  console.error('echo', d);
});

echo.on('message', function(msg, from) {
  console.log('echo : '+
              'received '+msg.toString()+
              ' from '+from);

  setTimeout(function() {
    console.log('echo sending back.');
    echo.send(msg, 0, msg.length, from.port, from.address);
  }, 2000);
});


