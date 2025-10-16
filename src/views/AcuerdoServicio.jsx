import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Configuracion.css";

const AcuerdoServicio = () => {
  const navigate = useNavigate();
  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) navigate(-1); };
  const fecha = new Date().toLocaleDateString();

  return (
    <div className="cfg-overlay" onClick={handleOverlayClick}>
      <div className="cfg-container">
        <div className="cfg-card">
          <div className="cfg-header">
            <button className="cfg-back" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
            <h2>Acuerdo de Servicio</h2>
          </div>

          <section className="cfg-section">
            <div className="cfg-box">
              <div className="cfg-line">
                <span><strong>Reglamento de Términos de Uso - NicaDriver</strong></span>
                <span className="muted">Última Actualización: {fecha}</span>
              </div>
              <div className="cfg-text">
                <p>Estimados usuarios, ¡bienvenidos a NicaDriver! Los productos y servicios de NicaDriver son propiedad y están operados por <strong>Desarrolladores S.A</strong> (en adelante, "NicaDriver" o "nosotros"). Antes de utilizar los Servicios, por favor lea y comprenda estos Términos y cualquier política relacionada.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>1. Definiciones y Alcance</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>1.1 Servicios Incluidos</strong></p>
                <ul>
                  <li>Monitoreo de tráfico en tiempo real</li>
                  <li>Sistema de reportes de incidentes viales</li>
                  <li>Dashboard de estadísticas y análisis</li>
                  <li>Gestión de contenido administrativo</li>
                  <li>Funcionalidades de Progressive Web App (PWA)</li>
                </ul>
                <p><strong>1.2 Aceptación de Términos</strong></p>
                <p>Al utilizar cualquiera de los servicios de NicaDriver, usted acepta estos Términos y nuestra Política de Privacidad.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>2. Uso de la Plataforma</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>2.1 Registro y Cuenta</strong></p>
                <ul>
                  <li>Los usuarios pueden registrarse mediante Firebase Authentication.</li>
                  <li>La plataforma distingue entre usuarios regulares y administradores.</li>
                  <li>Los administradores tienen acceso privilegiado a funciones de gestión y moderación.</li>
                </ul>
                <p><strong>2.2 Funciones Principales</strong></p>
                <p><em>Usuarios Regulares:</em> Visualización del estado del tráfico, reporte de incidentes viales, consulta de estadísticas públicas, acceso a información de contacto y noticias.</p>
                <p><em>Administradores:</em> Gestión de reportes, acceso a dashboard administrativo, moderación de contenido, exportación de datos y estadísticas.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>3. Responsabilidades del Usuario</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>3.1 Conducta Apropiada</strong></p>
                <ul>
                  <li>Proporcionar información veraz en los reportes.</li>
                  <li>Respetar los derechos de otros usuarios.</li>
                  <li>No utilizar la plataforma para actividades ilegales.</li>
                  <li>Mantener la confidencialidad de sus credenciales.</li>
                </ul>
                <p><strong>3.2 Restricciones</strong></p>
                <ul>
                  <li>Manipular o falsificar datos de tráfico.</li>
                  <li>Utilizar bots o scripts automatizados sin autorización.</li>
                  <li>Compartir contenido ofensivo o inapropiado.</li>
                  <li>Realizar ingeniería inversa de la plataforma.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>4. Propiedad Intelectual</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>4.1 Derechos de NicaDriver</strong></p>
                <p>Incluyen el código fuente, diseño UI/UX, marcas y logotipos, y documentación técnica.</p>
                <p><strong>4.2 Licencia de Uso</strong></p>
                <p>Licencia limitada, no exclusiva e intransferible para utilizar los servicios conforme a estos Términos.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>5. Privacidad y Protección de Datos</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>5.1 Recopilación de Datos</strong> mediante Firebase Authentication, Firestore, Storage, y herramientas de análisis como Google Analytics y Hotjar.</p>
                <p><strong>5.2 Uso de Datos de Ubicación</strong> para servicios de tráfico en tiempo real, precisión de reportes y estadísticas agregadas.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>6. Limitación de Responsabilidad</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>6.1 Exactitud de la Información</strong> No garantizamos exactitud absoluta, disponibilidad continua, ni integridad de información de terceros.</p>
                <p><strong>6.2 Servicios de Terceros</strong> Uso de Google Maps, OpenWeather API, Firebase y otros.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>7. Modificaciones y Terminación</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>7.1 Cambios</strong> Podemos modificar Términos, actualizar funcionalidades o suspender servicios.</p>
                <p><strong>7.2 Notificación</strong> Actualizando la fecha, notificaciones en la plataforma y correo cuando aplique.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>8. Términos Específicos por Función</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p>Cuando utilice funciones específicas, pueden aplicar Términos Específicos. En conflicto, prevalecen los términos específicos.</p>
              </div>
            </div>
          </section>

          <section className="cfg-section">
            <h3>9. Contacto y Soporte</h3>
            <div className="cfg-box">
              <div className="cfg-text">
                <p><strong>Email:</strong> desarrolladoressa2000@gmail.com</p>
                <p><strong>Sitio Web:</strong> www.nicadriver.com</p>
                <p><strong>Desarrolladores:</strong> Desarrolladores S.A</p>
                <p>Todos los términos y reglas mencionados constituyen un acuerdo integral entre usted y <strong>Desarrolladores S.A</strong>.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AcuerdoServicio;
