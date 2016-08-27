// var io = require('socket.io').listen(5000, {log: true});
var Leap = require('leapjs');

// io.sockets.on('connection', function (_socket) {
//
// 	// MIDI callback....
// 	input.on('message', function(deltaTime, message) {
// 		console.log('m:' + message + ' d:' + deltaTime);
// 		_socket.emit('midi', message);
// 	});
//
// });


//http://www.music.mcgill.ca/~gary/rtmidi/

var NUM_NOTES = 16;
var OFFSET_PITCH = 36;

var currentNote = 0;

var TRAIN_INPUT = "none";

var midi = require('midi');
console.log("MIDI up and running...");

Leap.loop(function(frame){
  if (frame.hands.length > 0) {
    console.log(frame.hands.length);
    // var hand = frame.hands[0];
    // var position = hand.palmPosition;
    // // process.stdout.write('palmHeight(y): ' + position[1] + '\r');
    // var palmHeight = position[1];

    var firstHandHeight = frame.hands[0].palmPosition[1];
    console.log('firstHandHeight:', firstHandHeight);

    var reverbAmount = mapClampedAndRounded(firstHandHeight, 100, 500, 0, 127);
    console.log('reverbAmount:', reverbAmount);
    output.sendMessage([176, 7, reverbAmount]);

    if (frame.hands.length > 1) {
      var secondHandHeight = frame.hands[1].palmPosition[1];
      console.log('secondHandHeight:', secondHandHeight);

      var freqShift = mapClampedAndRounded(secondHandHeight, 100, 500, 0, 127);
      console.log('freqShift:', freqShift);
      output.sendMessage([176, 8, freqShift]);

    }

    // console.log('hand.roll:', hand.roll());

    // var rollPosition = 127 - Math.round(map(hand.roll(), -1, +1, 0, 127));
    //
    // if (TRAIN_INPUT == "none" || TRAIN_INPUT == "rollPosition") {
    //   // console.log('palm height (mapped):', rollPosition);
    //   output.sendMessage([176, 7, rollPosition]);
    // }
    //
    // if (TRAIN_INPUT == "none" || TRAIN_INPUT == "grabStrength") {
    //   var grabStrength = 127 - Math.round(map(hand.grabStrength, 0, 1, 0, 127));
    //   // console.log('grab strength (mapped):', grabStrength)
    //   output.sendMessage([176, 8, grabStrength]);
    // }

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

function mapClampedAndRounded(value, leftMin, leftMax, rightMin, rightMax) {
  var mappedValue = map(value, leftMin, leftMax, rightMin, rightMax);
  if (mappedValue > rightMax) {
    mappedValue = rightMax;
  }
  if (mappedValue < rightMin) {
    mappedValue =  rightMin;
  }
  return Math.round(mappedValue);
}

// Set up a new output.
var output = new midi.output();

// Configure a callback.
// output.on('message', function(deltaTime, message) {
//     console.log('m:' + message + ' d:' + deltaTime);
// });

output.openVirtualPort("Leap Controller");



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
