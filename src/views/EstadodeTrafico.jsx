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

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
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

  // Obtener ubicación actual
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

  // Cargar reportes en tiempo real
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
        setSelectedLocation(null);
      };
      reader.readAsDataURL(imagen);
    } catch (error) {
      console.error('Error guardando el reporte:', error);
      alert('Hubo un error al guardar el reporte.');
    }
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Estado del Tráfico</h2>

      {/* Formulario */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={styles.input}>
          <option value="">Selecciona el tipo de incidente</option>
          <option value="Accidente">Accidente</option>
          <option value="Tráfico">Tráfico</option>
          <option value="Emergencia">Emergencia</option>
          <option value="Policía">Policía</option>
        </select>
        <textarea
          placeholder="Descripción del incidente"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          style={styles.input}
        />
        <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
        <button onClick={handleGuardarReporte} style={styles.boton}>
          Guardar Reporte
        </button>
      </div>

      {/* Mapa */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          mapTypeId="roadmap"
        >
          {showTraffic && <TrafficLayer />}
          {userLocation && <Marker position={userLocation} label="Tú" />}

          {/* Nueva ubicación seleccionada */}
          {selectedLocation && (
            <>
              <Marker position={selectedLocation} />
              <InfoWindow
                position={selectedLocation}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div>
                  <h4>Ubicación Seleccionada</h4>
                  <p>Lat: {selectedLocation.lat.toFixed(4)}</p>
                  <p>Lng: {selectedLocation.lng.toFixed(4)}</p>
                </div>
              </InfoWindow>
            </>
          )}

          {/* Reportes guardados */}
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
              <div style={{ maxWidth: '200px' }}>
                <h4>{selectedReporte.tipo}</h4>
                <p>{selectedReporte.descripcion}</p>
                {selectedReporte.imagenBase64 && (
                  <img
                    src={selectedReporte.imagenBase64}
                    alt="Incidente"
                    style={{ width: '100%', borderRadius: '5px' }}
                  />
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

const styles = {
  input: {
    padding: '10px',
    fontSize: '16px',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  boton: {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default EstadoTrafico;
