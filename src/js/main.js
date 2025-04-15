import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Configuración de la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Configuración de la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1.5;

// Configuración del renderizador
const viewerContainer = document.getElementById('viewer-container') || document.body;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
viewerContainer.appendChild(renderer.domElement);

// Luces
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

// Variable para almacenar el modelo actual
let currentModel = null;

// Función para cargar un modelo
function loadModel(modelPath) {
    // Mostrar pantalla de carga
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.textContent = 'Cargando modelo...';
    viewerContainer.appendChild(loadingElement);
    
    // Remover modelo anterior si existe
    if (currentModel) {
        scene.remove(currentModel);
    }
    
    const loader = new PLYLoader();
    loader.load(
        modelPath,
        (geometry) => {
            geometry.computeVertexNormals();
            geometry.center();
            
            // Color magenta/rosa (complementario al verde)
            const material = new THREE.MeshStandardMaterial({ 
                color: 0xff00ff,
                flatShading: false,
                roughness: 0.5,
                metalness: 0.2
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            // Escalar automáticamente el modelo
            const box = new THREE.Box3().setFromObject(mesh);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1 / maxDim;
            
            mesh.scale.set(scale, scale, scale);
            scene.add(mesh);
            currentModel = mesh;
            
            // Quitar pantalla de carga
            viewerContainer.removeChild(loadingElement);
        },
        (xhr) => {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            loadingElement.textContent = `Cargando: ${Math.round(percentComplete)}%`;
        },
        (error) => {
            console.error('Error cargando modelo:', error);
            loadingElement.textContent = 'Error al cargar el modelo';
            setTimeout(() => {
                viewerContainer.removeChild(loadingElement);
            }, 2000);
        }
    );
}

// Sistema de partículas
function createParticleSystem() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Posiciones aleatorias en un cubo grande
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5; // Colocar mayoría detrás de la cámara
        
        // Variaciones de color verde
        const greenShade = Math.random() * 0.3 + 0.7; // 0.7-1.0 para mantener el verde brillante
        color.setRGB(0, greenShade, 0);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Tamaños aleatorios
        sizes[i] = Math.random() * 0.1 + 0.02;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Textura para partículas
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('/particle.png', () => {}, () => {
        // Si falla, crear una textura de partícula por defecto
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        particleMaterial.uniforms.texture.value.image = canvas;
        particleMaterial.uniforms.texture.value.needsUpdate = true;
    });
    
    // Shader material para mejor rendimiento
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            texture: { value: particleTexture },
            time: { value: 0.0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                
                // Movimiento simple de las partículas
                vec3 pos = position;
                pos.y += sin(time * 0.2 + position.x) * 0.1;
                pos.x += cos(time * 0.1 + position.z) * 0.1;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D texture;
            varying vec3 vColor;
            
            void main() {
                vec4 texColor = texture2D(texture, gl_PointCoord);
                gl_FragColor = vec4(vColor, 0.3) * texColor;
            }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);
    
    return particles;
}

const particles = createParticleSystem();

// Responsive - redimensionar automáticamente
window.addEventListener('resize', () => {
    camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
});

// Crear selector de modelos
async function createModelSelector() {
    try {
        // Necesitará una API que liste los archivos
        // en JSON {name: x path: y}
        const models = [
            { name: 'Silla', path: '/models/Silla.ply' }
        ];
        
        const controlsElement = document.createElement('div');
        controlsElement.className = 'controls';
        
        const label = document.createElement('label');
        label.textContent = 'Seleccionar modelo:';
        
        const select = document.createElement('select');
        select.id = 'model-selector';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.path;
            option.textContent = model.name;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            loadModel(e.target.value);
        });
        
        controlsElement.appendChild(label);
        controlsElement.appendChild(select);
        
        document.querySelector('main').appendChild(controlsElement);
        
        // Cargar el primer modelo por defecto
        loadModel(models[0].path);
        
    } catch (error) {
        console.error('Error al crear el selector de modelos:', error);
    }
}

// Tiempo para animación
let time = 0;

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Actualizar controles
    controls.update();
    
    // Actualizar partículas
    time += 0.01;
    if (particles.material.uniforms) {
        particles.material.uniforms.time.value = time;
    }
    
    // Si hay un modelo, rotarlo suavemente cuando no se interactúa
    if (currentModel && !controls.enableDamping) {
        currentModel.rotation.y += 0.001;
    }
    
    renderer.render(scene, camera);
}

// Iniciar la aplicación
createModelSelector();
animate();