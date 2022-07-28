import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls';

import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { LineSegments, Vector3 } from 'three';

//Variables
var divisions = 128;


// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff);

//Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(-1,0.5,1);
camera.zoom = 1;

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setClearColor(0xffffff, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

//Grid, AxesHelper & OrbitControls
const gridHelper = new THREE.GridHelper(200,50);
//scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(1000);
//scene.add(axesHelper);
const controls = new OrbitControls(camera, renderer.domElement);

const ring = new THREE.TorusGeometry(2 ,0.05 ,16 ,100 );
const material = new THREE.MeshBasicMaterial({color: 0xffffff});
const hopfring = new THREE.Mesh(ring, material);
//scene.add(hopfring)
/*
const ball = new THREE.SphereGeometry(1, 16, 32);
const ballmaterial = new THREE.MeshBasicMaterial({color:0x000000});
const ballhopf = new THREE.Mesh(ball, ballmaterial);
scene.add(ballhopf)
*/

/*
class CustomCurve extends THREE.Curve {
  //1/sqrt(x^2+y^2+z^2)*(x,y,z)
  getPoint( t, optionalTarget = new THREE.Vector3() ) {
      const x = t * Math.cos(10.0 * t);
      const z = t * Math.sin(10.0 * t);
      const y = Math.pow(x, 2) + Math.pow(z, 2);

      return optionalTarget.set( x, y, z );
  } 
}

const curve_path = new CustomCurve();
const curve_geometry = new THREE.TubeGeometry( curve_path, 256, 0.05, 8, false );
const curve_material = new THREE.MeshPhysicalMaterial( { color: 0xE600AB, metalness: 0.5, roughness: 0.1, clearcoat: 1.0, side: THREE.DoubleSide } );
const curve = new THREE.Mesh( curve_geometry, curve_material );
scene.add( curve );

*/

/*
//S3->S2
function hopfrotation(x1,x2,x3,x4){
  const hopfpoint = new THREE.SphereGeometry(0.1, 32, 16);
  const hopfmaterial = new THREE.MeshStandardMaterial( { color: 0xFF0000 } );
  const sphere = new THREE.Mesh( hopfpoint, hopfmaterial );
  var x = 2*((x1*x3)+(x2*x4));
  var y = 2*((x2*x3)-(x1*x4));
  var z = x1^2+x2^2-x3^2-x4^2;
  sphere.position.set(x,y,z);
  scene.add(sphere);
}

//S3 -> R3
function hopfS3toR3(x,y,z,theta){
  var vector = hopfpreimage(x,y,z,theta);
  var d = vector.x;
  x = vector.y;
  y = vector.z;
  z = vector.w;
  var first = (1 / Math.sqrt(2 * (1 + x)));
  var xDenominator = (1 + x) * Math.sin(theta);
  var xNumerator = (1 - (d * Math.cos(theta)));
  var yDenominator = ((y * Math.sin(theta)) - (z * Math.cos(theta)));
  var yNumerator = (1 - (d * Math.cos(theta)));
  var zDenominator = ((y * Math.cos(theta)) + (z * Math.sin(theta)));
  var zNumerator = (1 - (d * Math.cos(theta)));

  var r3 = new THREE.Vector3(first * (xDenominator/xNumerator), first * (yDenominator/yNumerator), first * (zDenominator/zNumerator));
  return r3
}
*/


//S2->S3
function hopfpreimage(x,y,z, theta){
  if(z == -1){
    var r4 = new THREE.Vector4(0, Math.cos(theta), -Math.sin(theta), 0);
  } else{
    var r = 1/Math.sqrt(2*(1+z));
    var x1 = (r * ((1+z) * Math.cos(theta)));
    var y1 = (r * (x * Math.sin(theta) - y * Math.cos(theta)));
    var z1 = (r * (x * Math.cos(theta) + y * Math.sin(theta)));
    var w1 = (r * ((1+z) * Math.sin(theta)));
    var r4 = new THREE.Vector4(x1,y1,z1,w1);
  }
  return r4
}

//S3->R3
function stereo(x,y,z,theta){
  var vector = hopfpreimage(x,y,z,theta);
  var w = vector.x;
  x = vector.y;
  y = vector.z;
  z = vector.w;
  var r3 = new THREE.Vector3(x/(1-w), y/(1-w), z/(1-w));
  return r3
}
function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
//Use to create a Ring with one Point

function run(x,y,z, color){
 for (var i = 0; i < divisions+1; i++) {
  var theta = 2*Math.PI * i/divisions;
  var point = stereo(x,y,z,theta);
  const hopfpoint = new THREE.SphereGeometry(0.04, 16, 32);
  const hopfmaterial = new THREE.MeshBasicMaterial( { color: color } );
  const sphere = new THREE.Mesh( hopfpoint, hopfmaterial );
  sphere.position.set(point.x, point.y, point.z);
  const edges = new THREE.EdgesGeometry(hopfpoint, 10);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x000000}));
  line.position.set(point.x, point.y, point.z);
  scene.add(line)
  scene.add(sphere)
  }
}

//slot 1
function run1(x,y,z, color){
  for (var i = 0; i < divisions+1; i++) {
   var theta = 2*Math.PI * i/divisions;
   var point = stereo(x,y,z,theta);
   const hopfpoint = new THREE.SphereGeometry(0.04, 16, 32);
   const hopfmaterial = new THREE.MeshBasicMaterial( { color: color } );
   const sphere = new THREE.Mesh(hopfpoint, hopfmaterial);
   sphere.position.set(point.x, point.y, point.z);
   scene.add(sphere)
   }
 }


//Use to visualize 3 Dimensional function
function runx(x,y,z, color){
  const hopfpoint = new THREE.SphereGeometry(0.04, 16, 32);
  const hopfmaterial = new THREE.MeshBasicMaterial( { color: color } );
  const sphere = new THREE.Mesh( hopfpoint, hopfmaterial );
  sphere.position.set(x, y, z);
  scene.add(sphere)
}

//Create Spherical Coordinates given 2 angles
function spericalcoordinates(theta, phi){
  var x = Math.cos(phi) * Math.sin(theta);
  var y = Math.sin(phi) * Math.sin(theta);
  var z = Math.cos(theta);
  var vector = new THREE.Vector3(x,y,z);
  return vector
}

//Creates Multiple Rings with given function
function createMultipleRings(theta, phi, count, color){
  for(var i = 0; i<count; i++){
    var vector = spericalcoordinates(theta,((2*phi)/50)*i);
    var x = vector.x;
    var y = vector.y;
    var z = vector.z;
    run1(x,y,z,color)
  }
  }



//Creates Multiple Ring with given function
function createMultipleRings2(color){
  for(var t = Math.PI; t<4*Math.PI; t = t + (3*Math.PI)/100){
    var vector = spericalcoordinates(t/4,t);
    var x = vector.x;
    var y = vector.y;
    var z = vector.z;
    run1(x,y,z,color)
  }
  }

  function createMultipleRings3(color){
    for(var t = Math.PI; t<4*Math.PI; t = t + (3*Math.PI)/100){
      var vector = spericalcoordinates(t,1/4 * t);
      var x = vector.x;
      var y = vector.y;
      var z = vector.z;
      run1(x,y,z,color)
    }
    }  
createMultipleRings2(0xff0000)
//createMultipleRings3(0xffffff)
//createMultipleRings(Math.PI, Math.PI, 15, 0xE600AB)
animate()