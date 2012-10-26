var cluster = require('cluster'),
    zmq = require('zmq'),
    // place IP to connect o here
    port = 'tcp://127.0.0.1:80';

var zmqSocket = zmq.socket('sub');
zmqSocket.identity = 'subscriber' + process.pid;
zmqSocket.connect(port);
zmqSocket.subscribe('');

var express = require("express");
var io = require('socket.io');
var app = express(),
    server = require('http').createServer(app),
    io = io.listen(server);

server.listen(8080);

// Set up place for static files
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    zmqSocket.on('message',
        function(data) {
            console.log("received frame");

            socket.emit('frame', {
                frame: JSON.parse(data)
            });
    });
});
