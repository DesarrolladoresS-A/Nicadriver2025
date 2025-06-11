import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Nosotros from "./views/Nosotros";
import './App.css';
import EstadodeTrafico from "./views/EstadodeTrafico";
import Reportes from "./views/Reportes";
import Contacto from "./views/Contacto";
import Catalogo from "./views/Catalogorepor";
import Perfil from "./views/Perfil"; 
import Administrador from "./views/Administrador";
import Graficos from "./views/Graficos";

import ReporteAdmin from './views/ReporteAdmin';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Encabezado />
          <main className="margen-superior-main">
            <Routes>
              <Route path="/" element={<Navigate to="/inicio" replace />} />
              <Route path="/inicio" element={
                <div className="inicio-container">
                  <Inicio />
                </div>
              } />
              <Route path="/nosotros" element={
                <div className="nosotros-container">
                  <Nosotros />
                </div>
              } />
              <Route path="/perfil" element={<Perfil />} /> 
              <Route path="/estadodeTrafico" element={<EstadodeTrafico />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/login" element={<Login />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;