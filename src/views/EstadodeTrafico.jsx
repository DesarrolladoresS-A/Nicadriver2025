import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  TrafficLayer,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import { deleteDoc, doc } from 'firebase/firestore';
import '../styles/EstadodeTrafico.css';

const containerStyle = {
  width: '80vw',
  height: '600px',
  borderRadius: '12px',
  maxHeight: '700px',
};

const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const iconMap = {
  Accidente: 'https://img.icons8.com/color/48/car-crash.png',
  Tráfico: 'https://img.icons8.com/color/48/traffic-jam.png',
  Emergencia: 'https://img.icons8.com/color/48/ambulance.png',
  Policía: 'https://img.icons8.com/color/48/policeman-male.png',
};

const EstadoTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);

  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [selectedReporte, setSelectedReporte] = useState(null);

  const [puntoInicio, setPuntoInicio] = useState(null);
  const [puntoDestino, setPuntoDestino] = useState(null);
  const [showRutaMenu, setShowRutaMenu] = useState(false);
  const [seleccionandoInicio, setSeleccionandoInicio] = useState(true);

  // Detectar dispositivo móvil
  const esMovil = window.innerWidth <= 768;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(current);
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'incidentes'), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReportes(datos);
    });
    return () => unsubscribe();
  }, []);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = (event) => {
    const latLng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    if (showRutaMenu) {
      if (seleccionandoInicio) {
        setPuntoInicio(latLng);
        setSeleccionandoInicio(false);
      } else {
        setPuntoDestino(latLng);
      }
    } else {
      setSelectedLocation(latLng);
    }
  };

  const handleGuardarReporte = async () => {
    if (!tipo || !descripcion || !selectedLocation || !imagen) {
      alert('Completa todos los campos y selecciona una ubicación en el mapa.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        await addDoc(collection(db, 'incidentes'), {
          tipo,
          descripcion,
          imagenBase64: base64Image,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          fecha: serverTimestamp(),
        });

        alert('Reporte guardado exitosamente');
        setTipo('');
        setDescripcion('');
        setImagen(null);
        setSelectedLocation(null);
      };
      reader.readAsDataURL(imagen);
    } catch (error) {
      console.error('Error guardando el reporte:', error);
      alert('Hubo un error al guardar el reporte.');
    }
  };

  const handleIniciarViaje = () => {
    if (esMovil) {
      setShowRutaMenu(true);
      setSeleccionandoInicio(true);
    } else {
      alert('Esta función solo está disponible en dispositivos móviles.');
    }
  };

  const handleConfirmarRuta = () => {
    if (!puntoInicio || !puntoDestino) {
      alert('Selecciona un punto de inicio y uno de destino tocando el mapa.');
      return;
    }
    alert(`Ruta iniciada de (${puntoInicio.lat.toFixed(4)}, ${puntoInicio.lng.toFixed(4)}) a (${puntoDestino.lat.toFixed(4)}, ${puntoDestino.lng.toFixed(4)})`);
    setShowRutaMenu(false);
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Estado del Tráfico</h2>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          mapTypeId="roadmap"
        >
          {showTraffic && <TrafficLayer />}
          {userLocation && <Marker position={userLocation} label="Yo" />}
          {selectedLocation && <Marker position={selectedLocation} />}
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
    <div style={{ maxWidth: '220px' }}>
      <h4>{selectedReporte.tipo}</h4>
      <p>{selectedReporte.descripcion}</p>
      {selectedReporte.imagenBase64 && (
        <img
          src={selectedReporte.imagenBase64}
          alt="Incidente"
          style={{ width: '100%', borderRadius: '5px', marginBottom: '10px' }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={async () => {
            await addDoc(collection(db, 'confirmaciones'), {
              incidenteId: selectedReporte.id,
              confirmadoEn: serverTimestamp(),
            });
            alert('Se ha confirmado que el incidente sigue ocurriendo.');
            setSelectedReporte(null);
          }}
          style={{
            backgroundColor: '#ffc107',
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            color: '#333',
            cursor: 'pointer',
          }}
        >
          Sigue ocurriendo
        </button>
        <button
          onClick={async () => {
            if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
              await deleteDoc(doc(db, 'incidentes', selectedReporte.id));
              alert('Reporte eliminado');
              setSelectedReporte(null);
            }
          }}
          style={{
            backgroundColor: '#dc3545',
            border: 'none',
            borderRadius: '4px',
            padding: '6px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Eliminar reporte
        </button>
      </div>
    </div>
  </InfoWindow>
)}

        </GoogleMap>

        {/* Botón iniciar viaje (móvil) */}
        <button
          onClick={handleIniciarViaje}
          className="boton-iniciar-viaje"
        >
          🚗 Iniciar Viaje
        </button>

        {/* Menú de ruta (desplegable) */}
        {showRutaMenu && (
          <div className="ruta-sidebar">
            <h3>Iniciar Ruta</h3>
            <p><strong>Inicio:</strong> {puntoInicio ? `${puntoInicio.lat.toFixed(4)}, ${puntoInicio.lng.toFixed(4)}` : 'No seleccionado'}</p>
            <p><strong>Destino:</strong> {puntoDestino ? `${puntoDestino.lat.toFixed(4)}, ${puntoDestino.lng.toFixed(4)}` : 'No seleccionado'}</p>
            <p style={{ fontSize: '14px', color: '#555' }}>
              Toca en el mapa para seleccionar primero el inicio y luego el destino.
            </p>
            <div className="button-group">
              <button onClick={handleConfirmarRuta} className="button-guardar">Confirmar Ruta</button>
              <button onClick={() => setShowRutaMenu(false)} className="button-cancelar">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de reporte */}
      {selectedLocation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar Reporte</h3>
            <p>
              Ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>

            <label>Tipo del incidente</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Selecciona el tipo de incidente</option>
              <option value="Accidente">Accidente</option>
              <option value="Tráfico">Tráfico</option>
              <option value="Emergencia">Emergencia</option>
              <option value="Policía">Policía</option>
            </select>

            <label>Descripción</label>
            <textarea
              placeholder="Describe lo sucedido"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />

            <label>Subir foto</label>
            <label className="file-upload">
              📎 Subir foto
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>

            <div className="button-group">
              <button onClick={handleGuardarReporte} className="button-guardar">Guardar reporte</button>
              <button onClick={() => setSelectedLocation(null)} className="button-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadoTrafico;
