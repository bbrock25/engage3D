LiveModel = function () {

    var inputW = 632;		// sizes from kinect
    var inputH = 480;
    var useEvery = 1;


    this.sceneContents = function() {
	return particleSystem;
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

    

    // set up initial geometry

    var pMaterial = new THREE.ParticleBasicMaterial({
	//color: fgColour,
	vertexColors:true,
	size: useEvery * 3.5
    });

    
    var v = function(x, y, z) {
	return new THREE.Vertex(new THREE.Vector3(x, y, z));
    };


    var w = inputW / useEvery;
    var h = inputH / useEvery;
    
    var particles = new THREE.Geometry();
    for (var y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
	for (var x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
	    var xc = (x - (w / 2)) * useEvery * 2;
	    var yc = ((h / 2) - y) * useEvery * 2;
	    var particle = v(xc, yc, 0);
	    particle.usualY = yc;
	    particles.vertices.push(particle);
	    var col = new THREE.Color( 0xB0171F );
	    particles.colors.push(col);}
    }
    
    var particleSystem = new THREE.ParticleSystem(particles, pMaterial);

    
    var pvs = particles.vertices;
    var pLen = pvs.length;

    // update geometry when data buffer arrives
    var dataCallback = function(e) {
	var bytes = new Uint8Array(e.data);

	pd = [bytes[1], bytes[2], bytes[3], bytes[4]];

	var pIdx = 0;
	var byteIdx = 5;
	var rgbByteIdx = pLen+5;

	for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
            for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
		pv = pvs[pIdx];
		aByte = bytes[byteIdx];
		
		if (aByte === 255) {
		    pv.position.y = -5000;
		} else {
		    pv.position.y = pv.usualY;
		    depth = 128 - aByte;
		    pv.position.z = depth * 10;
		}

		particles.colors[pIdx].r = bytes[rgbByteIdx+0]/ 256;
		particles.colors[pIdx].g = bytes[rgbByteIdx+1]/ 256;
		particles.colors[pIdx].b = bytes[rgbByteIdx+2]/ 256;

		
		rgbByteIdx += 3;
		pIdx += 1;
		byteIdx += 1;
            }
	}

	particleSystem.geometry.__dirtyVertices = true;
	particleSystem.geometry.__dirtyColors = true;
	return true;
    };

};

