import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class ModelViewer {
  constructor(containerId = 'viewer-container') {
    this.container = document.getElementById(containerId) || document.body;
    this.currentModel = null;
    this.shoes = {};
    this.occupancyBox = null;
    this.temp = null;
    this.hum = null;
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
      console.log('Cargando modelo desde:', './models/Shelf.obj');
      const mesh = await new Promise((resolve, reject) => {
        loader.load(
          './models/Shelf.obj',
          (mesh) => {
            console.log('Modelo cargado exitosamente');
            resolve(mesh);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% cargado');
          },
          (error) => {
            console.error('Error cargando modelo:', error);
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
      await this.initializeShoes();
      this.fetchInitialSensorState();
      this.setupWebSocket();
    } catch (error) {
      console.error('Error loading shelf model:', error);
    }
  }

  async initializeShoes() {
    const shoeConfig = [
      { id: 'shoe_rojo', color: 0xff0000, yPosition: 4.608 },
      { id: 'shoe_azul', color: 0x0000ff, yPosition: 2.5 }
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
          
          // Crear material básico con color específico
          const material = new THREE.MeshBasicMaterial({
            color: config.color,
            side: THREE.DoubleSide
          });
          
          const shoe = new THREE.Mesh(geometry, material);
          shoe.name = config.id;
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
    if (this.shoes['shoe_rojo']) {
      this.shoes['shoe_rojo'].visible = sensorData.proximity1 < 39;
    }
    if (this.shoes['shoe_azul']) {
      this.shoes['shoe_azul'].visible = sensorData.proximity2 < 39;
    }
    this.showShelfOccupancyBox(
      this.shoes['shoe_rojo'] && this.shoes['shoe_rojo'].visible,
      this.shoes['shoe_azul'] && this.shoes['shoe_azul'].visible,
      this.temp,
      this.hum
    );
  }

  showShelfOccupancyBox(occupancy1, occupancy2, temp = null, hum = null) {
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
    const totalEstantes = 10;
    const volumenPorEstante = 0.025;
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

  fetchInitialSensorState() {
    // Notify parent window that we're ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'viewerReady' }, '*');
    }
    
    fetch('https://coldstoragehub.onrender.com/api/mongodb/readings/proximity?unitId=1')
    .then(response => response.json())
    .then(data => {
      this.updateShoesState({
        proximity1: data.proximity1?.value || 100,
        proximity2: data.proximity2?.value || 100
      });
    })
    .catch(() => {
      this.updateShoesState({ proximity1: 100, proximity2: 100 });
    });
  }

  setupWebSocket() {
    const ws = new WebSocket('wss://coldstoragehub.onrender.com/socket.io/?EIO=4&transport=websocket');
    let buffer = '';
    ws.onmessage = (event) => {
      buffer += event.data;
      if (buffer.includes('{') && buffer.includes('}')) {
        const jsonStr = buffer.substring(buffer.indexOf('{'), buffer.lastIndexOf('}') + 1);
        try {
          const msg = JSON.parse(jsonStr);
          if (msg.topic && msg.data) {
            // Notify parent window of sensor updates
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'sensorUpdate',
                topic: msg.topic,
                data: msg.data
              }, '*');
            }
            
            if (msg.topic.endsWith('proximity1')) {
              this.updateShoesState({
                proximity1: msg.data.value,
                proximity2: this.shoes['shoe_azul'] && this.shoes['shoe_azul'].visible ? 0 : 100
              });
            } else if (msg.topic.endsWith('proximity2')) {
              this.updateShoesState({
                proximity1: this.shoes['shoe_rojo'] && this.shoes['shoe_rojo'].visible ? 0 : 100,
                proximity2: msg.data.value
              });
            } else if (msg.topic.endsWith('temperature')) {
              this.temp = msg.data.value;
              this.showShelfOccupancyBox(
                this.shoes['shoe_rojo'] && this.shoes['shoe_rojo'].visible,
                this.shoes['shoe_azul'] && this.shoes['shoe_azul'].visible,
                this.temp,
                this.hum
              );
            } else if (msg.topic.endsWith('humidity')) {
              this.hum = msg.data.value;
              this.showShelfOccupancyBox(
                this.shoes['shoe_rojo'] && this.shoes['shoe_rojo'].visible,
                this.shoes['shoe_azul'] && this.shoes['shoe_azul'].visible,
                this.temp,
                this.hum
              );
            }
          }
        } catch (e) { /* ignorar parseos fallidos */ }
        buffer = '';
      }
    };
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