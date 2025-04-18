import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px', // Mapa con bordes redondeados
};

const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const EstadodeTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Asegúrate de tener tu clave de API aquí
    libraries: ['places'],
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [trafficMarkers, setTrafficMarkers] = useState([]);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);

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

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      {/* Título de la vista */}
      <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Estado del Tráfico y Rutas</h2>

      {/* Panel de controles de tráfico y rutas */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={handleToggleTraffic}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: showTraffic ? '#f44336' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {showTraffic ? 'Ocultar Tráfico' : 'Mostrar Tráfico'}
        </button>

        <button
          onClick={handleToggleRoutes}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: showRoutes ? '#f44336' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {showRoutes ? 'Ocultar Rutas' : 'Mostrar Rutas'}
        </button>
      </div>

      {/* Mapa de tráfico */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={13}
          onClick={handleMapClick}
          mapTypeId="satellite"
        >
          {/* Capa de tráfico en tiempo real */}
          {showTraffic && <TrafficLayer />}

          {/* Mostrar el marcador de la ubicación seleccionada */}
          {selectedLocation && (
            <Marker position={selectedLocation} />
          )}

          {/* Mostrar información cuando se hace clic en un marcador */}
          {selectedLocation && (
            <InfoWindow
              position={selectedLocation}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div>
                <h4>Ubicación Seleccionada</h4>
                <p>Latitud: {selectedLocation.lat}</p>
                <p>Longitud: {selectedLocation.lng}</p>
              </div>
            </InfoWindow>
          )}

          {/* Aquí puedes agregar las rutas si showRoutes es true */}
          {showRoutes && (
            // Este es solo un ejemplo. En una implementación real, tendrías que usar una API de direcciones para obtener rutas
            <Marker
              position={{ lat: 12.139, lng: -86.255 }} // Esto sería una ruta hacia el destino
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Cambia el ícono a algo que represente una ruta
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default EstadodeTrafico;
