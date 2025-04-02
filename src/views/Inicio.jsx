import { useNavigate } from 'react-router-dom';

import "../App.css";

const Inicio = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="inicio-container">
            <div className="inicio-header">
                <h1>NicaDriver</h1>
            </div>
            <div className="inicio-seccion superior">
                <div className="inicio-imagen">
                    <img src="/imagen/Carretera1" alt="Regularidad en la vía" />
                    <p>Regularidad en la vía</p>
                </div>
                <div className="inicio-imagen">
                    <img src="/images/resolucion-via.jpg" alt="Resolución en las vías" />
                    <p>Resolución en las vías</p>
                </div>
                <div className="inicio-imagen">
                    <img src="/images/viaje-sin-contratiempo.jpg" alt="Disfruta de tu viaje sin contratiempo" />
                    <p>Disfruta de tu viaje sin contratiempo</p>
                </div>
            </div>
            <div className="mision-vision-container">
                <div className="mision">
                    <h2>Misión</h2>
                    <p>Optimizar la movilidad y gestión del transporte en Nicaragua mediante una solución digital innovadora basada en inteligencia artificial e IoT.</p>
                </div>
                <div className="vision">
                    <h2>Visión</h2>
                    <p>Contribuir a una infraestructura vial más eficiente y sostenible, promoviendo un transporte más seguro y accesible para ciudadanos, transportistas y autoridades gubernamentales.</p>
                </div>
            </div>
            <div className="mapa-reporte-container">
                <div className="mapa-interactivo">
                    <h2>Mapa interactivo</h2>
                    <p>En el mapa de NicaDriver encontrarás información en tiempo real sobre el estado del tráfico, reportes de incidentes, calles en reparación y condiciones climáticas.</p>
                    <img src="/images/mapa.jpg" alt="Mapa interactivo" />
                </div>
                <div className="reporte">
                    <h2>Reporte</h2>
                    <p>"Tu reporte ayuda a mejorar la seguridad vial. ¡Informa cualquier incidente!"</p>
                    <p><strong>Ubicación:</strong> Avenida Central - Managua</p>
                    <p><strong>Tipo de incidente:</strong> accidente, bache, semáforo dañado.</p>
                    <p><strong>Tiempo transcurrido:</strong> hace 10 min, 1 hora.</p>
                    <button onClick={() => handleNavigate('/detalles')}>Ver más detalles</button>
                </div>
            </div>
        </div>
    );
};

export default Inicio;
