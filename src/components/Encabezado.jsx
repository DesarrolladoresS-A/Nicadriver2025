import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../database/authcontext";
import { db } from "../database/firebaseconfig";
import { collection, onSnapshot } from "firebase/firestore";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const prevEstadosRef = useRef({}); // rastrear estados previos por reporte id
  const initializedRef = useRef(false); // evitar notificaciones masivas en la primera carga
  const [notifHistory, setNotifHistory] = useState([]); // historial persistente
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
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

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    if (!bellOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

  // Suscripción a los reportes del usuario para notificaciones
  useEffect(() => {
    if (!user || user?.email === "desarrolladoressa2000@gmail.com") return; // No para admin
    const colRef = collection(db, "reportes");
    const unsub = onSnapshot(colRef, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const items = all.filter((r) => r.userEmail === user.email);
      console.log("Notificaciones: encontrados", items.length, "reportes del usuario");
      // Ordenar por fechaRegistro (ISO) descendente y limitar a 20
      items.sort((a, b) => {
        const fa = new Date(a.fechaRegistro || 0).getTime();
        const fb = new Date(b.fechaRegistro || 0).getTime();
        return fb - fa;
      });
      const latest = items.slice(0, 20);

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
    if (next) {
      if (!user) return;
      const key = `notif_history_${user.uid || user.email}`;
      const updated = notifHistory.map((n) => ({ ...n, read: true }));
      setNotifHistory(updated);
      setUnreadCount(0);
      localStorage.setItem(key, JSON.stringify(updated));
    }
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
                        <Nav.Link
                          onClick={handleLogout}
                          className="nav-link"
                        >
                          <i className="bi-box-arrow-right me-2"></i>
                          <strong>Salir</strong>
                        </Nav.Link>
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
                                <div className="notif-panel">
                                  {notifications.length === 0 ? (
                                    <div className="notif-empty">Sin notificaciones</div>
                                  ) : (
                                    notifications.map((n) => (
                                      <div key={n.id} className={`notif-item notif-${n.estado}`}>
                                        <div className="notif-title">{n.titulo}</div>
                                        <div className="notif-text">{n.mensaje}</div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Nav.Link
                          onClick={handleLogout}
                          className="nav-link"
                        >
                          <i className="bi-box-arrow-right me-2"></i>
                          <strong>Salir</strong>
                        </Nav.Link>
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