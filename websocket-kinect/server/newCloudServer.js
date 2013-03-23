var WebSocketServer = require('websocket').server;
var http = require('http');
var http2 = require('http');
var connections = [];
var kinectServer = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
var viewerServer = http2.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});


//var server2 = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
//});

kinectServer.listen(9000, function() { });
viewerServer.listen(9001, function() { });


// create the server




wsKinectServer = new WebSocketServer({
    httpServer: kinectServer,
    maxReceivedFrameSize: 64*1024*1024,   // 64MiB
    maxReceivedMessageSize: 64*1024*1024, // 64MiB
    protocol: 'of-protocol'
});

wsViewerServer = new WebSocketServer({
    httpServer: viewerServer,
    maxReceivedFrameSize: 64*1024*1024,   // 64MiB
    maxReceivedMessageSize: 64*1024*1024, // 64MiB
    protocol: 'of-protocol'
});



var kinectConnection;
var viewerConnection;
var kinectConnected=false;
var viewerConnected=false;

// WebSocket server
wsKinectServer.on('request', function(request) {
    kinectConnection = request.accept('of-protocol', request.origin);
    connections.push(kinectConnection);
    console.log('Connected to kinect client.');
    kinectedConnected=true;
    // This is the most important callback for us, we'll handle
    // all messages from users here.

    kinectConnection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            if(viewerConnected){
                //console.log('Sending some shit to the viewer.');
                connections.forEach(function(destination) {
                    if(destination != kinectConnection)
                        destination.sendBytes(message.binaryData);
                });
                //kinectConnection.sendBytes(message.binaryData);
            }
            else
                console.log('No viewer connected.');
        }
    });
    /*
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            .sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
*/

    kinectConnection.on('close', function(connection) {
        // close user connection
        console.log('Closing connection to Kinect...');
    });
});



wsViewerServer.on('request', function(request) {
    clientConnection = request.accept(null, request.origin);
    connections.push(clientConnection);
    console.log('Connected to viewer client.');
    viewerConnected = true;
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    
    clientConnection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);

            connections.forEach(function(destination) {
                if(destination != clientConnection)
                    //console.log('Sending message '+message.utf8Data+' to Kinect Server...')
                    destination.sendUTF(message.utf8Data);
                });
        }
        else if (message.type === 'binary') {
            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
        console.log(message);
    });
    clientConnection.on('close', function(connection) {
        console.log('Closed connection to viewer.');
    });
});