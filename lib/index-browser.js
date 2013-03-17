(function() {
  var SimUDP = require('./simudp.js');

  //add Buffer
  SimUDP.Buffer = require('buffer').Buffer;

  if (typeof define == 'function')
    define(SimUDP);
  else
    global.SimUDP = SimUDP;
})();