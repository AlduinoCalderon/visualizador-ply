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
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = new THREE.Fog(0xffffff, 1, 30);

    // Crear el cuarto con grid
    const roomSize = 40;
    
    // Grid Helper para el suelo
    const gridHelper = new THREE.GridHelper(roomSize, 40, 0xcccccc, 0xe6e6e6);
    gridHelper.position.y = -1.4;
    this.scene.add(gridHelper);

    // Crear pared trasera
    const backWallGeometry = new THREE.PlaneGeometry(roomSize, roomSize/2);
    const backWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe0e0e0, // Gris claro
      side: THREE.FrontSide,
      roughness: 0.8,  // Más mate
      metalness: 0.1
    });
    const backWallMesh = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWallMesh.position.z = -roomSize/4; // Acercada (antes era -roomSize/2)
    backWallMesh.position.y = roomSize/4 - 1.4;
    this.scene.add(backWallMesh);

    // Agregar sombras suaves en las esquinas
    const gradientGeometry = new THREE.PlaneGeometry(roomSize/20, roomSize/2);
    const gradientMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15,  // Un poco más oscuras las sombras
      side: THREE.FrontSide
    });

    // Sombra izquierda
    const leftShadow = new THREE.Mesh(gradientGeometry, gradientMaterial);
    leftShadow.position.set(-roomSize/2 + roomSize/40, roomSize/4 - 1.4, -roomSize/4 + 0.01);
    this.scene.add(leftShadow);

    // Sombra derecha
    const rightShadow = new THREE.Mesh(gradientGeometry, gradientMaterial);
    rightShadow.position.set(roomSize/2 - roomSize/40, roomSize/4 - 1.4, -roomSize/4 + 0.01);
    this.scene.add(rightShadow);

    // Líneas de perspectiva rediseñadas
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xe6e6e6, 
      transparent: true, 
      opacity: 0.3 
    });
    
    // Crear líneas de fondo más sutiles
    const backWallPoints = [];
    const numVerticalLines = 20; // Más líneas verticales para mejor efecto
    const verticalSpacing = roomSize / numVerticalLines;
    const wallHeight = roomSize / 2; // Altura reducida para mejor proporción

    // Línea horizontal superior
    backWallPoints.push(
      new THREE.Vector3(-roomSize/2, wallHeight, -roomSize/2),
      new THREE.Vector3(roomSize/2, wallHeight, -roomSize/2)
    );

    // Línea horizontal del medio
    backWallPoints.push(
      new THREE.Vector3(-roomSize/2, wallHeight/2, -roomSize/2),
      new THREE.Vector3(roomSize/2, wallHeight/2, -roomSize/2)
    );

    // Líneas verticales con espaciado gradual para efecto de perspectiva
    for (let i = 0; i <= numVerticalLines; i++) {
      const x = -roomSize/2 + i * verticalSpacing;
      // Ajustar la opacidad basada en la posición
      const lineOpacity = 0.1 + (i / numVerticalLines) * 0.2;
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xe6e6e6, 
        transparent: true, 
        opacity: lineOpacity 
      });
      
      const linePoints = [];
      linePoints.push(
        new THREE.Vector3(x, -1.4, -roomSize/2), // Comienza desde el nivel del grid
        new THREE.Vector3(x, wallHeight, -roomSize/2)
      );
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      this.scene.add(line);
    }

    // Agregar las líneas horizontales
    const linesGeometry = new THREE.BufferGeometry().setFromPoints(backWallPoints);
    const backWallLines = new THREE.LineSegments(linesGeometry, lineMaterial);
    this.scene.add(backWallLines);

    // Líneas laterales para dar profundidad
    const sidePoints = [];
    const numDepthLines = 4;
    for (let i = 0; i <= numDepthLines; i++) {
      const y = (i / numDepthLines) * wallHeight;
      sidePoints.push(
        // Línea izquierda
        new THREE.Vector3(-roomSize/2, y, -roomSize/2),
        new THREE.Vector3(-roomSize/2, y, roomSize/4),
        // Línea derecha
        new THREE.Vector3(roomSize/2, y, -roomSize/2),
        new THREE.Vector3(roomSize/2, y, roomSize/4)
      );
    }
    
    const sideGeometry = new THREE.BufferGeometry().setFromPoints(sidePoints);
    const sideWalls = new THREE.LineSegments(sideGeometry, lineMaterial);
    this.scene.add(sideWalls);

    // Cámara con mejor posición inicial
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 2, 8);
    
    // Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
  }
  
  
  initLights() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Luz hemisférica
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.scene.add(hemisphereLight);
    
    // Luz direccional principal
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(1, 1, 2);
    this.scene.add(mainLight);

    // Luz direccional suave desde atrás
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 1, -1);
    this.scene.add(backLight);
  }
  
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.target.set(0, 1, 0);
    
    // Limitar el movimiento de la cámara
    this.controls.minDistance = 4;
    this.controls.maxDistance = 12;
    this.controls.maxPolarAngle = Math.PI / 2; // No permitir ver debajo del grid
    this.controls.minPolarAngle = Math.PI / 6; // Limitar vista superior
    
    // Limitar rotación horizontal
    this.controls.minAzimuthAngle = -Math.PI / 4; // -45 grados
    this.controls.maxAzimuthAngle = Math.PI / 4;  // +45 grados

    // Limitar el paneo
    this.controls.enablePan = false;
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
              color: 0x808080,  // Gris industrial
              flatShading: false,
              roughness: 0.7,
              metalness: 0.3
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
                  color: 0x808080,
                  flatShading: false,
                  roughness: 0.7,
                  metalness: 0.3
                });
              }
            });

            // Calcular el tamaño del contenedor en unidades 3D
            const containerHeight = Math.tan(this.camera.fov * Math.PI / 360) * 2 * this.camera.position.length();
            const targetHeight = containerHeight * 0.75;

            // Calcular bounding box inicial
            const bbox = new THREE.Box3().setFromObject(mesh);
            const modelHeight = bbox.max.y - bbox.min.y;
            const scale = targetHeight / modelHeight;

            // Aplicar escala
            mesh.scale.set(scale, scale, scale);

            // Recalcular bounding box después de escalar
            bbox.setFromObject(mesh);
            const centerOffset = new THREE.Vector3();
            bbox.getCenter(centerOffset);

            // Posicionar el modelo correctamente
            mesh.position.x = -centerOffset.x;
            mesh.position.z = -centerOffset.z;
            mesh.position.y = -bbox.min.y * scale + 6; // Elevado 6 unidades

            // Rotar el modelo para que esté de frente
            mesh.rotation.y = Math.PI; // Girar 180 grados

          } catch (error) {
            console.error('Error procesando modelo OBJ:', error);
            loadingElement.textContent = 'Error procesando el modelo OBJ.';
            setTimeout(() => {
              this.container.removeChild(loadingElement);
            }, 5000);
            return;
          }
        }
        
          this.scene.add(mesh);
          this.currentModel = mesh;
          
        // Ajustar los controles para centrarse en el modelo
        this.controls.target.set(0, 3, 0); // Punto medio del modelo elevado
        this.controls.update();
        
        // Iniciar el polling de estado de los estantes
        this.startShelfStatusPolling();
        
            this.container.removeChild(loadingElement);
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
    // Crear el botón de hamburguesa
    const menuButton = document.createElement('button');
    menuButton.className = 'hamburger-menu';
    menuButton.innerHTML = `
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    `;

    // Crear el menú lateral
    const sideMenu = document.createElement('div');
    sideMenu.className = 'side-menu';
    
    // Contenedor del contenido del menú
    const menuContent = document.createElement('div');
    menuContent.className = 'menu-content';

    // Título del menú
    const menuTitle = document.createElement('h3');
    menuTitle.textContent = 'Selección de Modelo';
    menuContent.appendChild(menuTitle);

    // Selector de modelos
    const modelContainer = document.createElement('div');
    modelContainer.className = 'model-selector-container';
    
    const label = document.createElement('label');
    label.textContent = 'Modelo 3D:';
    label.className = 'model-label';
    
    const select = document.createElement('select');
    select.id = 'model-selector';
    select.className = 'model-select';
    
    // Agregar modelos al selector
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.path;
      option.textContent = model.name;
      select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
      this.loadModel(e.target.value);
      // Cerrar el menú después de seleccionar
      sideMenu.classList.remove('open');
      menuButton.classList.remove('active');
    });

    // Contenedor para el botón de carga local
    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'upload-container';
    
    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Cargar modelo local';
    uploadButton.className = 'upload-button';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ply,.obj';
    fileInput.style.display = 'none';
    
    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'ply' || fileExtension === 'obj') {
          if (file.size > 500 * 1024 * 1024) {
            alert('El archivo es muy grande. Esto puede causar problemas de rendimiento.');
          }
          
          const objectURL = URL.createObjectURL(file);
          const modelPath = `${objectURL}#${file.name}`;
          
          // Agregar el nuevo modelo al selector
          const option = document.createElement('option');
          option.value = modelPath;
          option.textContent = file.name;
          select.appendChild(option);
          select.value = modelPath;
          
          this.loadModel(modelPath);
          
          // Cerrar el menú después de cargar
          sideMenu.classList.remove('open');
          menuButton.classList.remove('active');
        } else {
          alert('Por favor, selecciona un archivo PLY u OBJ válido');
        }
      }
    });
    
    // Ensamblar el menú
    modelContainer.appendChild(label);
    modelContainer.appendChild(select);
    uploadContainer.appendChild(uploadButton);
    uploadContainer.appendChild(fileInput);
    
    menuContent.appendChild(modelContainer);
    menuContent.appendChild(uploadContainer);
    sideMenu.appendChild(menuContent);

    // Toggle del menú
    menuButton.addEventListener('click', () => {
      sideMenu.classList.toggle('open');
      menuButton.classList.toggle('active');
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!sideMenu.contains(e.target) && !menuButton.contains(e.target)) {
        sideMenu.classList.remove('open');
        menuButton.classList.remove('active');
      }
    });

    // Agregar elementos al DOM
    document.body.appendChild(menuButton);
    document.body.appendChild(sideMenu);

    // Estilos CSS
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --primary-color: #4CAF50;
        --primary-dark: #45a049;
        --background: #0a0a0a;
        --surface: rgba(20, 20, 20, 0.7);
        --border: #444;
        --text: rgba(255, 255, 255, 0.92);
        --shadow: rgba(0, 255, 0, 0.1);
      }

      .hamburger-menu {
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1000;
        width: 3rem;
        height: 3rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }

      .hamburger-menu:hover {
        background: rgba(30, 30, 30, 0.7);
      }

      .hamburger-box {
        width: 1.5rem;
        height: 1.25rem;
        position: relative;
        display: inline-block;
      }

      .hamburger-inner,
      .hamburger-inner::before,
      .hamburger-inner::after {
        width: 100%;
        height: 2px;
        background-color: var(--text);
        position: absolute;
        left: 0;
        transition: all 0.3s ease;
      }

      .hamburger-inner {
        top: 50%;
        transform: translateY(-50%);
      }

      .hamburger-inner::before {
        content: '';
        top: -8px;
      }

      .hamburger-inner::after {
        content: '';
        bottom: -8px;
      }

      .hamburger-menu.active .hamburger-inner {
        transform: rotate(45deg);
      }

      .hamburger-menu.active .hamburger-inner::before {
        transform: rotate(-90deg);
        top: 0;
      }

      .hamburger-menu.active .hamburger-inner::after {
        transform: rotate(-90deg);
        bottom: 0;
      }

      .side-menu {
        position: fixed;
        top: 0;
        left: -320px;
        width: 320px;
        height: 100vh;
        background: var(--surface);
        border-right: 2px solid var(--border);
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
        z-index: 999;
        overflow-y: auto;
        backdrop-filter: blur(5px);
      }

      .side-menu.open {
        transform: translateX(320px);
      }

      .menu-content {
        padding: 5rem 1.5rem 1.5rem;
      }

      .menu-content h3 {
        margin: 0 0 1.5rem;
        color: #e0ffe0;
        font-size: 1.25rem;
        font-weight: 500;
        text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
      }

      .model-selector-container {
        margin-bottom: 1.5rem;
      }

      .model-label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text);
        font-size: 0.875rem;
      }

      .model-select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: var(--text);
        background: #333;
        transition: all 0.3s ease;
      }

      .model-select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
      }

      .upload-button {
        width: 100%;
        padding: 0.75rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .upload-button:hover {
        background: var(--primary-dark);
      }

      @media (max-width: 768px) {
        .side-menu {
          width: 280px;
          left: -280px;
        }
        
        .side-menu.open {
          transform: translateX(280px);
        }

        .menu-content {
          padding: 4rem 1rem 1rem;
        }

        .hamburger-menu {
          top: 0.75rem;
          left: 0.75rem;
          width: 2.5rem;
          height: 2.5rem;
        }
      }

      @media (max-width: 480px) {
        .side-menu {
          width: 260px;
          left: -260px;
        }
        
        .side-menu.open {
          transform: translateX(260px);
        }
      }
    `;

    document.head.appendChild(style);

    // Cargar el modelo por defecto
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

  startShelfStatusPolling() {
    const POLLING_INTERVAL = 5 * 60 * 1000;
    let pollTimeoutId = null;
    const occupationBoxes = new Map();

    const updateShelfStatus = (shelf, isOccupied, sensorValue) => {
      if (!shelf) return;

      console.log(`[Shelf ${shelf.name}] Estado:`, {
        ocupado: isOccupied,
        valorSensor: sensorValue,
        umbral: 50,
        mensaje: isOccupied ? '⚠️ ESTANTE OCUPADO ⚠️' : '✅ ESTANTE DISPONIBLE'
      });
      
      let occupationBox = occupationBoxes.get(shelf.name);
      
      if (isOccupied) {
        if (!occupationBox) {
          console.log(`[Shelf ${shelf.name}] Creando indicador visual de ocupación`);
          const shelfBox = new THREE.Box3().setFromObject(shelf);
          const boxSize = shelfBox.getSize(new THREE.Vector3());
          const boxGeometry = new THREE.BoxGeometry(
            boxSize.x * 0.9,
            boxSize.y * 0.9,
            boxSize.z * 0.9
          );
          const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0x2196f3,
            transparent: true,
            opacity: 0.7,
            roughness: 0.3,
            metalness: 0.5
          });
          
          occupationBox = new THREE.Mesh(boxGeometry, boxMaterial);
          occupationBox.position.copy(shelf.position);
          
          this.scene.add(occupationBox);
          occupationBoxes.set(shelf.name, occupationBox);
        }
      } else {
        if (occupationBox) {
          console.log(`[Shelf ${shelf.name}] Removiendo indicador visual de ocupación`);
          this.scene.remove(occupationBox);
          occupationBoxes.delete(shelf.name);
        }
      }
    };

    const pollShelfStatus = async () => {
      try {
        console.log(`\n[${new Date().toISOString()}] Consultando estado de estantes...`);
        
        const response = await fetch('https://coldstoragehub.onrender.com/api/mongodb/readings/proximity?unitId=1', {
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('\n[API Response]:', JSON.stringify(data, null, 2));
        
        // Procesar los sensores de proximidad
        const proximity1Value = data.proximity1?.value || 100;
        const proximity2Value = data.proximity2?.value || 100;
        
        const shelf3Occupied = proximity1Value < 50;
        const shelf6Occupied = proximity2Value < 50;
        
        console.log('\n[Análisis de Sensores]', {
          proximity1: {
            valor: proximity1Value,
            umbral: 50,
            ocupado: shelf3Occupied
          },
          proximity2: {
            valor: proximity2Value,
            umbral: 50,
            ocupado: shelf6Occupied
          }
        });

        if (this.currentModel) {
          const shelf3 = this.currentModel.getObjectByName('shelf_3');
          const shelf6 = this.currentModel.getObjectByName('shelf_6');
          
          updateShelfStatus(shelf3, shelf3Occupied, proximity1Value);
          updateShelfStatus(shelf6, shelf6Occupied, proximity2Value);

          if (shelf3Occupied || shelf6Occupied) {
            console.log('\n⚠️ ALERTA: Hay estantes ocupados ⚠️');
            console.table({
              'Estante 3': { estado: shelf3Occupied ? 'OCUPADO' : 'DISPONIBLE', valor: proximity1Value },
              'Estante 6': { estado: shelf6Occupied ? 'OCUPADO' : 'DISPONIBLE', valor: proximity2Value }
            });
          }
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error en consulta:`, error);
      } finally {
        pollTimeoutId = setTimeout(pollShelfStatus, POLLING_INTERVAL);
      }
    };
    
    // Iniciar el polling
    pollShelfStatus();

    return () => {
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
    };
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const viewer = new ModelViewer('viewer-container');
  
  // Iniciar solo con el modelo del estante
  const staticModels = [
    { name: 'Estante', path: './models/Shelf.obj' },
    { name: 'Silla', path: './models/Silla.ply' }
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