conn = {};

var opt = {
			//url: '66.18.35.210',
			url: '150.182.139.50',
			port: '9001',
			protocol: 'of-protocol'
	    };    	

	
window.addEventListener("load", connect);
//window.addEventListener("load", DrawButtons);

function DataRequester(){
	this.OpenConnection = function() {
		RequestTimestep();

	};
}

function DrawButtons(){
	var text = new DataRequester();
	var gui = new dat.GUI();
	gui.add(text, 'OpenConnection');
}
function connect(){
	if(window.WebSocket != undefined)
	{
		console.log('opening WebSocket');
		if(conn.readyState === undefined || conn.readyState > 1)
		{
			//essentially the websocket constructor
			conn = new WebSocket('ws://'+opt.url+':'+opt.port+'/', opt.protocol );
			conn.onopen = onopen;
			conn.onclose = onclose;
			conn.onmessage = onmessage;
			conn.onerror = onerror;			
	    	conn.binaryType = "arraybuffer";

		}
	}
}

function onopen(){console.log('onopen: Connection Opened');}

function onclose(){
	console.log('onclose: retry connection');
	//while(conn.readyState === undefined || conn.readyState > 1)
	setTimeout(connect, 50);

}

function onerror(evt){console.log('onerror:', evt);}


function onmessage(evt){
	console.log('onmessage: Receiving Message');
  	kinect_buffer = new Uint8Array(evt.data);
  	// kinect_buffer = bytes;
	//console.log(kinect_buffer[1]);
	new_frame = 1;
	//cars = JSON.parse(evt.data);

}

