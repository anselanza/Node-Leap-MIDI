var Leap = require('leapjs');
var SerialPort = require('serialport');

//http://www.music.mcgill.ca/~gary/rtmidi/

var TRAIN_INPUT = "none";

var USE_SERIAL = true;

var REVERB_CC = 108;
var FREQSHIFT_DRYWET_CC = 107;
var FREQSHIFT_CC = 106;

var midi = require('midi');
console.log("MIDI up and running...");

var serialPort;

if (USE_SERIAL) {
  // ls /dev/cu.*   to list all serial devices on OS X
  serialPort = new SerialPort('/dev/cu.usbmodem14131', {
    baudRate: 9600
  });

  serialPort.on('open', function() {
    console.log('got connection')
  })

  serialPort.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(1);
  })

}



var leapController = Leap.loop({enableGestures:false}, function(frame){

  // If no hands, turn off
  var freqShiftDryWetAmount = 0;
  var reverbAmount = 0;

  var freqShift = 0;

  if (frame.hands.length > 0) {
    console.log(frame.hands.length);

    var firstHandHeight = frame.hands[0].palmPosition[1];
    console.log('firstHandHeight:', firstHandHeight);

    reverbAmount = mapClampedAndRounded(firstHandHeight, 100, 500, 0, 127);
    console.log('reverbAmount:', reverbAmount);
    output.sendMessage([176, REVERB_CC, reverbAmount]);

    if (frame.hands.length > 1) {
      freqShiftDryWetAmount = 127;

      var secondHandHeight = frame.hands[1].palmPosition[1];
      console.log('secondHandHeight:', secondHandHeight);

      freqShift = mapClampedAndRounded(secondHandHeight, 100, 500, 0, 127);
      console.log('freqShift:', freqShift);
      output.sendMessage([176, FREQSHIFT_CC, freqShift]);

    }

    if (USE_SERIAL) {
      // write\r,height1,height2\r
      var b, c;
      if (frame.hands.length == 1) {
        b = reverbAmount;
        c = 127;
      }
      if (frame.hands.length == 2) {
        b = reverbAmount;
        c = freqShift;
      }

      var serialString = "write\r" + b + "," + c + "\r";
      console.log(serialString);
      serialPort.write(serialString);
    }

  } // at least one hand
  output.sendMessage([176, FREQSHIFT_DRYWET_CC, freqShiftDryWetAmount]);
  output.sendMessage([176, REVERB_CC, reverbAmount]);




});

leapController.on('connect', function() {
  console.log('got Leap Motion connection');
  var origHandleData = this.connection.handleData;
  this.connection.handleData = function(data) {
    try {
      return origHandleData.call(this, data);
    } catch (e) {
      console.log(e);
    }
  };
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

output.openVirtualPort("Leap Controller");
