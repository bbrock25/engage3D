PointCloudAnimator
==================

Three.js point cloud viewer/animator

Implementing a few different fun things:

	*OrbitControls.js - allows camera mouse controlled pan, tilt, zoom, etc. 
	
	*Vector3 - all points are rendered using Vector3 objects, since Vertex is now depreciated
	
	*Particle Animation - particles are repositioned and recolored every frame 
	
		-particleSystem.geometry.verticesNeedUpdate = true;/forces update of geometry position
		-particleSystem.geometry.colorsNeedUpdate = true;//forces update of geometry colors

This renders on my machine at about 10fps, I'm going to experiment using shaders to recolor and see if there's 
any speedup. 

Thanks!

