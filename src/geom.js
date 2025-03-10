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
renderer.shadowMap.enabled = true;

// texture loader
const loader = new THREE.TextureLoader();

// key colors
const keyColor = 0x202020;
const noKeyColor = 0x300000;
const boardColor = 0x111111;
const onColor = 0x004000;

// PERSPECTIVE CAMERA VARIABLES
const fov = 45;
const aspect = 2; // the canvas default
// const near = 0.1;
const near = 5;
const far = 3000;

// cameras
const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
camera.position.set( 0, 20, 30 );

// const cameraHelper = new THREE.CameraHelper(camera);

const controls = new OrbitControls( camera, canvas );
controls.target.set( 0, 10, 0 );

controls.update();

const scene = new THREE.Scene();
scene.background = new THREE.Color( 'black' );

// cubes functions/variables
function makeInstance(geometry, color, x, y, z) {
	const material = new THREE.MeshPhongMaterial({color, shininess: 40});
   
	const cube = new THREE.Mesh(geometry, material);
	// shadows
	cube.castShadow = true;
	cube.receiveShadow = true;
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

// map all cube indices to keyCodes
let keyMap = new Map([
	// entire top row w/ backspace
	[192,27],[49,28],[50,29],[51,30],[52,31],[53,32],[54,33],[55,34],[56,35],[57,36],[48,37],[173,38],[61,39],[8,40],
	// all letters (Q-P, A-L, Z-M);
	[81,0],[87,1],[69,2],[82,3],[84,4],[89,5],[85,6],[73,7],[79,8],[80,9], // top row
	[65,10],[83,11],[68,12],[70,13],[71,14],[72,15],[74,16],[75,17],[76,18], // middle row
	[90,19],[88,20],[67,21],[86,22],[66,23],[78,24],[77,25], // bottom row
	[32,26], // spacebar
	// all other keys
	[20,42], // caps lock
	[16,43], // shift
	[219,44],[221,45],[220,46],[59,47],[222,48], // [, ], \, ;, ' keys
	[188,49],[190,50],[191,51], // ,, ., and / keys
	[13,52] // enter
]);

let letterMap = new Map([
	// entire top row
	[192,"`"],[49,"1"],[50,"2"],[51,"3"],[52,"4"],[53,"5"],[54,"6"],[55,"7"],[56,"8"],[57,"9"],[48,"0"],[173,"-"],[61,"="],[8,""],
	// all letters (q-p, a-l, z-m);
    [81,"q"],[87,"w"],[69,"e"],[82,"r"],[84,"t"],[89,"y"],[85,"u"],[73,"i"],[79,"o"],[80,"p"],[219,"["],[221,"]"],[220,"\\"],// top row
    [65,"a"],[83,"s"],[68,"d"],[70,"f"],[71,"g"],[72,"h"],[74,"j"],[75,"k"],[76,"l"],[59,";"],[222,"'"],// middle row
    [90,"z"],[88,"x"],[67,"c"],[86,"v"],[66,"b"],[78,"n"],[77,"m"],[188,","],[190,"."],[191,"/"], // bottom row
    [32," "], // spacebar
	[20,""],[16,""],[13,"\n"] // caps lock, shift, enter

]);

let shiftMap = new Map([
	// entire top row
	[192,"~"],[49,"!"],[50,"@"],[51,"#"],[52,"$"],[53,"%"],[54,"^"],[55,"&"],[56,"*"],[57,"("],[48,")"],[173,"_"],[61,"+"],[8,""],
	// all letters (q-p, a-l, z-m);
    [81,"q"],[87,"w"],[69,"e"],[82,"r"],[84,"t"],[89,"y"],[85,"u"],[73,"i"],[79,"o"],[80,"p"],[219,"{"],[221,"}"],[220,"|"],// top row
    [65,"a"],[83,"s"],[68,"d"],[70,"f"],[71,"g"],[72,"h"],[74,"j"],[75,"k"],[76,"l"],[59,":"],[222,"\""],// middle row
    [90,"z"],[88,"x"],[67,"c"],[86,"v"],[66,"b"],[78,"n"],[77,"m"],[188,"<"],[190,">"],[191,"?"], // bottom row
    [32," "], // spacebar
	[20,""],[16,""],[13,"\n"] // caps lock, shift, enter
]);

const cubes = [];
const keyboardCoords = [-12,2,-4];

const board = new THREE.BoxGeometry(boxWidth * 17, boxHeight * 0.9, boxDepth * 6.5);
makeInstance(board, boardColor, keyboardCoords[0] + 11.5, keyboardCoords[1] - 0.7, keyboardCoords[2] + 2.2);

// letters top row
for (let x = 0; x < 10; x++) {
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x, keyboardCoords[1], keyboardCoords[2]));
}
// letters home row
for (let x = 0; x < 9; x++) {
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x + 0.7, keyboardCoords[1], keyboardCoords[2] + 2.2));
}
// letters bottom row
for (let x = 0; x < 7; x++) {
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x + 1.5, keyboardCoords[1], keyboardCoords[2] + 4.4));
}

const spacebarGeometry = new THREE.BoxGeometry(boxWidth * 6, boxHeight, boxDepth);
cubes.push(makeInstance(spacebarGeometry, keyColor, keyboardCoords[0] + 10, keyboardCoords[1], keyboardCoords[2] + 6.6));

for (let x = 0; x < 13; x++) {
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x - 3.6, keyboardCoords[1], keyboardCoords[2] - 2.2));
}

const bkspGeometry = new THREE.BoxGeometry(boxWidth * 1.7, boxHeight, boxDepth);
cubes.push(makeInstance(bkspGeometry, keyColor, keyboardCoords[0] + 25.7, keyboardCoords[1], keyboardCoords[2] - 2.2));

const tabGeometry = new THREE.BoxGeometry(boxWidth * 1.7, boxHeight, boxDepth);
cubes.push(makeInstance(tabGeometry, noKeyColor, keyboardCoords[0] - 2.9, keyboardCoords[1], keyboardCoords[2]));

const capsLockGeometry = new THREE.BoxGeometry(boxWidth * 2.05, boxHeight, boxDepth);
cubes.push(makeInstance(capsLockGeometry, keyColor, keyboardCoords[0] - 2.55, keyboardCoords[1], keyboardCoords[2] + 2.2)); // index 42

const shiftGeometry = new THREE.BoxGeometry(boxWidth * 2.45, boxHeight, boxDepth);
cubes.push(makeInstance(shiftGeometry, keyColor, keyboardCoords[0] - 2.15, keyboardCoords[1], keyboardCoords[2] + 4.4)); // index 42

for (let x = 10; x < 13; x++) { // [ and ] keys
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x, keyboardCoords[1], keyboardCoords[2]));
}

for (let x = 9; x < 11; x++) {
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x + 0.7, keyboardCoords[1], keyboardCoords[2] + 2.2));
}

for (let x = 7; x < 10; x++) {
	cubes.push(makeInstance(geometry, keyColor, keyboardCoords[0] + 2.2*x + 1.5, keyboardCoords[1], keyboardCoords[2] + 4.4));
}

const enterGeometry = new THREE.BoxGeometry(boxWidth * 1.75, boxHeight, boxDepth);
cubes.push(makeInstance(enterGeometry, keyColor, keyboardCoords[0] + 25.65, keyboardCoords[1], keyboardCoords[2] + 2.2));

const rightShiftGeometry = new THREE.BoxGeometry(boxWidth * 2.45, boxHeight, boxDepth);
cubes.push(makeInstance(rightShiftGeometry, keyColor, keyboardCoords[0] + 24.95, keyboardCoords[1], keyboardCoords[2] + 4.4));

let inputString = "";

// from prisoner849's answer on https://stackoverflow.com/questions/70759788/how-to-blend-text-onto-a-texture-in-three-js
let c = document.createElement("canvas");
c.width = 1920;
c.height = 1080;
let ctx = c.getContext("2d");

ctx.fillStyle = "rgba(255, 255, 255, 0)";
ctx.fillRect(0, 0, c.width, c.height);
ctx.textAlign = "left";
ctx.textBaseline = "middle";
ctx.fillStyle = "green";
ctx.font = "bold 60px Courier New";

let text = inputString.replace(/(?![^\n]{1,32}$)([^\n]{1,32})\s/g, '[$1]\n');
ctx.fillText(text, c.width * 0.05, c.height * 0.1);
ctx.strokeText(text, c.width * 0.05, c.height * 0.1);
let tex = new THREE.CanvasTexture(c);
// tex.offset.y = 0.25;

let capsOn = false;
let shiftOn = false;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(ev) {
	var keyCode = ev.which;
	cubes[keyMap.get(keyCode)].position.y = yOffset;
	if (keyCode === 8) { // backspace key pressed
		inputString = inputString.slice(0, -1);
		if (shiftOn) {
			inputString = ""; // hard clear Shift + Bksp
		}
	}
	else if (keyCode === 20) { // caps lock key pressed
		capsOn = !capsOn;
	}
	else if (keyCode === 16) { // shift key pressed
		shiftOn = true;
	}
	else {
		let letter;
		if (shiftOn) {
			letter = shiftMap.get(keyCode).toUpperCase();
		}
		else {
			letter = letterMap.get(keyCode);
		}
		if (capsOn) {
			inputString += letter.toUpperCase();
		} 
		else {
			inputString += letter;
		}
	}

    ctx.clearRect(0, 0, c.width, c.height); // Clear previous text
	ctx.clearRect(0, 0, c.width, c.height);

	// Pick a maxWidth that leaves some space on the sides
	let maxTextWidth = c.width * 0.9;
	let lineHeight = 60; // or however tall your line should be

	// “wrap” the input string in multiple lines
	wrapText(
	  ctx,
	  inputString + "_",
	  c.width * 0.05, // x
	  c.height * 0.1, // y
	  maxTextWidth,
	  lineHeight
	);

	// console.log(inputString);
	
    tex.needsUpdate = true;
}

function drawAllText(ctx, text, x, y, maxWidth, lineHeight) {
	const words = text.split('');
	let line = '';
  
	for (let i = 0; i < words.length; i++) {
	  const testLine = line + words[i];
	  const metrics = ctx.measureText(testLine);
  
	  if (metrics.width > maxWidth && i > 0) {
		ctx.fillText(line, x, y);
		ctx.strokeText(line, x, y);
		line = words[i];
		y += lineHeight;
	  } else {
		line = testLine;
	  }
	}
  
	ctx.fillText(line, x, y);
	ctx.strokeText(line, x, y);
  
	return y + lineHeight;
  }
  
function wrapText(ctx, text, x, startY, maxWidth, lineHeight) {
	const paragraphs = text.split('\n');
	let y = startY;

	if (paragraphs.length > 15) {
		paragraphs.slice(-15).forEach(paragraph => {
			y = drawAllText(ctx, paragraph, x, y, maxWidth, lineHeight);
		  });
	}
	else {
		paragraphs.forEach(paragraph => {
			y = drawAllText(ctx, paragraph, x, y, maxWidth, lineHeight);
		  });
	}
  }

document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(ev) {
	var keyCode = ev.which;
	cubes[keyMap.get(keyCode)].position.y = yOffset + 0.5;
	if (keyCode === 16) {
		shiftOn = false;
	}
}

// draw the screen
const screenGeom = new THREE.PlaneGeometry(32, 18);
const screenMat = new THREE.MeshPhongMaterial({
	color: 0x000000,
	emissive: 0x00FF00,
    emissiveMap: tex,
	emissiveIntensity: 2,
    side: THREE.DoubleSide,
	shininess: 20,
});

const screen = new THREE.Mesh(screenGeom, screenMat);
screen.position.set(0, 12, -25);
scene.add(screen);

// draw ground plane
function drawPlane() {
	const planeSize = 60;

	const texture = loader.load( 'textures/90732.jpg' );
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	texture.repeat.set( 1, 1 );

	const planeGeo = new THREE.BoxGeometry( planeSize, planeSize * 0.75 );
	const planeMat = new THREE.MeshPhongMaterial( {
		map: texture,
		color: 0x444443,
		side: THREE.DoubleSide,
	} );
	const mesh = new THREE.Mesh( planeGeo, planeMat );
	// shadows
	mesh.receiveShadow = true;
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
	// shadows
	light.castShadow = true;
	light.position.set( camera.position.x, camera.position.y, camera.position.z );
	scene.add( light );
	// scene.add( camera.target );
}

function drawPointLight(col, int, pos) {
	let color = col;
	let intensity = int;
	let light = new THREE.PointLight(color, intensity);
	light.distance = 7;
	light.position.set(pos[0]+2, pos[1]-4, pos[2]+2);
	scene.add(light);
}

function drawLampLight(col, int) {
	let color = col;
	let intensity = int;
	let spotlight = new THREE.SpotLight(color, intensity);
	spotlight.angle = Math.PI/3;
	spotlight.decay = 2;
	spotlight.castShadow = true;
	spotlight.position.set(-17.6, 12, -9.6);

	const target = new THREE.Object3D();
	target.position.set(-8,0,0);
	scene.add(spotlight);
	scene.add(target);

	spotlight.target = target;
}

let screenLight = new THREE.SpotLight(0x00FF00);

function drawScreenLight(col, int) {
	screenLight.angle = Math.PI/2;
	screenLight.decay = 2;
	screenLight.castShadow = true;
	screenLight.position.set(0, 12, -24.9);

	const target = new THREE.Object3D();
	target.position.set(0,12,1000);
	scene.add(screenLight);
	scene.add(target);

	screenLight.target = target
}

// load up desk lamp from three.js
const scaleFactor = 0.03;

function loadObject() {
	const mtlLoader = new MTLLoader();
	mtlLoader.load( 'textures/28-lampara_escritorio/lampara_escritorio.mtl', ( mtl ) => {
		mtl.preload();
        // Ensure materials are rendered on both sides
        for (const material of Object.values(mtl.materials)) {
            material.side = THREE.DoubleSide;
		}
		const objLoader = new OBJLoader();
		objLoader.setMaterials(mtl);
		objLoader.load( 'textures/28-lampara_escritorio/lampara escritorio.obj', ( root ) => {
			root.scale.set(scaleFactor, scaleFactor, scaleFactor);
			root.castShadow = true;
			root.receiveShadow = true;
			root.rotation.y = Math.PI / 4;
			root.position.set(-20, 0.25, -12);
			scene.add(root);
		} );
	} );
}

// load skybox
function loadBackground() {

	// cube map method
	const cubeLoader = new THREE.CubeTextureLoader();
	const texture1 = cubeLoader.setPath('textures/skybox/').load( [
		'posx.jpg',
		'negx.jpg',
		'posy.jpg',
		'negy.jpg',
		'posz.jpg',
		'negz.jpg'
	] );
	scene.background = texture1;

	// equirectangular map
	// const textureLoader = new THREE.TextureLoader();
	// const texture2 = textureLoader.load(
	// 	'https://threejs.org/manual/examples/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
	// 	() => {

	// 		texture2.mapping = THREE.EquirectangularReflectionMapping;
	// 		texture2.colorSpace = THREE.SRGBColorSpace;
	// 		scene.background = texture2;

	// 	} );
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
const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
gui.add( minMaxGUIHelper, 'min', 0.1, 50, 0.1 ).name( 'near' );
gui.add( minMaxGUIHelper, 'max', 0.1, 2000, 0.1 ).name( 'far' );

// render everything
// render everything
function render() {

	if ( resizeRendererToDisplaySize( renderer ) ) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}

    resizeRendererToDisplaySize(renderer);
 
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);

	requestAnimationFrame( render );

	// render screenlight intensity based on number of characters on screen
	let lineCount = 0;
	for (const _ of inputString.split('\n')) {
		lineCount += 1;
	}
	// split each chunk into 49-character pieces if necessary
	let chunks = inputString.split('\n').slice(-15);
	let allLines = [];
	for (const c of chunks) {
		for (let i = 0; i < c.length; i += 49) {
			let piece = c.slice(i, i+49);
			allLines.push(piece);
		}
	}
	if (lineCount > 15) {
		let visibleLines = allLines.slice(-15).join('\n');
		screenLight.intensity = visibleLines.replaceAll(" ", "").length * 3;
	}
	else {
		screenLight.intensity = inputString.replaceAll(" ", "").length * 3;
	}
}

function main() {

	drawPlane();
	drawSkyLight();
	// drawDirectionalLight(0xFFFFFF, 1, [5, 10, -2]);
	drawPointLight(0xFFFFFF, 1000, [-17.6, 12, -9.6]);
	// light up the lightbulb
	drawLampLight(0xFFFFFF, 2000);
	// console.log(inputString.length);
	drawScreenLight(0x00FF00, 0);
	loadBackground();
	loadObject();
	// drawSpheres();

	render();

	requestAnimationFrame( render );

}

main();