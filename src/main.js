import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1.5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

// Cargar modelo
const loader = new PLYLoader();
loader.load('/models/Silla.ply', (geometry) => {
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}, undefined, (err) => {
  console.error('Error cargando modelo:', err);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
