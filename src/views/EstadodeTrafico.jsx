import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  TrafficLayer,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
  Polyline,
  Autocomplete
} from '@react-google-maps/api';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, storage } from '../database/firebaseconfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../styles/EstadodeTrafico.css';
import { GOOGLE_PLACES_CONFIG, getPlaceIcon, getPlaceTypeDescription, filterSuggestions } from '../config/googlePlacesConfig';

const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const iconMap = {
  Accidente: 'https://img.icons8.com/color/48/car-crash.png',
  Tráfico: 'https://img.icons8.com/color/48/traffic-jam.png',
  Policía: 'https://img.icons8.com/color/48/policeman-male.png',
  Peligro: 'https://img.icons8.com/color/48/high-priority.png',
  Cierre: 'https://img.icons8.com/color/48/road-closure.png',
  'Carril bloqueado': 'https://img.icons8.com/fluency/48/barrier.png',
};

const ciudadesNicaragua = [
  { nombre: 'Managua', lat: 12.1364, lng: -86.2514 },
  { nombre: 'León', lat: 12.4345, lng: -86.8794 },
  { nombre: 'Granada', lat: 11.9344, lng: -85.956 },
  { nombre: 'Matagalpa', lat: 12.9256, lng: -85.9175 },
  { nombre: 'Estelí', lat: 13.091, lng: -86.3538 },
];


// Moved outside the component to prevent recreation on each render

// Moved outside the component to prevent recreation on each render
const libraries = ['places', 'geometry'];

const EstadoTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [showRutaModal, setShowRutaModal] = useState(false);
  const [ciudadDestino, setCiudadDestino] = useState('');
  const [destino, setDestino] = useState('');
  const [rutaCalculada, setRutaCalculada] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [usarUbicacionActual, setUsarUbicacionActual] = useState(true);
  const [ciudadOrigenSeleccionada, setCiudadOrigenSeleccionada] = useState('');
  const [directions, setDirections] = useState(null);
  const [rutaPath, setRutaPath] = useState([]);
  const [clickEnRuta, setClickEnRuta] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelData, setTravelData] = useState({
    speed: 0,
    distance: 0,
    startTime: null,
    currentTime: new Date(),
    averageSpeed: 0
  });
  const [watchId, setWatchId] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [showTravelPanel, setShowTravelPanel] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentImage, setIncidentImage] = useState(null);
  const [incidentImagePreview, setIncidentImagePreview] = useState(null);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [voiceRecognitionActive, setVoiceRecognitionActive] = useState(false);
  const [showQuickReportButtons, setShowQuickReportButtons] = useState(false);
  const [nextTurn, setNextTurn] = useState(null);
  const [distanceToNextTurn, setDistanceToNextTurn] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSafetyAlert, setShowSafetyAlert] = useState(false);
  const [safetyAlertStep, setSafetyAlertStep] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(current);
          setCurrentLocation(current);
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('No se pudo obtener la ubicación. Usando ubicación predeterminada.');
          setUserLocation(defaultCenter);
          setCurrentLocation(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser');
      setLocationError('La geolocalización no es compatible con este navegador');
      setUserLocation(defaultCenter);
      setCurrentLocation(defaultCenter);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'incidentes'), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReportes(datos);
    });
    return () => unsubscribe();
  }, []);

  // Actualizar tiempo actual cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setTravelData(prev => ({
        ...prev,
        currentTime: new Date()
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distancia en metros
  };

  // Función para iniciar el seguimiento del viaje
  const startTravelTracking = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Geolocalización no disponible',
        text: 'La geolocalización no es compatible con este navegador',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setIsTraveling(true);
    setShowTravelPanel(true);
    setTravelData(prev => ({
      ...prev,
      startTime: new Date(),
      distance: 0,
      speed: 0,
      averageSpeed: 0
    }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCurrentLocation(newLocation);

        // Calcular velocidad si tenemos ubicación anterior
        if (previousLocation) {
          const distance = calculateDistance(
            previousLocation.lat,
            previousLocation.lng,
            newLocation.lat,
            newLocation.lng
          );

          // Calcular velocidad en km/h (asumiendo actualización cada segundo)
          const speed = distance * 3.6; // m/s a km/h

          setTravelData(prev => {
            const newDistance = prev.distance + distance;
            const timeElapsed = (new Date() - prev.startTime) / 1000 / 3600; // horas
            const avgSpeed = timeElapsed > 0 ? newDistance / 1000 / timeElapsed : 0;

            return {
              ...prev,
              speed: speed,
              distance: newDistance,
              averageSpeed: avgSpeed
            };
          });
        }

        setPreviousLocation(newLocation);
      },
      (error) => {
        console.error('Error en seguimiento de ubicación:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error en seguimiento',
          text: 'Error en el seguimiento de ubicación',
          confirmButtonText: 'Entendido'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    setWatchId(watchId);
  };

  // Función para detener el seguimiento del viaje
  const stopTravelTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTraveling(false);
    setShowTravelPanel(false);
    setPreviousLocation(null);
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = (event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    if (rutaPath.length > 0) {
      const estaEnRuta = isPointOnPath(
        clickedLocation,
        rutaPath,
        0.0002
      );

      setClickEnRuta(estaEnRuta);
    } else {
      setClickEnRuta(false);
    }

    setSelectedLocation(clickedLocation);
  };

  const isPointOnPath = (point, path, tolerance) => {
    const google = window.google;
    if (!google || !google.maps.geometry) return false;

    for (let i = 0; i < path.length - 1; i++) {
      const segmentStart = path[i];
      const segmentEnd = path[i + 1];

      if (google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(segmentStart),
        new google.maps.LatLng(point)
      ) <= tolerance ||
        google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(segmentEnd),
          new google.maps.LatLng(point)
        ) <= tolerance) {
        return true;
      }
    }
    return false;
  };

  const handleGuardarReporte = async () => {
    try {
      // Subir imagen a Storage si existe
      let imagenUrl = null;
      if (imagen) {
        try {
          const safeName = imagen.name?.replace(/[^a-zA-Z0-9_.-]/g, '_') || `incidente_${Date.now()}.jpg`;
          const path = `incidentes/${Date.now()}_${safeName}`;
          const ref = storageRef(storage, path);
          const snap = await uploadBytes(ref, imagen);
          imagenUrl = await getDownloadURL(snap.ref);
        } catch (e) {
          console.warn('Fallo al subir imagen a Storage, se guarda sin imagen:', e);
          imagenUrl = null;
        }
      }

      await addDoc(collection(db, 'incidentes'), {
        tipo: tipo || 'Tráfico',
        descripcion: descripcion || 'Reporte sin descripción',
        imagenUrl: typeof imagenUrl === 'string' && /^https?:\/\//i.test(imagenUrl) ? imagenUrl : null,
        lat: selectedLocation?.lat || 0,
        lng: selectedLocation?.lng || 0,
        fecha: serverTimestamp(),
        enRuta: clickEnRuta,
      });

      Swal.fire({
        icon: 'success',
        title: 'Reporte guardado',
        text: 'El reporte ha sido guardado exitosamente',
        confirmButtonText: 'Entendido'
      });
      setTipo('');
      setDescripcion('');
      setImagen(null);
      setImagenPreview(null);
      setSelectedLocation(null);
      setClickEnRuta(false);
    } catch (error) {
      console.error('Error guardando el reporte:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'Hubo un error al guardar el reporte.',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagen(null);
    setImagenPreview(null);
  };

  const handleBuscarRuta = async () => {
    if (!destino) {
      Swal.fire({
        icon: 'warning',
        title: 'Destino requerido',
        text: 'Por favor, ingrese un destino',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      Swal.fire({
        icon: 'warning',
        title: 'Ubicación no disponible',
        text: 'No se pudo obtener su ubicación actual. Usando ubicación predeterminada.',
        confirmButtonText: 'Continuar'
      });
      setUserLocation(defaultCenter);
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();

      // Ensure origin is a valid LatLngLiteral
      const origin = {
        lat: parseFloat(userLocation.lat),
        lng: parseFloat(userLocation.lng)
      };

      // Ensure destination is a string (address) or a valid LatLngLiteral
      let destination = destino;
      // If it's a string with coordinates, convert to LatLngLiteral
      if (typeof destino === 'string' && destino.includes(',')) {
        const [lat, lng] = destino.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          destination = { lat, lng };
        }
      }

      // Show loading state
      setRutaCalculada(false);
      setDirections(null);
      setRutaPath([]);

      const response = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      if (response?.routes?.[0]?.overview_path) {
        setDirections(response);
        setRutaCalculada(true);
        setRutaPath(response.routes[0].overview_path);

        // Mostrar alerta de seguridad
        setShowSafetyAlert(true);
        setSafetyAlertStep(0);
      } else {
        throw new Error('No se encontraron rutas');
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al calcular ruta',
        text: 'No se pudo calcular la ruta. Por favor, verifique el destino e intente nuevamente.',
        confirmButtonText: 'Entendido'
      });
      setRutaCalculada(false);
      setDirections(null);
      setRutaPath([]);
    }
  };

  const handleListo = () => {
    if (!rutaCalculada) {
      Swal.fire({
        icon: 'warning',
        title: 'Ruta requerida',
        text: 'Por favor, calcule la ruta primero',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Cerrar alerta de seguridad si está abierta
    setShowSafetyAlert(false);

    setRutaSeleccionada(directions);
    setShowRutaModal(false);

    // Procesar instrucciones de navegación
    processNavigationSteps(directions);
    calculateEstimatedArrival(directions);

    // Iniciar navegación
    setIsNavigating(true);
    setShowNavigationPanel(true);
    setShowQuickReportButtons(true);

    // Iniciar seguimiento del viaje
    startTravelTracking();
  };

  const handleCancelarRuta = () => {
    setDirections(null);
    setRutaCalculada(false);
    setRutaSeleccionada(null);
    setDestino('');
    setShowRutaModal(false);

    // Limpiar estados de navegación
    setIsNavigating(false);
    setShowNavigationPanel(false);
    setShowQuickReportButtons(false);
    setNavigationSteps([]);
    setCurrentStepIndex(0);
    setNextTurn(null);
    setDistanceToNextTurn(null);
    setEstimatedArrival(null);

    // Detener seguimiento del viaje
    stopTravelTracking();
  };

  const iniciarViaje = () => {
    if (!ciudadOrigenSeleccionada || !ciudadDestino) {
      Swal.fire({
        icon: 'warning',
        title: 'Selección requerida',
        text: 'Por favor, seleccione una ciudad de origen y destino',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setShowRutaModal(false);
  };

  // Función para manejar la selección de sugerencias
  const handleSuggestionSelect = async (suggestion) => {
    setDestino(suggestion.description);
    setShowSuggestions(false);

    // Obtener detalles del lugar seleccionado
    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({
        placeId: suggestion.place_id,
        ...GOOGLE_PLACES_CONFIG.placeDetailsOptions
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Si el lugar tiene coordenadas, las usamos para el destino
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setDestino(`${lat}, ${lng}`);
          }
        }
      });
    } catch (error) {
      console.log('Error obteniendo detalles del lugar:', error);
    }
  };

  // Función para manejar cambios en el input de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setDestino(value);

    if (value.length >= GOOGLE_PLACES_CONFIG.filters.minInputLength) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: value,
        ...GOOGLE_PLACES_CONFIG.autocompleteOptions
      }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Usar la función de filtrado de la configuración
          const filteredSuggestions = filterSuggestions(predictions);
          setSearchSuggestions(filteredSuggestions);
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Función para avanzar en la alerta de seguridad
  const nextSafetyStep = () => {
    if (safetyAlertStep < 2) {
      setSafetyAlertStep(safetyAlertStep + 1);
    } else {
      setShowSafetyAlert(false);
    }
  };

  // Función para saltar la alerta de seguridad
  const skipSafetyAlert = () => {
    setShowSafetyAlert(false);
  };

  // Función para reportar incidente durante el viaje
  const reportarIncidenteEnViaje = async () => {
    if (!currentLocation) {
      Swal.fire({
        icon: 'error',
        title: 'Ubicación no disponible',
        text: 'No se pudo obtener la ubicación actual',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (!incidentType || !incidentDescription) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, complete todos los campos requeridos',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      await addDoc(collection(db, 'incidentes'), {
        tipo: incidentType,
        descripcion: incidentDescription,
        imagenBase64: incidentImage ? await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(incidentImage);
        }) : null,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        fecha: serverTimestamp(),
        enRuta: true,
        reportadoDuranteViaje: true
      });

      Swal.fire({
        icon: 'success',
        title: 'Incidente reportado',
        text: 'El incidente ha sido reportado exitosamente',
        confirmButtonText: 'Entendido'
      });
      // Limpiar el formulario
      setIncidentType('');
      setIncidentDescription('');
      setIncidentImage(null);
      setIncidentImagePreview(null);
      setShowIncidentModal(false);
    } catch (error) {
      console.error('Error reportando incidente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al reportar',
        text: 'Hubo un error al reportar el incidente.',
        confirmButtonText: 'Entendido'
      });
    }
  };

  // Función para manejar cambio de imagen en el modal de incidente
  const handleIncidentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIncidentImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIncidentImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para remover imagen del incidente
  const removeIncidentImage = () => {
    setIncidentImage(null);
    setIncidentImagePreview(null);
  };

  // Función para iniciar reconocimiento de voz
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      Swal.fire({
        icon: 'warning',
        title: 'Reconocimiento de voz no disponible',
        text: 'El reconocimiento de voz no es compatible con este navegador',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceRecognitionActive(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Transcripción:', transcript);

      // Procesar comandos de voz para reportes rápidos
      if (transcript.includes('tráfico') || transcript.includes('trafico')) {
        reportQuickIncident('Tráfico', 'Reportado por voz');
      } else if (transcript.includes('accidente')) {
        reportQuickIncident('Accidente', 'Reportado por voz');
      } else if (transcript.includes('policía') || transcript.includes('policia')) {
        reportQuickIncident('Policía', 'Reportado por voz');
      } else if (transcript.includes('peligro')) {
        reportQuickIncident('Peligro', 'Reportado por voz');
      } else if (transcript.includes('cierre')) {
        reportQuickIncident('Cierre', 'Reportado por voz');
      } else if (transcript.includes('carril')) {
        reportQuickIncident('Carril bloqueado', 'Reportado por voz');
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Comando no reconocido',
          text: 'Intenta: "tráfico", "accidente", "policía", "peligro", "cierre" o "carril"',
          confirmButtonText: 'Entendido'
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setVoiceRecognitionActive(false);
    };

    recognition.onend = () => {
      setVoiceRecognitionActive(false);
    };

    recognition.start();
  };

  // Función para reporte rápido de incidentes
  const reportQuickIncident = async (tipo, descripcion) => {
    if (!currentLocation) {
      Swal.fire({
        icon: 'error',
        title: 'Ubicación no disponible',
        text: 'No se pudo obtener la ubicación actual',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      await addDoc(collection(db, 'incidentes'), {
        tipo: tipo,
        descripcion: descripcion,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        fecha: serverTimestamp(),
        enRuta: true,
        reportadoDuranteViaje: true,
        reporteRapido: true
      });

      // Mostrar confirmación visual
      showIncidentConfirmation(tipo);
    } catch (error) {
      console.error('Error reportando incidente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al reportar',
        text: 'Hubo un error al reportar el incidente.',
        confirmButtonText: 'Entendido'
      });
    }
  };

  // Función para mostrar confirmación visual del reporte
  const showIncidentConfirmation = (tipo) => {
    const confirmation = document.createElement('div');
    confirmation.className = 'incident-confirmation';
    confirmation.innerHTML = `
      <div class="confirmation-content">
        <div class="confirmation-icon">✅</div>
        <div class="confirmation-text">${tipo} reportado</div>
      </div>
    `;

    document.body.appendChild(confirmation);

    setTimeout(() => {
      confirmation.classList.add('show');
    }, 100);

    setTimeout(() => {
      confirmation.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(confirmation);
      }, 300);
    }, 2000);
  };

  // Función para procesar las instrucciones de navegación
  const processNavigationSteps = (directions) => {
    if (!directions?.routes?.[0]?.legs?.[0]?.steps) return;

    const steps = directions.routes[0].legs[0].steps.map((step, index) => ({
      instruction: step.instructions.replace(/<[^>]*>/g, ''), // Remover HTML tags
      distance: step.distance.text,
      duration: step.duration.text,
      maneuver: step.maneuver,
      startLocation: step.start_location,
      endLocation: step.end_location
    }));

    setNavigationSteps(steps);
    setCurrentStepIndex(0);
    updateNextTurnInfo(steps[0]);
  };

  // Función para actualizar información de la próxima vuelta
  const updateNextTurnInfo = (step) => {
    if (!step) return;

    setNextTurn(step.instruction);
    setDistanceToNextTurn(step.distance);
  };

  // Función para calcular tiempo estimado de llegada
  const calculateEstimatedArrival = (directions) => {
    if (!directions?.routes?.[0]?.legs?.[0]?.duration) return;

    const durationInSeconds = directions.routes[0].legs[0].duration.value;
    const arrivalTime = new Date(Date.now() + durationInSeconds * 1000);
    setEstimatedArrival(arrivalTime);
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div className="trafico-page">
      <div className="map-wrapper">
        {/* Overlay superior compacto: búsqueda en esquina superior izquierda */}
        <div className="trafico-overlay">
          <div className="trafico-controls">
            <input
              type="text"
              placeholder="Ingrese su destino..."
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="search-input"
            />
            <button onClick={handleBuscarRuta} className="search-button">
              Buscar Ruta
            </button>
            {rutaCalculada && (
              <button onClick={handleListo} className="listo-button">
                Listo
              </button>
            )}
            {rutaSeleccionada && (
              <button onClick={handleCancelarRuta} className="cancelar-ruta-button">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {locationError && (
        <div className="geo-alert">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span>{locationError}</span>
          </div>
        </div>
      )}

      <div className="main-container">
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="¿A dónde quieres ir?"
                value={destino}
                onChange={handleSearchChange}
                className="search-input"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <div className="search-icon">🔍</div>

              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="suggestion-icon">
                        {getPlaceIcon(suggestion.types)}
                      </div>
                      <div className="suggestion-text">
                        <div className="suggestion-main">
                          {suggestion.structured_formatting?.main_text || suggestion.description}
                        </div>
                        <div className="suggestion-secondary">
                          {suggestion.structured_formatting?.secondary_text || getPlaceTypeDescription(suggestion.types)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="search-buttons">
              <button onClick={handleBuscarRuta} className="search-button primary">
                <span className="button-icon">🗺️</span>
                Buscar Ruta
              </button>
              {rutaCalculada && (
                <button onClick={handleListo} className="search-button success">
                  <span className="button-icon">✅</span>
                  Listo
                </button>
              )}
              {rutaSeleccionada && (
                <button onClick={handleCancelarRuta} className="search-button danger">
                  <span className="button-icon">❌</span>
                  Cancelar Ruta
                </button>
              )}
            </div>
          </div>

          {locationError && (
            <div className="geo-alert">
              <div className="alert-content">
                <span className="alert-icon">⚠️</span>
                <span>{locationError}</span>
              </div>
            </div>
          )}

          {/* Mapa principal */}
          <div className="map-section">
            <div className="map-container">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentLocation || userLocation || defaultCenter}
                zoom={isTraveling ? 15 : 13}
                onLoad={handleMapLoad}
                onClick={handleMapClick}
                mapTypeId="hybrid"
              >
                <TrafficLayer />
                {currentLocation && <Marker position={currentLocation} label="Yo" />}
                {selectedLocation && !isTraveling && (
                  <Marker
                    position={selectedLocation}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: clickEnRuta ? 8 : 6,
                      fillColor: clickEnRuta ? '#FF0000' : '#FFFF00',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#000000'
                    }}
                  />
                )}
                {reportes.map((reporte) => (
                  <Marker
                    key={reporte.id}
                    position={{ lat: reporte.lat, lng: reporte.lng }}
                    icon={iconMap[reporte.tipo] || undefined}
                    onClick={() => setSelectedReporte(reporte)}
                  />
                ))}
                {selectedReporte && (
                  <InfoWindow
                    position={{ lat: selectedReporte.lat, lng: selectedReporte.lng }}
                    onCloseClick={() => setSelectedReporte(null)}
                  >
                    <div className="info-window-content">
                      <h4 className="info-window-title">{selectedReporte.tipo}</h4>
                      <p className="info-window-description">{selectedReporte.descripcion}</p>
                      {selectedReporte.imagenBase64 && (
                        <img
                          src={selectedReporte.imagenBase64}
                          alt="Incidente"
                          className="info-window-image"
                        />
                      )}
                      {selectedReporte.enRuta && (
                        <p className="info-window-route-warning">⚠️ Este incidente está en tu ruta</p>
                      )}
                    </div>
                  </InfoWindow>
                )}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </div>
          </div>

        {/* Alerta de Seguridad Interactiva */}
        {showSafetyAlert && (
          <div className="safety-alert-overlay">
            <div className="safety-alert-modal">
              <div className="safety-alert-header">
                <h3>🛡️ Medidas de Precaución</h3>
                <button onClick={skipSafetyAlert} className="skip-button">Saltar</button>
              </div>

              <div className="safety-alert-content">
                {safetyAlertStep === 0 && (
                  <div className="safety-step">
                    <div className="safety-icon">🚗</div>
                    <h4>Revisa tu vehículo</h4>
                    <ul>
                      <li>✅ Neumáticos en buen estado</li>
                      <li>✅ Luces funcionando</li>
                      <li>✅ Frenos revisados</li>
                      <li>✅ Combustible suficiente</li>
                    </ul>
                  </div>
                )}

                {safetyAlertStep === 1 && (
                  <div className="safety-step">
                    <div className="safety-icon">👤</div>
                    <h4>Preparación personal</h4>
                    <ul>
                      <li>✅ Cinturón de seguridad</li>
                      <li>✅ Teléfono cargado</li>
                      <li>✅ Documentos al día</li>
                      <li>✅ Descansado y alerta</li>
                    </ul>
                  </div>
                )}

                {safetyAlertStep === 2 && (
                  <div className="safety-step">
                    <div className="safety-icon">🛣️</div>
                    <h4>Durante el viaje</h4>
                    <ul>
                      <li>✅ Respeta los límites de velocidad</li>
                      <li>✅ Mantén distancia segura</li>
                      <li>✅ No uses el teléfono mientras manejas</li>
                      <li>✅ Usa las luces de emergencia si es necesario</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="safety-alert-footer">
                <div className="progress-dots">
                  {[0, 1, 2].map((step) => (
                    <div
                      key={step}
                      className={`progress-dot ${safetyAlertStep === step ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <button onClick={nextSafetyStep} className="next-button">
                  {safetyAlertStep < 2 ? 'Siguiente' : 'Comenzar viaje'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Panel de información del viaje */}
        {showTravelPanel && (
          <div className="travel-panel">
            <div className="travel-header">
              <h3>🚗 Viaje en Progreso</h3>
              <button
                className="close-travel-panel"
                onClick={stopTravelTracking}
                title="Finalizar viaje"
              >
                ✕
              </button>
            </div>

            <div className="travel-stats">
              <div className="stat-item">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <div className="stat-value">{travelData.speed.toFixed(1)}</div>
                  <div className="stat-label">km/h</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">📏</div>
                <div className="stat-content">
                  <div className="stat-value">{(travelData.distance / 1000).toFixed(2)}</div>
                  <div className="stat-label">km recorridos</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <div className="stat-value">
                    {travelData.startTime ?
                      Math.floor((travelData.currentTime - travelData.startTime) / 1000 / 60) : 0
                    }
                  </div>
                  <div className="stat-label">minutos</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{travelData.averageSpeed.toFixed(1)}</div>
                  <div className="stat-label">km/h promedio</div>
                </div>
              </div>
            </div>

            <div className="travel-time">
              <div className="current-time">
                {travelData.currentTime.toLocaleTimeString()}
              </div>
            </div>

            <div className="travel-actions">
              <button
                className="btn-report-incident"
                onClick={() => setShowIncidentModal(true)}
              >
                🚨 Reportar Incidente
              </button>
            </div>
          </div>
        )}

        {/* Panel de Navegación Avanzada */}
        {showNavigationPanel && (
          <div className="navigation-panel">
            <div className="navigation-header">
              <h3>🧭 Navegación Activa</h3>
              <button
                className="close-navigation-panel"
                onClick={() => {
                  setIsNavigating(false);
                  setShowNavigationPanel(false);
                  setShowQuickReportButtons(false);
                }}
                title="Finalizar navegación"
              >
                ✕
              </button>
            </div>

            {/* Próxima instrucción */}
            {nextTurn && (
              <div className="next-turn-info">
                <div className="turn-icon">🔄</div>
                <div className="turn-content">
                  <div className="turn-instruction">{nextTurn}</div>
                  <div className="turn-distance">{distanceToNextTurn}</div>
                </div>
              </div>
            )}

            {/* Tiempo estimado de llegada */}
            {estimatedArrival && (
              <div className="arrival-info">
                <div className="arrival-icon">⏰</div>
                <div className="arrival-content">
                  <div className="arrival-label">Llegada estimada</div>
                  <div className="arrival-time">{estimatedArrival.toLocaleTimeString()}</div>
                </div>
              </div>
            )}

            {/* Botones de reporte rápido */}
            <div className="quick-report-section">
              <h4>🚨 Reporte Rápido</h4>
              <div className="quick-report-buttons">
                <button
                  className="quick-report-btn traffic"
                  onClick={() => reportQuickIncident('Tráfico', 'Reporte rápido')}
                >
                  🚗 Tráfico
                </button>
                <button
                  className="quick-report-btn accident"
                  onClick={() => reportQuickIncident('Accidente', 'Reporte rápido')}
                >
                  💥 Accidente
                </button>
                <button
                  className="quick-report-btn police"
                  onClick={() => reportQuickIncident('Policía', 'Reporte rápido')}
                >
                  👮 Policía
                </button>
                <button
                  className="quick-report-btn danger"
                  onClick={() => reportQuickIncident('Peligro', 'Reporte rápido')}
                >
                  ⚠️ Peligro
                </button>
              </div>

              {/* Botón de reconocimiento de voz */}
              <button
                className={`voice-recognition-btn ${voiceRecognitionActive ? 'active' : ''}`}
                onClick={startVoiceRecognition}
                disabled={voiceRecognitionActive}
              >
                {voiceRecognitionActive ? '🎤 Escuchando...' : '🎤 Reporte por Voz'}
              </button>
            </div>
          </div>
        )}

        {/* Botones de reporte rápido flotantes */}
        {showQuickReportButtons && (
          <div className="floating-report-buttons">
            <button
              className="floating-report-btn"
              onClick={() => reportQuickIncident('Tráfico', 'Reporte rápido')}
              title="Reportar tráfico"
            >
              🚗
            </button>
            <button
              className="floating-report-btn"
              onClick={() => reportQuickIncident('Accidente', 'Reporte rápido')}
              title="Reportar accidente"
            >
              💥
            </button>
            <button
              className="floating-report-btn"
              onClick={() => reportQuickIncident('Policía', 'Reporte rápido')}
              title="Reportar policía"
            >
              👮
            </button>
            <button
              className="floating-report-btn"
              onClick={() => reportQuickIncident('Peligro', 'Reporte rápido')}
              title="Reportar peligro"
            >
              ⚠️
            </button>
          </div>
        )}

        <button
          onClick={() => setShowRutaModal(true)}
          className="fab fab-primary"
          title="Iniciar viaje"
          aria-label="Iniciar viaje"
        >
          <span className="fab-icon">🚗</span>
        </button>

        {showRutaModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Seleccionar Ruta</h3>

              <label>
                <input
                  type="checkbox"
                  checked={usarUbicacionActual}
                  onChange={() => setUsarUbicacionActual(!usarUbicacionActual)}
                /> Usar ubicación actual como origen
              </label>

              {!usarUbicacionActual && (
                <>
                  <label>Ciudad de origen</label>
                  <select className="form-select" value={ciudadOrigenSeleccionada} onChange={(e) => setCiudadOrigenSeleccionada(e.target.value)}>
                    <option value="">Selecciona una ciudad</option>
                    {ciudadesNicaragua.map((ciudad) => (
                      <option key={ciudad.nombre} value={ciudad.nombre}>{ciudad.nombre}</option>
                    ))}
                  </select>
                </>
              )}

              <label>Ciudad de destino</label>
              <select className="form-select" value={ciudadDestino} onChange={(e) => setCiudadDestino(e.target.value)}>
                <option value="">Selecciona una ciudad</option>
                {ciudadesNicaragua.map((ciudad) => (
                  <option key={ciudad.nombre} value={ciudad.nombre}>{ciudad.nombre}</option>
                ))}
              </select>

              <div className="button-group">
                <button className="btn btn-primary" onClick={iniciarViaje}>Buscar ruta</button>
                <button className="btn btn-secondary" onClick={() => setShowRutaModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para reportar incidente durante el viaje */}
        {showIncidentModal && (
          <div className="modal-overlay">
            <div className="modal-content incident-modal">
              <div className="modal-header">
                <h3>🚨 Reportar Incidente</h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowIncidentModal(false);
                    setIncidentType('');
                    setIncidentDescription('');
                    setIncidentImage(null);
                    setIncidentImagePreview(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p className="location-text">
                  Ubicación actual: {currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)}
                </p>

                <div className="form-group">
                  <label>Tipo del incidente</label>
                  <div className="incidente-buttons">
                    {['Tráfico', 'Policía', 'Accidente', 'Peligro', 'Cierre', 'Carril bloqueado'].map((opcion) => (
                      <button
                        key={opcion}
                        className={`tipo-incidente-btn ${incidentType === opcion ? 'selected' : ''}`}
                        onClick={() => setIncidentType(opcion)}
                      >
                        <img src={iconMap[opcion]} alt={opcion} width="24" />
                        {opcion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    placeholder="Describe lo sucedido"
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Imagen (opcional)</label>
                  <div className="image-upload-container">
                    {incidentImagePreview ? (
                      <div className="image-preview-container">
                        <img
                          src={incidentImagePreview}
                          alt="Vista previa"
                          className="image-preview"
                        />
                        <button
                          className="remove-image"
                          onClick={removeIncidentImage}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="incident-image-upload" className="image-upload-label">
                        <svg className="image-upload-icon" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-5 13h2v5h2v-5h2l-3-3l-3 3z" />
                        </svg>
                        Subir imagen
                      </label>
                    )}
                    <input
                      type="file"
                      id="incident-image-upload"
                      accept="image/*"
                      onChange={handleIncidentImageChange}
                      className="hidden-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowIncidentModal(false);
                    setIncidentType('');
                    setIncidentDescription('');
                    setIncidentImage(null);
                    setIncidentImagePreview(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={reportarIncidenteEnViaje}
                  disabled={!incidentType || !incidentDescription}
                >
                  Reportar Incidente
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedLocation && (
          <div className="modal-overlay">
            <div className="modal-content reporte-modal">
              <div className="modal-header">
                <h3>Registrar Reporte</h3>
                <button
                  className="modal-close"
                  onClick={() => setSelectedLocation(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p className="location-text">
                  Ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
                {clickEnRuta && (
                  <p className="route-warning">📍 Estás reportando un incidente en tu ruta</p>
                )}

                <div className="form-group">
                  <label>Tipo del incidente</label>
                  <div className="incidente-buttons">
                    {['Tráfico', 'Policía', 'Accidente', 'Peligro', 'Cierre', 'Carril bloqueado'].map((opcion) => (
                      <button
                        key={opcion}
                        className={`tipo-incidente-btn ${tipo === opcion ? 'selected' : ''}`}
                        onClick={() => setTipo(opcion)}
                      >
                        <img src={iconMap[opcion]} alt={opcion} width="24" />
                        {opcion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    placeholder="Describe lo sucedido"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Imagen (opcional)</label>
                  <div className="image-upload-container">
                    {imagenPreview ? (
                      <div className="image-preview-container">
                        <img
                          src={imagenPreview}
                          alt="Vista previa"
                          className="image-preview"
                        />
                        <button
                          className="remove-image"
                          onClick={removeImage}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="image-upload" className="image-upload-label">
                        <svg className="image-upload-icon" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-5 13h2v5h2v-5h2l-3-3l-3 3z" />
                        </svg>
                        Subir imagen
                      </label>
                    )}
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedLocation(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleGuardarReporte}
                  disabled={!tipo || !descripcion}
                >
                  Guardar Reporte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default EstadoTrafico;