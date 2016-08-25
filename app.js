var io = require('socket.io').listen(5000, {log: true});
var Leap = require('leapjs');

io.sockets.on('connection', function (_socket) {

	// MIDI callback....
	input.on('message', function(deltaTime, message) {
		console.log('m:' + message + ' d:' + deltaTime);
		_socket.emit('midi', message);
	});

});

var NUM_NOTES = 8;

var midi = require('midi');
console.log("MIDI up and running...");

Leap.loop(function(frame){
  if (frame.hands.length === 1) {
    var hand = frame.hands[0];
    var position = hand.palmPosition;
    // process.stdout.write('palmHeight(y): ' + position[1] + '\r');
    var palmHeight = position[1];

    var note = Math.round(map(palmHeight, 0, 500, 0, NUM_NOTES));
    process.stdout.write('note (mapped from palmHeight): ' + note + '\r');
		// console.log(note);

  }
});



function map (value, leftMin, leftMax, rightMin, rightMax) {

  // This function courtesy of http://stackoverflow.com/questions/1969240/mapping-a-range-of-values-to-another

  // Figure out how 'wide' each range is
  leftSpan = leftMax - leftMin;
  rightSpan = rightMax - rightMin;

  // Convert the left range into a 0-1 range (float)
  valueScaled = (value - leftMin) / (leftSpan);

  // Convert the 0-1 range into a value in the right range.
  return rightMin + (valueScaled * rightSpan);
}


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
// // Sysex,timing, and active sensing messages are ignored
// // by default. To enable these message types, pass false for
// // the appropriate type in the function below.
// // Order: (Sysex, Timing, Active Sensing)
// input.ignoreTypes(false, false, false);

// ... receive MIDI messages ...




// // Close the port when done.
// input.closePort();
