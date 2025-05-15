import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import Paginacion from '../components/ordenamiento/Paginacion';
import GraficosClima from '../components/GraficoClima';
import '../App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const { BaseLayer, Overlay } = LayersControl;

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const Inicio = () => {
  const [reportes, setReportes] = useState([]);
  const [currentDocPage, setCurrentDocPage] = useState(1);
  const [docsPerPage] = useState(4); // Mostrar 4 reportes por página
  const [userPosition, setUserPosition] = useState({ lat: 12.1364, lng: -86.2514 });
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(true);

  const images = [
    "/imagen/Carretera1.jpeg",
    "/imagen/Carretera2.jpg",
    "/imagen/Carretera3.jpg",
  ];

  useEffect(() => {
    const fetchReportes = async () => {
      const snapshot = await getDocs(collection(db, "reportes"));
      setReportes(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    };

    fetchReportes();
  }, []);

  const indexOfLastDoc = currentDocPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDocs = reportes.slice(indexOfFirstDoc, indexOfLastDoc);

  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return "Sin fecha";
    const fecha = fechaHora.toDate
      ? fechaHora.toDate()
      : new Date(fechaHora);
    return fecha.toLocaleString("es-NI");
  };

  const generarPDF = (reporte) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte de Incidente", 20, 20);
    doc.text(`Título: ${reporte.titulo}`, 20, 30);
    doc.text(`Ubicación: ${reporte.ubicacion}`, 20, 40);
    doc.text(`Descripción: ${reporte.descripcion}`, 20, 50);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fechaHora)}`, 20, 60);
    doc.save(`${reporte.titulo}.pdf`);
  };

  return (
    <div className="inicio-container">
      <div className="inicio-header">
        <h1>NicaDriver</h1>
      </div>

      <div className="inicio-seccion">
        <img src={images[0]} alt="Imagen descriptiva" className="inicio-img" />
      </div>

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

      <div className="mapa-reporte-container">
        <div className="mapa-interactivo">
          <h2>Mapa Interactivo con Clima</h2>
          <MapContainer center={userPosition} zoom={13} style={{ height: "400px", borderRadius: "12px" }}>
            <LayersControl position="topright">
              <BaseLayer checked name="Mapa Base - OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <Marker position={userPosition} icon={customIcon}>
                <Popup>
                  {loading ? (
                    <p>Cargando clima...</p>
                  ) : clima ? (
                    <>
                      <p><strong>Ubicación:</strong> {clima.name}</p>
                      <p><strong>Temperatura:</strong> {clima.main.temp} °C</p>
                      <p><strong>Condición:</strong> {clima.weather[0].description}</p>
                    </>
                  ) : (
                    <p>No se pudo obtener el clima.</p>
                  )}
                </Popup>
              </Marker>
            </LayersControl>
          </MapContainer>
          <GraficosClima />
        </div>
      </div>

      <div className="cuadros-reportes-section">
        <h2 className="text-center mb-3">Documentos de reportes</h2>
        <p className="text-center text-muted mb-4">Haz clic en un icono para descargar el reporte en PDF</p>
        
        <div className="cuadros-grid">
          {currentDocs.map((reporte) => (
            <div
              key={reporte.id}
              className="cuadro-reporte"
              onClick={() => generarPDF(reporte)}
            >
              <i className="bi bi-file-earmark-pdf-fill icono-pdf" />
              <h4>{reporte.titulo}</h4>
              <p>{formatearFechaHora(reporte.fechaHora)}</p>
            </div>
          ))}
        </div>

        {reportes.length > docsPerPage && (
          <div className="docs-pagination">
            <Paginacion
              totalItems={reportes.length}
              itemsPerPage={docsPerPage}
              currentPage={currentDocPage}
              setCurrentPage={setCurrentDocPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inicio;