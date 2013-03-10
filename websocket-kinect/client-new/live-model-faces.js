LiveModel = function() {

    var inputH = 480;
    var inputW = 632;		// sizes from kinect


    var offh = inputH/2;
    var offw = inputW/2;


    var vh = 200;
    var vw = 200;

    // var vh = 200;		// defines number of faces
    // var vw = 300;
    // var vh = 40;		// defines number of faces
    // var vw = 50;


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

    // var x;
    // var minx=inputW,maxx=-inputW,miny=inputH,maxy=inputH;
    // for (v=0; v<vertexCount; v++)
    // {
    // 	if (model.vertices[v].x < minx) minx = model.vertices[v].x;
    // 	if (model.vertices[v].x > maxx) maxx = model.vertices[v].x;
    // 	if (model.vertices[v].y < miny) miny = model.vertices[v].y;
    // 	if (model.vertices[v].y > maxy) maxy = model.vertices[v].y;
    // }

    // console.log("bounds: " + minx + " - " + maxx + ";" + miny + " - " + maxy);

    // var minu=10,minv=10,maxu=-10,maxv=-10;

    for (j=0; j<vh-1; j++) {
     	for (i=0; i<vw-1; i++) {

	    var a = j*vw+i;
	    var b = (j+1)*vw+i;
	    var c = (j*vw+i+1);
	    var d = (j+1)*vw+i+1;
	    
	    var iu = 1/vw;
	    var ju = 1/vh;

	    model.faces.push( new THREE.Face3(a,b,c) );
	    model.faces.push( new THREE.Face3(c,b,d) );
	    
	    // gotta fix this
	    var _ax = 0.5*(model.vertices[a].x+inputW)/inputW;
	    var _ay = 0.5*(model.vertices[a].y+inputH)/inputH;
	    var _bx = 0.5*(model.vertices[b].x+inputW)/inputW;
	    var _by = 0.5*(model.vertices[b].y+inputH)/inputH;
	    var _cx = 0.5*(model.vertices[c].x+inputW)/inputW;
	    var _cy = 0.5*(model.vertices[c].y+inputH)/inputH;
	    var _dx = 0.5*(model.vertices[d].x+inputW)/inputW;
	    var _dy = 0.5*(model.vertices[d].y+inputH)/inputH;

	    
	    // if (_ax < minu) minu=_ax;
	    // if (_ax > maxu) maxu=_ax;
	    // if (_bx < minu) minu=_bx;
	    // if (_bx > maxu) maxu=_bx;
	    // if (_cx < minu) minu=_cx;
	    // if (_cx > maxu) maxu=_cx;
	    // if (_ay < minv) minv=_ay;
	    // if (_ay > maxv) maxv=_ay;
	    // if (_by < minv) minv=_by;
	    // if (_by > maxv) maxv=_by;
	    // if (_cy < minv) minv=_cy;
	    // if (_cy > maxv) maxv=_cy;
	    

	    // model.faceVertexUvs[0].push( [ new THREE.Vector2(0,0),
	    // 				   new THREE.Vector2(1,1),
	    // 				   new THREE.Vector2(1,0) ] );
	    // model.faceVertexUvs[0].push( [ new THREE.Vector2(0,0),
	    // 				   new THREE.Vector2(1,1),
	    // 				   new THREE.Vector2(1,0) ] );

	    // model.faceVertexUvs[0].push( [ new THREE.Vector2(-(vw-i)/vw,.5*(vh-j)/vh),
	    // 				   new THREE.Vector2(-(vw-i)/vw,.5*(vh-j-1)/vh),
	    // 				   new THREE.Vector2(-(vw-i-1)/vw,.5*(vh-j)/vh) ] );
	    // model.faceVertexUvs[0].push( [ new THREE.Vector2(-(vw-i-1)/vw,.5*(vh-j)/vh),
	    // 				   new THREE.Vector2(-(vw-i)/vw,.5*(vh-j-1)/vh),
	    // 				   new THREE.Vector2(-(vw-i-1)/vw,.5*(vh-j-1)/vh) ] );

	    model.faceVertexUvs[0].push( [ new THREE.Vector2(_ax,_ay),
	    				   new THREE.Vector2(_bx,_by),
	    				   new THREE.Vector2(_cx,_cy) ] );
	    model.faceVertexUvs[0].push( [ new THREE.Vector2(_cx,_cy),
	    				   new THREE.Vector2(_bx,_by),
	    				   new THREE.Vector2(_dx,_dy) ] );



	}
    }
    
    // console.log("uv bounds: " + minu + " - " + maxu + ";" + minv + " - " + maxv);

    THREE.GeometryUtils.normalizeUVs(model);

    //model.computeBoundingSphere();
    // model.computeFaceNormals();
    // model.computeVertexNormals();
    // model.computeTangents();
    // model.tangentsNeedUpdate = true;
    // model.normalsNeedUpdate = true;
    // model.uvsNeedUpdate = true;
    

    // var material = new THREE.MeshBasicMaterial( { map : new THREE.Texture() } );
    //var material = new THREE.MeshBasicMaterial();
    // material.wireframe = true;
    // material.color=new THREE.Color(0x0F0F0F);
    // new THREE.DataTexture([], inputW, inputH, THREE.RGBFormat);

    var initColor = new THREE.Color( 0x00ff00 );
    // initColor.setHSV( 0.25, 0.85, 0.5 );

    var texture = THREE.ImageUtils.generateDataTexture(inputW, inputH, initColor );
    // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(25,25);
    // texture.anisotropy = 16;

    var material = new THREE.MeshBasicMaterial( { map : texture });
    // var material = new THREE.MeshPhongMaterial( 
    // 	{ map : texture, color: 0xffffff, specular: 0x111111 }
    // );
    var faceMesh = new THREE.Mesh(model, material);
    // faceMesh.receiveShadow = true;

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
	// var texture = new THREE.DataTexture(new Uint8Array(bytes, rgbByteIdx), 
	//  				    inputW, inputH, THREE.RGBFormat);


	// material.map = new THREE.DataTexture(new Uint8Array(bytes, rgbByteIdx), 
	// 				     inputW, inputH, THREE.RGBFormat);
	// material.needsUpdate = true;
	
	// texture.image.data = new Uint8Array(bytes, rgbByteIdx);
	texture.image.data = bytes.subarray(rgbByteIdx);
	texture.needsUpdate = true;
	//material.needsUpdate = true;
	

	var v=0;
	var x,y;
	var skip = Math.floor(dy)*inputW;

	for (y=0; y<vh; y++) {
	    for (x=0; x<vw; x++) {
		
		var byteOffset = Math.floor(x*dx)

		var abyte= bytes[byteIdx+byteOffset];
		
		// var depth =128;

		// // get local min depth
		// for (var i=0; i<dx; i++) {
		//     var b= bytes[byteIdx+byteOffset+i];
		//     if (b < depth)
		// 	depth = b;
		// }

		//var depth = (128 - abyte)*10;
		//model.vertices[v].setZ(depth);

		//model.vertices[v].setZ((128-abyte)*10);
		model.vertices[v].setZ(-abyte*10);
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


	// model.computeFaceNormals();
	// model.computeVertexNormals();
	
	// model.normalsNeedUpdate = true;
    	model.verticesNeedUpdate = true;
    	return true;
    };
    
    var OF_BACKEND = true;
    var opt = {
	url: 'localhost',
	port: '9000',
	protocol: 'of-protocol',
	on_update: undefined,
	on_open: undefined,
	on_close: undefined
    };

    this.connect = function(url) {
    	var reconnectDelay, ws;
    	reconnectDelay = 10;
    	console.log("Connecting to " + url + " ...");
    	//ws = new WebSocket(url);
    	
    	if(OF_BACKEND)
	    ws = new WebSocket('ws://'+opt.url+':'+opt.port+'/', opt.protocol );
    	else
    	    ws = new WebSocket(url);

    	ws.binaryType = 'arraybuffer';
    	seenKeyFrame = false;
    	ws.onopen = function() {
    	    return console.log('Connected');
    	};
    	ws.onclose = function() { // TODO: fix the reconnect
    	    console.log("Disconnected: retrying in " + reconnectDelay + "s");
    	    return setTimeout(this.connect, reconnectDelay*100);
    	};
    	return ws.onmessage = dataCallback;
    };

    
    var pd=[];			// pan data -- TODO: get rid of this
    this.panData = function() { return pd; }


}
