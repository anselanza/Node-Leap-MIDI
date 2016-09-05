var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);



var Leap = require('leapjs');


var MODE = (argv.mode || 'instrument');
var NUM_NOTES = (argv.notes || 8);
var OFFSET_PITCH = (argv.offset || 36);
var TRAIN_INPUT = (argv.train || 'none');

var REVERB_CC = (argv.reverbChannel || 108);
var FREQSHIFT_DRYWET_CC = (argv.freqAmountChannel || 107);
var FREQSHIFT_CC = (argv.freqShiftChannel || 106);

var currentNote = 0;


console.log('Mode:', MODE);
if (MODE == 'instrument') {
  console.log('Number of note steps:', NUM_NOTES);
  console.log('Offset for base pitch (semitones):', OFFSET_PITCH);
} else if (MODE == 'controller') {
  console.log('Reverb amount channel:', REVERB_CC);
  console.log('Frequency Shift Dry/Wet Amount channel:', FREQSHIFT_DRYWET_CC);
  console.log('Frequency Shift Pitch channel:', FREQSHIFT_CC);
} else {
  console.log('Unknown mode! Quitting...');
  process.exit(1);
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



function processAsController(frame) {

  var freqShiftDryWetAmount = 0;
  var reverbAmount = 0;

  if (frame.hands.length > 0) {
    console.log(frame.hands.length);

    var firstHandHeight = frame.hands[0].palmPosition[1];
    console.log('firstHandHeight:', firstHandHeight);

    reverbAmount = mapClampedAndRounded(firstHandHeight, 100, 500, 0, 127);
    console.log('reverbAmount:', reverbAmount);
    output.sendMessage([176, REVERB_CC, reverbAmount]);

    if (frame.hands.length > 1) { // two hands: use Frequency shifter, too
      freqShiftDryWetAmount = 127;

      var secondHandHeight = frame.hands[1].palmPosition[1];
      console.log('secondHandHeight:', secondHandHeight);

      var freqShift = mapClampedAndRounded(secondHandHeight, 100, 500, 0, 127);
      console.log('freqShift:', freqShift);
      output.sendMessage([176, FREQSHIFT_CC, freqShift]);

    }

  }
  output.sendMessage([176, FREQSHIFT_DRYWET_CC, freqShiftDryWetAmount]);
  output.sendMessage([176, REVERB_CC, reverbAmount]);
}


Leap.loop(function(frame){
  if (MODE == "instrument") {
    processAsInstrument(frame);
  } else if (MODE == "controller") {
    processAsController(frame);
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
