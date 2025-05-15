import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const MapaClima = () => {
  const [clima, setClima] = useState(null);
  const [lat, lng] = [12.1364, -86.2514]; // Coordenadas de Managua

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    const obtenerDatosClima = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=es`
        );
        setClima(response.data);
      } catch (error) {
        console.error("Error al obtener el clima:", error);
      }
    };

    obtenerDatosClima();
  }, []);

  return (
    <div>
      <h2>Mapa de Clima y Riesgo Vial</h2>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: "300px", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors © CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            {clima ? (
              <>
                <p><strong>Ubicación:</strong> {clima.name}</p>
                <p><strong>Temperatura:</strong> {clima.main.temp} °C</p>
                <p><strong>Condición:</strong> {clima.weather[0].description}</p>
                <p><strong>Viento:</strong> {clima.wind.speed} m/s</p>
              </>
            ) : (
              <p>Cargando clima...</p>
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapaClima;
