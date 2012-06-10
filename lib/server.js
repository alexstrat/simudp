var dgram = require('dgram');
var sio = require('socket.io');

/**
 * Socket.io/UDP proxy.
 *
 * @param {sio.Manager} sio               - a socket.io instance
 * @param {[Integer, Integer]} port_range - the udp ports range to
 *                                          be available
 * @param {String} whoami                 - the listening address
 */
function Proxy(sio, port_range, whoami) {
  this.sio = sio;
  this.port_range = port_range || [5000, 5010];
  this.whoami = whoami || '127.0.0.1';

  this.busy_ports = {};

  var self = this;
  this.sio.on('connection', function(client) {
    client.once('bind', function(bind) {
      self.handleBind(client, bind);
    });
  });
}

exports.Proxy = Proxy;

/**
 * Create a udp Proxy.
 *
 * Server can be either a Socket.io instance or a http server. In
 * this case a scoket.io will be instanciated listening the
 * provided http server.
 *
 * The created (or given) Socket.io instance will be returned.
 *
 * @param  {}       server  - Socket.io or http server instance
 * @param  {Object} options
 * @param  {Object} options['socket.io'] - Socket.io options
 * @param  {Array}  options.port_range   - udp available ports range
 * @param  {Array}  options.whoami       - listening address
 * @return {sio.Manager} socket.io instance
 */
exports.listen = function(server, options) {
  options = options || {};
  var io;

  if(server instanceof sio.Manager)
    io = server;
  else
    io = sio.listen(server, options['socket.io'] || {});

  new Proxy(io.of('/simudp'), options.port_range, options.whoami);

  return io;
};

Proxy.prototype.handleBind = function(client, bind) {
  var self = this;

  //find an available port
  var port = this.findPort(bind.port);

  //no port found
  if(port === null) {
    client.emit('error', 'no port available on server');
    client.disconnect();
    return;
  }

  //create the udp socket
  var udp = dgram.createSocket(bind.type || 'udp4');

  //emit listening with address
  udp.once('listening', function() {
    client.emit('listening', {
      address : self.whoami,
      port    : udp.address().port
    });
  });

  //bind
  udp.bind(port);
  //and mark port as busy
  this.busy_ports[port] = true;
  
  //bind client and udp socket messages events
  client.on('dgram-message', function(message) {
    udp.send(
      new Buffer(message.buffer, 'ascii'),
      message.offset,
      message.length,
      message.port,
      message.address);
  });

  udp.on('message', function(msg, rinfo) {
    client.emit('dgram-message', {
      msg : msg.toString('ascii'),
      rinfo : {
        address : rinfo.address,
        port    : rinfo.port
      }
    });
  });

  //bind error events
  udp.on('error', function(reason) {
    client.emit('error', reason);
  });
  
  //free port at the end
  udp.on('close', function() {
    self.busy_ports[port] = false;
    client.disconnect();
  });

  client.on('disconnect', function() {
    self.busy_ports[port] = false;
    try {udp.close();} catch(e){};
  });
};

Proxy.prototype.findPort = function(start) {
  start = start || this.port_range[0];

  if(start < this.port_range[0] || start > this.port_range[1])
    return null;

  for(var i=start; i<=this.port_range[1]; i++) {
    if(!this.busy_ports[i])
      return i;
  }
  return null;
};