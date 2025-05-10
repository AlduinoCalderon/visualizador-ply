import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupWebSocket, subscribeSensor } from './mqtt-setup.js';

class EmbeddedViewer {
  constructor(containerId = 'viewer-container') {
    this.container = document.getElementById(containerId) || document.body;
    this.currentModel = null;
    this.isShelfModel = true; // Siempre será shelf
    
    this.initScene();
    this.initLights();
    this.initControls();
    this.setupEventListeners();
    this.loadShelfModel();
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
      color: 0xe0e0e0,
      side: THREE.FrontSide,
      roughness: 0.8,
      metalness: 0.1
    });
    const backWallMesh = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWallMesh.position.z = -roomSize/4;
    backWallMesh.position.y = roomSize/4 - 1.4;
    this.scene.add(backWallMesh);

    // Cámara
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(5.10, 4.85, 9.99);
    
    // Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.scene.add(hemisphereLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(1, 1, 2);
    this.scene.add(mainLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 1, -1);
    this.scene.add(backLight);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 20;
    this.controls.target.set(1.28, 3.82, 0.12);
    
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };

    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.5;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }

  async loadShelfModel() {
    const loader = new OBJLoader();
    loader.load('./models/Shelf.obj', (mesh) => {
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

      mesh.scale.set(0.005, 0.005, 0.005);
      const bbox = new THREE.Box3().setFromObject(mesh);
      mesh.position.y = -bbox.min.y * mesh.scale.y + 8.529;

      this.scene.add(mesh);
      this.currentModel = mesh;
      this.setupSensors();
    });
  }

  setupSensors() {
    let temp = null, hum = null;
    let lastUpdateTimer = null;
    const INITIAL_FALLBACK_TIMEOUT = 25000; // 25 segundos
    let hasCheckedMongo = false;

    // Configuración de zapatos
    const shoeConfig = [
      { id: 'shoe_rojo', color: 0xff0000, yPosition: 4.608 },
      { id: 'shoe_azul', color: 0x0000ff, yPosition: 2.5 }
    ];

    const createShoe = (config) => {
      const loader = new PLYLoader();
      return new Promise((resolve) => {
        loader.load('./models/Shoe.ply', (geometry) => {
          geometry.computeVertexNormals();
          geometry.center();
          const material = new THREE.MeshStandardMaterial({ color: config.color });
          const shoe = new THREE.Mesh(geometry, material);
          shoe.name = config.id;
          shoe.scale.set(0.0237, 0.0237, 0.0237);
          shoe.position.set(0, config.yPosition, 0);
          shoe.visible = false;
          this.scene.add(shoe);
          resolve(shoe);
        });
      });
    };

    const initializeShoes = async () => {
      for (const config of shoeConfig) {
        const shoe = await createShoe(config);
        this[config.id] = shoe;
      }
    };

    const updateShoesState = (sensorData) => {
      if (this.shoeRojo) {
        this.shoeRojo.visible = sensorData.proximity1 < 39;
      }
      if (this.shoeAzul) {
        this.shoeAzul.visible = sensorData.proximity2 < 39;
      }

      this.showShelfOccupancyBox(
        this.shoeRojo && this.shoeRojo.visible,
        this.shoeAzul && this.shoeAzul.visible,
        temp,
        hum
      );
    };

    const resetTimer = () => {
      if (lastUpdateTimer) clearTimeout(lastUpdateTimer);
      
      if (!hasCheckedMongo) {
        lastUpdateTimer = setTimeout(async () => {
          try {
            const response = await fetch('https://coldstoragehub.onrender.com/api/mongodb/readings/proximity?unitId=1', {
              mode: 'cors',
              headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            updateShoesState({
              proximity1: data.proximity1?.value || 100,
              proximity2: data.proximity2?.value || 100
            });
            hasCheckedMongo = true;
          } catch (error) {
            console.error('Error en fallback fetch:', error);
          }
        }, INITIAL_FALLBACK_TIMEOUT);
      }
    };

    initializeShoes().then(() => {
      setupWebSocket();
      
      subscribeSensor('warehouse/unit/1/sensor/proximity1', (message) => {
        updateShoesState({
          proximity1: message.value,
          proximity2: this.shoeAzul ? (this.shoeAzul.visible ? 0 : 100) : 100
        });
        resetTimer();
      });

      subscribeSensor('warehouse/unit/1/sensor/proximity2', (message) => {
        updateShoesState({
          proximity1: this.shoeRojo ? (this.shoeRojo.visible ? 0 : 100) : 100,
          proximity2: message.value
        });
        resetTimer();
      });

      subscribeSensor('warehouse/unit/1/sensor/temperature', (message) => {
        temp = message.value;
        updateShoesState({
          proximity1: this.shoeRojo ? (this.shoeRojo.visible ? 0 : 100) : 100,
          proximity2: this.shoeAzul ? (this.shoeAzul.visible ? 0 : 100) : 100
        });
        resetTimer();
      });

      subscribeSensor('warehouse/unit/1/sensor/humidity', (message) => {
        hum = message.value;
        updateShoesState({
          proximity1: this.shoeRojo ? (this.shoeRojo.visible ? 0 : 100) : 100,
          proximity2: this.shoeAzul ? (this.shoeAzul.visible ? 0 : 100) : 100
        });
        resetTimer();
      });

      resetTimer();
    });
  }

  showShelfOccupancyBox(occupancy1, occupancy2, temp = null, hum = null) {
    if (!this.occupancyBox) {
      this.occupancyBox = document.createElement('div');
      this.occupancyBox.className = 'occupancy-box';
      this.occupancyBox.style.position = 'absolute';
      this.occupancyBox.style.top = '20px';
      this.occupancyBox.style.right = '20px';
      this.occupancyBox.style.background = 'rgba(255, 255, 255, 0.9)';
      this.occupancyBox.style.color = '#333';
      this.occupancyBox.style.padding = '12px 15px';
      this.occupancyBox.style.borderRadius = '8px';
      this.occupancyBox.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      this.occupancyBox.style.fontSize = '14px';
      this.occupancyBox.style.zIndex = '1000';
      this.occupancyBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      this.occupancyBox.style.maxWidth = '300px';
      this.occupancyBox.style.wordBreak = 'break-word';
      this.occupancyBox.style.display = 'flex';
      this.occupancyBox.style.flexDirection = 'column';
      this.occupancyBox.style.alignItems = 'flex-start';
      this.occupancyBox.style.gap = '8px';
      this.occupancyBox.style.backdropFilter = 'blur(4px)';
      this.renderer.domElement.parentElement.appendChild(this.occupancyBox);

      const style = document.createElement('style');
      style.textContent = `
        .occupancy-box .sensor-row {
          display: flex;
          flex-direction: row;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 4px;
          width: 100%;
        }
        .occupancy-box .sensor-item {
          min-width: 80px;
          font-size: 13px;
        }
        .occupancy-box b {
          color: #666;
          font-weight: 500;
        }
      `;
      document.head.appendChild(style);
    }

    const totalEstantes = 10;
    const volumenPorEstante = 0.025; // m³
    let ocupados = 0;
    if (occupancy1) ocupados++;
    if (occupancy2) ocupados++;
    const metrosUsados = ocupados * volumenPorEstante;
    const porcentaje = ((metrosUsados / (totalEstantes * volumenPorEstante)) * 100).toFixed(1);
    
    let html = '';
    if (ocupados > 0) {
      html += `<div><b>Estantes ocupados:</b> ${ocupados}</div>`;
      html += `<div><b>Metros usados:</b> ${metrosUsados.toFixed(3)} m³</div>`;
      html += `<div><b>Porcentaje de ocupación:</b> ${porcentaje}%</div>`;
    }
    if (temp !== null || hum !== null) {
      html += `<div class='sensor-row'>
        <div class='sensor-item'><b>Temp:</b> ${temp !== null ? temp : '--'} °C</div>
        <div class='sensor-item'><b>Humedad:</b> ${hum !== null ? hum : '--'} %</div>
      </div>`;
    }
    this.occupancyBox.innerHTML = html;
    this.occupancyBox.style.display = (html) ? 'block' : 'none';
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    this.currentModel = null;
    this.scene = null;
    this.camera = null;
    this.renderer.dispose();
  }
}

// Inicializar el visor embebido
document.addEventListener('DOMContentLoaded', () => {
  const viewer = new EmbeddedViewer('viewer-container');
  viewer.animate();
  window.embeddedViewer = viewer;
}); 