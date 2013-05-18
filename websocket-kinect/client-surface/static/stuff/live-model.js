LiveModel = function(wsurl) {
    url = wsurl;

    connect();
}

LiveModel.prototype = {
    
    constructor: LiveModel,
    
    reconnectDelay : 10,

    ws : null,

    dataCallback = function(e) {
	var aByte, byteIdx, bytes, depth, inStream, keyFrame, outStream, pIdx, prevBytes, pv, x, y, _ref5, _ref6;
	_ref5 = [prevOutArrayIdx, currentOutArrayIdx], currentOutArrayIdx = _ref5[0], prevOutArrayIdx = _ref5[1];
	// inStream = LZMA.wrapArrayBuffer(new Uint8Array(e.data));
	// outStream = LZMA.wrapArrayBuffer(outArrays[currentOutArrayIdx]);
	// LZMA.decompress(inStream, inStream, outStream, rawDataLen);
	// bytes = outStream.data;

	var position = geom.attributes.position.array;
	bytes = new Uint8Array(e.data);
	


	// prevBytes = new Uint8Array(e.data);
	// keyFrame = bytes[0];
	// if (!(keyFrame || seenKeyFrame)) return;
	// seenKeyFrame = true;
	// _ref6 = [bytes[1], bytes[2], bytes[3], bytes[4]], qtl = _ref6[0], qtr = _ref6[1], qbl = _ref6[2], qbr = _ref6[3];
	// dynaPan = dynaPan * 0.9 + ((qtr + qbr) - (qtl + qbl)) * 0.1;


	pIdx = 0;
	byteIdx = 5;
	rgbByteIdx = pLen+5;

	var depthidx = 2;
	for (var p=0; p<position.length; p++)
	{
	    position[depthidx] = bytes[byteIdx++];
	    depthidx += 3;
	}


	// for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
	//   for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {
	//     pv = pvs[pIdx];
	//     aByte = bytes[byteIdx];
	//     if (!keyFrame) {
	//       aByte = bytes[byteIdx] = (prevBytes[byteIdx] + aByte) % 256;
	//     }
	//     if (aByte === 255) {
	//       pv.y = -5000;
	//     } else {
	//       pv.y = pv.usualY;
	//       depth = 128 - aByte;
	//       pv.z = depth * 10;
	//     }

	//     // particles.colors[pIdx].r = bytes[rgbByteIdx+0]/ 256;
	//     // particles.colors[pIdx].g = bytes[rgbByteIdx+1]/ 256;
	//     // particles.colors[pIdx].b = bytes[rgbByteIdx+2]/ 256;
	// 	    particles.colors[pIdx].r = 1;
	//       particles.colors[pIdx].g = 1;
	//       particles.colors[pIdx].b = 1;

	//     rgbByteIdx += 3;
	//     pIdx += 1;
	//     byteIdx += 1;
	//   }
	// }
	


	mesh.geometry.verticesNeedUpdate=true;
	// mesh.geometry.colorsNeedUpdate=true;
	return true;
    },

        
    connect = function() {
	console.log("Connecting to " + url + " ...");

	ws = new WebSocket(url);
	ws.binaryType = 'arraybuffer';

	ws.onopen = function() {
	    return console.log('Connected');
	};

	ws.onclose = function() {
	    console.log("Disconnected: retrying in " + reconnectDelay + "s");
	    return setTimeout(connect, reconnectDelay * 1000);
	};

	return ws.onmessage = dataCallback;
    }

}
