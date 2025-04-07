import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, TrafficLayer } from '@react-google-maps/api';

import "../App.css";

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '10px',
};

const defaultCenter = {
  lat: 12.1364,
  lng: -86.2514,
};

const Inicio = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const [currentImage, setCurrentImage] = useState(0);
  const [showTraffic, setShowTraffic] = useState(true);

  const images = [
    "/imagen/Carretera1.jpeg",
    "/imagen/Carretera2.jpg",
    "/imagen/Carretera3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prevImage => (prevImage + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  return (
    <div className="inicio-container">
      <div className="inicio-header">
        <h1>NicaDriver</h1>
      </div>

      {/* Carrusel */}
      <div className="inicio-seccion">
        <img src={images[currentImage]} alt="Imagen descriptiva" className="inicio-img" />
      </div>

      {/* Misión y visión */}
      <div className="mision-vision-container">
        <div className="mision">
          <h2>Misión</h2>
          <p>Optimizar la movilidad y gestión del transporte en Nicaragua mediante una solución digital innovadora basada en inteligencia artificial e IoT.</p>
        </div>
        <div className="vision">
          <h2>Visión</h2>
          <p>Contribuir a una infraestructura vial más eficiente y sostenible, promoviendo un transporte más seguro y accesible para ciudadanos, transportistas y autoridades gubernamentales.</p>
        </div>
      </div>

      {/* Mapa en tiempo real directamente visible */}
      <div className="mapa-reporte-container">
        <div className="mapa-interactivo">
          <h2>Mapa interactivo</h2>
          <p>Información en tiempo real sobre el tráfico y condiciones viales.</p>
          
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={13}
              mapTypeId="roadmap"
            >
              {showTraffic && <TrafficLayer />}
            </GoogleMap>
          ) : (
            <div>Cargando mapa...</div>
          )}
        </div>

        {/* Reporte */}
        <div className="reporte">
          <h2>Reporte</h2>
          <p>"Tu reporte ayuda a mejorar la seguridad vial. ¡Informa cualquier incidente!"</p>
          <p><strong>Ubicación:</strong> Avenida Central - Managua</p>
          <p><strong>Tipo de incidente:</strong> accidente, bache, semáforo dañado.</p>
          <p><strong>Tiempo transcurrido:</strong> hace 10 min, 1 hora.</p>
          <button onClick={() => handleNavigate('/Reportes')}>Ver más detalles</button>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
