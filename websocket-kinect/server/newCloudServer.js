/*---------------------------------------------------------
newCloudServer.js
    A Pass-through server for Engage3D's Kinect Video 
    Conferencing App. Creates two servers to listen for
    messages from both the Viewer and the Kincet.
Author: Forrest Pruitt
---------------------------------------------------------*/
/* Note 
 For Memory Leaks, Memwatch is great:
 var memwatch = require('memwatch');
 var hd = new memwatch.HeapDiff();
 ~CODE TO TEST GOES HERE~
//var diff = hd.end();
*/

var WebSocketServer = require('websocket').server;
var http = require('http');
var http2 = require('http');
// var connections = [];
var kinect_connections = [];
var viewer_connections = [];
var kinectServer = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
var viewerServer = http2.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

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
console.log('Listening on port 9000 for the Kinect');
console.log('Listening on port 9001 for the Viewer');

//---------------------------------------------
// Kinect Code
//---------------------------------------------
wsKinectServer.on('request', function(request) 
{
    kinectConnection = request.accept('of-protocol', request.origin);
    kinect_connections.push(kinectConnection);
	console.log('Connected to kinect client.');
    kinectedConnected=true;
    // This is the most important callback for us, we'll handle
    // all messages from users here.

    kinectConnection.on('message', function(message) 
    {
        if (message.type === 'utf8') 
        {
            console.log('Received Message: ' + message.utf8Data);            
        }

        else if (message.type === 'binary') 
        {
            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            if(viewerConnected)
            {
                viewer_connections.forEach(function(destination) 
                {
                    if(destination != kinectConnection)
                        destination.sendBytes(message.binaryData);
                });
            }
        }

		});

    kinectConnection.on('close', function(connection) 
    {
        console.log('Closing connection to Kinect...');

        kinect_connections.forEach(function(connection) 
        {
            if(kinectConnection.socket._peername == connection.socket._peername)
            {
                console.log("Closing connection with label: ");
                console.log(connection.socket._peername);
                kinect_connections.splice(connection,1);
            }
        });

        kinectConnected = false;
        kinectConnection = null; 

        console.log('Closed connection to Kinect.');
        var numConnections = 0; 
        kinect_connections.forEach(function(connection) 
        {
            numConnections++;
        }
        );
        console.log('Open Connections: ' + numConnections );
	    
    });

});

//-----------------------------------------------
// Viewer Code
//----------------------------------------------

//Set up the connection from this server to the viewer.
wsViewerServer.on('request', function(request) 
{
    
    clientConnection = request.accept(null, request.origin);
    console.log(clientConnection.socket._peername)
    viewer_connections.push(clientConnection);
    console.log('Connected to viewer client.');
    viewerConnected = true;

    //Here we are handling messages from the viewer to the Kinect.
    //This is currently (March 2013) used primarily for throttling the
    //Stream, ie setting the framerate.
    clientConnection.on('message', function(message) 
    {
        if (message.type === 'utf8') 
        {
            kinect_connections.forEach(function(destination) 
            {
                if(destination != clientConnection)
                    destination.sendUTF(message.utf8Data);
            });
        }
        else if (message.type === 'binary') 
        {//probably not sending binary this way
        //     destination.sendBytes(message.binaryData);
        //     connections.forEach(function(destination) 
        //     {
        //         // 
        //         if(destination != clientConnection)
        //             destination.sendBytes(message.binaryData);
        
        //     });
            
        }
        console.log(message);
    });

    clientConnection.on('close', function(connection) 
    {
        console.log('Closing connection to viewer.');
        viewer_connections.forEach(function(connection) 
            {
                if(clientConnection.socket._peername == connection.socket._peername)
                {
                    console.log("Closing connection with label: ");
                    console.log(connection.socket._peername);
                    viewer_connections.splice(connection,1);
                }
            }
        );

        console.log('Closed connection to viewer.');
        var numConnections = 0; 
        viewer_connections.forEach(function(connection) 
        {
            numConnections++;
        }
        );
        console.log('Open Connections: ' + numConnections );


    });
});


//var diff = hd.end();
//console.log(diff);
