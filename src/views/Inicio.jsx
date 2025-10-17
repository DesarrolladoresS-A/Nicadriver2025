import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, TransitLayer, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import Paginacion from '../components/ordenamiento/Paginacion';
import '../styles/Inicio.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { MessageCircle } from "lucide-react"; //
import '../styles/ChatButton.css';
import ChatButton from '../components/chatbot/ChatButton';

// Configuración de Google Maps
const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px',
  overflow: 'hidden'
};

const center = {
  lat: 12.1364,
  lng: -86.2514
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Datos reales de rutas de transporte colectivo de Managua
const rutasTransporte = [
  {
    id: 'ruta-110',
    nombre: 'Ruta 110 - Mercado Oriental - Ciudad Sandino',
    numero: '110',
    color: '#FF4757',
    horario: '5:00 AM - 10:00 PM',
    frecuencia: '8-12 min',
    precio: 'C$ 2.50',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1364, -86.2514], // Terminal Centro
      [12.1380, -86.2500], // Mercado Oriental
      [12.1400, -86.2480], // Barrio Martha Quezada
      [12.1420, -86.2460], // Villa Libertad
      [12.1440, -86.2440], // Ciudad Sandino
      [12.1460, -86.2420], // Colonia 14 de Septiembre
      [12.1480, -86.2400], // Las Brisas
    ],
    paradasDetalladas: [
      { nombre: 'Terminal Centro', coordenadas: [12.1364, -86.2514], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Mercado Oriental', coordenadas: [12.1380, -86.2500], tiempo: '6 min', tipo: 'Principal' },
      { nombre: 'Barrio Martha Quezada', coordenadas: [12.1400, -86.2480], tiempo: '12 min', tipo: 'Regular' },
      { nombre: 'Villa Libertad', coordenadas: [12.1420, -86.2460], tiempo: '18 min', tipo: 'Regular' },
      { nombre: 'Ciudad Sandino', coordenadas: [12.1440, -86.2440], tiempo: '25 min', tipo: 'Principal' },
      { nombre: 'Colonia 14 de Septiembre', coordenadas: [12.1460, -86.2420], tiempo: '32 min', tipo: 'Regular' },
      { nombre: 'Las Brisas', coordenadas: [12.1480, -86.2400], tiempo: '40 min', tipo: 'Final' },
    ]
  },
  {
    id: 'ruta-112',
    nombre: 'Ruta 112 - Tipitapa - Mercado Oriental',
    numero: '112',
    color: '#00D2D3',
    horario: '5:30 AM - 9:30 PM',
    frecuencia: '10-15 min',
    precio: 'C$ 3.00',
    tipo: 'Interurbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.2000, -86.2000], // Tipitapa
      [12.1900, -86.2100], // San Benito
      [12.1800, -86.2200], // Las Brisas
      [12.1700, -86.2300], // Villa Libertad
      [12.1600, -86.2400], // Mercado Oriental
      [12.1500, -86.2500], // Terminal Centro
    ],
    paradasDetalladas: [
      { nombre: 'Tipitapa', coordenadas: [12.2000, -86.2000], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'San Benito', coordenadas: [12.1900, -86.2100], tiempo: '10 min', tipo: 'Principal' },
      { nombre: 'Las Brisas', coordenadas: [12.1800, -86.2200], tiempo: '20 min', tipo: 'Regular' },
      { nombre: 'Villa Libertad', coordenadas: [12.1700, -86.2300], tiempo: '30 min', tipo: 'Regular' },
      { nombre: 'Mercado Oriental', coordenadas: [12.1600, -86.2400], tiempo: '40 min', tipo: 'Principal' },
      { nombre: 'Terminal Centro', coordenadas: [12.1500, -86.2500], tiempo: '50 min', tipo: 'Terminal' },
    ]
  },
  {
    id: 'ruta-113',
    nombre: 'Ruta 113 - Masaya - Terminal Centro',
    numero: '113',
    color: '#3742FA',
    horario: '6:00 AM - 9:00 PM',
    frecuencia: '15-20 min',
    precio: 'C$ 4.00',
    tipo: 'Interurbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1000, -86.3000], // Masaya
      [12.1100, -86.2900], // Nindirí
      [12.1200, -86.2800], // Colonia Centroamérica
      [12.1300, -86.2700], // Barrio Martha Quezada
      [12.1364, -86.2514], // Terminal Centro
    ],
    paradasDetalladas: [
      { nombre: 'Masaya', coordenadas: [12.1000, -86.3000], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Nindirí', coordenadas: [12.1100, -86.2900], tiempo: '12 min', tipo: 'Principal' },
      { nombre: 'Colonia Centroamérica', coordenadas: [12.1200, -86.2800], tiempo: '22 min', tipo: 'Regular' },
      { nombre: 'Barrio Martha Quezada', coordenadas: [12.1300, -86.2700], tiempo: '32 min', tipo: 'Regular' },
      { nombre: 'Terminal Centro', coordenadas: [12.1364, -86.2514], tiempo: '45 min', tipo: 'Terminal' },
    ]
  },
  {
    id: 'ruta-114',
    nombre: 'Ruta 114 - Carretera Sur - Villa Venezuela',
    numero: '114',
    color: '#96CEB4',
    horario: '5:15 AM - 10:15 PM',
    frecuencia: '12-18 min',
    precio: 'C$ 2.50',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.0800, -86.2500], // Carretera Sur
      [12.1000, -86.2400], // Villa Venezuela
      [12.1200, -86.2300], // Colonia 14 de Septiembre
      [12.1300, -86.2200], // Colonia Centroamérica
      [12.1364, -86.2514], // Terminal Centro
    ],
    paradasDetalladas: [
      { nombre: 'Carretera Sur', coordenadas: [12.0800, -86.2500], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Villa Venezuela', coordenadas: [12.1000, -86.2400], tiempo: '10 min', tipo: 'Principal' },
      { nombre: 'Colonia 14 de Septiembre', coordenadas: [12.1200, -86.2300], tiempo: '20 min', tipo: 'Regular' },
      { nombre: 'Colonia Centroamérica', coordenadas: [12.1300, -86.2200], tiempo: '30 min', tipo: 'Regular' },
      { nombre: 'Terminal Centro', coordenadas: [12.1364, -86.2514], tiempo: '40 min', tipo: 'Terminal' },
    ]
  },
  {
    id: 'ruta-115',
    nombre: 'Ruta 115 - Ciudad Sandino - Las Brisas',
    numero: '115',
    color: '#FFEAA7',
    horario: '5:45 AM - 9:45 PM',
    frecuencia: '8-10 min',
    precio: 'C$ 2.50',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1500, -86.2400], // Ciudad Sandino
      [12.1550, -86.2350], // Colonia 14 de Septiembre
      [12.1600, -86.2300], // Las Brisas
      [12.1650, -86.2250], // Villa Libertad
      [12.1700, -86.2200], // San Benito
    ],
    paradasDetalladas: [
      { nombre: 'Ciudad Sandino', coordenadas: [12.1500, -86.2400], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Colonia 14 de Septiembre', coordenadas: [12.1550, -86.2350], tiempo: '8 min', tipo: 'Regular' },
      { nombre: 'Las Brisas', coordenadas: [12.1600, -86.2300], tiempo: '15 min', tipo: 'Principal' },
      { nombre: 'Villa Libertad', coordenadas: [12.1650, -86.2250], tiempo: '22 min', tipo: 'Regular' },
      { nombre: 'San Benito', coordenadas: [12.1700, -86.2200], tiempo: '30 min', tipo: 'Final' },
    ]
  },
  {
    id: 'ruta-116',
    nombre: 'Ruta 116 - Terminal Centro - Mercado Oriental',
    numero: '116',
    color: '#FF9F43',
    horario: '5:00 AM - 10:30 PM',
    frecuencia: '6-8 min',
    precio: 'C$ 2.00',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1364, -86.2514], // Terminal Centro
      [12.1380, -86.2500], // Barrio Martha Quezada
      [12.1400, -86.2500], // Mercado Oriental
      [12.1420, -86.2480], // Villa Libertad
      [12.1440, -86.2460], // Colonia Centroamérica
    ],
    paradasDetalladas: [
      { nombre: 'Terminal Centro', coordenadas: [12.1364, -86.2514], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Barrio Martha Quezada', coordenadas: [12.1380, -86.2500], tiempo: '5 min', tipo: 'Regular' },
      { nombre: 'Mercado Oriental', coordenadas: [12.1400, -86.2500], tiempo: '10 min', tipo: 'Principal' },
      { nombre: 'Villa Libertad', coordenadas: [12.1420, -86.2480], tiempo: '15 min', tipo: 'Regular' },
      { nombre: 'Colonia Centroamérica', coordenadas: [12.1440, -86.2460], tiempo: '20 min', tipo: 'Final' },
    ]
  },
  {
    id: 'ruta-117',
    nombre: 'Ruta 117 - Las Brisas - Ciudad Sandino',
    numero: '117',
    color: '#6C5CE7',
    horario: '6:15 AM - 9:15 PM',
    frecuencia: '12-15 min',
    precio: 'C$ 3.00',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1600, -86.2300], // Las Brisas
      [12.1550, -86.2350], // Colonia 14 de Septiembre
      [12.1500, -86.2400], // Ciudad Sandino
      [12.1450, -86.2450], // Villa Libertad
      [12.1400, -86.2500], // Mercado Oriental
    ],
    paradasDetalladas: [
      { nombre: 'Las Brisas', coordenadas: [12.1600, -86.2300], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Colonia 14 de Septiembre', coordenadas: [12.1550, -86.2350], tiempo: '8 min', tipo: 'Regular' },
      { nombre: 'Ciudad Sandino', coordenadas: [12.1500, -86.2400], tiempo: '15 min', tipo: 'Principal' },
      { nombre: 'Villa Libertad', coordenadas: [12.1450, -86.2450], tiempo: '22 min', tipo: 'Regular' },
      { nombre: 'Mercado Oriental', coordenadas: [12.1400, -86.2500], tiempo: '30 min', tipo: 'Final' },
    ]
  },
  {
    id: 'ruta-118',
    nombre: 'Ruta 118 - Villa Venezuela - Terminal Centro',
    numero: '118',
    color: '#00B894',
    horario: '5:30 AM - 10:00 PM',
    frecuencia: '10-12 min',
    precio: 'C$ 2.50',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1000, -86.2400], // Villa Venezuela
      [12.1100, -86.2450], // Colonia Centroamérica
      [12.1200, -86.2500], // Barrio Martha Quezada
      [12.1300, -86.2520], // Mercado Oriental
      [12.1364, -86.2514], // Terminal Centro
    ],
    paradasDetalladas: [
      { nombre: 'Villa Venezuela', coordenadas: [12.1000, -86.2400], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Colonia Centroamérica', coordenadas: [12.1100, -86.2450], tiempo: '8 min', tipo: 'Regular' },
      { nombre: 'Barrio Martha Quezada', coordenadas: [12.1200, -86.2500], tiempo: '15 min', tipo: 'Regular' },
      { nombre: 'Mercado Oriental', coordenadas: [12.1300, -86.2520], tiempo: '22 min', tipo: 'Principal' },
      { nombre: 'Terminal Centro', coordenadas: [12.1364, -86.2514], tiempo: '30 min', tipo: 'Terminal' },
    ]
  },
  {
    id: 'ruta-119',
    nombre: 'Ruta 119 - San Benito - Las Brisas',
    numero: '119',
    color: '#E17055',
    horario: '6:00 AM - 9:00 PM',
    frecuencia: '15-20 min',
    precio: 'C$ 3.50',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1800, -86.2200], // San Benito
      [12.1750, -86.2250], // Villa Libertad
      [12.1700, -86.2300], // Las Brisas
      [12.1650, -86.2350], // Colonia 14 de Septiembre
      [12.1600, -86.2400], // Ciudad Sandino
    ],
    paradasDetalladas: [
      { nombre: 'San Benito', coordenadas: [12.1800, -86.2200], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Villa Libertad', coordenadas: [12.1750, -86.2250], tiempo: '10 min', tipo: 'Regular' },
      { nombre: 'Las Brisas', coordenadas: [12.1700, -86.2300], tiempo: '18 min', tipo: 'Principal' },
      { nombre: 'Colonia 14 de Septiembre', coordenadas: [12.1650, -86.2350], tiempo: '25 min', tipo: 'Regular' },
      { nombre: 'Ciudad Sandino', coordenadas: [12.1600, -86.2400], tiempo: '35 min', tipo: 'Final' },
    ]
  },
  {
    id: 'ruta-120',
    nombre: 'Ruta 120 - Terminal Centro - Villa Venezuela',
    numero: '120',
    color: '#A29BFE',
    horario: '5:00 AM - 10:30 PM',
    frecuencia: '8-10 min',
    precio: 'C$ 2.50',
    tipo: 'Urbana',
    empresa: 'Transporte Managua',
    recorrido: [
      [12.1364, -86.2514], // Terminal Centro
      [12.1300, -86.2500], // Mercado Oriental
      [12.1200, -86.2480], // Barrio Martha Quezada
      [12.1100, -86.2460], // Colonia Centroamérica
      [12.1000, -86.2440], // Villa Venezuela
    ],
    paradasDetalladas: [
      { nombre: 'Terminal Centro', coordenadas: [12.1364, -86.2514], tiempo: '0 min', tipo: 'Terminal' },
      { nombre: 'Mercado Oriental', coordenadas: [12.1300, -86.2500], tiempo: '8 min', tipo: 'Principal' },
      { nombre: 'Barrio Martha Quezada', coordenadas: [12.1200, -86.2480], tiempo: '15 min', tipo: 'Regular' },
      { nombre: 'Colonia Centroamérica', coordenadas: [12.1100, -86.2460], tiempo: '22 min', tipo: 'Regular' },
      { nombre: 'Villa Venezuela', coordenadas: [12.1000, -86.2440], tiempo: '30 min', tipo: 'Final' },
    ]
  }
];

// Paradas principales de buses
const paradasPrincipales = [
  {
    id: 'parada-1',
    nombre: 'Terminal de Buses Centro',
    coordenadas: [12.1364, -86.2514],
    rutas: ['Ruta 1', 'Ruta 2', 'Ruta 3', 'Ruta 4', 'Ruta 5']
  },
  {
    id: 'parada-2',
    nombre: 'Mercado Oriental',
    coordenadas: [12.1400, -86.2500],
    rutas: ['Ruta 1', 'Ruta 2']
  },
  {
    id: 'parada-3',
    nombre: 'Ciudad Sandino',
    coordenadas: [12.1500, -86.2400],
    rutas: ['Ruta 2']
  },
  {
    id: 'parada-4',
    nombre: 'Tipitapa',
    coordenadas: [12.2000, -86.2000],
    rutas: ['Ruta 3']
  },
  {
    id: 'parada-5',
    nombre: 'Masaya',
    coordenadas: [12.1000, -86.3000],
    rutas: ['Ruta 4']
  },
  {
    id: 'parada-6',
    nombre: 'Carretera Sur',
    coordenadas: [12.0800, -86.2500],
    rutas: ['Ruta 5']
  }
];

const Inicio = () => {
  // Estado para reportes y paginación
  const [reportes, setReportes] = useState([]);
  const [currentDocPage, setCurrentDocPage] = useState(1);
  const [docsPerPage] = useState(4);

  // Estado para Google Maps
  const [map, setMap] = useState(null);
  const [transitLayerVisible, setTransitLayerVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapError, setMapError] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [rutasVisiblesMapa, setRutasVisiblesMapa] = useState(() => {
    const initialState = {};
    rutasTransporte.forEach(ruta => {
      initialState[ruta.id] = true;
    });
    return initialState;
  });

  // Estado para el mapa de transporte
  const [userPosition] = useState({ lat: 12.1364, lng: -86.2514 });
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rutasVisibles, setRutasVisibles] = useState(() => {
    const initialState = {};
    rutasTransporte.forEach(ruta => {
      initialState[ruta.id] = true;
    });
    return initialState;
  });
  const [paradasVisibles, setParadasVisibles] = useState(true);

  // Estado para el selector de rutas tipo Moovit
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [buscarParada, setBuscarParada] = useState('');
  const [mostrarDetallesRuta, setMostrarDetallesRuta] = useState(false);

  // Estado para funcionalidades avanzadas del mapa
  const [filtroTipo, setFiltroTipo] = useState('Todas');
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas');
  const [rutaDestacada, setRutaDestacada] = useState(null);
  const [mostrarTodasLasRutas, setMostrarTodasLasRutas] = useState(true);

  // Carrusel de imágenes (hero secundario si se desea)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/imagen/Carretera1.jpeg', '/imagen/Calle-1.jpg', '/imagen/calle-2.jpeg', '/imagen/calle-3.webp'];

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reportes'));
        setReportes(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (e) {
        console.error('Error obteniendo reportes:', e);
      }
    };
    fetchReportes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Verificar API key de Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('API Key status:', apiKey ? 'Present' : 'Missing');

    if (!apiKey || apiKey === 'tu_clave_de_api_aqui' || apiKey === 'demo-key') {
      setMapError('Google Maps API Key no configurada correctamente');
      setIsMapLoading(false);
    } else {
      // Si hay API key, intentar cargar el mapa
      setIsMapLoading(true);
      setMapError(null);

      // Timeout para evitar carga infinita
      const timeout = setTimeout(() => {
        if (isMapLoading) {
          setMapError('Timeout: El mapa tardó demasiado en cargar');
          setIsMapLoading(false);
        }
      }, 10000); // 10 segundos

      return () => clearTimeout(timeout);
    }
  }, [isMapLoading]);

  // PDF de reporte
  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return 'Sin fecha';
    const fecha = fechaHora.toDate ? fechaHora.toDate() : new Date(fechaHora);
    return fecha.toLocaleString('es-NI');
  };

  const generarPDF = (reporte) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Reporte de Incidente', 20, 20);
    doc.text(`Título: ${reporte.titulo}`, 20, 30);
    doc.text(`Ubicación: ${reporte.ubicacion}`, 20, 40);
    doc.text(`Descripción: ${reporte.descripcion}`, 20, 50);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fechaHora)}`, 20, 60);
    doc.save(`${reporte.titulo}.pdf`);
  };

  // Lucide y toggle de tema (modo oscuro)
  useEffect(() => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    // refrescar íconos para que tomen color adecuado
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // Funciones para manejar Google Maps
  const onLoad = useCallback((map) => {
    console.log('Google Maps loaded successfully');
    setMap(map);
    setIsMapLoading(false);
    setMapError(null);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onError = useCallback((error) => {
    console.error('Error cargando Google Maps:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'
    });
    setMapError(`Error cargando el mapa: ${error.message || 'Error desconocido'}`);
    setIsMapLoading(false);
  }, []);

  const toggleTransitLayer = () => {
    setTransitLayerVisible(!transitLayerVisible);
  };

  const toggleParadas = () => {
    setParadasVisibles(!paradasVisibles);
  };

  const toggleRutaMapa = (rutaId) => {
    setRutasVisiblesMapa(prev => ({
      ...prev,
      [rutaId]: !prev[rutaId]
    }));
  };

  const resetMapa = () => {
    if (map) {
      map.setZoom(13);
      map.setCenter(center);
    }
    setTransitLayerVisible(false);
    setParadasVisibles(true);
    setSelectedMarker(null);
    setRutaDestacada(null);
    setMostrarTodasLasRutas(true);
    setFiltroTipo('Todas');
    setFiltroEmpresa('Todas');

    // Restaurar todas las rutas
    const initialState = {};
    rutasTransporte.forEach(ruta => {
      initialState[ruta.id] = true;
    });
    setRutasVisiblesMapa(initialState);
  };

  // Funciones para el selector de rutas tipo Moovit
  const seleccionarRuta = (ruta) => {
    setRutaSeleccionada(ruta);
    setMostrarDetallesRuta(true);
    setRutaDestacada(ruta.id);
    setMostrarTodasLasRutas(false);

    // Filtrar solo la ruta seleccionada en el mapa
    const nuevaVisibilidad = {};
    rutasTransporte.forEach(r => {
      nuevaVisibilidad[r.id] = r.id === ruta.id;
    });
    setRutasVisibles(nuevaVisibilidad);
  };

  const cerrarDetallesRuta = () => {
    setMostrarDetallesRuta(false);
    setRutaSeleccionada(null);
    setBuscarParada('');
    setRutaDestacada(null);
    setMostrarTodasLasRutas(true);

    // Restaurar todas las rutas
    const initialState = {};
    rutasTransporte.forEach(ruta => {
      initialState[ruta.id] = true;
    });
    setRutasVisibles(initialState);
  };

  // Funciones avanzadas para filtrado
  const aplicarFiltros = () => {
    const rutasFiltradas = rutasTransporte.filter(ruta => {
      const cumpleTipo = filtroTipo === 'Todas' || ruta.tipo === filtroTipo;
      const cumpleEmpresa = filtroEmpresa === 'Todas' || ruta.empresa === filtroEmpresa;
      return cumpleTipo && cumpleEmpresa;
    });

    const nuevaVisibilidad = {};
    rutasTransporte.forEach(ruta => {
      nuevaVisibilidad[ruta.id] = rutasFiltradas.some(r => r.id === ruta.id);
    });
    setRutasVisibles(nuevaVisibilidad);
  };

  const destacarRuta = (rutaId) => {
    setRutaDestacada(rutaDestacada === rutaId ? null : rutaId);
  };

  const obtenerTiposUnicos = () => {
    return [...new Set(rutasTransporte.map(ruta => ruta.tipo))];
  };

  const obtenerEmpresasUnicas = () => {
    return [...new Set(rutasTransporte.map(ruta => ruta.empresa))];
  };

  // Funcionalidad para descarga de app
  const descargarApp = () => {
    // Detectar el sistema operativo del usuario
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      // Redirigir a Google Play Store
      window.open('https://play.google.com/store/apps/details?id=com.nicadriver.app', '_blank');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      // Redirigir a App Store
      window.open('https://apps.apple.com/app/nicadriver/id123456789', '_blank');
    } else {
      // Mostrar modal con opciones para ambos sistemas
      const opcion = confirm(
        '¿Desde qué dispositivo quieres descargar la app?\n\n' +
        'Aceptar: Android (Google Play)\n' +
        'Cancelar: iOS (App Store)'
      );

      if (opcion) {
        window.open('https://play.google.com/store/apps/details?id=com.nicadriver.app', '_blank');
      } else {
        window.open('https://apps.apple.com/app/nicadriver/id123456789', '_blank');
      }
    }
  };

  const filtrarParadas = (termino) => {
    if (!rutaSeleccionada) return [];
    return rutaSeleccionada.paradasDetalladas.filter(parada =>
      parada.nombre.toLowerCase().includes(termino.toLowerCase())
    );
  };

  const indexOfLastDoc = currentDocPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDocs = reportes.slice(indexOfFirstDoc, indexOfLastDoc);

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="hero-gradient full-bleed min-h-[95vh] flex items-center justify-center pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hero-content text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Movilidad Inteligente para <span className="text-yellow-300">Nicaragua</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Planifica tu viaje en transporte público, encuentra las mejores rutas de buses y navega por Managua de manera inteligente y eficiente.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="btn btn-secondary btn-lg animate-float">
                  <i data-lucide="bus" className="w-5 h-5 mr-2"></i>
                  Ver Rutas de Buses
                </button>
                <button className="btn bg-yellow-400 text-blue-900 hover:bg-yellow-300 btn-lg animate-float">
                  <i data-lucide="map-pin" className="w-5 h-5 mr-2"></i>
                  Encontrar Parada
                </button>
              </div>
            </div>

            <div className="relative animate-float">
              <img
                src="https://laprensa-bucket.s3.us-west-2.amazonaws.com/wp-content/uploads/2016/03/26175105/Av.-Bolivar1.jpg"
                alt="Modern city traffic and transportation"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Descarga App */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Etiqueta */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Descarga NicaDriver</h2>

          {/* Botón único de descarga */}
          <button
            onClick={descargarApp}
            className="btn btn-primary btn-lg px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <i data-lucide="download" className="w-6 h-6 mr-3"></i>
            Descargar App Gratis
          </button>

          {/* Características destacadas */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="map" className="w-8 h-8 text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Rutas de Managua</h3>
              <p className="text-muted-foreground text-sm">Consulta todas las rutas de buses de Managua con paradas y horarios actualizados</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="bell" className="w-8 h-8 text-green-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Notificaciones Inteligentes</h3>
              <p className="text-muted-foreground text-sm">Recibe alertas sobre retrasos, cambios de ruta y condiciones del tráfico</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="navigation" className="w-8 h-8 text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Navegación en Tiempo Real</h3>
              <p className="text-muted-foreground text-sm">Mapas actualizados y tráfico en vivo para una mejor experiencia de viaje</p>
            </div>
          </div>
        </div>
      </section>

      {/* Misión & Visión */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Nuestra Misión</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transformamos la movilidad urbana a través de tecnología innovadora y colaboración ciudadana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                <i data-lucide="star" className="w-8 h-8 text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Misión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Proporcionar una plataforma tecnológica que mejore la seguridad vial y optimice el flujo de tráfico en Nicaragua mediante reportes ciudadanos y análisis de datos en tiempo real.
              </p>
            </div>

            <div className="card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                <i data-lucide="eye" className="w-8 h-8 text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Visión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ser la plataforma líder en movilidad inteligente en Centroamérica, contribuyendo a ciudades más conectadas, seguras y eficientes para todos los ciudadanos.
              </p>
            </div>

            <div className="card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <i data-lucide="shield" className="w-8 h-8 text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Valores</h3>
              <p className="text-muted-foreground leading-relaxed">
                Innovación, transparencia, colaboración y compromiso con la seguridad vial. Creemos en el poder de la tecnología para crear un impacto positivo en la sociedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa de Rutas de Transporte Colectivo */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mapa Interactivo de Rutas</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explora todas las rutas de transporte público de Managua. Haz clic en cualquier ruta para ver su recorrido completo
            </p>
          </div>

          <div className="card rounded-2xl shadow-lg overflow-hidden">
            {/* Controles del mapa */}
            <div className="transport-controls">
              {/* Filtros principales */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-card-foreground">Filtros:</span>

                  {/* Filtro por tipo */}
                  <select
                    value={filtroTipo}
                    onChange={(e) => {
                      setFiltroTipo(e.target.value);
                      aplicarFiltros();
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Todas">Todos los tipos</option>
                    {obtenerTiposUnicos().map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>

                  {/* Filtro por empresa */}
                  <select
                    value={filtroEmpresa}
                    onChange={(e) => {
                      setFiltroEmpresa(e.target.value);
                      aplicarFiltros();
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Todas">Todas las empresas</option>
                    {obtenerEmpresasUnicas().map(empresa => (
                      <option key={empresa} value={empresa}>{empresa}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleParadas}
                    className={`btn btn-sm ${paradasVisibles ? 'btn-default' : 'btn-outline'}`}
                  >
                    <i data-lucide="map-pin" className="w-4 h-4 mr-1"></i>
                    Paradas
                  </button>
                  <button
                    onClick={toggleTransitLayer}
                    className={`btn btn-sm ${transitLayerVisible ? 'btn-default' : 'btn-outline'}`}
                  >
                    <i data-lucide="layers" className="w-4 h-4 mr-1"></i>
                    Google Transit
                  </button>
                  <button
                    onClick={resetMapa}
                    className="btn btn-outline btn-sm"
                  >
                    <i data-lucide="refresh-cw" className="w-4 h-4 mr-1"></i>
                    Reset
                  </button>
                </div>
              </div>

              {/* Selector de rutas individuales */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground mr-2">Rutas:</span>
                  {rutasTransporte.map((ruta) => (
                    <button
                      key={ruta.id}
                      onClick={() => toggleRutaMapa(ruta.id)}
                      className={`route-filter-btn ${rutasVisiblesMapa[ruta.id] ? 'active' : ''}`}
                      style={{
                        backgroundColor: rutasVisiblesMapa[ruta.id] ? ruta.color : 'transparent',
                        borderColor: ruta.color,
                        color: rutasVisiblesMapa[ruta.id] ? 'white' : ruta.color
                      }}
                    >
                      {ruta.numero}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leyenda mejorada para Google Maps */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="legend-item">
                  <div className="legend-color bg-blue-500"></div>
                  <span>Rutas Manuales</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color bg-red-500"></div>
                  <span>Terminal Principal</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color bg-blue-500"></div>
                  <span>Paradas</span>
                </div>
                <div className="legend-item">
                  <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
                  <span>Google Maps Transit</span>
                </div>
              </div>
            </div>

            {/* Mapa interactivo con Google Maps */}
            <div className="relative bg-muted">
              <div className="p-4">
                <div className="transport-map-container">
                  {mapError ? (
                    <div className="map-error-container">
                      <div className="error-icon">⚠️</div>
                      <h3 className="error-title">Error del Mapa</h3>
                      <p className="error-message">{mapError}</p>
                      <div className="error-solutions">
                        <h4>Soluciones:</h4>
                        <ol>
                          <li>Crear archivo <code>.env</code> en la raíz del proyecto</li>
                          <li>Agregar: <code>VITE_GOOGLE_MAPS_API_KEY=tu_clave_real_aqui</code></li>
                          <li>Obtener clave desde <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                          <li>Habilitar Maps JavaScript API y Places API</li>
                          <li>Verificar que la clave tenga permisos para tu dominio</li>
                        </ol>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <strong>Debug Info:</strong>
                          <br />
                          API Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Presente' : 'Faltante'}
                          <br />
                          Error: {mapError}
                        </div>
                      </div>
                    </div>
                  ) : isMapLoading ? (
                    <div className="map-loading-container">
                      <div className="loading-spinner"></div>
                      <p>Cargando mapa...</p>
                    </div>
                  ) : (
                    <LoadScript
                      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key'}
                      libraries={['places']}
                      onError={onError}
                    >
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={mapZoom}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        options={mapOptions}
                      >
                        {/* Capa de transporte público de Google */}
                        {transitLayerVisible && <TransitLayer />}

                        {/* Rutas manuales de Managua */}
                        {rutasTransporte.map((ruta) => (
                          rutasVisiblesMapa[ruta.id] && (
                            <Polyline
                              key={ruta.id}
                              path={ruta.recorrido.map(coord => ({
                                lat: coord[0],
                                lng: coord[1]
                              }))}
                              options={{
                                strokeColor: ruta.color,
                                strokeOpacity: 0.8,
                                strokeWeight: 4,
                                clickable: false,
                                geodesic: true
                              }}
                            />
                          )
                        ))}

                        {/* Marcadores de paradas principales */}
                        {paradasVisibles && paradasPrincipales.map((parada) => (
                          <Marker
                            key={parada.id}
                            position={{ lat: parada.coordenadas[0], lng: parada.coordenadas[1] }}
                            onClick={() => setSelectedMarker(parada)}
                            icon={{
                              url: parada.id === 'parada-1'
                                ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                              scaledSize: new window.google.maps.Size(30, 30)
                            }}
                          />
                        ))}

                        {/* InfoWindow para mostrar información de paradas */}
                        {selectedMarker && (
                          <InfoWindow
                            position={{
                              lat: selectedMarker.coordenadas[0],
                              lng: selectedMarker.coordenadas[1]
                            }}
                            onCloseClick={() => setSelectedMarker(null)}
                          >
                            <div className="stop-popup">
                              <h3 className="font-bold text-lg mb-2">{selectedMarker.nombre}</h3>
                              <div className="mb-2">
                                <strong>Rutas disponibles:</strong>
                              </div>
                              <ul className="routes-list">
                                {selectedMarker.rutas.map((ruta, index) => (
                                  <li key={index} className="text-sm">{ruta}</li>
                                ))}
                              </ul>
                              {selectedMarker.id === 'parada-1' && (
                                <div className="terminal-info mt-2 p-2 bg-blue-50 rounded">
                                  <strong>Terminal Principal:</strong> Punto de conexión para todas las rutas
                                </div>
                              )}
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  )}
                </div>
              </div>

              {/* Estadísticas del transporte */}
              <div className="transport-stats">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-item">
                    <div className="stat-number">{rutasTransporte.length}</div>
                    <div className="stat-label">Rutas Totales</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{rutasTransporte.filter(r => r.tipo === 'Urbana').length}</div>
                    <div className="stat-label">Rutas Urbanas</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{rutasTransporte.filter(r => r.tipo === 'Interurbana').length}</div>
                    <div className="stat-label">Rutas Interurbanas</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">5:00 AM - 10:30 PM</div>
                    <div className="stat-label">Horario Promedio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentos de reportes */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Documentos de reportes</h2>
            <p className="text-muted-foreground">Haz clic en un icono para descargar el reporte en PDF</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {currentDocs.map((reporte) => (
              <div
                key={reporte.id}
                className="card p-4 rounded-xl shadow hover:shadow-md cursor-pointer transition"
                onClick={() => generarPDF(reporte)}
              >
                <div className="flex items-center gap-3">
                  <i data-lucide="file-text" className="w-6 h-6 text-red-500"></i>
                  <div>
                    <h4 className="font-semibold text-card-foreground leading-tight">{reporte.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{formatearFechaHora(reporte.fechaHora)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reportes.length > docsPerPage && (
            <div className="mt-6 flex justify-center">
              <Paginacion
                totalItems={reportes.length}
                itemsPerPage={docsPerPage}
                currentPage={currentDocPage}
                setCurrentPage={setCurrentDocPage}
              />
            </div>
          )}
        </div>
      </section>

      {/* Botón de chatbot */}
      <div className="fixed bottom-6 right-6 z-40">
        <ChatButton />
      </div>

    </div>
  );
};

export default Inicio;