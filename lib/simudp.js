var util   = require('util');
var events = require('events');
var io     = require('socket.io-client');
var Buffer = require('buffer').Buffer;

function Socket(type, listener, host, io_options) {
  events.EventEmitter.call(this);

  //init state variables
  this._listening = false;
  this._binding   = false;

  //type of socket 'udp4', 'udp6', 'unix_socket'
  this.type = type || 'udp4';

  //listener
  if (typeof listener === 'function')
    this.on('message', listener);

  //args swap
  if(typeof listener === 'string') {
    host = listener;
    io_options = host;
  }

  io_options = io_options || {};

  //alows muliple socket on one browser
  io_options['force new connection'] = true;

  //use sio manespaceing
  host = (host || '') + '/simudp';

  //connect socket.io
  this.sio = io.connect(host, io_options);
}
util.inherits(Socket, events.EventEmitter);

exports.Socket = Socket;
exports.createSocket = function(type, listener) {
  return new Socket(type, listener);
};


Socket.prototype.bind = function(port, address) {
  var self = this;

  if(this._listening)
    throw new Error('already listening');

  if(this._binding)
    throw new Error('already binding');
  
  this._binding = true;

  this.sio.emit('bind', {
    type    : this.type,
    port    : port,
    address : address
  });

  this.sio.on('listening', function(address) {
    //set address
    self._address = address;

    self._binding = false;
    self._listening = true;

    self.emit('listening');
    
    //proxy incoming messages
    self.sio.on('dgram-message', function(message) {
      self.emit('message',
        new Buffer(message.msg, 'ascii'),
        message.rinfo);
    });

    //proxy error
    self.sio.on('error', function(error) {
      self.emit('error', error);
    });

    //disconnection
    self.sio.on('disconnect', function() {
      self.emit('close');
      self.removeAllListeners();
    });
  });
};

Socket.prototype.send = function(buffer, offset, length, port, address, callback) {
  var self = this;

  //we are not listening : bind and then send when listening
  if(!this._listening) {
    if(!this._binding)
      this.bind();

    var _args = arguments;
    this.once('listening', function() {
      self.send.apply(self, _args);
    });
    return;
  }

  //accept buffer as string
  buffer = (typeof buffer === 'string') ? new Buffer(buffer) : buffer;

  //emit directly exception if any
  if (offset >= buffer.length)
    throw new Error('Offset into buffer too large');
  if (offset + length > buffer.length)
    throw new Error('Offset + length beyond buffer length');

  //send it on wire
  this.sio.emit('dgram-message', {
    buffer  : buffer.toString('ascii'),
    offset  : offset,
    length  : length,
    port    : port,
    address : address
  });

  if(callback)
    callback.call(null);
};


Socket.prototype.close = function() {
  this.sio.disconnect();
  this.emit('close');
  this.removeAllListeners();
};


Socket.prototype.address = function() {
  if(! this._address)
    throw new Error('not binded');

  return this._address;
};


// not implemented methods

Socket.prototype.setBroadcast = function(arg) {
  throw new Error('not implemented');
};

Socket.prototype.setTTL = function(arg) {
  throw new Error('not implemented');
};

Socket.prototype.setMulticastTTL = function(arg) {
  throw new Error('not implemented');
};

Socket.prototype.setMulticastLoopback = function(arg) {
  throw new Error('not implemented');
};

Socket.prototype.addMembership = function(multicastAddress, nterfaceAddress) {
  throw new Error('not implemented');
};

Socket.prototype.dropMembership = function(multicastAddress, interfaceAddress) {
  throw new Error('not implemented');
};