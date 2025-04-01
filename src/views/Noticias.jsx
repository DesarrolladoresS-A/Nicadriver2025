import { useNavigate } from "react-router-dom";

const Noticias= () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Noticias</h1>
    </div>
  )
}

export default Noticias;