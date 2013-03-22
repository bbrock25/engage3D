(function() {

    $(function() {
	var animate, bgColour, camT, camYRange, camZ, camZRange, camera, connect, currentOutArrayIdx, doCamPan, doCamZoom, down, drawControl, dvp, dynaPan, fgColour, i, k, kvp, outArrays, pLen, params, prevOutArrayIdx, projector, pvs, qbl, qbr, qtl, qtr, rawDataLen, renderer, scene, seenKeyFrame, setSize, startCamPan, stats, stopCamPan, sx, sy, togglePlay, wls, x, xc, y, yc, _i, _len, _ref, _ref2, _ref3, _ref4;
	var iteration = 0;
	if (!(window.WebGLRenderingContext && document.createElement('canvas').getContext('experimental-webgl') && window.WebSocket && new WebSocket('ws://.').binaryType)) {
	    $('#noWebGL').show();
	    return;
	}
	params = {
	    stats: true,
	    fog: 1,
	    credits: 1,
	    ws: "ws://" + "localhost:9000"
	};
	// build page
	wls = window.location.search;
	_ref = wls.substring(1).split('&');
	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	    kvp = _ref[_i];
	    _ref2 = kvp.split('='), k = _ref2[0], v = _ref2[1];
	    params[k] = k === 'ws' ? v : parseInt(v);
	}
	if (params.credits) $('#creditOuter').show();
	if (true) {
	    stats = new Stats();
	    stats.domElement.id = 'stats';
	    document.body.appendChild(stats.domElement);
	} 
	bgColour = 0x000000;
	fgColour = 0xffffff;
	
	// bgColour = 0xFF0000;
	// fgColour = 0x000000;

	Transform.prototype.t = Transform.prototype.transformPoint;
	
	renderer = new THREE.WebGLRenderer({
	    antialias: true
	});
	camera = new THREE.PerspectiveCamera(60, 1, 1, 10000);
	dvp = (_ref3 = window.devicePixelRatio) != null ? _ref3 : 1;
	setSize = function() {
	    renderer.setSize(window.innerWidth * dvp, window.innerHeight * dvp);
	    renderer.domElement.style.width = window.innerWidth + 'px';
	    renderer.domElement.style.height = window.innerHeight + 'px';
	    camera.aspect = window.innerWidth / window.innerHeight;
	    return camera.updateProjectionMatrix();
	};
	setSize();
	$(window).on('resize', setSize);
	document.body.appendChild(renderer.domElement);
	renderer.setClearColorHex(bgColour, 1.0);
	renderer.clear();
	projector = new THREE.Projector();
	scene = new THREE.Scene();
	scene.add(camera);
	if (params.fog) scene.fog = new THREE.FogExp2(bgColour, 0.00033);
	
	
	light = new THREE.AmbientLight(0xFFFFFF);
	// light = new THREE.DirectionalLight( 0xffffff, 0.35 );
	// light.color.setHSV( 0.3, 0.95, 1 );
	// light.position.set( 0, -100, 0 );


	scene.add(light);

	// kinect stuff
	kmodel = new LiveModel();
	scene.add(kmodel.sceneContents());
	//--

	togglePlay = function() {};

	down = false;
	dynaPan = 0;
	sx = sy = 0;
//	camZRange = [2000, 200];
//	camZ = 880;
	camZRange = [4000, 200];
	camZ = 3000;


	camYRange = [-600, 600];
	camT = new Transform();
	animate = function() {
	    var _ref4, panData;
	    renderer.clear();
	    
	    panData = kmodel.panData();
	    //	console.log("pd len:" +panData.length);
	    if (panData.length > 0)
	    {
		qtl = panData[0], qtr = panData[1], qbl = panData[2], qbr = panData[3];
		dynaPan = dynaPan * 0.9 + ((qtr + qbr) - (qtl + qbl)) * 0.1;
	    }

	    //	console.log("dynapan: " + dynaPan);

	    _ref4 = camT.t(0.01 * camZ * dynaPan, camZ), camera.position.x = _ref4[0], camera.position.z = _ref4[1];

	    camera.lookAt(scene.position);
	    renderer.render(scene, camera);
	    window.requestAnimationFrame(animate, renderer.domElement);
	    if (params.stats) return stats.update();
	};
	animate();
	startCamPan = function(ev) {
	    down = true;
	    sx = ev.clientX;
	    return sy = ev.clientY;
	};
	$(renderer.domElement).on('mousedown', startCamPan);
	stopCamPan = function() {
	    return down = false;
	};
	$(renderer.domElement).on('mouseup', stopCamPan);
	doCamPan = function(ev) {
	    var camY, dx, dy, rotation;
	    if (down) {
		dx = ev.clientX - sx;
		dy = ev.clientY - sy;
		rotation = dx * 0.0005 * Math.log(camZ);
		camT.rotate(rotation);
		camY = camera.position.y;
		camY += dy * 3;
		if (camY < camYRange[0]) camY = camYRange[0];
		if (camY > camYRange[1]) camY = camYRange[1];
		camera.position.y = camY;
		sx += dx;
		return sy += dy;
	    }
	};
	$(renderer.domElement).on('mousemove', doCamPan);
	doCamZoom = function(ev, d, dX, dY) {
	    camZ -= dY * 40;
	    camZ = Math.max(camZ, camZRange[1]);
	    return camZ = Math.min(camZ, camZRange[0]);
	};
	$(renderer.domElement).on('mousewheel', doCamZoom);

	// kinect stuff
	kmodel.connect();

	var val = $('#slider').val();
	output 	= $('#output');
	output.html(val);

	$('#slider').on('mouseup',function(e){
	    output.html(this.value);
	    kmodel.sendSlider(this.value);
	});



	return 1;
    });

}).call(this);
