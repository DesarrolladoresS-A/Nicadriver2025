import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import "../styles/Configuracion.css";

const Item = ({ label, selected, onClick }) => (
  <button className={`cfg-row ${selected ? 'active' : ''}`} onClick={onClick}>
    <div className="cfg-row-title">{label}</div>
    {selected && <span className="cfg-badge">Activo</span>}
  </button>
);

const Apariencia = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="cfg-container">
      <div className="cfg-card">
        <div className="cfg-header">
          <button className="cfg-back" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
          <h2>Apariencia</h2>
        </div>

        <section className="cfg-section">
          <div className="cfg-box">
            <Item label="Claro" selected={theme === 'light'} onClick={() => setTheme('light')} />
            <Item label="Normal" selected={theme === 'normal'} onClick={() => setTheme('normal')} />
            <Item label="Oscuro" selected={theme === 'dark'} onClick={() => setTheme('dark')} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Apariencia;
