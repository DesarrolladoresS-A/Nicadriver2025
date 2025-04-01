import { useNavigate } from "react-router-dom";

const Nosotros = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Nosotros</h1>
    </div>
  )
}

export default Nosotros;