var io = require('socket.io').listen(5000, {log: true});
var Leap = require('leapjs');

io.sockets.on('connection', function (_socket) {

	// MIDI callback....
	input.on('message', function(deltaTime, message) {
		console.log('m:' + message + ' d:' + deltaTime);
		_socket.emit('midi', message);
	});

});


var midi = require('midi');
console.log("MIDI up and running...");

Leap.loop(function(frame){
  console.log(frame.hands.length);
});



// // Set up a new input.
// var input = new midi.input();
//
// // Count the available input ports.
// input.getPortCount();
//
// // Get the name of a specified input port.
// input.getPortName(0);
//
//
//
// // Open the first available input port.
// input.openPort(0);
//
// // Sysex, timing, and active sensing messages are ignored
// // by default. To enable these message types, pass false for
// // the appropriate type in the function below.
// // Order: (Sysex, Timing, Active Sensing)
// input.ignoreTypes(false, false, false);

// ... receive MIDI messages ...




// // Close the port when done.
// input.closePort();
