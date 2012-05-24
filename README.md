
**Simudp** : udp for the browser.

Imitates exactly the [dgram](http://nodejs.org/api/dgram.html) API in the browser and backed by [socket.io](http://socket.io)/UDP proxy.

### Installation

```bash
$ npm install simudp
```

### Runs the proxy server :

```js
var server = require('http').createServer();

require('simudp').listen(server);

server.listen(8080);
```

### In the browser

```js
var simudp = require('simudp');
var Buffer = require('buffer').Buffer; //be sure Buffer is present

var socket = simudp.createSocket('udp4');

var hello = new Buffer('hello');
socket.send(hello, 0, hello.length, 3000, 'anywhere.com');

socket.on('message', function(buf, rinfo) {
  //...
});

//you've understood, it's dgram for the browser...
```

### Browserify support

Simudp is fully compatible with [browserfy](https://github.com/substack/node-browserify). It is even the best way to use it..

**However**, for the [moment](https://github.com/substack/node-browserify/pull/143), the main version provides a broken implementation of Buffer. That's why [this](https://github.com/toots/node-browserify) version should be used..

