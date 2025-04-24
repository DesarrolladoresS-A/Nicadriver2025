import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./views/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Nosotros from "./views/Nosotros";

import './App.css';
import EstadodeTrafico from "./views/EstadodeTrafico";
import Reportes from "./views/Reportes";  {/* Asegúrate de importar el componente Reportes */}
import Contacto from "./views/Contacto";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Encabezado />
        <main className="margen-superior-main">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/nosotros" element={<ProtectedRoute element={<Nosotros />} />} />
            <Route path="/estadodeTrafico" element={<ProtectedRoute element={<EstadodeTrafico />} />} />
            <Route path="/reportes" element={<ProtectedRoute element={<Reportes />} />} />  {/* Ruta para el componente Reportes */}
            <Route path="/contacto" element={<ProtectedRoute element={<Contacto />} />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
