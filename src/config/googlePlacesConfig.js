// Google Places API Configuration
// Archivo: src/config/googlePlacesConfig.js

export const GOOGLE_PLACES_CONFIG = {
  // Configuración para AutocompleteService
  autocompleteOptions: {
    componentRestrictions: { country: 'ni' }, // Nicaragua
    types: [
      'establishment',        // Lugares de negocio
      'geocode',             // Direcciones geocodificadas
      'locality',            // Ciudades
      'administrative_area_level_1',  // Departamentos
      'administrative_area_level_2',  // Municipios
      'route',               // Calles y carreteras
      'street_address',      // Direcciones específicas
      'point_of_interest'    // Puntos de interés
    ],
    fields: [
      'place_id',
      'formatted_address', 
      'geometry', 
      'name', 
      'types',
      'formatted_phone_number',
      'website',
      'rating',
      'user_ratings_total'
    ]
  },

  // Configuración para PlacesService
  placeDetailsOptions: {
    fields: [
      'place_id',
      'formatted_address',
      'geometry',
      'name',
      'types',
      'formatted_phone_number',
      'website',
      'rating',
      'user_ratings_total',
      'photos',
      'opening_hours',
      'business_status'
    ]
  },

  // Tipos de lugares con iconos personalizados
  placeTypeIcons: {
    'establishment': '🏢',
    'locality': '🏙️',
    'administrative_area_level_1': '🗺️',
    'administrative_area_level_2': '🏘️',
    'route': '🛣️',
    'street_address': '🏠',
    'point_of_interest': '📍',
    'hospital': '🏥',
    'school': '🏫',
    'university': '🎓',
    'bank': '🏦',
    'gas_station': '⛽',
    'restaurant': '🍽️',
    'shopping_mall': '🛍️',
    'airport': '✈️',
    'bus_station': '🚌',
    'park': '🌳',
    'church': '⛪',
    'mosque': '🕌',
    'synagogue': '🕍',
    'hindu_temple': '🛕',
    'cemetery': '⚰️',
    'fire_station': '🚒',
    'police': '🚔',
    'post_office': '📮',
    'library': '📚',
    'museum': '🏛️',
    'zoo': '🦁',
    'aquarium': '🐠',
    'amusement_park': '🎢',
    'casino': '🎰',
    'movie_theater': '🎬',
    'night_club': '🎵',
    'bar': '🍺',
    'cafe': '☕',
    'store': '🏪',
    'supermarket': '🛒',
    'pharmacy': '💊',
    'dentist': '🦷',
    'doctor': '👨‍⚕️',
    'veterinary_care': '🐕',
    'car_repair': '🔧',
    'car_wash': '🚗',
    'parking': '🅿️',
    'atm': '💰',
    'embassy': '🏛️',
    'city_hall': '🏛️',
    'courthouse': '⚖️',
    'local_government_office': '🏛️'
  },

  // Configuración de filtros
  filters: {
    maxSuggestions: 8,
    minInputLength: 2,
    includeTypes: [
      'establishment',
      'geocode', 
      'locality',
      'administrative_area_level_1',
      'administrative_area_level_2',
      'route',
      'street_address',
      'point_of_interest'
    ]
  }
};

// Función helper para obtener el icono según el tipo de lugar
export const getPlaceIcon = (types) => {
  if (!types || !Array.isArray(types)) return '📍';
  
  // Buscar el primer tipo que tenga icono personalizado
  for (const type of types) {
    if (GOOGLE_PLACES_CONFIG.placeTypeIcons[type]) {
      return GOOGLE_PLACES_CONFIG.placeTypeIcons[type];
    }
  }
  
  return '📍'; // Icono por defecto
};

// Función helper para obtener la descripción del tipo de lugar
export const getPlaceTypeDescription = (types) => {
  if (!types || !Array.isArray(types)) return 'Ubicación';
  
  const typeDescriptions = {
    'establishment': 'Lugar de negocio',
    'locality': 'Ciudad',
    'administrative_area_level_1': 'Departamento',
    'administrative_area_level_2': 'Municipio',
    'route': 'Calle/Carretera',
    'street_address': 'Dirección específica',
    'point_of_interest': 'Punto de interés',
    'hospital': 'Hospital',
    'school': 'Escuela',
    'university': 'Universidad',
    'bank': 'Banco',
    'gas_station': 'Gasolinera',
    'restaurant': 'Restaurante',
    'shopping_mall': 'Centro comercial',
    'airport': 'Aeropuerto',
    'bus_station': 'Terminal de buses',
    'park': 'Parque',
    'church': 'Iglesia',
    'mosque': 'Mezquita',
    'synagogue': 'Sinagoga',
    'hindu_temple': 'Templo hindú',
    'cemetery': 'Cementerio',
    'fire_station': 'Bomberos',
    'police': 'Policía',
    'post_office': 'Correo',
    'library': 'Biblioteca',
    'museum': 'Museo',
    'zoo': 'Zoológico',
    'aquarium': 'Acuario',
    'amusement_park': 'Parque de diversiones',
    'casino': 'Casino',
    'movie_theater': 'Cine',
    'night_club': 'Discoteca',
    'bar': 'Bar',
    'cafe': 'Café',
    'store': 'Tienda',
    'supermarket': 'Supermercado',
    'pharmacy': 'Farmacia',
    'dentist': 'Dentista',
    'doctor': 'Doctor',
    'veterinary_care': 'Veterinaria',
    'car_repair': 'Taller mecánico',
    'car_wash': 'Lavado de autos',
    'parking': 'Estacionamiento',
    'atm': 'Cajero automático',
    'embassy': 'Embajada',
    'city_hall': 'Alcaldía',
    'courthouse': 'Tribunal',
    'local_government_office': 'Oficina gubernamental'
  };
  
  // Buscar el primer tipo que tenga descripción personalizada
  for (const type of types) {
    if (typeDescriptions[type]) {
      return typeDescriptions[type];
    }
  }
  
  return 'Ubicación'; // Descripción por defecto
};

// Función para filtrar sugerencias
export const filterSuggestions = (predictions) => {
  if (!predictions) return [];
  
  return predictions
    .filter(prediction => {
      // Verificar que tenga los tipos incluidos
      return prediction.types && prediction.types.some(type => 
        GOOGLE_PLACES_CONFIG.filters.includeTypes.includes(type)
      );
    })
    .slice(0, GOOGLE_PLACES_CONFIG.filters.maxSuggestions);
};
