import { useNavigate } from "react-router-dom";
import '../styles/Nosotros.css';

const Nosotros = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div className="nosotros-container">
      {/* Encabezado */}
      <header className="nosotros-header">
        <h1>Sobre nosotros</h1>
        <p className="nosotros-subtitulo">Innovación y tecnología para mejorar la movilidad en Nicaragua</p>
      </header>

      {/* Sección Quiénes Somos */}
      <section className="seccion-nosotros">
        <div className="contenido-seccion">
          <div className="texto-seccion">
            <h2>¿Quiénes somos?</h2>
            <p>
              NicaDriver es una plataforma digital diseñada para mejorar la movilidad urbana y la seguridad vial en Nicaragua. 
              A través de la integración de inteligencia artificial, datos en tiempo real y colaboración con entidades gubernamentales, 
              facilitamos información precisa sobre el tráfico, el estado de las carreteras y alertas viales.
            </p>
          </div>
          <img 
            src="/imagen/Nosotros.jpg" 
            alt="Equipo NicaDriver" 
            className="imagen-seccion"
          />
        </div>
      </section>

      {/* Sección Misión */}
      <section className="seccion-nosotros gris">
        <div className="contenido-seccion invertido">
          <div className="texto-seccion">
            <h2>Misión</h2>
            <p>
              Nuestra misión es optimizar la movilidad y gestión del transporte en Nicaragua mediante una solución digital innovadora basada en inteligencia artificial. 
              A través de nuestra aplicación, buscamos proporcionar información en tiempo real sobre el estado de las carreteras, 
              mejorar la eficiencia del tráfico y reducir los costos operativos para conductores, transportistas y entidades gubernamentales.
            </p>
          </div>
          <img 
            src="/imagen/Carretera5.jpg" 
            alt="Misión NicaDriver" 
            className="imagen-seccion"
          />
        </div>
      </section>

      {/* Sección Visión */}
      <section className="seccion-nosotros">
        <div className="contenido-seccion">
          <div className="texto-seccion">
            <h2>Visión</h2>
            <p>
              Aspiramos a transformar la movilidad y gestión del transporte en Nicaragua mediante la integración de inteligencia artificial, 
              brindando soluciones digitales que optimicen el trabajo, reduzcan la congestión y mejoren la planificación vial. 
              Buscamos contribuir a una infraestructura vial más eficiente y sostenible.
            </p>
          </div>
          <img 
            src="/imagen/Carretera6.jpg" 
            alt="Visión NicaDriver" 
            className="imagen-seccion"
          />
        </div>
      </section>

      {/* Sección Valores */}
      <section className="seccion-valores">
        <h2>Nuestros valores</h2>
        <div className="lista-valores">
          <div className="valor-item">
            <span className="valor-icon">🚀</span>
            <h3>Innovación tecnológica</h3>
            <p>Implementamos las últimas tecnologías para revolucionar la movilidad</p>
          </div>
          
          <div className="valor-item">
            <span className="valor-icon">🔍</span>
            <h3>Transparencia y accesibilidad</h3>
            <p>Datos claros y disponibles para todos los usuarios</p>
          </div>
          
          <div className="valor-item">
            <span className="valor-icon">🚦</span>
            <h3>Seguridad vial</h3>
            <p>Priorizamos la protección de todos en las vías</p>
          </div>
          
          <div className="valor-item">
            <span className="valor-icon">🌿</span>
            <h3>Compromiso sostenible</h3>
            <p>Soluciones que benefician al medio ambiente</p>
          </div>
          
          <div className="valor-item">
            <span className="valor-icon">🤝</span>
            <h3>Colaboración institucional</h3>
            <p>Trabajamos con entidades públicas y privadas</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Nosotros;