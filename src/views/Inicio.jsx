import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CuadrosDeReportes from "../components/CuadrosDeReportes";
import GraficosClima from "../components/GraficoClima";
import "../App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const { BaseLayer, Overlay } = LayersControl;

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '12px',
  marginTop: '10px',
};

// Ícono personalizado
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const FlyToUserLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13);
  }, [position, map]);
  return null;
};

const Inicio = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState({ lat: 12.1364, lng: -86.2514 });

  const images = [
    "/imagen/Carretera1.jpeg",
    "/imagen/Carretera2.jpg",
    "/imagen/Carretera3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserPosition({ lat: coords.latitude, lng: coords.longitude }),
        () => console.warn("No se pudo obtener la ubicación. Se usará la predeterminada.")
      );
    }
  }, []);

  useEffect(() => {
    const fetchClima = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userPosition.lat}&lon=${userPosition.lng}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric&lang=es`
        );
        const data = await res.json();
        setClima(data);
      } catch (err) {
        console.error("Error al obtener el clima:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClima();
  }, [userPosition]);

  const handleNavigate = (path) => navigate(path);

  return (
    <div className="inicio-container">
      <div className="inicio-header">
        <h1>NicaDriver</h1>
      </div>

      {/* Carrusel */}
      <div className="inicio-seccion">
        <img src={images[currentImage]} alt="Imagen descriptiva" className="inicio-img" />
      </div>

      {/* Misión y Visión */}
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

      {/* Mapa y Clima */}
      <div className="mapa-reporte-container">
        <div className="mapa-interactivo">
          <h2>Mapa Interactivo con Clima</h2>
          <p>Visualiza el clima actual y capas meteorológicas para tomar decisiones más seguras en carretera.</p>

          <MapContainer center={userPosition} zoom={13} style={mapContainerStyle}>
            <FlyToUserLocation position={userPosition} />

            <LayersControl position="topright">
              <BaseLayer checked name="Mapa Base - OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>

              {/* Capas meteorológicas de OpenWeather */}
              <Overlay checked name="Temperatura">
                <TileLayer
                  url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`}
                />
              </Overlay>
              <Overlay name="Precipitaciones">
                <TileLayer
                  url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`}
                />
              </Overlay>
              <Overlay name="Nubosidad">
                <TileLayer
                  url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`}
                />
              </Overlay>
            </LayersControl>

            <Marker position={userPosition} icon={customIcon}>
              <Popup>
                {loading ? (
                  <p>Cargando clima...</p>
                ) : clima ? (
                  <>
                    <p><strong>Ubicación:</strong> {clima.name}</p>
                    <p><strong>Temperatura:</strong> {clima.main.temp} °C</p>
                    <p><strong>Condición:</strong> {clima.weather[0].description}</p>
                    <p><strong>Viento:</strong> {clima.wind.speed} m/s</p>
                  </>
                ) : (
                  <p>No se pudo obtener el clima.</p>
                )}
              </Popup>
            </Marker>
          </MapContainer>

          <GraficosClima />
        </div>

 
      </div>

      {/* Sección de Documentos PDF */}
      <div className="cuadros-reportes-section mt-5">
        <h2 className="text-center mb-3">Documentos de reportes</h2>
        <p className="text-center text-muted mb-4">Haz clic en un icono para descargar el reporte en PDF</p>
        <CuadrosDeReportes />
      </div>
    </div>
  );
};

export default Inicio;