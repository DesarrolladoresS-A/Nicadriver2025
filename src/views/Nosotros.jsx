import '../styles/Nosotros.css';

const Nosotros = () => {
  return (
    <div className="nosotros-page">
      {/* HERO */}
      <header className="hero">
        <div className="container hero-inner">
          <div>
            <div className="badge"><span className="glow-dot"></span> Nosotros</div>
            <h1>Mantenemos las vías en movimiento con reparaciones inteligentes</h1>
            <p>
              Somos una plataforma integral para la gestión de reparaciones viales y mantenimiento del transporte.
              Centralizamos reportes ciudadanos, priorización con IA y coordinación con cuadrillas para
              reparar baches, señalización y daños en la vía pública de forma rápida y trazable.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#equipo">¿Quienes somos?</a>
              <a className="btn btn-ghost" href="#historia">Nuestra historia</a>
            </div>
            <div className="pill-grid">
              <div className="pill">
                <h3>Misión</h3>
                <p>Restaurar y mantener la infraestructura vial con datos, eficiencia operativa y transparencia.</p>
              </div>
              <div className="pill">
                <h3>Visión</h3>
                <p>Ciudades conectadas, seguras y resilientes gracias a un mantenimiento vial predictivo y colaborativo.</p>
              </div>
              <div className="pill">
                <h3>Valores</h3>
                <p>Servicio público, seguridad, eficiencia, colaboración interinstitucional y mejora continua.</p>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="orbit"></div>

            <div className="floating-group">
              <div className="floating-card">
                <div className="kpi">
                  <div className="dot"></div>
                  <div>
                    <div className="label">Órdenes activas</div>
                    <div className="value">42</div>
                  </div>
                </div>
                <div className="kpi">
                  <div className="dot" style={{ background: 'var(--warning)', boxShadow: '0 0 16px rgba(245,158,11,.55)' }}></div>
                  <div>
                    <div className="label">Tiempo medio de reparación</div>
                    <div className="value">3.8 días</div>
                  </div>
                </div>
              </div>

              <div className="floating-card">
                <div className="kpi">
                  <div className="dot" style={{ background: 'var(--accent)', boxShadow: '0 0 16px rgba(108,140,255,.55)' }}></div>
                  <div>
                    <div className="label">Satisfacción municipal</div>
                    <div className="value">94</div>
                  </div>
                </div>
                <div className="kpi">
                  <div className="dot" style={{ background: 'var(--danger)', boxShadow: '0 0 16px rgba(239,68,68,.55)' }}></div>
                  <div>
                    <div className="label">Incidencias reabiertas</div>
                    <div className="value">0.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {/* MÉTRICAS */}
        <div className="metrics" aria-label="Métricas destacadas">
          <div className="metric-card">
            <div className="num">+2,500</div>
            <div className="sub">Órdenes completadas</div>
          </div>
          <div className="metric-card">
            <div className="num">780 km</div>
            <div className="sub">Vía intervenida</div>
          </div>
          <div className="metric-card">
            <div className="num">48 h</div>
            <div className="sub">Tiempo medio de resolución</div>
          </div>
          <div className="metric-card">
            <div className="num">45</div>
            <div className="sub">Municipios con cobertura</div>
          </div>
        </div>

      
        {/* EQUIPO */}
        <div className="section-title" id="equipo">
          <span>Equipo</span><span className="line"></span>
        </div>
        <section className="team" aria-label="Nuestro equipo">
          <div className="team-grid">
            <article className="member">
              <div className="avatar-wrap">
                <div className="avatar">AM</div>
              </div>
              <div className="member-body">
                <h5>Amin Marin</h5>
                <div className="role">Marketing</div>
                <div className="tags">
                  <span className="tag">Publicista</span>
                  <span className="tag">Comunicador</span>
                </div>
              </div>
            </article>
            <article className="member">
              <div className="avatar-wrap">
                <div className="avatar">JL</div>
              </div>
              <div className="member-body">
                <h5>Josnel López</h5>
                <div className="role">Programador</div>
                <div className="tags">
                  <span className="tag">Analista</span>
                  <span className="tag">Seguridad</span>
                </div>
              </div>
            </article>
            <article className="member">
              <div className="avatar-wrap">
                <div className="avatar">ID</div>
              </div>
              <div className="member-body">
                <h5>Iza Duartez</h5>
                <div className="role">Deseñadora</div>
                <div className="tags">
                </div>
              </div>
            </article>
            <article className="member">
              <div className="avatar-wrap">
                <div className="avatar">BG</div>
              </div>
              <div className="member-body">
                <h5>Byron García</h5>
                <div className="role">Programador</div>
                <div className="tags">
                  <span className="tag">Diseñador</span>
                </div>
              </div>
            </article>
            <article className="member">
              <div className="avatar-wrap">
                <div className="avatar">MR</div>
              </div>
              <div className="member-body">
                <h5>Mauricio Rubio</h5>
                <div className="role">Programador</div>
                <div className="tags">
                  <span className="tag">Cyber Seguridad</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" aria-label="Llamado a la acción">
          <h3>¿Listo para recuperar tus calles?</h3>
          <p>Diseñemos tu plan de mantenimiento vial y gestionemos reparaciones de extremo a extremo.</p>
          <div className="hero-cta">
          </div>
        </section>
      </main>
    </div>
  );
};

export default Nosotros;