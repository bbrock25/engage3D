LiveModel = function() {

    var inputH = 480;
    var inputW = 632;		// sizes from kinect


    var offh = inputH/2;
    var offw = inputW/2;


    var vh = 100;		// defines number of faces
    var vw = 100;


    var dy = inputH / vh;
    var dx = inputW / vw;


    var model = new THREE.Geometry();
    model.dynamic = true;


    var vertices;
    var i,j
    var usualY=[];

    for (j=0; j< vh; j++) {
	for (i=0; i<vw; i++) {

	    var x = ((i*dx)-offw)*2;
	    var y = ((j*dy)-offh)*2;

	    model.vertices.push(new THREE.Vector3(x,y,0));
	    usualY.push(y);
	}
    }

    var vertexCount = model.vertices.length;

    // model.vertices.push( new THREE.Vector3( -10,  10, 0 ) );
    // model.vertices.push( new THREE.Vector3( -10, -10, 0 ) );
    // model.vertices.push( new THREE.Vector3(  10, -10, 0 ) );
    // model.faces.push( new THREE.Face3( 0, 1, 2 ) );
    
    for (j=0; j<vh-1; j++) {
	for (i=0; i<vw-1; i++) {

	    var a = j*vw+i;
	    var b = (j+1)*vw+i;
	    var c = (j*vw+i+1);
	    var d = (j+1)*vw+i+1;

	    model.faces.push( new THREE.Face3(a,b,c) );
	    model.faces.push( new THREE.Face3(c,d,b) );
	}
    }

//    model.computeBoundingSphere();

    var faceMesh = new THREE.Mesh(model);

    this.sceneContents = function() {
	return faceMesh;
    };

    


    // WEBSOCKET STUFF

    var numVerts = vh* vw;
    var numData = inputH * inputW;

    // update geometry when data buffer arrives
    var dataCallback = function(e) {
    	var bytes = new Uint8Array(e.data);

    	pd = [bytes[1], bytes[2], bytes[3], bytes[4]];

    	var pIdx = 0;
    	var byteIdx = 5;
    	var rgbByteIdx = numData+5;


	var v=0;
	var x,y;

	for (y=0; y<inputH; y+= dy) {
	    for (x=0; x<inputW; x+= dx) {

		var abyte= bytes[byteIdx+Math.floor(x)];
		var vtx = model.vertices[v];

		if (abyte == 255) {
		    vtx.setY(-5000);
		}
		else {
		    var depth = (128 - abyte)*10;
		    vtx.setZ(depth);
		    vtx.setY(usualY[v]);
		}

		v = v+1;
	    }
	    
	    byteIdx+=inputW;
	}
	    


	// var c=byteIdx;
	// for (j=0; j< vh; j++) {
	//     for (i=0; i<vw; i++) {
	// 	var abyte = bytes[c+i*dx];
	// 	var vtx = model.vertices[j*vw+i];

	// 	if (abyte == 255) {
	// 	    vtx.setY(-5000);
	// 	}
	// 	else {
	// 	    var depth = (128-abyte)*10;
	// 	    vtx.setY(usualY[j*vw+i]);
	// 	    vtx.setZ(depth);
	// 	}
	//     }	    

	//     c += inputW;
	// }


	// var i=0;
	// for (c=0; c<=numData; c += dx) {
	//     var depth = 128 - bytes[c+byteIdx];
	//     model.vertices[i]=new  THREE.vector3(depth*10);
	//     i++;
	// }


    	// for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
        //     for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
    	// 	pv = pvs[pIdx];
    	// 	aByte = bytes[byteIdx];
	
    	// 	if (aByte === 255) {
    	// 	    pv.position.y = -5000;
    	// 	} else {
    	// 	    pv.position.y = pv.usualY;
    	// 	    depth = 128 - aByte;
    	// 	    pv.position.z = depth * 10;
    	// 	}

    	// 	particles.colors[pIdx].r = bytes[rgbByteIdx+0]/ 256;
    	// 	particles.colors[pIdx].g = bytes[rgbByteIdx+1]/ 256;
    	// 	particles.colors[pIdx].b = bytes[rgbByteIdx+2]/ 256;

	
    	// 	rgbByteIdx += 3;
    	// 	pIdx += 1;
    	// 	byteIdx += 1;
        //     }
    	// }

    	model.verticesNeedUpdate = true;
    	model.colorsNeedUpdate = true;
    	return true;
    };


    this.connect = function(url) {
    	var reconnectDelay, ws;
    	reconnectDelay = 10;
    	console.log("Connecting to " + url + " ...");
    	ws = new WebSocket(url);
    	ws.binaryType = 'arraybuffer';
    	seenKeyFrame = false;
    	ws.onopen = function() {
    	    return console.log('Connected');
    	};
    	ws.onclose = function() { // TODO: fix the reconnect
    	    console.log("Disconnected: retrying in " + reconnectDelay + "s");
    	    return setTimeout(this.connect, reconnectDelay(1000));
    	};
    	return ws.onmessage = dataCallback;
    };

    
    var pd=[];			// pan data -- TODO: get rid of this
    this.panData = function() { return pd; }


}
