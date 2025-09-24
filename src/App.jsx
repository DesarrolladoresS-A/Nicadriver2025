import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
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
import ReporteAdmin from './views/ReporteAdmin';
import Register from './views/Register';

function Layout() {
  const location = useLocation();
  const showFooter = location.pathname === '/inicio' || location.pathname === '/nosotros';

  return (
    <div className="app">
      <Encabezado />
      <div className="main container">
        <main className="content margen-superior-main flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={
              <div className="inicio-container">
                <Inicio />
              </div>
            } />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/estadodeTrafico" element={<EstadodeTrafico />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/graficos" element={<Graficos />} />
            <Route path="/reporteAdmin" element={<ReporteAdmin />} />
            <Route path="/administrador" element={
              <div className="inicio-container">
                <Administrador />
              </div>
            } />
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
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;