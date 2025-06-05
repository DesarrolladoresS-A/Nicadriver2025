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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Encabezado />
        <main className="margen-superior-main">
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/estadodeTrafico" element={<EstadodeTrafico />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;