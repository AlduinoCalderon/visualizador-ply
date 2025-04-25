import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
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
    console.log('Iniciando carga de modelo:', modelPath);
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.textContent = 'Cargando modelo...';
    this.container.appendChild(loadingElement);

    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }
    
    const fileExtension = modelPath.split('#').pop().split('.').pop().toLowerCase();
    console.log('Extensión del archivo a cargar:', fileExtension);
    let loader;
    
    if (fileExtension === 'ply') {
      console.log('Usando PLYLoader');
      loader = new PLYLoader();
    } else if (fileExtension === 'obj') {
      console.log('Usando OBJLoader');
      loader = new OBJLoader();
    } else {
      console.error('Formato de archivo no soportado:', fileExtension);
      loadingElement.textContent = 'Formato de archivo no soportado';
      setTimeout(() => {
        this.container.removeChild(loadingElement);
      }, 2000);
      return;
    }
    
    // Configurar timeout para archivos grandes
    const loadingTimeout = setTimeout(() => {
      loadingElement.textContent = 'El archivo es grande, esto puede tomar unos minutos...';
    }, 5000);
    
    // Remover el nombre del archivo de la URL para la carga
    const cleanUrl = modelPath.split('#')[0];
    
    loader.load(
      cleanUrl,
      (geometry) => {
        clearTimeout(loadingTimeout);
        let mesh;
        
        if (fileExtension === 'ply') {
          loadingElement.textContent = 'Procesando geometría...';
          try {
            geometry.computeVertexNormals();
            geometry.center();
            
            const material = new THREE.MeshStandardMaterial({ 
              color: 0xff00ff,  
              flatShading: false,
              roughness: 0.5,
              metalness: 0.2
            });
            
            mesh = new THREE.Mesh(geometry, material);
          } catch (error) {
            console.error('Error procesando geometría PLY:', error);
            loadingElement.textContent = 'Error procesando el modelo PLY. Verifica que el archivo no esté corrupto.';
            setTimeout(() => {
              this.container.removeChild(loadingElement);
            }, 5000);
            return;
          }
        } else if (fileExtension === 'obj') {
          loadingElement.textContent = 'Procesando modelo OBJ...';
          try {
            mesh = geometry;
            mesh.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xff00ff,
                  flatShading: false,
                  roughness: 0.5,
                  metalness: 0.2
                });
              }
            });
          } catch (error) {
            console.error('Error procesando modelo OBJ:', error);
            loadingElement.textContent = 'Error procesando el modelo OBJ. Verifica que el archivo no esté corrupto.';
            setTimeout(() => {
              this.container.removeChild(loadingElement);
            }, 5000);
            return;
          }
        }
        
        loadingElement.textContent = 'Ajustando escala...';
        try {
          const box = new THREE.Box3().setFromObject(mesh);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1 / maxDim;
          
          mesh.scale.set(scale, scale, scale);
          this.scene.add(mesh);
          this.currentModel = mesh;
          
          this.container.removeChild(loadingElement);
        } catch (error) {
          console.error('Error ajustando escala:', error);
          loadingElement.textContent = 'Error ajustando la escala del modelo.';
          setTimeout(() => {
            this.container.removeChild(loadingElement);
          }, 5000);
        }
      },
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        loadingElement.textContent = `Cargando: ${Math.round(percentComplete)}%`;
      },
      (error) => {
        clearTimeout(loadingTimeout);
        console.error('Error cargando modelo:', error);
        loadingElement.textContent = 'Error al cargar el modelo. Verifica que el archivo no esté corrupto y que sea un PLY u OBJ válido.';
        setTimeout(() => {
          this.container.removeChild(loadingElement);
        }, 5000);
      }
    );
  }
  
  createModelSelector(models) {
    const controlsElement = document.createElement('div');
    controlsElement.className = 'controls';
    
    const label = document.createElement('label');
    label.textContent = 'Modelo 3D:';
    
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
    
    // Crear botón para cargar archivos locales
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ply,.obj';
    fileInput.style.display = 'none';
    
    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Cargar archivo local';
    uploadButton.className = 'upload-button';
    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Archivo seleccionado:', file.name, 'Tamaño:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
        const fileExtension = file.name.split('.').pop().toLowerCase();
        console.log('Extensión detectada:', fileExtension);
        
        if (fileExtension === 'ply' || fileExtension === 'obj') {
          if (file.size > 500 * 1024 * 1024) { // 500MB
            alert('El archivo es muy grande. Esto puede causar problemas de rendimiento.');
          }
          console.log('Creando URL para el archivo...');
          const objectURL = URL.createObjectURL(file);
          const modelPath = `${objectURL}#${file.name}`;
          console.log('URL creada:', modelPath);
          this.loadModel(modelPath);
        } else {
          console.error('Extensión no soportada:', fileExtension);
          alert('Por favor, selecciona un archivo PLY u OBJ válido');
        }
      }
    });
    
    controlsElement.appendChild(label);
    controlsElement.appendChild(select);
    controlsElement.appendChild(uploadButton);
    controlsElement.appendChild(fileInput);
    
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
      this.currentModel.rotation.y += 0.21;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const viewer = new ModelViewer('viewer-container');
  
  // Iniciar con modelos estáticos (para pruebas)
  const staticModels = [
    { name: 'Silla', path: './models/Silla.ply' },
    { name: 'Kinect1_OBJ', path: './models/kinect_reconstruction_20250424_172803.obj' },
    { name: 'Kinect2_OBJ', path: './models/kinect_reconstruction_20250424_172823.obj' },
    { name: 'Kinect3_OBJ', path: './models/kinect_reconstruction_20250424_172851.obj' }
  ];
  
  viewer.createModelSelector(staticModels);
  viewer.animate();

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