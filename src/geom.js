import * as THREE from 'three';
import { MinMaxGUIHelper } from './guihelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const canvas = document.querySelector( '#c' );
const view1Elem = document.querySelector('#view1');
// const view2Elem = document.querySelector('#view2');
// const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
const renderer = new THREE.WebGLRenderer ({
	antialias: true,
	canvas,
	logarithmicDepthBuffer: true
})

// PERSPECTIVE CAMERA VARIABLES
const fov = 45;
const aspect = 2; // the canvas default
// const near = 0.1;
const near = 5;
const far = 200;

// ORTHOGRAPHIC CAMERA VARIABLES
const size = 1;
// const near = 5;
// const far = 50;
// const camera = new THREE.OrthographicCamera( - size, size, size, - size, near, far );
// camera.zoom = 0.2;

// cameras
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.set( 0, 20, 30 );

// const cameraHelper = new THREE.CameraHelper(camera);

const controls = new OrbitControls( camera, canvas );
controls.target.set( 0, 5, 0 );

controls.keys = {
	LEFT: 'ArrowLeft', //left arrow
	UP: 'UpArrow', // up arrow
	RIGHT: 'RightArrow', // right arrow
	BOTTOM: 'DownArrow' // down arrow
}

controls.update();

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
	const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
   
	// compute a unit vector that points in the direction the camera is now
	// from the center of the box
	const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
   
	// move the camera to a position distance units way from the center
	// in whatever direction the camera was from the center already
	camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
   
	// pick some near and far values for the frustum that
	// will contain the box.
	camera.near = boxSize / 100;
	camera.far = boxSize * 100;
   
	camera.updateProjectionMatrix();
   
	// point the camera to look at the center of the box
	camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

const scene = new THREE.Scene();
scene.background = new THREE.Color( 'black' );

// cubes functions/variables
function makeInstance(geometry, color, x, y, z) {
	const material = new THREE.MeshPhongMaterial({color});
   
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
   
	cube.position.x = x;
	cube.position.y = y;
	cube.position.z = z;
   
	return cube;
}

const boxWidth = 2;
const boxHeight = 2;
const boxDepth = 2;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

var yOffset = 1.5;

// from prisoner849's answer on https://stackoverflow.com/questions/70759788/how-to-blend-text-onto-a-texture-in-three-js
let c = document.createElement("canvas");
let ctx = c.getContext("2d");
ctx.fillStyle = "rgba(255, 255, 255, 0)";
ctx.fillRect(0, 0, c.width, c.height);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "magenta";
ctx.font = "bold 36px Arial";
let text = "I love Three.js";
ctx.fillText(text, c.width * 0.5, c.height * 0.5);
ctx.strokeStyle = "red";
ctx.strokeText(text, c.width * 0.5, c.height * 0.5);
let tex = new THREE.CanvasTexture(c);
tex.offset.y = 0.25;

// map all cube indices to keyCodes
let keyMap = new Map([
	// all letters (Q-P, A-L, Z-M);
	[81,0],[87,1],[69,2],[82,3],[84,4],[89,5],[85,6],[73,7],[79,8],[80,9], // top row
	[65,10],[83,11],[68,12],[70,13],[71,14],[72,15],[74,16],[75,17],[76,18], // middle row
	[90,19],[88,20],[67,21],[86,22],[66,23],[78,24],[77,25], // bottom row
	[32,26] // spacebar
]);

const cubes = [];
const keyboardCoords = [-8,2,-4];

// letters top row
for (let x = 0; x < 10; x++) {
	cubes.push(makeInstance(geometry, 0x444444, keyboardCoords[0] + 2.2*x, keyboardCoords[1], keyboardCoords[2]));
}
// letters home row
for (let x = 0; x < 9; x++) {
	cubes.push(makeInstance(geometry, 0x444444, keyboardCoords[0] + 2.2*x + 0.7, keyboardCoords[1], keyboardCoords[2] + 2.2));
}
// letters bottom row
for (let x = 0; x < 7; x++) {
	cubes.push(makeInstance(geometry, 0x444444, keyboardCoords[0] + 2.2*x + 1.5, keyboardCoords[1], keyboardCoords[2] + 4.4));
}
const spacebarGeometry = new THREE.BoxGeometry(boxWidth * 6, boxHeight, boxDepth);
cubes.push(makeInstance(spacebarGeometry, 0x444444, keyboardCoords[0] + 10, keyboardCoords[1], keyboardCoords[2] + 6.6));

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(ev) {
	var keyCode = ev.which;
	cubes[keyMap.get(keyCode)].position.y = yOffset;
}

document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(ev) {
	var keyCode = ev.which;
	cubes[keyMap.get(keyCode)].position.y = yOffset + 0.5;
}

// draw ground plane
function drawPlane() {
	const planeSize = 40;

	const loader = new THREE.TextureLoader();
	const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	const repeats = planeSize / 2;
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

// sky hemisphere light
function drawSkyLight() {
	const skyColor = 0x222222; // light blue
	const groundColor = 0x000000; // brownish orange
	const intensity = 5;
	const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
	scene.add( light );
}

// sky directional light (like the sun)
function drawDirectionalLight(col, int, pos) {
	const color = col;
	const intensity = int;
	const light = new THREE.DirectionalLight( color, intensity );
	light.position.set( camera.position.x, camera.position.y, camera.position.z );
	scene.add( light );
	scene.add( camera.target );
}

function drawPointLight(col, int, pos) {
	let color = col;
	let intensity = int;
	let light = new THREE.PointLight(color, intensity);
	light.position.set(pos[0], pos[1], pos[2]);
	scene.add(light);
}

// load up windmill from three.js
function loadObject() {
	const mtlLoader = new MTLLoader();
	mtlLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill/windmill.mtl', ( mtl ) => {

		mtl.preload();
		const objLoader = new OBJLoader();
		objLoader.setMaterials(mtl);
		objLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', ( root ) => {
			scene.add(root);
			passSize(root);
		} );
	} );
}

function passSize( root ) {
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
}

// load skybox
function loadBackground() {

	// cube map method
	const cubeLoader = new THREE.CubeTextureLoader();
	const texture1 = cubeLoader.load( [
		'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
		'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
		'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
		'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
		'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
		'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
	] );
	// scene.background = texture1;

	// equirectangular map
	const textureLoader = new THREE.TextureLoader();
	const texture2 = textureLoader.load(
		'https://threejs.org/manual/examples/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
		() => {

			texture2.mapping = THREE.EquirectangularReflectionMapping;
			texture2.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture2;

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

function drawSpheres() {
	const sphereRadius = 2;
	const sphereWidthDivisions = 32;
	const sphereHeightDivisions = 16;
	const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
	const numSpheres = 20;
	for (let i = 0; i < numSpheres; ++i) {
		const sphereMat = new THREE.MeshPhongMaterial();
		sphereMat.color.setHSL(i * .73, 1, 0.5);
		const mesh = new THREE.Mesh(sphereGeo, sphereMat);
		mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
		scene.add(mesh);
	}
}

// CAMERA CONTROLS

// function updateCamera() {
// 	camera.updateProjectionMatrix();
// }

const gui = new GUI();
// gui.add(camera, 'fov', 1, 180);
// const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
// // gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
// // gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
// gui.add(minMaxGUIHelper, 'min', 0.00001, 500, 0.00001).name('near');
const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
gui.add( minMaxGUIHelper, 'min', 0.1, 50, 0.1 ).name( 'near' );
gui.add( minMaxGUIHelper, 'max', 0.1, 50, 0.1 ).name( 'far' );

// render everything
function render(time) {
	time *= 0.001;

	if ( resizeRendererToDisplaySize( renderer ) ) {

		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();

	}

    resizeRendererToDisplaySize(renderer);
 
    // render the original view
    {
      camera.updateProjectionMatrix();
    //   cameraHelper.update();
 
      // don't draw the camera helper in the original view
    //   cameraHelper.visible = false;
 
      // render
      renderer.render(scene, camera);
    }

	// cubes.forEach((cube, ndx) => {
	// 	const speed = 1 + ndx * .1;
	// 	const rot = time * speed;
	// 	cube.rotation.x = rot;
	// 	cube.rotation.y = rot;
	// });

	requestAnimationFrame( render );

}

function main() {

	drawPlane();
	drawSkyLight();
	drawDirectionalLight(0xFFFFFF, 1, [5, 10, -2]);
	drawPointLight(0xFFFFFF, 200, [-5, 10, 0]);
	loadBackground();
	// loadObject();
	// drawSpheres();

	render();

	requestAnimationFrame( render );

}

main();