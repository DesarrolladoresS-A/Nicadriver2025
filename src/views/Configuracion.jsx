import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import "../styles/Configuracion.css";

const RowButton = ({ title, subtitle, onClick }) => (
  <button className="cfg-row" onClick={onClick}>
    <div className="cfg-row-text">
      <div className="cfg-row-title">{title}</div>
      {subtitle && <div className="cfg-row-sub">{subtitle}</div>}
    </div>
    <span className="cfg-row-arrow">›</span>
  </button>
);

const Configuracion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) navigate(-1);
  };

  return (
    <div className="cfg-overlay" onClick={handleOverlayClick}>
      <div className="cfg-container">
        <div className="cfg-card">
          <div className="cfg-header">
            <button className="cfg-back" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
            <h2>Configuración</h2>
          </div>

          <section className="cfg-section">
            <h3>Datos</h3>
            <div className="cfg-box">
              <div className="cfg-line">
                <span>Correo Electrónico</span>
                <span className="muted">{user?.email || "—"}</span>
              </div>
              <RowButton title="Controles de Datos" onClick={() => navigate("/perfil/configuracion/datos")} />
            </div>
          </section>

          <section className="cfg-section">
            <h3>App</h3>
            <div className="cfg-box">
              <RowButton title="Idioma" subtitle="Español / Inglés / Chino" onClick={() => navigate("/perfil/configuracion/idiomas")} />
              <RowButton title="Apariencia" subtitle="Claro / Normal / Oscuro" onClick={() => navigate("/perfil/configuracion/apariencia")} />
            </div>
          </section>

          <section className="cfg-section">
            <h3>Acerca de</h3>
            <div className="cfg-box">
              <RowButton title="Acuerdo de Servicio" onClick={() => navigate('/perfil/configuracion/terminos')} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
