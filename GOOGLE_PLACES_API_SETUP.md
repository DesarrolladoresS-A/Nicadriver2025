# Google Places API - Configuración para NicaDriver

## 📋 Requisitos Previos

Para que funcione la búsqueda con sugerencias de lugares en Nicaragua, necesitas:

1. **Cuenta de Google Cloud Platform**
2. **API Key de Google Maps**
3. **Habilitar las siguientes APIs:**
   - Places API
   - Maps JavaScript API
   - Geocoding API

## 🔧 Configuración Paso a Paso

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto (ej: "NicaDriver-Maps")

### 2. Habilitar APIs Necesarias

En la consola de Google Cloud:

1. Ve a **"APIs y servicios" > "Biblioteca"**
2. Busca y habilita estas APIs:
   - **Places API** (Nueva)
   - **Maps JavaScript API**
   - **Geocoding API**

### 3. Crear API Key

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"Clave de API"**
4. Copia tu API Key

### 4. Configurar Restricciones de API Key

Para mayor seguridad, configura restricciones:

1. Haz clic en tu API Key
2. En **"Restricciones de aplicación"**:
   - Selecciona **"Sitios web HTTP"**
   - Agrega tu dominio (ej: `localhost:3000`, `tu-dominio.com`)
3. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca solo las APIs que necesitas:
     - Places API (Nueva)
     - Maps JavaScript API
     - Geocoding API

### 5. Configurar Variables de Entorno

Crea o actualiza tu archivo `.env`:

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Otras APIs (si las usas)
VITE_OPENWEATHER_API_KEY=tu_openweather_key
VITE_GEMINI_API_KEY=tu_gemini_key
```

## 🚀 Uso de la API

### Configuración Básica

El archivo `src/config/googlePlacesConfig.js` contiene toda la configuración:

```javascript
import { GOOGLE_PLACES_CONFIG } from '../config/googlePlacesConfig';

// La configuración incluye:
// - Restricción a Nicaragua (country: 'ni')
// - Tipos de lugares permitidos
// - Campos a obtener
// - Iconos personalizados
// - Filtros de sugerencias
```

### Tipos de Lugares Soportados

La API buscará automáticamente:

- **🏢 Establecimientos**: Restaurantes, hospitales, bancos, etc.
- **🏙️ Ciudades**: Managua, León, Granada, etc.
- **🗺️ Departamentos**: Managua, León, Granada, etc.
- **🏘️ Municipios**: Distritos y municipios
- **🛣️ Rutas**: Calles y carreteras
- **🏠 Direcciones**: Direcciones específicas
- **📍 Puntos de interés**: Parques, monumentos, etc.

### Funciones Helper Disponibles

```javascript
import { 
  getPlaceIcon, 
  getPlaceTypeDescription, 
  filterSuggestions 
} from '../config/googlePlacesConfig';

// Obtener icono según tipo de lugar
const icon = getPlaceIcon(['restaurant', 'food']); // 🍽️

// Obtener descripción del tipo
const description = getPlaceTypeDescription(['restaurant']); // "Restaurante"

// Filtrar sugerencias
const filtered = filterSuggestions(predictions);
```

## 🔍 Ejemplos de Búsqueda

### Búsquedas que Funcionan:

- **Ciudades**: "Managua", "León", "Granada"
- **Lugares específicos**: "Hospital Bautista", "Universidad Nacional"
- **Direcciones**: "Carretera Masaya", "Calle Central"
- **Puntos de interés**: "Parque Central", "Catedral de León"
- **Establecimientos**: "Pizza Hut", "Banco ProCredit"

### Búsquedas Restringidas:

- Solo lugares en Nicaragua
- Mínimo 2 caracteres para activar sugerencias
- Máximo 8 sugerencias por búsqueda

## 🛠️ Personalización

### Agregar Nuevos Tipos de Lugares

En `googlePlacesConfig.js`:

```javascript
placeTypeIcons: {
  // Agregar nuevos tipos
  'nuevo_tipo': '🆕',
  'otro_tipo': '🔧'
},

// Y sus descripciones
const typeDescriptions = {
  'nuevo_tipo': 'Descripción del nuevo tipo',
  'otro_tipo': 'Otra descripción'
};
```

### Modificar Filtros

```javascript
filters: {
  maxSuggestions: 10,        // Cambiar número de sugerencias
  minInputLength: 3,         // Cambiar longitud mínima
  includeTypes: [            // Agregar/quitar tipos
    'establishment',
    'geocode',
    // ... otros tipos
  ]
}
```

## 🚨 Solución de Problemas

### Error: "This API project is not authorized"

1. Verifica que las APIs estén habilitadas
2. Revisa las restricciones de tu API Key
3. Asegúrate de que el dominio esté en las restricciones

### Error: "REQUEST_DENIED"

1. Verifica que tu API Key sea correcta
2. Revisa las restricciones de API
3. Asegúrate de que las APIs estén habilitadas

### No Aparecen Sugerencias

1. Verifica que Places API esté habilitada
2. Revisa la consola del navegador para errores
3. Asegúrate de que la API Key tenga permisos para Places API

### Sugerencias de Otros Países

1. Verifica que `componentRestrictions: { country: 'ni' }` esté configurado
2. Revisa que la configuración se esté aplicando correctamente

## 📊 Límites y Costos

### Límites Gratuitos (Google Cloud)

- **Places API**: 1,000 solicitudes/día
- **Maps JavaScript API**: 28,000 cargas de mapa/mes
- **Geocoding API**: 40,000 solicitudes/mes

### Monitoreo de Uso

1. Ve a **"APIs y servicios" > "Cuotas"**
2. Monitorea el uso de cada API
3. Configura alertas de límites

## 🔒 Seguridad

### Mejores Prácticas:

1. **Nunca expongas tu API Key en código público**
2. **Usa restricciones de dominio**
3. **Restringe las APIs a solo las necesarias**
4. **Monitorea el uso regularmente**
5. **Rota las API Keys periódicamente**

### Configuración Segura:

```javascript
// En producción, usa variables de entorno
const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

// Con restricciones de dominio
const mapOptions = {
  apiKey: API_KEY,
  libraries: ['places', 'geometry'],
  // ... otras opciones
};
```

## 📞 Soporte

Si tienes problemas:

1. Revisa la [documentación oficial de Google Places API](https://developers.google.com/maps/documentation/places/web-service)
2. Consulta el [foro de Google Maps Platform](https://developers.google.com/maps/support)
3. Verifica los [códigos de error de Places API](https://developers.google.com/maps/documentation/places/web-service/error-messages)

---

**¡Listo!** Con esta configuración tendrás sugerencias completas de todos los lugares de Nicaragua en tu aplicación NicaDriver. 🚗💨
