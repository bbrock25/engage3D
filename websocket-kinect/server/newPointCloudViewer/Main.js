
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer, mesh, ranges;

var cross;

var particleCount, particles, pMaterial, particleSystem;

var colors = [0xFFFF00, 0x33FF33, 0xFF0099, 0x333333, 0x000FF, 0x3333CC]
var colors_rgb = [	74,112,139,
					188,210,238,
					128,128,0,
					255,69,0
					];
for(var i = 0; i < colors_rgb.length; i ++)
	colors_rgb[i] /= 256;

init();
animate();

function load_particle_system()
{
	var ww = 640, hh = 480;


	particleCount = ww*hh,
    particles = new THREE.Geometry(),
	pMaterial = new THREE.ParticleBasicMaterial({
		size: 5
		,vertexColors:true
		,sizeAttenuation: false
		// color:colors[3],
		});

	// now create the individual particles
	var p = 0;
	for(var x = 0; x < ww; x ++)for(y = 0; y < hh; y ++){
		// create a particle with random
		var  pX = x - ww/2
			,pY = y - hh/2
			,pZ = (Math.random() * 500 )*.1
		    ,particle = new THREE.Vector3(pX,pY,pZ)
		    ,color = new THREE.Color(colors[(p++)%6]);

		// add it to the geometry
		particles.vertices.push(particle);
		particles.colors.push(color);
	}
	
	// create the particle system
    particleSystem = new THREE.ParticleSystem(particles, pMaterial);
	
	//these don't appear to be necessary
	//particleSystem.dynamic = true;
	//particleSystem.sortParticles = false;	
	
	// add it to the scene
	scene.add(particleSystem);

}
var iter = 0;

function animate() {
	iter++;
	var r,g,b;

	for(var i = 0; i < particleCount; i += 1)
	{
		particleSystem.geometry.vertices[i].z += 1;
		particleSystem.geometry.vertices[i].z = (particleSystem.geometry.vertices[i].z > 100) ? 0 : particleSystem.geometry.vertices[i].z;
		
		var color_idx = 3*((iter+i)%4);
		particleSystem.geometry.colors[i].r = colors_rgb[3*((iter+i)%4)+0];
		particleSystem.geometry.colors[i].g = colors_rgb[3*((iter+i)%4)+1];
		particleSystem.geometry.colors[i].b = colors_rgb[3*((iter+i)%4)+2];
	}
	
	particleSystem.geometry.verticesNeedUpdate = true;	//forces update of geometry position
	particleSystem.geometry.colorsNeedUpdate = true;	//forces update of geometry colors
	
	particleSystem.rotation.y += 0.01;

	controls.update();

	stats.update();
	renderer.render(scene, camera);
	requestAnimationFrame( animate );

}

function init() {

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 750;

	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.000 );
	
	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	//renderer.setClearColor( scene.fog.color, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	load_particle_system();

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

	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

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


















