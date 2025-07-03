import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import Paginacion from '../components/ordenamiento/Paginacion';
import '../styles/Inicio.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Button } from "react-bootstrap";
import ModalInstalacionIOS from '../components/inicio/ModalInstalacionIOS';
import '../styles/DownloadButtons.css';

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
  const [docsPerPage] = useState(4);
  const [userPosition, setUserPosition] = useState({ lat: 12.1364, lng: -86.2514 });
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/imagen/Carretera1.jpeg",
    "/imagen/Calle-1.jpg",
    "/imagen/calle-2.jpeg",
    "/imagen/calle-3.webp",
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Cambiar cada 4 segundos

    return () => clearInterval(timer);
  }, [images.length]);

  const handleIndicatorClick = (index) => {
    setCurrentImageIndex(index);
  };

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

  // Estados PWA con nombres solicitados
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(true); // Forzado a true para pruebas
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  // useEffect para detectar dispositivo iOS
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const esIOS = /iphone|ipad|ipod/.test(userAgent);
    console.log('Es dispositivo iOS:', esIOS);
    setEsDispositivoIOS(esIOS);
  }, []);

  // useEffect para capturar el evento beforeinstallprompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      console.log('Evento beforeinstallprompt capturado');
      setSolicitudInstalacion(e);
      setMostrarBotonInstalacion(true);
    };

    console.log('Agregando event listener para beforeinstallprompt');
    window.addEventListener('beforeinstallprompt', handler);
    
    // Forzar el estado para ver el botón
    setMostrarBotonInstalacion(true);

    return () => {
      console.log('Limpiando event listener');
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Función para instalar la PWA
  const instalarPWA = async () => {
    console.log('Intentando instalar PWA...');
    if (solicitudInstalacion) {
      console.log('Solicitud de instalación disponible');
      try {
        console.log('Mostrando prompt de instalación...');
        solicitudInstalacion.prompt();
        const { outcome } = await solicitudInstalacion.userChoice;
        console.log(`El usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      } catch (error) {
        console.error('Error al intentar instalar la PWA:', error);
      }
    } else {
      console.log('No hay solicitud de instalación disponible');
      // Alternativa para navegadores que no soportan beforeinstallprompt
      window.open('https://nicadriver.web.app', '_blank');
    }
  };

  const abrirModalInstrucciones = () => {
    setMostrarModalInstrucciones(true);
  };

  return (
    <div className="inicio-container">
      <div className="inicio-header">
        <h1>NicaDriver</h1>
      </div>

      <div className="inicio-seccion">
        <div className="carousel-container">
          <img 
            src={images[currentImageIndex]} 
            alt="Imagen descriptiva" 
            className="inicio-img"
          />
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <div
                key={index}
                className={`carousel-indicator ${currentImageIndex === index ? 'active' : ''}`}
                onClick={() => handleIndicatorClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mision-vision-container">
        <div className="mision">
          <div className="icon-container">
            <i className="bi bi-compass-fill" style={{ fontSize: '2.5rem', color: '#1e3d87' }}></i>
          </div>
          <h2 className="text-center">Misión</h2>
          <p className="text-center">Optimizar la movilidad y gestión del transporte en Nicaragua mediante una solución digital innovadora basada en inteligencia artificial e IoT.</p>
        </div>
        <div className="vision">
          <div className="icon-container">
            <i className="bi bi-rocket-fill" style={{ fontSize: '2.5rem', color: '#1e3d87' }}></i>
          </div>
          <h2 className="text-center">Visión</h2>
          <p className="text-center">Contribuir a una infraestructura vial más eficiente y sostenible, promoviendo un transporte más seguro y accesible para ciudadanos, transportistas y autoridades gubernamentales.</p>
        </div>
      </div>

      {/* Sección de Descarga de Aplicación */}
      <div className="download-section text-center my-5 p-4 border rounded" style={{ 
        backgroundColor: '#f8f9fa',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 className="mb-4 fw-bold" style={{ color: '#1e3d87' }}>Descarga NicaDriver</h3>
        <p className="mb-4 text-muted">Selecciona tu plataforma para descargar la aplicación</p>
        
        <div className="download-buttons-container">
          {/* Botón para Windows */}
          <button 
            className="download-button windows-button"
            onClick={() => window.open('https://nicadriver.web.app/download/windows', '_blank')}
          >
            <div className="button-content">
              <i className="bi bi-windows"></i>
              <span>Windows</span>
            </div>
            <div className="button-overlay"></div>
          </button>
          
          {/* Botón para Android */}
          <button 
            className="download-button android-button"
            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.nicadriver.app', '_blank')}
          >
            <div className="button-content">
              <i className="bi bi-android"></i>
              <span>Android</span>
            </div>
            <div className="button-overlay"></div>
          </button>
          
          {/* Botón para iPhone */}
          <button 
            className="download-button ios-button"
            onClick={() => window.open('https://apps.apple.com/app/nicadriver/idYOUR_APP_ID', '_blank')}
          >
            <div className="button-content">
              <i className="bi bi-apple"></i>
              <span>iPhone</span>
            </div>
            <div className="button-overlay"></div>
          </button>
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
          {/* <GraficosClima /> */}
        </div>
      </div>

      <div className="cuadros-reportes-section">
        <div className="section-header">
          <h2 className="text-center mb-3">Documentos de reportes</h2>
          <p className="text-center text-muted mb-4">Haz clic en un icono para descargar el reporte en PDF</p>
        </div>
        
        <div className="cuadros-grid">
          {currentDocs.map((reporte) => (
            <div
              key={reporte.id}
              className="cuadro-reporte"
              onClick={() => generarPDF(reporte)}
            >
              <div className="reporte-icon">
                <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: '1.5rem', color: '#dc3545' }}></i>
              </div>
              <div className="reporte-info">
                <h4>{reporte.titulo}</h4>
                <p className="fecha-reporte">{formatearFechaHora(reporte.fechaHora)}</p>
              </div>
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