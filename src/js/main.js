import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import io from 'socket.io-client';

class ModelViewer {
  constructor(containerId = 'viewer-container') {
    this.container = document.getElementById(containerId) || document.body;
    this.currentModel = null;
    this.shoes = {};
    this.occupancyBox = null;
    this.temp = null;
    this.hum = null;
    this.sensorBuffer = {
      proximity1: null,
      proximity2: null,
      proximity3: null,
      proximity4: null,
      proximity5: null,
      proximity6: null,
      temperature: null,
      humidity: null
    };
    this.lastUpdateTime = null;
    this.initScene();
    this.initLights();
    this.initControls();
    this.setupEventListeners();
    this.loadShelfModel();
    
    // Setup message listener for embedded mode
    window.addEventListener('message', (event) => {
      // Verify origin if needed
      // if (event.origin !== "https://your-parent-domain.com") return;
      
      if (event.data.type === 'updateSensors') {
        this.updateShoesState(event.data.sensorData);
      }
    });
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = new THREE.Fog(0xffffff, 1, 30);
    const roomSize = 40;
    const gridHelper = new THREE.GridHelper(roomSize, 40, 0xcccccc, 0xe6e6e6);
    gridHelper.position.y = -1.4;
    this.scene.add(gridHelper);
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
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(5.10, 4.85, 9.99);
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
    try {
      console.log(`[${new Date().toISOString()}] Cargando modelo desde: ./models/Shelf.obj`);
      const mesh = await new Promise((resolve, reject) => {
        loader.load(
          './models/Shelf.obj',
          (mesh) => {
            console.log(`[${new Date().toISOString()}] Modelo cargado exitosamente`);
            resolve(mesh);
          },
          (xhr) => {
            console.log(`[${new Date().toISOString()}] ${(xhr.loaded / xhr.total * 100)}% cargado`);
          },
          (error) => {
            console.error(`[${new Date().toISOString()}] Error cargando modelo:`, error);
            reject(error);
          }
        );
      });

      // Crear un nuevo material básico
      const basicMaterial = new THREE.MeshBasicMaterial({
        color: 0x808080,
        side: THREE.DoubleSide
      });

      // Aplicar el material a todos los meshes
            mesh.traverse((child) => {
              if (child instanceof THREE.Mesh) {
          // Limpiar materiales antiguos
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat && typeof mat.dispose === 'function') {
                  mat.dispose();
                }
              });
            } else if (typeof child.material.dispose === 'function') {
              child.material.dispose();
            }
          }
          
          // Asignar nuevo material
          child.material = basicMaterial.clone();
          
          // Asegurarse de que la geometría tenga normales
          if (child.geometry) {
            if (!child.geometry.attributes.normal) {
              child.geometry.computeVertexNormals();
            }
          }
        }
      });

      mesh.scale.set(0.005, 0.005, 0.005);
      const bbox = new THREE.Box3().setFromObject(mesh);
      mesh.position.y = -bbox.min.y * mesh.scale.y + 8.529;
          this.scene.add(mesh);
          this.currentModel = mesh;
          
      // Inicializar zapatos y sensores
      console.log(`[${new Date().toISOString()}] Inicializando zapatos...`);
      await this.initializeShoes();
      
      // Primero obtener el estado inicial de MongoDB
      console.log(`[${new Date().toISOString()}] Consultando estado inicial de sensores en MongoDB...`);
      await this.fetchInitialSensorState();
      
      // Después de obtener el estado inicial, configurar Socket.IO
      console.log(`[${new Date().toISOString()}] Configurando Socket.IO para actualizaciones en tiempo real...`);
      this.setupWebSocket();
        } catch (error) {
      console.error(`[${new Date().toISOString()}] Error loading shelf model:`, error);
    }
  }

  async initializeShoes() {
    const shoeConfig = [
      { id: 'shoe_1', color: 0xff0000, yPosition: 7.908, sensorType: 'proximity1' },  // Estante superior
      { id: 'shoe_2', color: 0x00ff00, yPosition: 6.8, sensorType: 'proximity3' },  // Estante 2
      { id: 'shoe_3', color: 0x0000ff, yPosition: 5.7, sensorType: 'proximity2' },  // Estante 3
      { id: 'shoe_4', color: 0xffff00, yPosition: 4.65, sensorType: 'proximity4' },  // Estante 4
      { id: 'shoe_5', color: 0xff00ff, yPosition: 3.45, sensorType: 'proximity5' },  // Estante 5
      { id: 'shoe_6', color: 0x00ffff, yPosition: 2.4023, sensorType: 'proximity6' }   // Estante inferior
    ];

    for (const config of shoeConfig) {
      await this.createShoe(config);
    }
  }

  createShoe(config) {
    return new Promise((resolve) => {
      const loader = new PLYLoader();
      console.log('Cargando zapato desde:', './models/Shoe.ply');
      loader.load(
        './models/Shoe.ply',
        (geometry) => {
          console.log('Zapato cargado exitosamente');
          geometry.computeVertexNormals();
          geometry.center();
          
          const material = new THREE.MeshBasicMaterial({
            color: config.color,
            side: THREE.DoubleSide
          });
          
          const shoe = new THREE.Mesh(geometry, material);
          shoe.name = config.id;
          shoe.userData.sensorType = config.sensorType; // Guardar el tipo de sensor
          shoe.scale.set(0.0237, 0.0237, 0.0237);
          shoe.position.set(0, config.yPosition, 0);
          shoe.visible = false;
          this.scene.add(shoe);
          this.shoes[config.id] = shoe;
          resolve(shoe);
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% cargado');
      },
      (error) => {
          console.error('Error cargando zapato:', error);
        }
      );
    });
  }

  updateShoesState(sensorData) {
    // Actualizar cada zapato según su sensor correspondiente
    Object.entries(this.shoes).forEach(([shoeId, shoe]) => {
      const sensorType = shoe.userData.sensorType;
      const oldVisible = shoe.visible;
      if (sensorData[sensorType] !== undefined) {
        shoe.visible = sensorData[sensorType] < 39;
        if (oldVisible !== shoe.visible) {
          console.log(`[${new Date().toISOString()}] 👞 Zapato ${shoeId} (${sensorType}) ${shoe.visible ? 'visible' : 'oculto'} - Valor: ${sensorData[sensorType]}`);
        }
      }
    });

    // Actualizar el box de ocupación
    const occupiedShelves = Object.entries(this.shoes)
      .filter(([_, shoe]) => shoe.visible)
      .length;

    this.showShelfOccupancyBox(
      occupiedShelves,
      this.temp,
      this.hum
    );
  }

  showShelfOccupancyBox(occupiedShelves, temp = null, hum = null) {
    if (!this.occupancyBox) {
      this.occupancyBox = document.createElement('div');
      this.occupancyBox.className = 'occupancy-box';
      this.occupancyBox.style.position = 'absolute';
      this.occupancyBox.style.top = '1rem';
      this.occupancyBox.style.right = '1rem';
      this.occupancyBox.style.background = 'rgba(30,30,30,0.92)';
      this.occupancyBox.style.color = '#fff';
      this.occupancyBox.style.padding = '1.2rem 1.5rem';
      this.occupancyBox.style.borderRadius = '12px';
      this.occupancyBox.style.fontFamily = 'monospace';
      this.occupancyBox.style.fontSize = '1rem';
      this.occupancyBox.style.zIndex = 2000;
      this.occupancyBox.style.boxShadow = '0 2px 10px rgba(0,0,0,0.25)';
      this.occupancyBox.style.maxWidth = '90vw';
      this.occupancyBox.style.wordBreak = 'break-word';
      this.occupancyBox.style.display = 'flex';
      this.occupancyBox.style.flexDirection = 'column';
      this.occupancyBox.style.alignItems = 'flex-start';
      this.occupancyBox.style.gap = '0.5rem';
      (this.container || document.body).appendChild(this.occupancyBox);
    }

    const totalEstantes = 6;
    const volumenPorEstante = 0.025;
    const metrosUsados = occupiedShelves * volumenPorEstante;
    const porcentaje = ((metrosUsados / (totalEstantes * volumenPorEstante)) * 100).toFixed(1);
    
    let html = '';
    if (occupiedShelves > 0) {
      html += `<div><b>Estantes ocupados:</b> ${occupiedShelves}</div>`;
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

  async fetchInitialSensorState() {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'viewerReady' }, '*');
    }
    
    try {
      console.log(`[${new Date().toISOString()}] Realizando fetch a MongoDB...`);
      const response = await fetch('https://coldstoragehub.onrender.com/api/mongodb/readings/proximity?unitId=1');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Datos recibidos de MongoDB:`, data);
      
      const sensorData = {
        proximity1: data.proximity1?.value,
        proximity2: data.proximity2?.value,
        proximity3: data.proximity3?.value,
        proximity4: data.proximity4?.value,
        proximity5: data.proximity5?.value,
        proximity6: data.proximity6?.value
      };
      
      console.log(`[${new Date().toISOString()}] Estado inicial de sensores:`, sensorData);
      this.updateShoesState(sensorData);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error al obtener estado inicial de sensores:`, error);
      this.updateShoesState({
        proximity1: 100,
        proximity2: 100,
        proximity3: 100,
        proximity4: 100,
        proximity5: 100,
        proximity6: 100
      });
    }
  }

  setupWebSocket() {
    console.log(`[${new Date().toISOString()}] Iniciando conexión Socket.IO...`);
    
    // Cargar Socket.IO dinámicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    script.onload = () => {
      this.socket = io('https://coldstoragehub.onrender.com');
      
      this.socket.on('connect', () => {
        console.log(`[${new Date().toISOString()}] Conexión Socket.IO establecida`);
      });

      this.socket.on('mqtt-message', (data) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] 📡 Mensaje recibido:`, {
          topic: data.topic,
          value: data.message.value,
          timestamp: data.message.timestamp
        });

        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'sensorUpdate',
            topic: data.topic,
            data: data.message
          }, '*');
        }

        // Actualizar el buffer de sensores
        const sensorType = data.topic.split('/').pop();
        this.sensorBuffer[sensorType] = {
          value: data.message.value,
          timestamp: data.message.timestamp
        };

        // Verificar si tenemos un conjunto completo de lecturas
        const now = Date.now();
        const hasAllReadings = Object.values(this.sensorBuffer).every(reading => reading !== null);
        const timeSinceLastUpdate = this.lastUpdateTime ? now - this.lastUpdateTime : Infinity;
        
        if (hasAllReadings && timeSinceLastUpdate >= 1000) { // Actualizar cada segundo como máximo
          console.log(`[${timestamp}] 📊 Conjunto completo de lecturas recibido:`, this.sensorBuffer);
          
          // Crear objeto de estado con los valores actuales
          const currentState = {
            proximity1: this.sensorBuffer.proximity1.value,
            proximity2: this.sensorBuffer.proximity2.value,
            proximity3: this.sensorBuffer.proximity3.value,
            proximity4: this.sensorBuffer.proximity4.value,
            proximity5: this.sensorBuffer.proximity5.value,
            proximity6: this.sensorBuffer.proximity6.value
          };

          // Actualizar temperatura y humedad
          this.temp = this.sensorBuffer.temperature.value;
          this.hum = this.sensorBuffer.humidity.value;

          // Log del estado actual de los zapatos
          console.log(`[${timestamp}] 👞 Estado actual de zapatos:`, 
            Object.entries(this.shoes).map(([id, shoe]) => ({
              id,
              sensorType: shoe.userData.sensorType,
              visible: shoe.visible,
              value: currentState[shoe.userData.sensorType]
            }))
          );

          // Actualizar estado de los zapatos
          this.updateShoesState(currentState);
          
          // Actualizar el box de ocupación
          this.showShelfOccupancyBox(
            Object.values(this.shoes).filter(shoe => shoe.visible).length,
            this.temp,
            this.hum
          );

          this.lastUpdateTime = now;
        }
      });

      this.socket.on('disconnect', () => {
        console.log(`[${new Date().toISOString()}] Conexión Socket.IO cerrada`);
      });

      this.socket.on('connect_error', (error) => {
        console.error(`[${new Date().toISOString()}] Error de conexión Socket.IO:`, error);
      });
    };
    document.head.appendChild(script);
  }
  
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const viewer = new ModelViewer('viewer-container');
  viewer.animate();
  window.modelViewer = viewer;
});