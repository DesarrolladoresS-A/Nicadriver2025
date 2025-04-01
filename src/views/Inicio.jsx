import { useNavigate } from "react-router-dom";

const Inicio = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Inicio</h1>
    </div>
  )
}

export default Inicio;