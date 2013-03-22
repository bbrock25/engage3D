var BinaryServer = require ('binaryjs').BinaryServer;
var fs = require('fs');

var kinectToCloudServer = BinaryServer({port: 9000, host:'localhost'});
var cloudToViewerServer = BinaryServer({port:9001, host:'localhost'});


var viewerConnected = false;
var kinectConnected = false;

var client;

console.log('Starting...');



kinectToCloudServer.on('connection', function(kinectClient){
	console.log('Kinect is connected!');
	kinectConnected = true;
	client = kinectClient;
});

cloudToViewerServer.on('connection', function(client){
	viewerConnected=true;
	console.log('Viewer is connected!');
});



kinectToCloudServer.on('data', function(data){
	//Pass on through to the WebGL viewer if connected.
	if(viewerConnected){
		
		//Forward onto the viewer(s)
		
		console.log('Sending binary stream on to viewer...');
		client.send(data);
	}
	else
		console.log('No viewer connected, not sending stream.');
});

cloudToViewerServer.on('data', function(data){
	console.log('Received data from the client.');
});



