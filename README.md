# Digital Twin Viewer

Visualizador 3D de gemelos digitales con soporte para sensores en tiempo real.

## Características

- Visualización 3D de modelos PLY y OBJ
- Integración con sensores en tiempo real
- Monitoreo de ocupación y métricas
- Componente embebible para integración en otras páginas
- Soporte para múltiples modelos
- Interfaz responsiva

## Tecnologías

- Three.js para renderizado 3D
- Vite para desarrollo y construcción
- JavaScript moderno (ES6+)
- CSS3 para estilos y animaciones

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/digital-twin-viewer.git
cd digital-twin-viewer
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Uso como Componente Embebible

El visor puede ser embebido fácilmente en cualquier página web. Sigue estos pasos:

1. Incluye el script en tu HTML:
```html
<script src="path/to/main.js"></script>
```

2. Agrega un contenedor para el visor:
```html
<div id="shelf-viewer-container"></div>
```

3. Inicializa el visor:
```html
<script>
  const viewer = initShelfViewer('shelf-viewer-container', {
    width: '800px',
    height: '600px'
  });
</script>
```

### Opciones de Configuración

El visor acepta las siguientes opciones de configuración:

```javascript
const options = {
  width: '100%',           // Ancho del contenedor
  height: '400px',         // Alto del contenedor
  models: [                // Lista de modelos disponibles
    { 
      name: 'Estante', 
      path: './models/Shelf.obj' 
    },
    { 
      name: 'Silla', 
      path: './models/Silla.ply' 
    }
  ]
};
```

### Ejemplo Completo

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Página con Visor 3D</title>
  <style>
    #shelf-viewer-container {
      border: 1px solid #ccc;
      border-radius: 8px;
      margin: 20px;
    }
  </style>
</head>
<body>
  <h1>Mi Visor 3D</h1>
  
  <div id="shelf-viewer-container"></div>

  <script src="path/to/main.js"></script>
  <script>
    const viewer = initShelfViewer('shelf-viewer-container', {
      width: '800px',
      height: '600px'
    });
  </script>
</body>
</html>
```

## Características del Componente

- **Responsive**: Se adapta automáticamente al tamaño del contenedor
- **Encapsulado**: Estilos y funcionalidad aislados para evitar conflictos
- **Configurable**: Personalizable a través de opciones
- **Tiempo Real**: Actualización automática de sensores y métricas
- **Interactivo**: Controles de cámara y selección de modelos

## Notas Importantes

1. **Rutas de Modelos**: Asegúrate de que las rutas a los modelos sean correctas en tu configuración.
2. **CORS**: Si los modelos están en otro dominio, asegúrate de que CORS esté configurado correctamente.
3. **WebSocket**: El componente requiere una conexión WebSocket para las actualizaciones en tiempo real.
4. **Fallback**: Si no hay actualizaciones vía WebSocket por más de 1 minuto, se consultará la API de MongoDB.

## Autor

Desarrollado por [AlduinoCalderon](https://github.com/AlduinoCalderon)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Uso desde Vercel Deploy

El componente está disponible públicamente en [https://3dvisualizer-coral.vercel.app](https://3dvisualizer-coral.vercel.app). Para usarlo en tu página:

1. Incluye el script desde el deploy:
```html
<script src="https://3dvisualizer-coral.vercel.app/main.js"></script>
```

2. Agrega el contenedor:
```html
<div id="shelf-viewer-container"></div>
```

3. Inicializa el visor (el estante y la occupancy box se cargarán automáticamente):
```html
<script>
  const viewer = initShelfViewer('shelf-viewer-container');
</script>
```

### Ejemplo de Implementación con Vercel

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Página con Visor 3D</title>
  <style>
    #shelf-viewer-container {
      border: 1px solid #ccc;
      border-radius: 8px;
      margin: 20px;
    }
  </style>
</head>
<body>
  <h1>Mi Visor 3D</h1>
  
  <div id="shelf-viewer-container"></div>

  <script src="https://3dvisualizer-coral.vercel.app/main.js"></script>
  <script>
    const viewer = initShelfViewer('shelf-viewer-container');
  </script>
</body>
</html>
```

### Opciones de Configuración (Opcional)

Si necesitas personalizar el visor, puedes usar las siguientes opciones:

```javascript
const options = {
  width: '100%',           // Ancho del contenedor
  height: '400px',         // Alto del contenedor
  models: [                // Lista de modelos disponibles (por defecto solo el estante)
    { 
      name: 'Estante', 
      path: 'https://3dvisualizer-coral.vercel.app/models/Shelf.obj' 
    }
  ]
};

const viewer = initShelfViewer('shelf-viewer-container', options);
```

### Notas sobre el Deploy en Vercel

1. **CORS**: El deploy en Vercel está configurado para aceptar peticiones desde cualquier origen.
2. **WebSocket**: La conexión WebSocket se establece automáticamente con el servidor de sensores.
3. **Modelos**: El estante se carga automáticamente al inicializar el visor.
4. **Occupancy Box**: Se muestra automáticamente con las métricas en tiempo real.
5. **Actualizaciones**: El componente se actualiza automáticamente cuando hay cambios en el deploy.
