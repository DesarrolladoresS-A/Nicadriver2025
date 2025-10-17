import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import { ThemeProvider } from "./theme/ThemeContext";
import { LanguageProvider } from "./i18n/LanguageContext";

import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Nosotros from "./views/Nosotros";
import './App.css';
import EstadodeTrafico from "./views/EstadodeTrafico";
import Reportes from "./views/Reportes";
import Contacto from "./views/Contacto";
import Administrador from "./views/Administrador";
import Graficos from "./views/Graficos";
import ReporteAdminCards from './views/ReporteAdminCards';
import ReporteAdminDetalle from './views/ReporteAdminDetalle';
import { useEffect, useState } from 'react';
import LoaderTractor from './components/common/LoaderTractor';
import Perfil from "./views/Perfil";
import ProtectedRoute from "./components/ProtectedRoute";
import Configuracion from "./views/Configuracion";
import ControlDatos from "./views/ControlDatos";
import Idiomas from "./views/Idiomas";
import Apariencia from "./views/Apariencia";
import RegisUser from "./views/RegisUser";

function Layout() {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);
  const [minDelayTimer, setMinDelayTimer] = useState(null);
  const showFooter = location.pathname === '/inicio' || location.pathname === '/nosotros';
  const isNosotros = location.pathname === '/nosotros';
  const isInicio = location.pathname === '/inicio';
  const isEstado = location.pathname === '/estadodeTrafico' || location.pathname === '/estadodetrafico';
  const isReportes = location.pathname === '/reportes';
  const isAdministrador = location.pathname === '/administrador';
  const ytmusicUrl = import.meta.env.VITE_YTMUSIC_URL || '#';

  // Pequeña superposición global en cada cambio de ruta
  useEffect(() => {
    // Mostrar el loader brevemente al cambiar de ruta
    setRouteLoading(true);
    const t = setTimeout(() => setRouteLoading(false), 800); // ~0.8s
    setMinDelayTimer(t);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [location.pathname]);

  return (
    <div className="app">
      {routeLoading && (
        <LoaderTractor overlay={true} mensaje="Cargando..." />
      )}
      <Encabezado />
      <div className={`main ${isNosotros || isInicio || isEstado || isReportes || isAdministrador ? 'no-padding-top' : ''}`}>
        <main className={`content flex-1 ${isNosotros || isInicio || isEstado || isReportes || isAdministrador ? '' : 'margen-superior-main'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/estadodeTrafico" element={<EstadodeTrafico />} />
            {/* Alias en minúsculas para compatibilidad con enlaces existentes */}
            <Route path="/estadodetrafico" element={<EstadodeTrafico />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/regisuser" element={<RegisUser />} />
            <Route path="/graficos" element={<Graficos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/reporteAdmin" element={<ReporteAdminCards />} />
            <Route path="/reporteAdmin/:id/detalle" element={<ReporteAdminDetalle />} />
            <Route path="/administrador" element={<Administrador />} />
            <Route path="/perfil" element={<ProtectedRoute element={<Perfil />} />} />
            <Route path="/perfil/configuracion" element={<ProtectedRoute element={<Configuracion />} />} />
            <Route path="/perfil/configuracion/datos" element={<ProtectedRoute element={<ControlDatos />} />} />
            <Route path="/perfil/configuracion/idiomas" element={<ProtectedRoute element={<Idiomas />} />} />
            <Route path="/perfil/configuracion/apariencia" element={<ProtectedRoute element={<Apariencia />} />} />
          </Routes>
        </main>
      </div>

      {showFooter && (
        <footer className="footer-navbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-5 gap-8 items-start">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <img src="/Logo.png" alt="NicaDriver" className="w-8 h-8 rounded-lg" />
                  <span className="text-lg font-bold text-white">NicaDriver</span>
                </div>
                <p className="text-white/90">
                  Transformando la movilidad urbana en Nicaragua a través de tecnología innovadora y colaboración ciudadana.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Plataforma</h4>
                <ul className="space-y-2 text-white/90">
                  <li><Link to="/estadodeTrafico" className="hover:text-[#1e3d87] transition-colors">Tráfico en Vivo</Link></li>
                  <li><Link to="/reportes" className="hover:text-[#1e3d87] transition-colors">Reportar Incidente</Link></li>
                  <li><Link to="/graficos" className="hover:text-[#1e3d87] transition-colors">Estadísticas</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Empresa</h4>
                <ul className="space-y-2 text-white/90">
                  <li><Link to="/nosotros" className="hover:text-[#1e3d87] transition-colors">Acerca de</Link></li>
                  <li><Link to="/contacto" className="hover:text-[#1e3d87] transition-colors">Contacto</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-white/90">
                  <li><a href="#" className="hover:text-[#1e3d87] transition-colors">Privacidad</a></li>
                  <li><a href="#" className="hover:text-[#1e3d87] transition-colors">Términos</a></li>
                </ul>
              </div>

              {/* Redes Sociales */}
              <div>
                <h4 className="font-semibold text-white mb-4">Síguenos</h4>
                <div className="flex items-center gap-4 text-white">
                  {/* Reemplaza # con las URLs oficiales cuando las tengas */}
                  <a href="#" aria-label="Facebook" className="hover:text-[#1e3d87] transition-colors"><i className="bi bi-facebook text-2xl"></i></a>
                  <a href="https://www.instagram.com/nicadriver_of?utm_source=ig_web_button_share_sheet&igsh=aDE1cW1zd3Bnbzh4" aria-label="Instagram" className="hover:text-[#1e3d87] transition-colors" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram text-2xl"></i></a>
                  <a href="#" aria-label="Twitter" className="hover:text-[#1e3d87] transition-colors"><i className="bi bi-twitter text-2xl"></i></a>
                  <a href="#" aria-label="YouTube" className="hover:text-[#1e3d87] transition-colors"><i className="bi bi-youtube text-2xl"></i></a>
                  <a href="#" aria-label="LinkedIn" className="hover:text-[#1e3d87] transition-colors"><i className="bi bi-linkedin text-2xl"></i></a>
                  {/* YouTube Music configurable por .env */}
                  <a href={ytmusicUrl} aria-label="YouTube Music" className="hover:text-[#1e3d87] transition-colors" target="_blank" rel="noopener noreferrer" title="YouTube Music">
                    <i className="bi bi-music-note-beamed text-2xl"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 footer-divider border-t">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-white/90 text-sm"> {new Date().getFullYear()} NicaDriver. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Layout />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;