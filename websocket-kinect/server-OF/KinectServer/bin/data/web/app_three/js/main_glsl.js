var container;

var scene, camera, light, renderer;
var geometry, cube, mesh, material;
var mouse, center;
var stats;

//var video;
var kinectws;
var texture;

if ( Detector.webgl ) {

	init();
	animate();

} else {

	document.body.appendChild( Detector.getWebGLErrorMessage() );

}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	var info = document.createElement( 'div' );
	info.id = 'info';
	info.innerHTML = '<a href="http://github.com/mrdoob/three.js" target="_blank">three.js</a> - kinect';
	document.body.appendChild( info );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	scene = new THREE.Scene();
	center = new THREE.Vector3();
	center.z = - 1000;

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 0, 500 );
	scene.add( camera );

	//video = document.createElement( 'video' );
	//video.addEventListener( 'loadedmetadata', init_tex, false );
	//video.loop = true;
	//video.src = 'textures/kinect.webm';
	//video.play();

	kinectws = new cml.KinectWS({
		on_open: function() 
		{
			console.log('kinect open');
			init_tex();
		},
		on_update: function() 
		{
			texture.needsUpdate = true;
		},
		on_close: function() 
		{
			console.log('kinect close');
		}
	});

	function init_tex() {

		//texture = new THREE.Texture( video );
		texture = new THREE.Texture( kinectws.canvas()  );

		var width = 640, height = 480;
		var nearClipping = 500/*850*/, farClipping = 4000/*4000*/;

		geometry = new THREE.Geometry();

		for ( var i = 0, l = width * height; i < l; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = ( i % width );
			vertex.y = Math.floor( i / width );

			geometry.vertices.push( vertex );

		}

		material = new THREE.ShaderMaterial( {

			uniforms: {
			"map": { type: "t", value: 0, texture: texture },
			"width": { type: "f", value: width },
			"height": { type: "f", value: height },
			"nearClipping": { type: "f", value: nearClipping },
			"farClipping": { type: "f", value: farClipping },
			"pointSize": { type: "f", value: 2 },
			"zOffset": { type: "f", value: 1000 }
			},
			vertexShader: 
				document.getElementById( 'vs' ).textContent,
			fragmentShader: 
				document.getElementById( 'fs' ).textContent,
			depthWrite: false
		} );

		mesh = new THREE.ParticleSystem( geometry, material );
		mesh.position.x = 0;
		mesh.position.y = 0;
		scene.add( mesh );

		//setInterval( function () {

			//if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

				//texture.needsUpdate = true;

			//}

		//}, 1000 / 30 );


		var gui = new DAT.GUI();
		gui.add( material.uniforms.nearClipping, 'value' )
			.name( 'nearClipping' ).min( 1 ).max( 10000 )
			.step( 1.0 );
		gui.add( material.uniforms.farClipping, 'value' )
			.name( 'farClipping' ).min( 1 ).max( 10000 ).
			step( 1.0 );
		gui.add( material.uniforms.pointSize, 'value' )
			.name( 'pointSize' ).min( 1 ).max( 10 )
			.step( 1.0 );
		gui.add( material.uniforms.zOffset, 'value' )
			.name( 'zOffset' ).min( 0 ).max( 4000 )
			.step( 1.0 );
		gui.close();
	}	

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	mouse = new THREE.Vector3( 0, 0, 1 );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onDocumentMouseMove( event ) {

	mouse.x = ( event.clientX - window.innerWidth / 2 ) * 8;
	mouse.y = ( event.clientY - window.innerHeight / 2 ) * 8;

}

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	camera.position.x += ( mouse.x - camera.position.x ) * 0.05;
	camera.position.y += ( - mouse.y - camera.position.y ) * 0.05;
	camera.lookAt( center );

	renderer.render( scene, camera );

}
