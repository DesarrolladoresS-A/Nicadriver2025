import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow } from '@react-google-maps/api';

const EstadodeTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);

  const containerStyle = {
    width: '100%',
    height: '70vh',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  const defaultCenter = {
    lat: 12.1364,  // Managua, Nicaragua
    lng: -86.2514
  };

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  const handleToggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const handleToggleRoutes = () => {
    setShowRoutes(!showRoutes);
  };

  if (!isLoaded) return (
    <div className="mapa-loading">
      <div className="spinner"></div>
      <p>Cargando mapa...</p>
    </div>
  );

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
        
        <button 
          onClick={handleToggleRoutes}
          className={`control-button ${showRoutes ? 'active' : ''}`}
        >
          {showRoutes ? 'Ocultar Rutas' : 'Mostrar Rutas'}
        </button>
      </div>

      {/* Mapa interactivo */}
      <div className="mapa-interactivo">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={13}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false
          }}
        >
          {showTraffic && <TrafficLayer />}
          
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
        </GoogleMap>
      </div>

      {/* Leyenda del mapa */}
      <div className="mapa-leyenda">
        <div className="leyenda-item">
          <span className="leyenda-color verde"></span>
          <p>Tráfico fluido</p>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color amarillo"></span>
          <p>Tráfico moderado</p>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-color rojo"></span>
          <p>Congestión</p>
        </div>
      </div>

      {/* Botón flotante para reportes */}
      <button 
        className="boton-flotante"
        onClick={() => console.log('Ir a reportes')}
      >
        Reportar Incidencia
      </button>
    </div>
  );
};

export default EstadodeTrafico;