LiveModel = function () {
    var inputW, inputH, useEvery, w, h, pMaterial,  particles, particleSystem, dataCallback;


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
	ws.onclose = function() {
	    console.log("Disconnected: retrying in " + reconnectDelay + "s");
	    return setTimeout(this.connect, reconnectDelay(1000));
	};
	return ws.onmessage = dataCallback;
    };


    inputW = 632;
    inputH = 480;
    useEvery = 1;

    w = inputW / useEvery;
    h = inputH / useEvery;
    

    pMaterial = new THREE.ParticleBasicMaterial({
	//color: fgColour,
	vertexColors:true,
	size: useEvery * 3.5
    });

    
    v = function(x, y, z) {
	    return new THREE.Vertex(new THREE.Vector3(x, y, z));
	};

    particles = new THREE.Geometry();
    for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
	for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
	    xc = (x - (w / 2)) * useEvery * 2;
	    yc = ((h / 2) - y) * useEvery * 2;
	    particle = v(xc, yc, 0);
	    particle.usualY = yc;
	    particles.vertices.push(particle);
	    var col = new THREE.Color( 0xB0171F );
	    particles.colors.push(col);}
    }
    
    particleSystem = new THREE.ParticleSystem(particles, pMaterial);

	
    seenKeyFrame = null;
    qtl = qtr = qbl = qbr = null;
    pvs = particles.vertices;
    pLen = pvs.length;
    rawDataLen = 5 + 4*pLen;
    //console.log(pLen);
    outArrays = (function() {
      var _results;
      _results = [];
      for (i = 0; i <= 1; i++) {
        _results.push(new Uint8Array(new ArrayBuffer(rawDataLen)));
      }
      return _results;
    })();


    var pd=[];			// pan data -- TODO: get rid of this
    this.panData = function() { return pd; }

    dataCallback = function(e) {
      var aByte, byteIdx, bytes, depth, inStream, keyFrame, outStream, pIdx, prevBytes, pv, x, y, _ref5;

      bytes = new Uint8Array(e.data);
      prevBytes = new Uint8Array(e.data);
      keyFrame = bytes[0];
      if (!(keyFrame || seenKeyFrame)) return;
      seenKeyFrame = true;

	    pd = [bytes[1], bytes[2], bytes[3], bytes[4]];

      pIdx = 0;
      byteIdx = 5;
      rgbByteIdx = pLen+5;

      for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
        for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
          pv = pvs[pIdx];
          aByte = bytes[byteIdx];
          if (!keyFrame) {
            aByte = bytes[byteIdx] = (prevBytes[byteIdx] + aByte) % 256;
          }
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

