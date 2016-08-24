console.log("Listener server running...");

var io = require('socket.io-client'),
socket = io.connect('http://127.0.0.1:5000');
socket.on('connect', function() {
	console.log("Got a client!");
});
socket.on('midi', function (data) {
	console.log("Rx: "+data);
});


// socket.emit('private message', { user: 'me', msg: 'whazzzup?' });