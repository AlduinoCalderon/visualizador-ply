import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class ModelViewer {
  constructor(containerId = 'viewer-container') {
    this.container = document.getElementById(containerId) || document.body;
    this.currentModel = null;
    
    this.initScene();
    this.initLights();
    this.initControls();
    this.setupEventListeners();
  }
  
  initScene() {
    // Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    
    // Cámara
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 1.5;
    
    // Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
  }
  
  initLights() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Luz hemisférica
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.scene.add(hemisphereLight);
    
    // Luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }
  
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
  }
  
  setupEventListeners() {
    // Manejar cambio de tamaño de ventana
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }
  
  loadModel(modelPath) {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.textContent = 'Cargando modelo...';
    this.container.appendChild(loadingElement);

    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }
    
    const loader = new PLYLoader();
    loader.load(
      modelPath,
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.center();
        
        const material = new THREE.MeshStandardMaterial({ 
          color: 0xff00ff,  
          flatShading: false,
          roughness: 0.5,
          metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        
        mesh.scale.set(scale, scale, scale);
        this.scene.add(mesh);
        this.currentModel = mesh;
        
        this.container.removeChild(loadingElement);
      },
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        loadingElement.textContent = `Cargando: ${Math.round(percentComplete)}%`;
      },
      (error) => {
        console.error('Error cargando modelo:', error);
        loadingElement.textContent = 'Error al cargar el modelo';
        setTimeout(() => {
          this.container.removeChild(loadingElement);
        }, 2000);
      }
    );
  }
  
  createModelSelector(models) {
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
      this.loadModel(e.target.value);
    });
    
    controlsElement.appendChild(label);
    controlsElement.appendChild(select);
    
    document.querySelector('main').appendChild(controlsElement);
    
    // Cargar el primer modelo por defecto
    if (models.length > 0) {
      this.loadModel(models[0].path);
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Actualizar controles
    this.controls.update();
    
    // Si hay un modelo, rotarlo suavemente cuando no se interactúa
    if (this.currentModel && !this.controls.enableDamping) {
      this.currentModel.rotation.y += 0.001;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  const viewer = new ModelViewer('viewer-container');
  
  // Iniciar con modelos estáticos (para pruebas)
  const staticModels = [
    { name: 'Silla', path: '/models/Silla.ply' },
    { name: 'Prueba', path: '/models/test1.ply' }
  ];
  
  viewer.createModelSelector(staticModels);
  viewer.animate();
  
  // Exportar la instancia para uso externo si es necesario
  window.modelViewer = viewer;
});

/**
 * Función a futuro para cargar modelos desde una API
 *
 */
export async function loadModelsFromAPI(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const models = await response.json();
    
    // Si ya tenemos una instancia de visor, actualizar sus modelos
    if (window.modelViewer) {
      // Limpiar selector anterior
      const oldSelector = document.querySelector('.controls');
      if (oldSelector) {
        oldSelector.remove();
      }
      
      window.modelViewer.createModelSelector(models);
    }
    
    return models;
  } catch (error) {
    console.error('Error cargando modelos desde API:', error);
    return [];
  }
}