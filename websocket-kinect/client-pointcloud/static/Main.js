
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer, mesh, ranges;

var cross;

var particleCount, particles, pMaterial, particleSystem;
var buffer_geometry, particle_count, positions, colors, ww, hh, new_frame = 0;

ww = 632;
hh = 480;

var kinect_buffer = new Uint8Array( 5 + ww*hh + 3*ww*hh);

particleCount = ww*hh;

//var colors = [0xFFFF00, 0x33FF33, 0xFF0099, 0x333333, 0x000FF, 0x3333CC]
var colors_rgb = [	74,112,139,
					188,210,238,
					128,128,0,
					255,69,0
					];
for(var i = 0; i < colors_rgb.length; i ++)
	colors_rgb[i] /= 256;

init();
animate();

var iter = 0;

function init() {
	container = document.getElementById( 'container' );
	camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 10000 );

	//camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	// camera.position.x = 0;
	// camera.position.y = 0;
	camera.position.z = 2750;

	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x050505, 1, 15000 );
	
	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: false, clearColor: 0x333333, clearAlpha: 1, alpha: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( scene.fog.color, 1 );

	container.appendChild( renderer.domElement );
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	buffer_geometry = new THREE.BufferGeometry();
	buffer_geometry.attributes = {

		position: {
			itemSize: 3,
			array: new Float32Array( particleCount * 3 ),
			numItems: particleCount * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array( particleCount * 3 ),
			numItems: particleCount * 3
		},
		// dynamic: true

	}
	buffer_geometry.dynamic = true;
	positions = buffer_geometry.attributes.position.array;
	colors = buffer_geometry.attributes.color.array;

	var color = new THREE.Color();

	var n = 1000, n2 = n / 2; // particles spread in the cube

	var NI = 640, NJ = 480, i = 0;
	var h = hh, w = ww;
	for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
			for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {

			var xc = (x - (w / 2)) * 2;
			var yc = ((h / 2) - y) * 2;
			var z = 0;

			positions[ i ]     = xc;
			positions[ i + 1 ] = yc;
			positions[ i + 2 ] = z;

			// colors

			var vx = ( x / n ) + 0.5;
			var vy = ( y / n ) + 0.5;
			var vz = ( z / n ) + 0.5;

			color.setRGB( vx, vy, vz );

			colors[ i ]     = color.r;
			colors[ i + 1 ] = color.g;
			colors[ i + 2 ] = color.b;
			i += 3;
		}
	}

	buffer_geometry.computeBoundingSphere();
	var buffer_material = new THREE.ParticleBasicMaterial( { size: 15, vertexColors: true } );

	// create the particle system
    particleSystem = new THREE.ParticleSystem(buffer_geometry, buffer_material);

	scene.add(particleSystem);
	stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

	// lights
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	scene.add( light );

	light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

}


function animate()
{
	requestAnimationFrame( animate );
	if(new_frame)
	{
		var depth_idx = 5;
		var rgb_idx = 5 + ww*hh;
		var i = 0;
		var h = hh; 
		var w = ww;

		for (y = 0; 0 <= h ? y < h : y > h; 0 <= h ? y++ : y--) {
		        for (x = 0; 0 <= w ? x < w : x > w; 0 <= w ? x++ : x--) {	

				var d = kinect_buffer[depth_idx];
				var r = kinect_buffer[rgb_idx+0]/256;
				var g = kinect_buffer[rgb_idx+1]/256;
				var b = kinect_buffer[rgb_idx+2]/256;
				
				d = (128 - d)*10;
				positions[3*i+2] = d;
				
				colors[3*i+0] = r;
				colors[3*i+1] = g;
				colors[3*i+2] = b;

				depth_idx++;
				rgb_idx += 3;
				i++
			}
		}

		buffer_geometry.attributes.position.needsUpdate = true;	//forces update of geometry position
		buffer_geometry.attributes.color.needsUpdate = true;	//forces update of geometry position

		new_frame = 0;
	}
	controls.update();

	stats.update();
	renderer.render(scene, camera);
}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function render() {
	renderer.render( scene, camera );
}


















