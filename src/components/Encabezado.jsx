import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../database/authcontext";
import { db } from "../database/firebaseconfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";
import { RecentReportNotification, ReportStatusNotification } from "./notifications";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [latestReports, setLatestReports] = useState([]); // lista base de reportes del usuario
  const prevEstadosRef = useRef({}); // rastrear estados previos por reporte id
  const initializedRef = useRef(false); // evitar notificaciones masivas en la primera carga
  const [notifHistory, setNotifHistory] = useState([]); // historial persistente
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const profilePanelRef = useRef(null);
  const configPanelRef = useRef(null);

  const [activeTab, setActiveTab] = useState('recent'); // recent | status
  const [perfilData, setPerfilData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/inicio");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);
  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  // Cargar historial desde localStorage al iniciar sesión
  useEffect(() => {
    if (!user) return;
    const key = `notif_history_${user.uid || user.email}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setNotifHistory(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      } catch (e) {
        console.error("Error parsing notif history:", e);
      }
    } else {
      setNotifHistory([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Cerrar paneles al hacer click fuera
  useEffect(() => {
    if (!bellOpen && !profileOpen && !configOpen) return;
    const handleClickOutside = (e) => {
      const outsideBell = panelRef.current ? !panelRef.current.contains(e.target) : false;
      const outsideProfile = profilePanelRef.current ? !profilePanelRef.current.contains(e.target) : false;
      const outsideConfig = configPanelRef.current ? !configPanelRef.current.contains(e.target) : false;
      if (bellOpen && outsideBell) setBellOpen(false);
      if (profileOpen && outsideProfile) setProfileOpen(false);
      if (configOpen && outsideConfig) setConfigOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen, profileOpen, configOpen]);

  // Cargar datos de perfil del usuario
  useEffect(() => {
    let unsub = null;
    (async () => {
      if (!user) { setPerfilData(null); return; }
      try {
        // carga puntual del doc
        const { doc, getDoc } = await import('firebase/firestore');
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setPerfilData(snap.data());
        else setPerfilData({ email: user.email, nombre: user.displayName || '', apellido: '' });
      } catch {
        setPerfilData({ email: user?.email });
      }
    })();
    return () => { if (unsub) unsub(); };
  }, [user]);

  // Suscripción a los reportes del usuario para notificaciones
  useEffect(() => {
    if (!user || user?.email === "desarrolladoressa2000@gmail.com") return; // No para admin
    // Suscribe SOLO a documentos del usuario autenticado para evitar recibir cambios de otros usuarios
    const colRef = collection(db, "reportes");
    const q = query(colRef, where("userEmail", "==", user.email));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("Notificaciones: encontrados", items.length, "reportes del usuario");
      // Ordenar por fechaRegistro (ISO) descendente y limitar a 20
      items.sort((a, b) => {
        const fa = new Date(a.fechaRegistro || 0).getTime();
        const fb = new Date(b.fechaRegistro || 0).getTime();
        return fb - fa;
      });
      const latest = items.slice(0, 20);
      setLatestReports(latest);

      // En la primera carga no crear eventos de "creado" para todo el historial
      if (!initializedRef.current) {
        const seed = {};
        latest.forEach((r) => {
          const currEstado = (r.estado || "pendiente").toLowerCase();
          seed[r.id] = currEstado;
        });
        prevEstadosRef.current = seed;
        initializedRef.current = true;
      }

      // Detectar NUEVOS reportes y cambios de estado para generar eventos adicionales
      const prev = prevEstadosRef.current || {};
      const newEvents = [];

      latest.forEach((r) => {
        const currEstado = (r.estado || "pendiente").toLowerCase();
        const prevEstado = prev[r.id];
        const titulo = r.titulo || "Reporte";

        // Nuevo reporte detectado (no existía antes): notificación de envío correcto
        if (prevEstado === undefined && initializedRef.current) {
          newEvents.unshift({
            id: `${r.id}-creado-${Date.now()}`,
            titulo,
            estado: currEstado,
            mensaje: `Reporte "${titulo}"
 se ha enviado correctamente
 Estado: Pendiente`,
            fecha: r.fechaRegistro || r.createdAt || null,
            read: false,
          });
        }

        if (prevEstado && prevEstado !== currEstado && currEstado !== "pendiente") {
          const estadoLabel = currEstado === "aprobado" || currEstado === "aceptado" ? "Aceptado" : currEstado === "rechazado" ? "Rechazado" : "En proceso";
          newEvents.unshift({
            id: `${r.id}-${currEstado}-${Date.now()}`,
            titulo,
            estado: currEstado,
            mensaje: `Reporte "${titulo}"
 fue contestado por el administrador
 Estado: ${estadoLabel}`,
            fecha: r.fechaRegistro || r.createdAt || null,
            read: false,
          });
        }
        prev[r.id] = currEstado; // actualizar previo
      });
      prevEstadosRef.current = prev;

      // Mapear a mensajes base (lista de reportes con su estado actual)
      const mapped = latest.map((r) => {
        const estado = (r.estado || "pendiente").toLowerCase();
        const estadoLabel = estado === "aprobado" || estado === "aceptado" ? "Aceptado" : estado === "rechazado" ? "Rechazado" : estado === "pendiente" ? "Pendiente" : "En proceso";
        const titulo = r.titulo || "Reporte";
        const msg = `Reporte "${titulo}"
 responderemos su reporte durante 30 dias
 Estado: ${estadoLabel}`;
        return {
          id: r.id,
          titulo,
          estado,
          mensaje: msg,
          fecha: r.fechaRegistro || r.createdAt || null,
        };
      });

      // Persistir historial con nuevos eventos (sin duplicar)
      if (newEvents.length > 0) {
        const key = `notif_history_${user.uid || user.email}`;
        const existing = [...notifHistory];
        let added = 0;
        newEvents.forEach((ev) => {
          if (!existing.find((x) => x.id === ev.id)) {
            existing.unshift(ev);
            added += 1;
          }
        });
        if (added > 0) {
          setNotifHistory(existing);
          setUnreadCount(existing.filter((n) => !n.read).length);
          localStorage.setItem(key, JSON.stringify(existing));
          setBellOpen(true);
        }
      }

      // UI combina: primero historial, luego estados base
      const combined = [...notifHistory, ...mapped].slice(0, 20);
      setNotifications(combined);
    }, (err) => {
      console.error("Error en notificaciones (onSnapshot):", err);
    });
    return () => unsub();
  }, [user, notifHistory]);

  // Abrir/cerrar campana y marcar como leídas
  const toggleBell = () => {
    const next = !bellOpen;
    setBellOpen(next);
    if (next) setProfileOpen(false);
    if (next) {
      if (!user) return;
      const key = `notif_history_${user.uid || user.email}`;
      const updated = notifHistory.map((n) => ({ ...n, read: true }));
      setNotifHistory(updated);
      setUnreadCount(0);
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const toggleProfile = (e) => {
    e.preventDefault();
    setProfileOpen((v) => { const nv = !v; if (nv) { setBellOpen(false); setConfigOpen(false);} return nv; });
  };

  const openConfigPanel = () => {
    setConfigOpen(true);
    setProfileOpen(false);
    setBellOpen(false);
  };

  return (
    <>
      <Navbar expand="md" fixed="top" className="color-navbar">
        <Container>
          <Navbar.Brand onClick={() => handleNavigate("/inicio")} className="text-white" style={{ cursor: "pointer" }}>
            <img alt="" src="/Logo.png" width="60" height="40" className="d-inline-block align-top" />
            <strong>NicaDriver</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={handleToggle} />
          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-sm"
            aria-labelledby="offcanvasNavbarLabel-expand-sm"
            placement="end"
            show={isCollapsed}
            onHide={() => setIsCollapsed(false)}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-sm" className={isCollapsed ? "color-texto-marca" : "text-white"}>
                Menú
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                {/* Vista Home - Cuando NO está logueado */}
                {!isLoggedIn && (
                  <>
                    <Nav.Link onClick={() => handleNavigate("/inicio")} className="nav-link">
                      <i className="bi-house-door me-2"></i>
                      <strong>Inicio</strong>
                    </Nav.Link>
                    <Nav.Link onClick={() => handleNavigate("/nosotros")} className="nav-link">
                      <i className="bi-info-circle me-2"></i>
                      <strong>Nosotros</strong>
                    </Nav.Link>
                    <Nav.Link onClick={() => handleNavigate("/login")} className="nav-link">
                      <i className="bi-box-arrow-in-right me-2"></i>
                      <strong>Entrar</strong>
                    </Nav.Link>
                  </>
                )}

                {/* Vista Usuario - Cuando ESTÁ logueado */}
                {isLoggedIn && (
                  <>
                    {/* Verificar si es administrador */}
                    {user?.email === "desarrolladoressa2000@gmail.com" ? (
                      // Menú de Administrador
                      <>
                        <Nav.Link
                          onClick={() => handleNavigate("/administrador")}
                          className={`nav-link ${location.pathname === "/administrador" ? "active" : ""}`}
                        >
                          <i className="bi-speedometer2 me-2"></i>
                          <strong>Inicio Administrador</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/estadodeTrafico")}
                          className={`nav-link ${location.pathname === "/estadodeTrafico" ? "active" : ""}`}
                        >
                          <i className="bi-cone-striped me-2"></i>
                          <strong>Estado del Tráfico</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/reporteAdmin")}
                          className={`nav-link ${location.pathname === "/reporteAdmin" ? "active" : ""}`}
                        >
                          <i className="bi-file-earmark-text-fill me-2"></i>
                          <strong>Reporte Administrador</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/graficos")}
                          className={`nav-link ${location.pathname === "/graficos" ? "active" : ""}`}
                        >
                          <i className="bi-graph-up me-2"></i>
                          <strong>Gráficos</strong>
                        </Nav.Link>
                        <div className="profile-anchor">
                          <Nav.Link
                            onClick={toggleProfile}
                            className={`nav-link ${location.pathname === "/perfil" ? "active" : ""}`}
                          >
                            <i className="bi-person-circle me-2"></i>
                            <strong>Perfil</strong>
                          </Nav.Link>
                          {profileOpen && (
                          <div ref={profilePanelRef} className="notif-panel profile-panel" style={{ width: 380, maxHeight: 480, overflow: 'hidden' }}>
                            <div style={{ padding: 12 }}>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                                <div style={{ width: 132, height: 132, borderRadius: '9999px', overflow:'hidden', border:'4px solid #e5e7eb', background:'#f3f4f6' }}>
                                  {perfilData?.profileImage ? (
                                    <img src={`data:image/jpeg;base64,${perfilData.profileImage}`} alt="Perfil" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                  ) : (
                                    <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#fbbf24',color:'#111827',fontWeight:800,fontSize:44}}>
                                      {(perfilData?.nombre?.[0]||'').toUpperCase()}{(perfilData?.apellido?.[0]||'').toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="perfil-section" style={{marginTop:12}}>
                                <h3 style={{margin:'8px 0'}}>Datos:</h3>
                                <div className="perfil-box">
                                  <p><strong>Usuario:</strong> {`${perfilData?.nombre||''} ${perfilData?.apellido||''}`.trim() || (user?.displayName||'Usuario')}</p>
                                  <p><strong>Cédula:</strong> {perfilData?.cedula || '—'}</p>
                                </div>
                              </div>
                              <div className="perfil-section" style={{marginTop:8}}>
                                <h3 style={{margin:'8px 0'}}>Contacto:</h3>
                                <div className="perfil-box">
                                  <p><strong>Teléfono:</strong> {perfilData?.celular || '—'}</p>
                                  <p><strong>Correo Electrónico:</strong> {perfilData?.email || user?.email || '—'}</p>
                                </div>
                              </div>
                              <div className="perfil-actions" style={{marginTop:12}}>
                                <button className="btn-config" onClick={openConfigPanel}>Configuración</button>
                                <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                              </div>
                            </div>
                          </div>
                          )}
                          {configOpen && (
                          <div ref={configPanelRef} className="notif-panel profile-panel" style={{ width: 380, maxHeight: 520, overflow: 'auto' }}>
                            <div style={{ padding: 12 }}>
                              <div className="cfg-section" style={{marginTop:4}}>
                                <h3 style={{margin:'6px 0'}}>Datos</h3>
                                <div className="cfg-box">
                                  <div className="cfg-line">
                                    <span>Correo Electrónico</span>
                                    <span className="muted">{user?.email || '—'}</span>
                                  </div>
                                  <button className="cfg-row" onClick={() => { setConfigOpen(false); handleNavigate('/perfil/configuracion/datos'); }}>
                                    <div className="cfg-row-title">Controles de Datos</div>
                                    <span className="cfg-row-arrow">›</span>
                                  </button>
                                </div>
                              </div>
                              <div className="cfg-section" style={{marginTop:10}}>
                                <h3 style={{margin:'6px 0'}}>App</h3>
                                <div className="cfg-box">
                                  <button className="cfg-row" onClick={() => { setConfigOpen(false); handleNavigate('/perfil/configuracion/idiomas'); }}>
                                    <div className="cfg-row-title">Idioma</div>
                                    <span className="cfg-row-sub">Español / Inglés / Chino</span>
                                  </button>
                                  <button className="cfg-row" onClick={() => { setConfigOpen(false); handleNavigate('/perfil/configuracion/apariencia'); }}>
                                    <div className="cfg-row-title">Apariencia</div>
                                    <span className="cfg-row-sub">Claro / Normal / Oscuro</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Cierre del ancla de perfil (admin) */}
                        </div>
                      </>
                    ) : (
                      // Menú de Usuario Normal
                      <>
                        <Nav.Link
                          onClick={() => handleNavigate("/inicio")}
                          className={`nav-link ${location.pathname === "/inicio" ? "active" : ""}`}
                        >
                          <i className="bi-house-door-fill me-2"></i>
                          <strong>Inicio</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/nosotros")}
                          className={`nav-link ${location.pathname === "/nosotros" ? "active" : ""}`}
                        >
                          <i className="bi-person-fill me-2"></i>
                          <strong>Nosotros</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/estadodeTrafico")}
                          className={`nav-link ${location.pathname === "/estadodeTrafico" ? "active" : ""}`}
                        >
                          <i className="bi-cone-striped me-2"></i>
                          <strong>Estado del Trafico</strong>
                        </Nav.Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Nav.Link
                            onClick={() => handleNavigate("/reportes")}
                            className={`nav-link ${location.pathname === "/reportes" ? "active" : ""}`}
                          >
                            <i className="bi-file-earmark-text-fill me-2"></i>
                            <strong>Reportes</strong>
                          </Nav.Link>
                          {/* Campana de notificaciones a la par de Reportes */}
                          {isLoggedIn && user?.email !== "desarrolladoressa2000@gmail.com" && (
                            <div ref={panelRef} className="notif-bell" onClick={toggleBell} title="Notificaciones">
                              <i className="bi bi-bell-fill" style={{ color: 'black' }}></i>
                              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                              {bellOpen && (
                                <div className="notif-panel" style={{ width: 360, maxHeight: 420, overflow: 'hidden' }}>
                                  <div style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 1, display: 'flex', gap: 8, padding: '8px 8px 6px', borderBottom: '1px solid #f3f4f6' }}>
                                    <button
                                      className="btn btn-light"
                                      style={{ borderRadius: 16, padding: '4px 10px', background: activeTab === 'recent' ? '#e9ecef' : '#fff', color: '#111827', border: '1px solid #e5e7eb' }}
                                      onClick={(e) => { e.stopPropagation(); setActiveTab('recent'); }}
                                    >
                                      Reportes Recientes
                                    </button>
                                    <button
                                      className="btn btn-light"
                                      style={{ borderRadius: 16, padding: '4px 10px', background: activeTab === 'status' ? '#e9ecef' : '#fff', color: '#111827', border: '1px solid #e5e7eb' }}
                                      onClick={(e) => { e.stopPropagation(); setActiveTab('status'); }}
                                    >
                                      Estado de Reportes
                                    </button>
                                  </div>
                                  <div key={activeTab} className="fade-slide" style={{ padding: 8, height: 360, overflowY: 'auto' }}>
                                    {activeTab === 'recent' && (
                                      latestReports.length === 0 ? (
                                        <div className="notif-empty">Sin notificaciones</div>
                                      ) : (
                                        latestReports.map((r) => (
                                          <RecentReportNotification
                                            key={r.id}
                                            report={{
                                              tipoReporte: r.titulo || r.tipoReporte,
                                              userEmail: r.userEmail || (user && user.email),
                                              descripcion: r.descripcion,
                                              fechaRegistro: r.fechaRegistro || r.fechaHora,
                                              imagenUrl: r.foto || r.imagenUrl || r.imagen || r.image || r.photoURL || r.imagenBase64
                                            }}
                                          />
                                        ))
                                      )
                                    )}
                                    {activeTab === 'status' && (
                                      latestReports.filter((r) => (r.estado || 'pendiente').toLowerCase() !== 'pendiente').length === 0 ? (
                                        <div className="notif-empty">Sin actualizaciones</div>
                                      ) : (
                                        latestReports.filter((r) => (r.estado || 'pendiente').toLowerCase() !== 'pendiente').map((r) => (
                                          <ReportStatusNotification
                                            key={`${r.id}-status`}
                                            report={{
                                              tipoReporte: r.titulo || r.tipoReporte,
                                              userEmail: r.userEmail || (user && user.email),
                                              descripcion: r.descripcion,
                                              fechaActualizacion: r.fechaActualizacion || r.fechaRegistro || r.fechaHora,
                                              estado: r.estado || 'pendiente',
                                              comentarioAdmin: r.comentarioAdmin,
                                              imagenUrl: r.foto || r.imagenUrl || r.imagen || r.image || r.photoURL || r.imagenBase64
                                            }}
                                          />
                                        ))
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Perfil anclado: igual que en bloque admin */}
                          <div className="profile-anchor">
                            <Nav.Link
                              onClick={toggleProfile}
                              className={`nav-link ${location.pathname === "/perfil" ? "active" : ""}`}
                            >
                              <i className="bi-person-circle me-2"></i>
                              <strong>Perfil</strong>
                            </Nav.Link>
                            {profileOpen && (
                              <div ref={profilePanelRef} className="notif-panel profile-panel" style={{ width: 380, maxHeight: 480, overflow: 'hidden' }}>
                                <div style={{ padding: 12 }}>
                                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                                    <div style={{ width: 132, height: 132, borderRadius: '9999px', overflow:'hidden', border:'4px solid #e5e7eb', background:'#f3f4f6' }}>
                                      {perfilData?.profileImage ? (
                                        <img src={`data:image/jpeg;base64,${perfilData.profileImage}`} alt="Perfil" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                      ) : (
                                        <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#fbbf24',color:'#111827',fontWeight:800,fontSize:44}}>
                                          {(perfilData?.nombre?.[0]||'').toUpperCase()}{(perfilData?.apellido?.[0]||'').toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="perfil-section" style={{marginTop:12}}>
                                    <h3 style={{margin:'8px 0'}}>Datos:</h3>
                                    <div className="perfil-box">
                                      <p><strong>Usuario:</strong> {`${perfilData?.nombre||''} ${perfilData?.apellido||''}`.trim() || (user?.displayName||'Usuario')}</p>
                                      <p><strong>Cédula:</strong> {perfilData?.cedula || '—'}</p>
                                    </div>
                                  </div>
                                  <div className="perfil-section" style={{marginTop:8}}>
                                    <h3 style={{margin:'8px 0'}}>Contacto:</h3>
                                    <div className="perfil-box">
                                      <p><strong>Teléfono:</strong> {perfilData?.celular || '—'}</p>
                                      <p><strong>Correo Electrónico:</strong> {perfilData?.email || user?.email || '—'}</p>
                                    </div>
                                  </div>
                                  <div className="perfil-actions" style={{marginTop:12}}>
                                    <button className="btn-config" onClick={openConfigPanel}>Configuración</button>
                                    <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {configOpen && (
                              <div ref={configPanelRef} className="notif-panel profile-panel" style={{ width: 380, maxHeight: 520, overflow: 'auto' }}>
                                <div style={{ padding: 12 }}>
                                  <div className="cfg-section" style={{marginTop:4}}>
                                    <h3 style={{margin:'6px 0'}}>Datos</h3>
                                    <div className="cfg-box">
                                      <div className="cfg-line">
                                        <span>Correo Electrónico</span>
                                        <span className="muted">{user?.email || '—'}</span>
                                      </div>
                                      <button className="cfg-row" onClick={() => { setConfigOpen(false); handleNavigate('/perfil/configuracion/datos'); }}>
                                        <div className="cfg-row-title">Controles de Datos</div>
                                        <span className="cfg-row-arrow">›</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="cfg-section" style={{marginTop:10}}>
                                    <h3 style={{margin:'6px 0'}}>App</h3>
                                    <div className="cfg-box">
                                      <button className="cfg-row" onClick={() => { setConfigOpen(false); handleNavigate('/perfil/configuracion/idiomas'); }}>
                                        <div className="cfg-row-title">Idioma</div>
                                        <span className="cfg-row-sub">Español / Inglés / Chino</span>
                                      </button>
                                      <button className="cfg-row" onClick={() => { setConfigOpen(false); handleNavigate('/perfil/configuracion/apariencia'); }}>
                                        <div className="cfg-row-title">Apariencia</div>
                                        <span className="cfg-row-sub">Claro / Normal / Oscuro</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default Encabezado;