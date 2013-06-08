LiveModel = function() {

  var inputH = 480;
  var inputW = 632;// sizes from kinect

  var offh = inputH/2;
  var offw = inputW/2;

  var vh = 160;// make sure inpuH/W are evenly
  var vw = 158;// divisible by vh/vw
  // faceMesh.receiveShadow = true;
  var w, h, xc, yc, particle;

  useEvery = 1;

  w = inputW / useEvery;
  h = inputH / useEvery;
  var pMaterial = new THREE.ParticleBasicMaterial({
    vertexColors:true,
    size: useEvery * 3.75
  });

  var colors = [0xB0171F, 0x9900FF];
	var particles = new THREE.Geometry();
  particles.dynamic = true;
 
  for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
    for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
      xc = (x - (w / 2)) * useEvery * 2;
      yc = ((h / 2) - y) * useEvery * 2;
      particle = new THREE.Vector3(xc, yc, 0);
      particle.usualY = yc;
      particles.vertices.push(particle);
      var col = new THREE.Color( colors[y%2] );
      particles.colors.push(col);
    }
  }
  var particleSystem = new THREE.ParticleSystem(particles, pMaterial);

  this.sceneContents = function() {
	   return particleSystem;
  };
	var _ref4 = [0, 1], currentOutArrayIdx = _ref4[0], prevOutArrayIdx = _ref4[1];
	var pLen = particles.vertices.length;
	var pvs = particles.vertices;

	dataCallback2 = function(e) {
      var aByte, byteIdx, bytes, depth, inStream, keyFrame, outStream, pIdx, prevBytes, pv, x, y, _ref5, _ref6;
      _ref5 = [prevOutArrayIdx, currentOutArrayIdx], currentOutArrayIdx = _ref5[0], prevOutArrayIdx = _ref5[1];
      // inStream = LZMA.wrapArrayBuffer(new Uint8Array(e.data));
      // outStream = LZMA.wrapArrayBuffer(outArrays[currentOutArrayIdx]);
      // LZMA.decompress(inStream, inStream, outStream, rawDataLen);
      // bytes = outStream.data;
      bytes = new Uint8Array(e.data);
      prevBytes = new Uint8Array(e.data);
      keyFrame = bytes[0];
      if (!(keyFrame || seenKeyFrame)) return;
      seenKeyFrame = true;
      _ref6 = [bytes[1], bytes[2], bytes[3], bytes[4]], qtl = _ref6[0], qtr = _ref6[1], qbl = _ref6[2], qbr = _ref6[3];
      //dynaPan = dynaPan * 0.9 + ((qtr + qbr) - (qtl + qbl)) * 0.1;
      pIdx = 0;
      byteIdx = 5;
      rgbByteIdx = pLen+5;

      for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
        for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
          pv = pvs[pIdx];
          aByte = bytes[byteIdx];
          
          if (aByte === 255) {
            pv.y = -5000;
          } else {
            pv.y = pv.usualY;
            depth = 128 - aByte;
            pv.z = depth * 10;
          }
          var r = bytes[rgbByteIdx+0]/ 256;
          var g = bytes[rgbByteIdx+1]/ 256;
          var b = bytes[rgbByteIdx+2]/ 256;

          particles.colors[pIdx].r = r;
          particles.colors[pIdx].g = g;
          particles.colors[pIdx].b = b;

          rgbByteIdx += 3;
          pIdx += 1;
          byteIdx += 1;
        }
      }

      particleSystem.geometry.verticesNeedUpdate = true;  //forces update of geometry position
      particleSystem.geometry.colorsNeedUpdate = true;  //forces update of geometry colors

     return true;
    };

    // WEBSOCKET STUFF

    var numVerts = vh* vw;
    var numData = inputH * inputW;


    var ws;
    this.connect = function() {
		var reconnectDelay, OF_BACKEND, opt;

	    OF_BACKEND = true;
	    
	    opt = {
			url: 'localhost',
			port: '9001',
			protocol: 'of-protocol',
			on_update: undefined,
			on_open: undefined,
			on_close: undefined
	    };    	

	    reconnectDelay = 10;
    	console.log("Connecting to " + opt.url + " ...");
		
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
    	    return setTimeout(this.connect, 10);
    	};
    	//console.log('.');
    	// ws.onmessage = function(){
    	// 	console.log('.');
    	// };
    	ws.onmessage = dataCallback2;
    };

    this.sendSlider = function(sliderValue){
	  var msg = {
		    type: "message",
		    depthCenter: parseInt(sliderValue),
					};
    	ws.send(JSON.stringify(msg));

    }
    var framerate_value = 10;
    var depthfocus_value = 5000;

 	var StreamController = function() {
		  this.framerate = framerate_value;
		  this.depthfocus = depthfocus_value;

		  this.displayOutline = false;
	};

	window.onload = function() {
		var text = new StreamController();
		var gui = new dat.GUI(); 
		var sc_directives = {
			type: "message",
			depthfocus: depthfocus_value,
			framerate: framerate_value
		}
		var depth_controller = gui.add(text, 'depthfocus', 1, 10000);
		var framerate_controller = gui.add(text, 'framerate', 1,30);

		depth_controller.onFinishChange(function(value) {
		  // Fires when a controller loses focus.
		  value = Math.floor(value);
		  depthfocus_value = value;
		  sc_directives.depthfocus = depthfocus_value;
		  console.log('sending msg', sc_directives)
		  ws.send(JSON.stringify(sc_directives));
		});	

		framerate_controller.onFinishChange(function(value) {
		  // Fires when a controller loses focus.
		  value = Math.floor(value);
		  framerate_value = value;
		  sc_directives.framerate = framerate_value;
		  console.log('sending msg', sc_directives)
		  ws.send(JSON.stringify(sc_directives));
		});	
	};


    
    var pd=[];			// pan data -- TODO: get rid of this
    this.panData = function() { return pd; }


}