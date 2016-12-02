var SerialPort = require('serialport');

var serialPort = new SerialPort('/dev/cu./dev/cu.usbmodem14131', {
  baudRate: 9600
});

serialPort.on('open', function() {
  console.log('got connection')
})

var b = 0, c = 0;

var i = setInterval(function() {
  var b = Math.round(Math.random() * 127);
  var c = Math.round(Math.random() * 127);
  // b++;
  // c++;
  // b = 64;
  // c = 64;

  var serialString = "write\r" + b + "," + c + "\r";
  console.log(serialString);
  serialPort.write(serialString);

}, 20)
// // write\r,height1,height2\r
// var b, c;
// if (frame.hands.length == 1) {
//   b = reverbAmount;
//   c = 127;
// }
// if (frame.hands.length == 2) {
//   b = reverbAmount;
//   c = freqShift;
// }
