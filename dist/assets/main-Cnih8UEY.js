import{s as V,a as A}from"./mqtt-setup-A007qq7Q.js";import{m as G,C as U,n as _,o as J,p as k,q as L,r as R,f as E,b as I,B as T,s as Y,d as N,t as X,W as q,A as K,H as Q,D as W,h as O,u as z,V as m,l as Z,v as ee}from"./three-s0w8xr1i.js";import{P as D,O as oe}from"./loaders-Cem-VtSN.js";import{O as te}from"./controls-BycUIGfH.js";class se{constructor(s="viewer-container"){this.container=document.getElementById(s)||document.body,this.currentModel=null,this.isEmbedded=window.location.pathname.includes("/embedded"),this.coordsDisplay=document.createElement("div"),this.coordsDisplay.className="coords-display",this.coordsDisplay.style.display="none",document.body.appendChild(this.coordsDisplay),this.initScene(),this.initLights(),this.initControls(),this.setupEventListeners()}initScene(){this.scene=new G,this.scene.background=new U(16777215),this.scene.fog=new _(16777215,1,30);const s=40,t=new J(s,40,13421772,15132390);t.position.y=-1.4,this.scene.add(t);const i=new k(s,s/2),d=new L({color:14737632,side:R,roughness:.8,metalness:.1}),h=new E(i,d);h.position.z=-40/4,h.position.y=s/4-1.4,this.scene.add(h);const p=new k(s/20,s/2),n=new L({color:0,transparent:!0,opacity:.15,side:R}),e=new E(p,n);e.position.set(-40/2+s/40,s/4-1.4,-40/4+.01),this.scene.add(e);const o=new E(p,n);o.position.set(s/2-s/40,s/4-1.4,-40/4+.01),this.scene.add(o);const r=new I({color:15132390,transparent:!0,opacity:.3}),l=[],c=20,f=s/c,a=s/2;l.push(new m(-40/2,a,-40/2),new m(s/2,a,-40/2)),l.push(new m(-40/2,a/2,-40/2),new m(s/2,a/2,-40/2));for(let b=0;b<=c;b++){const y=-20+b*f,M=.1+b/c*.2,x=new I({color:15132390,transparent:!0,opacity:M}),C=[];C.push(new m(y,-1.4,-40/2),new m(y,a,-40/2));const v=new T().setFromPoints(C),F=new Y(v,x);this.scene.add(F)}const u=new T().setFromPoints(l),g=new N(u,r);this.scene.add(g);const w=[],S=4;for(let b=0;b<=S;b++){const y=b/S*a;w.push(new m(-40/2,y,-40/2),new m(-40/2,y,s/4),new m(s/2,y,-40/2),new m(s/2,y,s/4))}const B=new T().setFromPoints(w),P=new N(B,r);this.scene.add(P),this.camera=new X(60,this.container.clientWidth/this.container.clientHeight,.1,1e3),this.camera.position.set(0,2,8),this.renderer=new q({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setPixelRatio(window.devicePixelRatio),this.container.appendChild(this.renderer.domElement)}initLights(){const s=new K(4210752,.5);this.scene.add(s);const t=new Q(16777215,4473924,.8);this.scene.add(t);const i=new W(16777215,1);i.position.set(1,1,2),this.scene.add(i);const d=new W(16777215,.3);d.position.set(0,1,-1),this.scene.add(d)}initControls(){this.controls=new te(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.05,this.controls.rotateSpeed=.5,this.controls.minDistance=4,this.controls.maxDistance=20,this.controls.mouseButtons={LEFT:O.ROTATE,MIDDLE:O.DOLLY,RIGHT:O.PAN},this.controls.minPolarAngle=0,this.controls.maxPolarAngle=Math.PI,this.controls.minAzimuthAngle=-1/0,this.controls.maxAzimuthAngle=1/0,this.controls.enablePan=!0,this.controls.panSpeed=.5,this.controls.addEventListener("change",()=>{this.currentModel&&this.updateCoordinatesDisplay()})}setupEventListeners(){window.addEventListener("resize",()=>{this.camera.aspect=this.container.clientWidth/this.container.clientHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight)})}loadModel(s){console.log("Iniciando carga de modelo:",s);const t=document.createElement("div");t.className="loading",t.textContent="Cargando modelo...",this.container.appendChild(t),this.currentModel&&this.scene.remove(this.currentModel);const i=s.split("#").pop().split(".").pop().toLowerCase(),d=s.split("/").pop().split("#")[0];console.log("Cargando:",d,"Extensión:",i);let h;if(i==="ply")h=new D;else if(i==="obj")h=new oe;else{console.error("Formato de archivo no soportado:",i),t.textContent="Formato de archivo no soportado",setTimeout(()=>{this.container.removeChild(t)},2e3);return}const p=setTimeout(()=>{t.textContent="El archivo es grande, esto puede tomar unos minutos..."},5e3);h.load(s.split("#")[0],n=>{clearTimeout(p);let e;if(i==="ply"){t.textContent="Procesando geometría...";try{n.computeVertexNormals(),n.center();const a=new L({color:8421504,flatShading:!1,roughness:.7,metalness:.3});e=new E(n,a)}catch(a){console.error("Error procesando geometría PLY:",a),t.textContent="Error procesando el modelo PLY.",setTimeout(()=>{this.container.removeChild(t)},5e3);return}}else if(i==="obj"){t.textContent="Procesando modelo OBJ...";try{e=n,e.traverse(a=>{a instanceof E&&(a.material=new L({color:8421504,flatShading:!1,roughness:.7,metalness:.3}))})}catch(a){console.error("Error procesando modelo OBJ:",a),t.textContent="Error procesando el modelo OBJ.",setTimeout(()=>{this.container.removeChild(t)},5e3);return}}if(d.toLowerCase().includes("silla")||d.toLowerCase().includes("shelf")){if(e.scale.set(.005,.005,.005),console.log("Aplicando escala fija para silla/estante:",e.scale),d.toLowerCase().includes("shelf")){const a=new z().setFromObject(e);e.position.y=-a.min.y*e.scale.y+8.529}}else{const u=new z().setFromObject(e).getSize(new m),w=1/Math.max(u.x,u.y,u.z);e.scale.set(w,w,w),console.log("Aplicando escala proporcional:",e.scale)}const o=new z().setFromObject(e),r=o.getCenter(new m);e.position.x=-r.x,e.position.z=-r.z,d.toLowerCase().includes("shelf")||(e.position.y=-o.min.y*e.scale.y),this.scene.add(e),this.currentModel=e;const l=new z().setFromObject(e),c=new m;l.getSize(c);const f=new m;if(l.getCenter(f),this.isShelfModel=d.toLowerCase().includes("shelf"),this.isShelfModel){this.camera.position.set(5.1,4.85,9.99),this.controls.target.set(1.28,3.82,.12),this.addDraggableShoe(4.608);let a=null,u=null,g=null;const w=25e3;let S=!1;const B=[{id:"shoe_rojo",color:16711680,yPosition:4.608},{id:"shoe_azul",color:255,yPosition:2.5}],P=x=>{const C=new D;return new Promise(v=>{C.load("./models/Shoe.ply",F=>{F.computeVertexNormals(),F.center();const H=new L({color:x.color}),$=new E(F,H);$.name=x.id,$.scale.set(.0237,.0237,.0237),$.position.set(0,x.yPosition,0),$.visible=!1,this.scene.add($),v($)})})},b=async()=>{const x=[];for(const C of B){const v=await P(C);x.push(v)}return x},y=x=>{this.isShelfModel&&(this.shoeRojo&&(this.shoeRojo.visible=x.proximity1<39),this.shoeAzul&&(this.shoeAzul.visible=x.proximity2<39),this.showShelfOccupancyBox(this.shoeRojo&&this.shoeRojo.visible,this.shoeAzul&&this.shoeAzul.visible,a,u))},M=()=>{g&&clearTimeout(g),S||(g=setTimeout(async()=>{var x,C;try{const v=await fetch("https://coldstoragehub.onrender.com/api/mongodb/readings/proximity?unitId=1",{mode:"cors",headers:{Accept:"application/json"}});if(!v.ok)throw new Error(`Error HTTP: ${v.status}`);const F=await v.json();y({proximity1:((x=F.proximity1)==null?void 0:x.value)||100,proximity2:((C=F.proximity2)==null?void 0:C.value)||100}),S=!0}catch(v){console.error("Error en fallback fetch:",v)}},w))};b().then(()=>{V(),A("warehouse/unit/1/sensor/proximity1",x=>{this.isShelfModel&&(y({proximity1:x.value,proximity2:this.shoeAzul&&this.shoeAzul.visible?0:100}),M())}),A("warehouse/unit/1/sensor/proximity2",x=>{this.isShelfModel&&(y({proximity1:this.shoeRojo&&this.shoeRojo.visible?0:100,proximity2:x.value}),M())}),A("warehouse/unit/1/sensor/temperature",x=>{this.isShelfModel&&(a=x.value,y({proximity1:this.shoeRojo&&this.shoeRojo.visible?0:100,proximity2:this.shoeAzul&&this.shoeAzul.visible?0:100}),M())}),A("warehouse/unit/1/sensor/humidity",x=>{this.isShelfModel&&(u=x.value,y({proximity1:this.shoeRojo&&this.shoeRojo.visible?0:100,proximity2:this.shoeAzul&&this.shoeAzul.visible?0:100}),M())}),M()})}else d.toLowerCase().includes("silla")?(this.camera.position.set(.16,2.45,4.31),this.controls.target.set(.16,.53,.8),this.occupancyBox&&(this.occupancyBox.style.display="none"),this.coordsDisplay&&(this.coordsDisplay.style.display="none"),this.shoeRojo&&(this.shoeRojo.visible=!1),this.shoeAzul&&(this.shoeAzul.visible=!1)):(this.occupancyBox&&(this.occupancyBox.style.display="none"),this.coordsDisplay&&(this.coordsDisplay.style.display="none"),this.shoeRojo&&(this.shoeRojo.visible=!1),this.shoeAzul&&(this.shoeAzul.visible=!1));this.camera.updateProjectionMatrix(),this.controls.update(),this.container.removeChild(t)},n=>{const e=n.loaded/n.total*100;t.textContent=`Cargando: ${Math.round(e)}%`},n=>{clearTimeout(p),console.error("Error cargando modelo:",n),t.textContent="Error al cargar el modelo.",setTimeout(()=>{this.container.removeChild(t)},5e3)})}createModelSelector(s){if(this.isEmbedded){const a=s.find(u=>u.name==="Estante");a&&this.loadModel(a.path);return}const t=document.createElement("button");t.className="hamburger-menu",t.innerHTML=`
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    `;const i=document.createElement("div");i.className="side-menu";const d=document.createElement("div");d.className="menu-content";const h=document.createElement("h3");h.textContent="Selección de Modelo",d.appendChild(h);const p=document.createElement("button");p.textContent="Ver métricas",p.className="metrics-toggle-button",p.style.marginBottom="1rem",p.onclick=()=>{this.coordsDisplay.style.display==="none"?this.coordsDisplay.style.display="flex":this.coordsDisplay.style.display="none"},d.appendChild(p);const n=document.createElement("div");n.className="model-selector-container";const e=document.createElement("label");e.textContent="Modelo 3D:",e.className="model-label";const o=document.createElement("select");o.id="model-selector",o.className="model-select",s.forEach(a=>{const u=document.createElement("option");u.value=a.path,u.textContent=a.name,o.appendChild(u)}),o.addEventListener("change",a=>{this.loadModel(a.target.value),i.classList.remove("open"),t.classList.remove("active")});const r=document.createElement("div");r.className="upload-container";const l=document.createElement("button");l.textContent="Cargar modelo local",l.className="upload-button";const c=document.createElement("input");c.type="file",c.accept=".ply,.obj",c.style.display="none",l.addEventListener("click",()=>{c.click()}),c.addEventListener("change",a=>{const u=a.target.files[0];if(u){const g=u.name.split(".").pop().toLowerCase();if(g==="ply"||g==="obj"){u.size>500*1024*1024&&alert("El archivo es muy grande. Esto puede causar problemas de rendimiento.");const S=`${URL.createObjectURL(u)}#${u.name}`,B=document.createElement("option");B.value=S,B.textContent=u.name,o.appendChild(B),o.value=S,this.loadModel(S),i.classList.remove("open"),t.classList.remove("active")}else alert("Por favor, selecciona un archivo PLY u OBJ válido")}}),n.appendChild(e),n.appendChild(o),r.appendChild(l),r.appendChild(c),d.appendChild(n),d.appendChild(r),i.appendChild(d),t.addEventListener("click",()=>{i.classList.toggle("open"),t.classList.toggle("active")}),document.addEventListener("click",a=>{!i.contains(a.target)&&!t.contains(a.target)&&(i.classList.remove("open"),t.classList.remove("active"))}),document.body.appendChild(t),document.body.appendChild(i);const f=document.createElement("style");f.textContent=`
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

      .coords-display {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1rem;
        color: var(--text);
        font-family: monospace;
        font-size: 0.875rem;
        backdrop-filter: blur(5px);
        z-index: 1000;
        display: flex;
        gap: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }

      .coords-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .coords-title {
        color: #e0ffe0;
        font-weight: bold;
        margin-bottom: 0.25rem;
        text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
      }

      @media (max-width: 768px) {
        .coords-display {
          bottom: 0.5rem;
          right: 0.5rem;
          font-size: 0.75rem;
          padding: 0.75rem;
          gap: 1rem;
        }
      }

      @media (max-width: 480px) {
        .coords-display {
          flex-direction: column;
          gap: 0.5rem;
          max-width: calc(100% - 2rem);
        }
      }
    `,document.head.appendChild(f),s.length>0&&this.loadModel(s[0].path)}animate(){this.animationFrameId=requestAnimationFrame(this.animate.bind(this)),this.controls.update(),this.updateCoordinatesDisplay(),this.renderer.render(this.scene,this.camera)}updateCoordinatesDisplay(){if(!this.coordsDisplay)return;let s="";const t=this.camera.position,i=this.controls.target,d=new m;this.camera.getWorldDirection(d);const h=new m().subVectors(t,i).length(),p=Z.radToDeg(Math.atan2(t.y-i.y,new m(t.x-i.x,0,t.z-i.z).length()));if(s+=`
      <div class="coords-group">
        <div class="coords-title">Camera</div>
        <div class="coord-value">Position: ${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)}</div>
        <div class="coord-value">Target: ${i.x.toFixed(2)}, ${i.y.toFixed(2)}, ${i.z.toFixed(2)}</div>
        <div class="coord-value">Distance: ${h.toFixed(2)} units</div>
        <div class="coord-value">Vertical Angle: ${p.toFixed(1)}°</div>
        <div class="coord-value">FOV: ${this.camera.fov.toFixed(1)}°</div>
        <div class="coord-value">Aspect: ${this.camera.aspect.toFixed(3)}</div>
      </div>
    `,this.currentModel){const n=new z().setFromObject(this.currentModel),e=new m;n.getSize(e);const o=new m;n.getCenter(o);const r=e.x*e.y*e.z,l=new m,c=new m;this.currentModel.updateMatrixWorld(!0),this.currentModel.getWorldPosition(l),this.currentModel.getWorldScale(c),s+=`
        <div class="coords-group">
          <div class="coords-title">Model</div>
          <div class="coord-value">Position: ${l.x.toFixed(3)}, ${l.y.toFixed(3)}, ${l.z.toFixed(3)}</div>
          <div class="coord-value">Dimensions: ${e.x.toFixed(3)} × ${e.y.toFixed(3)} × ${e.z.toFixed(3)}</div>
          <div class="coord-value">Volume: ${r.toFixed(3)} cubic units</div>
          <div class="coord-value">Center: ${o.x.toFixed(3)}, ${o.y.toFixed(3)}, ${o.z.toFixed(3)}</div>
          <div class="coord-value">Scale: ${c.x.toFixed(5)}</div>
          <div class="coord-value">Height from Ground: ${(l.y-e.y/2).toFixed(3)} units</div>
        </div>
      `}if(this.coordsDisplay.innerHTML=s,this.shoeRojo&&this.shoeRojo.visible){const n=this.shoeRojo,e=new z().setFromObject(n),o=new m;e.getSize(o);const r=new m;e.getCenter(r);const l=o.x*o.y*o.z,c=new m,f=new m;n.updateMatrixWorld(!0),n.getWorldPosition(c),n.getWorldScale(f);const a=(c.y-o.y/2).toFixed(3);this.coordsDisplay.innerHTML+=`
        <div class="coords-group">
          <div class="coords-title">Shoe (Rojo)</div>
          <div class="coord-value">Position: ${c.x.toFixed(3)}, ${c.y.toFixed(3)}, ${c.z.toFixed(3)}</div>
          <div class="coord-value">Dimensions: ${o.x.toFixed(3)} × ${o.y.toFixed(3)} × ${o.z.toFixed(3)}</div>
          <div class="coord-value">Volume: ${l.toFixed(3)} cubic units</div>
          <div class="coord-value">Center: ${r.x.toFixed(3)}, ${r.y.toFixed(3)}, ${r.z.toFixed(3)}</div>
          <div class="coord-value">Scale: ${f.x.toFixed(5)}</div>
          <div class="coord-value">Height from Ground: ${a} units</div>
        </div>
      `}if(this.shoeAzul&&this.shoeAzul.visible){const n=this.shoeAzul,e=new z().setFromObject(n),o=new m;e.getSize(o);const r=new m;e.getCenter(r);const l=o.x*o.y*o.z,c=new m,f=new m;n.updateMatrixWorld(!0),n.getWorldPosition(c),n.getWorldScale(f);const a=(c.y-o.y/2).toFixed(3);this.coordsDisplay.innerHTML+=`
        <div class="coords-group">
          <div class="coords-title">Shoe (Azul)</div>
          <div class="coord-value">Position: ${c.x.toFixed(3)}, ${c.y.toFixed(3)}, ${c.z.toFixed(3)}</div>
          <div class="coord-value">Dimensions: ${o.x.toFixed(3)} × ${o.y.toFixed(3)} × ${o.z.toFixed(3)}</div>
          <div class="coord-value">Volume: ${l.toFixed(3)} cubic units</div>
          <div class="coord-value">Center: ${r.x.toFixed(3)}, ${r.y.toFixed(3)}, ${r.z.toFixed(3)}</div>
          <div class="coord-value">Scale: ${f.x.toFixed(5)}</div>
          <div class="coord-value">Height from Ground: ${a} units</div>
        </div>
      `}}startShelfStatusPolling(){let t=null;const i=new Map,d=(p,n,e)=>{if(!p)return;console.log(`[Shelf ${p.name}] Estado:`,{ocupado:n,valorSensor:e,umbral:50,mensaje:n?"⚠️ ESTANTE OCUPADO ⚠️":"✅ ESTANTE DISPONIBLE"});let o=i.get(p.name);if(n){if(!o){console.log(`[Shelf ${p.name}] Creando indicador visual de ocupación`);const l=new z().setFromObject(p).getSize(new m),c=new ee(l.x*.9,l.y*.9,l.z*.9),f=new L({color:2201331,transparent:!0,opacity:.7,roughness:.3,metalness:.5});o=new E(c,f),o.position.copy(p.position),this.scene.add(o),i.set(p.name,o)}}else o&&(console.log(`[Shelf ${p.name}] Removiendo indicador visual de ocupación`),this.scene.remove(o),i.delete(p.name))},h=async()=>{var p,n;try{console.log(`
[${new Date().toISOString()}] Consultando estado de estantes...`);const e=await fetch("https://coldstoragehub.onrender.com/api/mongodb/readings/proximity?unitId=1",{mode:"cors",headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`Error HTTP: ${e.status}`);const o=await e.json();console.log(`
[API Response]:`,JSON.stringify(o,null,2));const r=((p=o.proximity1)==null?void 0:p.value)||100,l=((n=o.proximity2)==null?void 0:n.value)||100,c=r<50,f=l<50;if(console.log(`
[Análisis de Sensores]`,{proximity1:{valor:r,umbral:50,ocupado:c},proximity2:{valor:l,umbral:50,ocupado:f}}),this.currentModel){const a=this.currentModel.getObjectByName("shelf_3"),u=this.currentModel.getObjectByName("shelf_6");d(a,c,r),d(u,f,l),(c||f)&&(console.log(`
⚠️ ALERTA: Hay estantes ocupados ⚠️`),console.table({"Estante 3":{estado:c?"OCUPADO":"DISPONIBLE",valor:r},"Estante 6":{estado:f?"OCUPADO":"DISPONIBLE",valor:l}}))}}catch(e){console.error(`[${new Date().toISOString()}] Error en consulta:`,e)}finally{t=setTimeout(h,3e5)}};return h(),()=>{t&&clearTimeout(t)}}async addDraggableShoe(s=4.608){new D().load("./models/Shoe.ply",i=>{i.computeVertexNormals(),i.center();const d=new L({color:16711680}),h=new E(i,d);h.name="shoe_rojo",h.scale.set(.0237,.0237,.0237),h.position.set(0,s,0),h.visible=!1,this.scene.add(h),this.shoeRojo=h,this.addBlueShoe(2.5)})}addBlueShoe(s=2.5){new D().load("./models/Shoe.ply",i=>{i.computeVertexNormals(),i.center();const d=new L({color:255}),h=new E(i,d);h.name="shoe_azul",h.scale.set(.0237,.0237,.0237),h.position.set(0,s-.123,0),h.visible=!1,this.scene.add(h),this.shoeAzul=h})}showShelfOccupancyBox(s,t,i=null,d=null){if(!this.isShelfModel){this.occupancyBox&&(this.occupancyBox.style.display="none");return}if(!this.occupancyBox){this.occupancyBox=document.createElement("div"),this.occupancyBox.className="occupancy-box",this.occupancyBox.style.position="fixed",this.occupancyBox.style.top="1rem",this.occupancyBox.style.right="1rem",this.occupancyBox.style.left="",this.occupancyBox.style.background="rgba(30,30,30,0.92)",this.occupancyBox.style.color="#fff",this.occupancyBox.style.padding="1.2rem 1.5rem",this.occupancyBox.style.borderRadius="12px",this.occupancyBox.style.fontFamily="monospace",this.occupancyBox.style.fontSize="1rem",this.occupancyBox.style.zIndex=2e3,this.occupancyBox.style.boxShadow="0 2px 10px rgba(0,0,0,0.25)",this.occupancyBox.style.maxWidth="90vw",this.occupancyBox.style.wordBreak="break-word",this.occupancyBox.style.display="flex",this.occupancyBox.style.flexDirection="column",this.occupancyBox.style.alignItems="flex-start",this.occupancyBox.style.gap="0.5rem",document.body.appendChild(this.occupancyBox);const l=document.createElement("style");l.textContent=`
        @media (max-width: 600px) {
          .occupancy-box {
            left: 50% !important;
            right: auto !important;
            top: auto !important;
            bottom: 0.5rem !important;
            transform: translateX(-50%) !important;
            max-width: 98vw !important;
            font-size: 0.95rem !important;
            padding: 0.8rem 0.5rem !important;
            border-radius: 10px !important;
            position: fixed !important;
            z-index: 2000 !important;
          }
        }
        .occupancy-box .sensor-row {
          display: flex;
          flex-direction: row;
          gap: 1.2rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .occupancy-box .sensor-item {
          min-width: 90px;
        }
      `,document.head.appendChild(l)}const h=10,p=.025;let n=0;s&&n++,t&&n++;const e=n*p,o=(e/(h*p)*100).toFixed(1);let r="";n>0&&(r+=`<div><b>Estantes ocupados:</b> ${n}</div>`,r+=`<div><b>Metros usados:</b> ${e.toFixed(3)} m³</div>`,r+=`<div><b>Porcentaje de ocupación:</b> ${o}%</div>`),(i!==null||d!==null)&&(r+=`<div class='sensor-row'>
        <div class='sensor-item'><b>Temp:</b> ${i!==null?i:"--"} °C</div>
        <div class='sensor-item'><b>Humedad:</b> ${d!==null?d:"--"} %</div>
      </div>`),this.occupancyBox.innerHTML=r,this.occupancyBox.style.display=r?"block":"none"}hideShelfOccupancyBox(){this.occupancyBox&&(this.occupancyBox.style.display="none")}dispose(){this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.coordsDisplay&&this.coordsDisplay.parentNode&&this.coordsDisplay.parentNode.removeChild(this.coordsDisplay),this.controls&&this.controls.dispose(),this.currentModel=null,this.scene=null,this.camera=null,this.renderer.dispose()}}document.addEventListener("DOMContentLoaded",()=>{const j=new se("viewer-container"),s=[{name:"Estante",path:"./models/Shelf.obj"},{name:"Silla",path:"./models/Silla.ply"}];j.createModelSelector(s),j.animate(),window.modelViewer=j});
