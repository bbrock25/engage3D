LiveModel = function() {

    var inputH = 480;
    var inputW = 632;		// sizes from kinect


    var offh = inputH/2;
    var offw = inputW/2;


    var vh = 200;		// defines number of faces
    var vw = 300;


    var dy = inputH / vh;
    var dx = inputW / vw;


    var model = new THREE.Geometry();
    model.dynamic = true;

    var vertices;
    var i,j

    for (j=vh-1; j>=0; j--) {	// server loads points bottom to top
	for (i=0; i<vw; i++) {

	    var x = ((i*dx)-offw)*2;
	    var y = ((j*dy)-offh)*2;

	    model.vertices.push(new THREE.Vector3(x,y,0));
	}
    }

    var vertexCount = model.vertices.length;

    
    for (j=0; j<vh-1; j++) {
	for (i=0; i<vw-1; i++) {

	    var a = j*vw+i;
	    var b = (j+1)*vw+i;
	    var c = (j*vw+i+1);
	    var d = (j+1)*vw+i+1;
	    
	    model.faces.push( new THREE.Face3(a,b,c) );
	    model.faces.push( new THREE.Face3(c,b,d) );

	    model.faceVertexUvs[0].push( [ new THREE.Vector2(0,0),
					   new THREE.Vector2(1,1),
					   new THREE.Vector2(1,0) ] );
	    model.faceVertexUvs[0].push( [ new THREE.Vector2(0,0),
					   new THREE.Vector2(1,1),
					   new THREE.Vector2(1,0) ] );

	}
    }
    
//    var foo = new THREE.TetrahedronGeometry(100);
    console.log("vertex count: " + model.vertices.length);
    console.log("face count: " + model.faces.length);
    console.log("faceVertexUvs[0] count: " + model.faceVertexUvs[0].length);
    console.log("faceVertexUvs[0][0] count: " + model.faceVertexUvs[0][0].length);

    model.computeBoundingSphere();
    model.computeFaceNormals();
    model.computeVertexNormals();
    model.computeTangents();
    THREE.GeometryUtils.normalizeUVs(model);


    var material = new THREE.MeshBasicMaterial();
    material.wireframe=true;

    var faceMesh = new THREE.Mesh(model, material);

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

	// image data to texture the mesh
	material.map = new THREE.DataTexture(new Uint8Array(bytes, rgbByteIdx), 
					     inputW, inputH, THREE.RGBFormat);

	material.needsUpdate = true;

	var v=0;
	var x,y;
	var skip = Math.floor(dy)*inputW;

	for (y=0; y<vh; y++) {
	    for (x=0; x<vw; x++) {
		
		var byteOffset = Math.floor(x*dx)

		var abyte= bytes[byteIdx+byteOffset];
		
		var depth = (128 - abyte)*10;
		
		model.vertices[v].setZ(depth);
		v = v+1;
	    }
	    
	    byteIdx+=skip;
	}



	// works when inputH,inputW = vh,vw
	// for (y=0; y<inputH; y++) {
	//     for (x=0; x<inputW; x++) {

	// 	var abyte= bytes[byteIdx];
	// 	var vtx = model.vertices[v];

	// 	// if (abyte == 255) {
	// 	//     vtx.setY(-5000);
	// 	// }
	// 	// else {
	// 	//     var depth = (128 - abyte)*10;
	// 	//     vtx.setZ(depth);
	// 	//     vtx.setY(usualY[v]);
	// 	// }

	// 	var depth = (128 - abyte)*10;
	// 	vtx.setZ(depth);

	// 	v++;
	// 	byteIdx++;
	//     }
	// }



    	model.verticesNeedUpdate = true;
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
