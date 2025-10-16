import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "../styles/Configuracion.css";

const Idiomas = () => {
  const { lang, setLang } = useLanguage();
  const navigate = useNavigate();

  const options = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'Inglés' },
    { code: 'zh', label: 'Chino' }
  ];

  const select = (code) => {
    setLang(code);
    navigate(-1);
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) navigate(-1); };

  return (
    <div className="cfg-overlay" onClick={handleOverlayClick}>
      <div className="cfg-container">
        <div className="cfg-card">
        <div className="cfg-header">
          <button className="cfg-back" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
          <h2>Idiomas</h2>
        </div>

        <section className="cfg-section">
          <div className="cfg-box">
            {options.map((o) => (
              <button key={o.code} className={`cfg-row ${lang === o.code ? 'active' : ''}`} onClick={() => select(o.code)}>
                <div className="cfg-row-title">{o.label}</div>
                {lang === o.code && <span className="cfg-badge">Actual</span>}
              </button>
            ))}
          </div>
        </section>
        </div>
      </div>
    </div>
  );
};

export default Idiomas;
