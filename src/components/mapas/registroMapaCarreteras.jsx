import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px', // Mapa con bordes redondeados
};

const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const RegistroMapaCarreteras = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Asegúrate de tener tu clave de API aquí
    libraries: ['places', 'directions'],
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [directions, setDirections] = useState(null);

  // Obtener la ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } else {
      alert('Geolocalización no soportada por tu navegador.');
    }
  }, []);

  // Obtener direcciones cuando se selecciona un destino
  const handleGetDirections = () => {
    if (userLocation && selectedLocation) {
      const DirectionsServiceInstance = new window.google.maps.DirectionsService();

      DirectionsServiceInstance.route(
        {
          origin: userLocation,
          destination: selectedLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            alert('No se pudo obtener la ruta.');
          }
        }
      );
    }
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

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      {/* Título de la vista */}
      <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Registro de Incidentes y Rutas</h2>

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

        <button
          onClick={handleGetDirections}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Obtener Ruta
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

          {/* Mostrar la ubicación del usuario */}
          {userLocation && (
            <Marker position={userLocation} label="Mi Ubicación" />
          )}

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

          {/* Mostrar las rutas si showRoutes es true */}
          {showRoutes && directions && (
            <DirectionsRenderer directions={directions} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default RegistroMapaCarreteras;
