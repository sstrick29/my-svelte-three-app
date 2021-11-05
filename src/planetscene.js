//dependencies
import * as THREE from 'three';
//import { Color } from 'svelthree';

// scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000);

// geometry mesh
var geometry   = new THREE.SphereGeometry(0.5, 32, 32);
// material
var material  = new THREE.MeshBasicMaterial({
    color: 0x00ff00});
//material.map    = THREE.ImageUtils.loadTexture('images/earthmap1k.jpg');
var earthMesh = new THREE.Mesh(geometry, material);
let renderer;
scene.add(earthMesh);


camera.position.z = 5;

const animate = () => {
  requestAnimationFrame(animate);
  earthMesh.rotation.x += 0.01;
  earthMesh.rotation.y += 0.01;
  renderer.render(scene, camera);
};

const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

export const createScene = (el) => {
  renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      canvas: el });

  resize();
  animate();
}

window.addEventListener('resize', resize);