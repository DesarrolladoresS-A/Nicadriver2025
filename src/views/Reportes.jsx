import { useNavigate } from "react-router-dom";

const Reportes = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Reportes</h1>
    </div>
  )
}

export default Reportes;