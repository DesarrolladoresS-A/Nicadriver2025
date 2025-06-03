import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  TrafficLayer,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid';
import { uploadImageToStorage, saveReportToDatabase } from '../utils/firebase'; // adapta esto a tu lógica

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const incidentTypes = ['Accidente', 'Tráfico', 'Emergencia', 'Policía'];

const RegistroMapaCarreteras = () => {

  const saveReportToDatabase = async (incidentes) => {
  await addDoc(collection(db, 'incidentes'), incidentes);
};
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [reportForm, setReportForm] = useState({
    tipo: '',
    descripcion: '',
    imagen: null,
  });
  const [reportes, setReportes] = useState([]);

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

  const handleCenterUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  const handleGetRoute = () => {
    if (userLocation && selectedLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: selectedLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error('Error obteniendo la ruta:', status);
          }
        }
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      setReportForm((prev) => ({ ...prev, imagen: files[0] }));
    } else {
      setReportForm((prev) => ({ ...prev, [name]: value }));
    }
  };

const handleSubmitReporte = async (e) => {
  e.preventDefault();
  if (!reportForm.tipo || !reportForm.descripcion || !selectedLocation || !reportForm.imagen) {
    alert('Por favor completa todos los campos y selecciona una ubicación.');
    return;
  }

  try {
    const reporteIncidente = {
      tipo: reportForm.tipo,
      descripcion: reportForm.descripcion,
      imagenBase64: reportForm.imagen, // guardamos la imagen como base64
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      timestamp: new Date().toISOString(),
    };

    await saveReportToDatabase(incidentes);

    setReportes((prev) => [...prev, incidentes]);
    setReportForm({ tipo: '', descripcion: '', imagen: null });
    setSelectedLocation(null);
    alert('¡Reporte guardado correctamente!');
  } catch (error) {
    console.error('Error al guardar el reporte:', error);
    alert('Error al guardar el reporte.');
  }
};


  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Registro de Incidentes en Carreteras</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={handleGetRoute} style={styles.boton}>Obtener Ruta</button>
        <button onClick={() => setShowTraffic(!showTraffic)} style={styles.boton}>
          {showTraffic ? 'Ocultar Tráfico' : 'Mostrar Tráfico'}
        </button>
        <button onClick={handleCenterUser} style={styles.boton}>Ir a Mi Ubicación</button>
      </div>

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
          {userLocation && <Marker position={userLocation} label="Yo" />}

          {reportes.map((rep, idx) => (
            <Marker
              key={idx}
              position={{ lat: rep.lat, lng: rep.lng }}
              icon={{
                url: '/marker_' + rep.tipo.toLowerCase() + '.png',
                scaledSize: new window.google.maps.Size(35, 35),
              }}
            />
          ))}

          {directions && <DirectionsRenderer directions={directions} />}

          {selectedLocation && (
            <InfoWindow
              position={selectedLocation}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <form onSubmit={handleSubmitReporte} style={{ width: '250px' }}>
                <h4>Nuevo Reporte</h4>
                <label>Tipo:</label>
                <select name="tipo" value={reportForm.tipo} onChange={handleInputChange} required>
                  <option value="">Seleccionar</option>
                  {incidentTypes.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={reportForm.descripcion}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%' }}
                />
                <label>Imagen:</label>
                <input type="file" name="imagen" onChange={handleInputChange} accept="image/*" />
                <button type="submit" style={{ marginTop: '10px', ...styles.boton }}>
                  Guardar Reporte
                </button>
              </form>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

const styles = {
  boton: {
    padding: '10px 15px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '15px',
  },
};

export default RegistroMapaCarreteras;