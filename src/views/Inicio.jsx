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
import { MessageCircle } from "lucide-react"; //
import '../styles/ChatButton.css';
import ChatButton from '../components/chatbot/ChatButton';

const { BaseLayer } = LayersControl;

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const Inicio = () => {
  // Estado para reportes y paginación
  const [reportes, setReportes] = useState([]);
  const [currentDocPage, setCurrentDocPage] = useState(1);
  const [docsPerPage] = useState(4);

  // Estado para mapa/clima (placeholder)
  const [userPosition] = useState({ lat: 12.1364, lng: -86.2514 });
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrusel de imágenes (hero secundario si se desea)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/imagen/Carretera1.jpeg', '/imagen/Calle-1.jpg', '/imagen/calle-2.jpeg', '/imagen/calle-3.webp'];

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reportes'));
        setReportes(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (e) {
        console.error('Error obteniendo reportes:', e);
      }
    };
    fetchReportes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  // PDF de reporte
  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return 'Sin fecha';
    const fecha = fechaHora.toDate ? fechaHora.toDate() : new Date(fechaHora);
    return fecha.toLocaleString('es-NI');
  };

  const generarPDF = (reporte) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Reporte de Incidente', 20, 20);
    doc.text(`Título: ${reporte.titulo}`, 20, 30);
    doc.text(`Ubicación: ${reporte.ubicacion}`, 20, 40);
    doc.text(`Descripción: ${reporte.descripcion}`, 20, 50);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fechaHora)}`, 20, 60);
    doc.save(`${reporte.titulo}.pdf`);
  };

  // Lucide y toggle de tema (modo oscuro)
  useEffect(() => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    // refrescar íconos para que tomen color adecuado
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  const indexOfLastDoc = currentDocPage * docsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage;
  const currentDocs = reportes.slice(indexOfFirstDoc, indexOfLastDoc);

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="hero-gradient full-bleed min-h-[95vh] flex items-center justify-center pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hero-content text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Movilidad Inteligente para <span className="text-yellow-300">Nicaragua</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Reporta incidentes viales, consulta el tráfico en tiempo real y contribuye a una movilidad más segura y eficiente en todo el país.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="btn btn-secondary btn-lg">
                  <i data-lucide="map-pin" className="w-5 h-5 mr-2"></i>
                  Ver Mapa en Vivo
                </button>
                <button className="btn bg-yellow-400 text-blue-900 hover:bg-yellow-300 btn-lg">
                  <i data-lucide="alert-triangle" className="w-5 h-5 mr-2"></i>
                  Reportar Incidente
                </button>
              </div>
            </div>

            <div className="relative animate-float">
              <img
                src="https://laprensa-bucket.s3.us-west-2.amazonaws.com/wp-content/uploads/2016/03/26175105/Av.-Bolivar1.jpg"
                alt="Modern city traffic and transportation"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Misión & Visión */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Nuestra Misión</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transformamos la movilidad urbana a través de tecnología innovadora y colaboración ciudadana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6">
                <i data-lucide="star" className="w-8 h-8 text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Misión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Proporcionar una plataforma tecnológica que mejore la seguridad vial y optimice el flujo de tráfico en Nicaragua mediante reportes ciudadanos y análisis de datos en tiempo real.
              </p>
            </div>

            <div className="card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-6">
                <i data-lucide="eye" className="w-8 h-8 text-accent-foreground"></i>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Visión</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ser la plataforma líder en movilidad inteligente en Centroamérica, contribuyendo a ciudades más conectadas, seguras y eficientes para todos los ciudadanos.
              </p>
            </div>

            <div className="card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <i data-lucide="shield" className="w-8 h-8 text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Valores</h3>
              <p className="text-muted-foreground leading-relaxed">
                Innovación, transparencia, colaboración y compromiso con la seguridad vial. Creemos en el poder de la tecnología para crear un impacto positivo en la sociedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa interactivo (manteniendo funcionalidad) */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Mapa de Tráfico en Tiempo Real</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Visualiza incidentes viales, congestiones y el estado del tráfico en toda Nicaragua
            </p>
          </div>

          <div className="card rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-card-foreground">Filtros:</span>
                  <button className="btn btn-default btn-sm">Todos</button>
                  <button className="btn btn-outline btn-sm">Accidentes</button>
                  <button className="btn btn-outline btn-sm">Obras</button>
                  <button className="btn btn-outline btn-sm">Congestión</button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">En vivo</span>
                </div>
              </div>
            </div>

            <div className="relative bg-muted">
              <div className="p-4">
                <MapContainer center={userPosition} zoom={13} style={{ height: '400px', borderRadius: '12px' }}>
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
              </div>

              <div className="p-6 bg-muted">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">12</div>
                    <div className="text-sm text-muted-foreground">Incidentes Activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">15min</div>
                    <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">8</div>
                    <div className="text-sm text-muted-foreground">Resueltos Hoy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">87%</div>
                    <div className="text-sm text-muted-foreground">Tasa Resolución</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Descarga App */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Descarga la App Móvil</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Lleva NicaDriver contigo y reporta incidentes desde cualquier lugar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn btn-default btn-lg min-w-[200px]">
              <i data-lucide="smartphone" className="w-5 h-5 mr-2"></i>
              Descargar para iOS
            </button>
            <button className="btn btn-outline btn-lg min-w-[200px]">
              <i data-lucide="download" className="w-5 h-5 mr-2"></i>
              Descargar para Android
            </button>
          </div>

          {/* Features de descarga */}
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-left">
            <div className="card p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <i data-lucide="smartphone" className="w-6 h-6 text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Reportes Rápidos</h3>
              <p className="text-muted-foreground">Reporta incidentes con un solo toque, incluye ubicación automática</p>
            </div>

            <div className="card p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <i data-lucide="download" className="w-6 h-6 text-accent"></i>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Notificaciones</h3>
              <p className="text-muted-foreground">Recibe alertas sobre incidentes cerca de tu ubicación</p>
            </div>

            <div className="card p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i data-lucide="wifi-off" className="w-6 h-6 text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Offline</h3>
              <p className="text-muted-foreground">Funciona sin conexión, sincroniza cuando tengas internet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Documentos de reportes */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Documentos de reportes</h2>
            <p className="text-muted-foreground">Haz clic en un icono para descargar el reporte en PDF</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {currentDocs.map((reporte) => (
              <div
                key={reporte.id}
                className="card p-4 rounded-xl shadow hover:shadow-md cursor-pointer transition"
                onClick={() => generarPDF(reporte)}
              >
                <div className="flex items-center gap-3">
                  <i data-lucide="file-text" className="w-6 h-6 text-red-500"></i>
                  <div>
                    <h4 className="font-semibold text-card-foreground leading-tight">{reporte.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{formatearFechaHora(reporte.fechaHora)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reportes.length > docsPerPage && (
            <div className="mt-6 flex justify-center">
              <Paginacion
                totalItems={reportes.length}
                itemsPerPage={docsPerPage}
                currentPage={currentDocPage}
                setCurrentPage={setCurrentDocPage}
              />
            </div>
          )}
        </div>
      </section>

      {/* Botón de chatbot */}
    <div className="fixed bottom-6 right-6 z-40">
      <ChatButton />
    </div>

    </div>
  );
};

export default Inicio;