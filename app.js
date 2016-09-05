var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);



var Leap = require('leapjs');


var MODE = (argv.mode || 'instrument');
var NUM_NOTES = (argv.notes || 8);
var OFFSET_PITCH = (argv.offset || 36);
var TRAIN_INPUT = (argv.train || 'none');

var currentNote = 0;


console.log('Mode:', MODE);
if (MODE == 'instrument') {
  console.log('Number of note steps:', NUM_NOTES);
  console.log('Offset for base pitch (semitones):', OFFSET_PITCH);
}
console.log('Training requested:', TRAIN_INPUT);

var midi = require('midi');
console.log("MIDI up and running...");

function processAsInstrument(frame) {
  if (frame.hands.length > 0) {
    var hand = frame.hands[0];
    var position = hand.palmPosition;
    // process.stdout.write('palmHeight(y): ' + position[1] + '\r');
    var palmHeight = position[1];

    if (palmHeight) {
      var note = Math.round(map(palmHeight, 100, 500, 0, NUM_NOTES));
      // process.stdout.write('note (mapped from palmHeight): ' + note + '\r');



  		// output.sendMessage([176,22,1]);
      if (note != currentNote) {
        if (TRAIN_INPUT == "none" || TRAIN_INPUT == "palmHeight") {

          process.stdout.write('[');
          for (var n = 0; n < NUM_NOTES; n++) {
            if (n == note) {
              process.stdout.write('|');
            } else {
              process.stdout.write('-');
            }
          }
          process.stdout.write(']\n');

          output.sendMessage([128,currentNote + OFFSET_PITCH,90]); // note off
          output.sendMessage([144,note + OFFSET_PITCH,90]); // note on
          currentNote = note;
        }
      }

    }

    // console.log('hand.roll:', hand.roll());

    var rollPosition = 127 - Math.round(map(hand.roll(), -1, +1, 0, 127));

    if (TRAIN_INPUT == "none" || TRAIN_INPUT == "rollPosition") {
      // console.log('palm height (mapped):', rollPosition);
      output.sendMessage([176, 7, rollPosition]);
    }

    if (TRAIN_INPUT == "none" || TRAIN_INPUT == "grabStrength") {
      var grabStrength = 127 - Math.round(map(hand.grabStrength, 0, 1, 0, 127));
      // console.log('grab strength (mapped):', grabStrength)
      output.sendMessage([176, 8, grabStrength]);
    }

  }

}



Leap.loop(function(frame){
  if (MODE == "instrument") {
    processAsInstrument(frame);
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

// Set up a new output.
var output = new midi.output();

// Configure a callback.
// output.on('message', function(deltaTime, message) {
//     console.log('m:' + message + ' d:' + deltaTime);
// });

output.openVirtualPort("Leap Controller");
