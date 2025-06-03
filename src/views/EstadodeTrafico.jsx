import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  TrafficLayer,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [imagenBase64, setImagenBase64] = useState(null);

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

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenBase64(reader.result); // base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarReporte = async () => {
    if (!tipo || !descripcion || !selectedLocation || !imagenBase64) {
      alert('Completa todos los campos y selecciona una ubicación en el mapa.');
      return;
    }

    try {
      await addDoc(collection(db, 'incidentes'), {
        tipo,
        descripcion,
        imagenBase64, // aquí guardamos la imagen en base64
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        fecha: serverTimestamp(),
      });

      alert('Reporte guardado exitosamente');
      setTipo('');
      setDescripcion('');
      setImagenBase64(null);
      setSelectedLocation(null);
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
        <input type="file" accept="image/*" onChange={handleImageChange} />
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
