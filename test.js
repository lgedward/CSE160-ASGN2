import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { OBJLoader } from 'three/addons/OBJLoader.js';
import { MTLLoader } from 'three/addons/MTLLoader.js';


function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

	
	const boxWidth = 100;
    const boxHeight = 100;
    const boxDepth = 100;
    const cubeGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = 1000;
	cube.position.y = 500;
    scene.add(cube);


	const sphereRadius = 50;  // Set the radius to 50 for visibility
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 32;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = 500;
    sphere.position.y = 500;
    scene.add(sphere);

	const geometry3 = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );
	const loader = new THREE.TextureLoader();
	const texture = loader.load( './images/wall.jpg' );
	texture.colorSpace = THREE.SRGBColorSpace;
	const material2 = new THREE.MeshBasicMaterial( {
		map: texture,
	} );
	const cube3 = new THREE.Mesh( geometry3, material2 );
	cube3.position.x = -1000;
	cube3.position.y = 500;
	scene.add( cube3 );

	const shapes = [cube, sphere];


	{

		const planeSize = 4000;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		const repeats = planeSize / 200;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}

	{

		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 3;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}

	function frameArea( sizeToFitOnScreen, boxSize, boxCenter, camera ) {

		const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
		const halfFovY = THREE.MathUtils.degToRad( camera.fov * .5 );
		const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );
		// compute a unit vector that points in the direction the camera is now
		// in the xz plane from the center of the box
		const direction = ( new THREE.Vector3() )
			.subVectors( camera.position, boxCenter )
			.multiply( new THREE.Vector3( 1, 0, 1 ) )
			.normalize();

		// move the camera to a position distance units way from the center
		// in whatever direction the camera was from the center already
		camera.position.copy( direction.multiplyScalar( distance ).add( boxCenter ) );

		// pick some near and far values for the frustum that
		// will contain the box.
		camera.near = boxSize / 100;
		camera.far = boxSize * 100;

		camera.updateProjectionMatrix();

		// point the camera to look at the center of the box
		camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );

	}

	{

		const mtlLoader = new MTLLoader();
		mtlLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill_2/windmill-fixed.mtl', ( mtl ) => {

			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill_2/windmill.obj', ( root ) => {

				scene.add( root );

				// compute the box that contains all the stuff
				// from root and below
				const box = new THREE.Box3().setFromObject( root );

				const boxSize = box.getSize( new THREE.Vector3() ).length();
				const boxCenter = box.getCenter( new THREE.Vector3() );

				// set the camera to frame the box
				frameArea( boxSize * 1.2, boxSize, boxCenter, camera );

				// update the Trackball controls to handle the new size
				controls.maxDistance = boxSize * 10;
				controls.target.copy( boxCenter );
				controls.update();

			} );

		} );

	}

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render(time) {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}
		

		shapes.forEach( ( cube, ndx ) => {

			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;

		} );

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
