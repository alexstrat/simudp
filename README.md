
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

```html
<!-- you need to serve SimUDP.js by your own -->
<script src="/SimUDP.js"></script>
<script>
  
var socket = SimUDP.createSocket('udp4');

var hello = new SimUDP.Buffer('hello');

socket.send(hello, 0, hello.length, 3000, 'anywhere.com');

socket.on('message', function(buf, rinfo) {
  //...
});

//you've understood, it's dgram for the browser...
</script>
```

### Doc

Read the [source](https://github.com/alexstrat/simudp/blob/master/lib/simudp.js) or [ask around](https://github.com/alexstrat/simudp/issues).

### Browserify support

Simudp is fully compatible with [browserfy](https://github.com/substack/node-browserify). Best way is to use directly [dgram-browserify](https://github.com/alexstrat/dgram-browserify).
