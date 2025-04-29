import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, TrafficLayer, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 12.1364, // Managua
  lng: -86.2514,
};

const RegistroMapaCarreteras = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'], // SOLO places
  });

  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);

  // Obtener ubicación del usuario
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

  const handleCenterUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Registro de Incidentes y Rutas</h2>

      {/* Botones de control */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={handleGetRoute} style={styles.boton}>Obtener Ruta</button>
        <button onClick={() => setShowTraffic(!showTraffic)} style={styles.boton}>
          {showTraffic ? 'Ocultar Tráfico' : 'Mostrar Tráfico'}
        </button>
        <button onClick={handleCenterUser} style={styles.boton}>Ir a Mi Ubicación</button>
      </div>

      {/* Mapa */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          mapTypeId="satellite" // Mapa satelital tipo Waze
          options={{
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {showTraffic && <TrafficLayer />}

          {userLocation && <Marker position={userLocation} label="Yo" />}

          {selectedLocation && (
            <>
              <Marker position={selectedLocation} />
              <InfoWindow
                position={selectedLocation}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div>
                  <h4>Destino seleccionado</h4>
                  <p>Lat: {selectedLocation.lat.toFixed(4)}</p>
                  <p>Lng: {selectedLocation.lng.toFixed(4)}</p>
                </div>
              </InfoWindow>
            </>
          )}

          {directions && <DirectionsRenderer directions={directions} />}
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
