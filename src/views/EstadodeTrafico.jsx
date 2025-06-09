import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  TrafficLayer,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer
} from '@react-google-maps/api';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
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

const ciudadesNicaragua = [
  { nombre: 'Managua', lat: 12.1364, lng: -86.2514 },
  { nombre: 'León', lat: 12.4345, lng: -86.8794 },
  { nombre: 'Granada', lat: 11.9344, lng: -85.956 },
  { nombre: 'Matagalpa', lat: 12.9256, lng: -85.9175 },
  { nombre: 'Estelí', lat: 13.091, lng: -86.3538 },
];

const EstadoTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
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
  const [usarUbicacionActual, setUsarUbicacionActual] = useState(true);
  const [ciudadOrigenSeleccionada, setCiudadOrigenSeleccionada] = useState('');
  const [directions, setDirections] = useState(null);

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
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
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
        setImagenPreview(null);
        setSelectedLocation(null);
      };
      reader.readAsDataURL(imagen);
    } catch (error) {
      console.error('Error guardando el reporte:', error);
      alert('Hubo un error al guardar el reporte.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      // Crear una vista previa de la imagen
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

  const iniciarViaje = () => {
    const origen = usarUbicacionActual
      ? userLocation
      : ciudadesNicaragua.find((c) => c.nombre === ciudadOrigenSeleccionada);

    const destino = ciudadesNicaragua.find((c) => c.nombre === ciudadDestino);

    if (!origen || !destino) {
      alert('Debes seleccionar el origen y destino correctamente.');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
          mapRef.current.panTo(origen);
          mapRef.current.setZoom(8);
        } else {
          console.error('Error obteniendo ruta:', status);
        }
      }
    );
    setShowRutaModal(false);
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
          mapTypeId="hybrid"
        >
          <TrafficLayer />
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
              <div style={{ maxWidth: '280px' }}>
                <h4 style={{ color: '#FF5722', marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>{selectedReporte.tipo}</h4>
                <p style={{ margin: '0 0 18px 0', color: '#333', fontSize: '14px', lineHeight: '1.4' }}>{selectedReporte.descripcion}</p>
                {selectedReporte.imagenBase64 && (
                  <img
                    src={selectedReporte.imagenBase64}
                    alt="Incidente"
                    style={{ width: '100%', borderRadius: '5px', marginBottom: '18px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}
                  />
                )}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '18px', paddingTop: '12px', borderTop: '2px solid rgba(0, 0, 0, 0.1)' }}>
                  <button 
                    className="info-window-button sigue"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={async () => {
                      await addDoc(collection(db, 'confirmaciones'), {
                        incidenteId: selectedReporte.id,
                        confirmadoEn: serverTimestamp(),
                      });
                      alert('Se ha confirmado que el incidente sigue ocurriendo.');
                      setSelectedReporte(null);
                    }}
                  >
                    Sigue ocurriendo
                  </button>
                  <button 
                    className="info-window-button eliminar"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={async () => {
                      if (confirm('¿Deseas eliminar este reporte?')) {
                        await deleteDoc(doc(db, 'incidentes', selectedReporte.id));
                        alert('Reporte eliminado');
                        setSelectedReporte(null);
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>

        {/* Icono para iniciar viaje */}
        <button
          onClick={() => setShowRutaModal(true)}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            zIndex: 10,
            fontSize: '24px',
            backgroundColor: '#ffffffdd',
            borderRadius: '50%',
            padding: '10px',
            border: '2px solid #007bff',
            cursor: 'pointer'
          }}
          title="Iniciar viaje"
        >
          🚗
        </button>
      </div>

      {/* Modal de selección de ruta */}
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
                <select value={ciudadOrigenSeleccionada} onChange={(e) => setCiudadOrigenSeleccionada(e.target.value)}>
                  <option value="">Selecciona una ciudad</option>
                  {ciudadesNicaragua.map((ciudad) => (
                    <option key={ciudad.nombre} value={ciudad.nombre}>{ciudad.nombre}</option>
                  ))}
                </select>
              </>
            )}

            <label>Ciudad de destino</label>
            <select value={ciudadDestino} onChange={(e) => setCiudadDestino(e.target.value)}>
              <option value="">Selecciona una ciudad</option>
              {ciudadesNicaragua.map((ciudad) => (
                <option key={ciudad.nombre} value={ciudad.nombre}>{ciudad.nombre}</option>
              ))}
            </select>

            <div className="button-group">
              <button onClick={iniciarViaje}>Buscar ruta</button>
              <button onClick={() => setShowRutaModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro de incidente */}
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
              />
            </div>

            <div className="button-group">
              <button onClick={handleGuardarReporte}>Guardar reporte</button>
              <button onClick={() => setSelectedLocation(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadoTrafico;
