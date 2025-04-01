import { useNavigate } from "react-router-dom";

const Contacto = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Contacto</h1>
    </div>
  )
}

export default Contacto;