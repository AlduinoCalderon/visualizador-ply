import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1.5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Cargar modelo
const loader = new PLYLoader();
loader.load('/models/Silla.ply', (geometry) => {
  geometry.computeVertexNormals();
  geometry.center();
  const material = new THREE.MeshStandardMaterial({ color: 0xaaFFaa });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(0.001, 0.001, 0.001);
  scene.add(mesh);
}, undefined, (err) => {
  console.error('Error cargando modelo:', err);
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
