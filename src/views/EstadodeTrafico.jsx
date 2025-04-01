import { useNavigate } from "react-router-dom";

const EstadodeTrafico = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Estado de Trafico</h1>
    </div>
  )
}

export default EstadodeTrafico;