import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  TrafficLayer,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api';
import Modal from 'react-modal';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../database/firebaseconfig'; // tu configuración de Firebase

Modal.setAppElement('#root');

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
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reportForm, setReportForm] = useState({ tipo: '', descripcion: '', imagen: null });
  const [reportes, setReportes] = useState([]);
  const [directions, setDirections] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);

  const [modalReporteOpen, setModalReporteOpen] = useState(false);
  const [modalRutaOpen, setModalRutaOpen] = useState(false);
  const [destinoRuta, setDestinoRuta] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
      });
    }
  }, []);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setSelectedLocation(location);
    setModalReporteOpen(true);
  };

  const handleCenterUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  const handleGetRoute = () => {
    if (!userLocation || !destinoRuta) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destinoRuta }, (results, status) => {
      if (status === 'OK') {
        const destination = results[0].geometry.location;
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: userLocation,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              setDirections(result);
              setModalRutaOpen(false);
            } else {
              alert('No se pudo calcular la ruta');
            }
          }
        );
      } else {
        alert('Dirección inválida');
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setReportForm((prev) => ({
      ...prev,
      [name]: name === 'imagen' ? files[0] : value,
    }));
  };

  const handleSubmitReporte = async (e) => {
    e.preventDefault();
    if (!selectedLocation || !reportForm.tipo || !reportForm.descripcion || !reportForm.imagen) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imagenBase64 = reader.result;

      const nuevoReporte = {
        ...reportForm,
        imagenBase64,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        fecha: new Date(),
      };

      await addDoc(collection(db, 'incidentes'), nuevoReporte);
      setReportes((prev) => [...prev, nuevoReporte]);
      setModalReporteOpen(false);
      setReportForm({ tipo: '', descripcion: '', imagen: null });
      setSelectedLocation(null);
    };
    reader.readAsDataURL(reportForm.imagen);
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Mapa de Incidentes en Carreteras</h2>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
        <button onClick={() => setModalRutaOpen(true)} style={styles.boton}>
          Iniciar Viaje
        </button>
        <button onClick={handleCenterUser} style={styles.boton}>
          Ir a Mi Ubicación
        </button>
        <button onClick={() => setShowTraffic((v) => !v)} style={styles.boton}>
          {showTraffic ? 'Ocultar Tráfico' : 'Mostrar Tráfico'}
        </button>
      </div>

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
      </GoogleMap>

      {/* Modal Registro de Incidente */}
      <Modal
        isOpen={modalReporteOpen}
        onRequestClose={() => setModalReporteOpen(false)}
        style={customStyles}
      >
        <h3>Registrar Incidente</h3>
        <form onSubmit={handleSubmitReporte}>
          <label>Tipo:</label>
          <select name="tipo" value={reportForm.tipo} onChange={handleInputChange}>
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
            style={{ width: '100%' }}
          />

          <label>Imagen:</label>
          <input type="file" name="imagen" accept="image/*" onChange={handleInputChange} />

          <button type="submit" style={styles.boton}>Guardar Reporte</button>
        </form>
      </Modal>

      {/* Modal Ruta */}
      <Modal
        isOpen={modalRutaOpen}
        onRequestClose={() => setModalRutaOpen(false)}
        style={customStyles}
      >
        <h3>Seleccionar Destino</h3>
        <input
          type="text"
          placeholder="Escribe tu destino"
          value={destinoRuta}
          onChange={(e) => setDestinoRuta(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleGetRoute} style={styles.boton}>
          Calcular Ruta
        </button>
      </Modal>
    </div>
  );
};

const customStyles = {
  content: {
    width: '400px',
    margin: 'auto',
    borderRadius: '8px',
    padding: '20px',
  },
};

const styles = {
  boton: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  input: {
    padding: '10px',
    width: '100%',
    marginBottom: '10px',
  },
};

export default RegistroMapaCarreteras;
