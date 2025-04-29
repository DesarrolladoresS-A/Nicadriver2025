import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow } from '@react-google-maps/api';

// Estilos del contenedor del mapa
const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

// Coordenadas por defecto (Managua, Nicaragua)
const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const EstadodeTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showIcons, setShowIcons] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [reportingMode, setReportingMode] = useState(false);

  // Función para manejar el clic en el mapa
  const handleMapClick = (event) => {
    if (reportingMode) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      const tipo = prompt('¿Qué tipo de incidencia quieres reportar? (Accidente, Tráfico, Emergencia, Policía)');
      
      if (tipo) {
        setIncidents((prev) => [...prev, { lat, lng, tipo }]);
      }
      setReportingMode(false);
    } else {
      setSelectedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  // Función para alternar la visibilidad del tráfico
  const handleToggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  // Verificar si el mapa está cargado
  if (!isLoaded) return (
    <div className="mapa-loading">
      <div className="spinner"></div>
      <p>Cargando mapa...</p>
    </div>
  );

  // Función para manejar el ícono de "+" y mostrar los íconos
  const handleToggleIcons = () => {
    setShowIcons(!showIcons);
  };

  // Función para obtener íconos personalizados
  const getIconUrl = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'accidente':
        return 'https://img.icons8.com/color/48/car-crash.png';
      case 'tráfico':
        return 'https://img.icons8.com/color/48/traffic-jam.png';
      case 'emergencia':
        return 'https://img.icons8.com/color/48/ambulance.png';
      case 'policía':
        return 'https://img.icons8.com/color/48/police-badge.png';
      default:
        return 'https://img.icons8.com/color/48/marker.png';
    }
  };

  return (
    <div className="estado-trafico-container">
      <h1 className="mapa-titulo">Estado del Tráfico en Tiempo Real</h1>
      
      {/* Panel de controles */}
      <div className="mapa-controles">
        <button 
          onClick={handleToggleTraffic}
          className={`control-button ${showTraffic ? 'active' : ''}`}
        >
          {showTraffic ? 'Ocultar Tráfico' : 'Mostrar Tráfico'}
        </button>
      </div>

      {/* Mapa interactivo */}
      <div className="mapa-interactivo" style={{ height: '100%' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={13}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false,
            mapTypeId: 'satellite', // Mapa de satélite
          }}
        >
          {showTraffic && <TrafficLayer />}
          
          {/* Mostrar marcadores de ubicación seleccionada */}
          {selectedLocation && (
            <>
              <Marker position={selectedLocation} />
              <InfoWindow
                position={selectedLocation}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div className="info-window">
                  <h3>Ubicación seleccionada</h3>
                  <p>Lat: {selectedLocation.lat.toFixed(4)}</p>
                  <p>Lng: {selectedLocation.lng.toFixed(4)}</p>
                </div>
              </InfoWindow>
            </>
          )}

          {/* Mostrar incidencias reportadas */}
          {incidents.map((inc, index) => (
            <Marker
              key={index}
              position={{ lat: inc.lat, lng: inc.lng }}
              label={{
                text: inc.tipo[0], // Primera letra del tipo de incidencia
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              icon={{
                url: getIconUrl(inc.tipo),
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Botón flotante de "+" para mostrar los íconos */}
      <button 
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          padding: '15px 20px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          fontSize: '24px',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        }}
        onClick={handleToggleIcons}
      >
        +
      </button>

      {/* Íconos para seleccionar el tipo de incidencia */}
      <div style={{
        position: 'fixed',
        bottom: '140px',
        right: '20px',
        display: showIcons ? 'block' : 'none',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        padding: '10px',
      }}>
        <button onClick={() => setIncidents((prev) => [...prev, { lat: selectedLocation.lat, lng: selectedLocation.lng, tipo: 'Accidente' }])}>
          🚗 Accidente
        </button>
        <button onClick={() => setIncidents((prev) => [...prev, { lat: selectedLocation.lat, lng: selectedLocation.lng, tipo: 'Tráfico' }])}>
          🚦 Tráfico
        </button>
        <button onClick={() => setIncidents((prev) => [...prev, { lat: selectedLocation.lat, lng: selectedLocation.lng, tipo: 'Emergencia' }])}>
          🚑 Emergencia
        </button>
        <button onClick={() => setIncidents((prev) => [...prev, { lat: selectedLocation.lat, lng: selectedLocation.lng, tipo: 'Policía' }])}>
          🚓 Policía
        </button>
      </div>
    </div>
  );
};

export default EstadodeTrafico;
