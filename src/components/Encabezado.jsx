import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useAuth } from "../database/authcontext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
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
                      <strong>Iniciar Sesión</strong>
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
                          onClick={() => handleNavigate("/estadodetrafico")}
                          className={`nav-link ${location.pathname === "/estadodetrafico" ? "active" : ""}`}
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
                          <strong>Cerrar Sesión</strong>
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
                          onClick={() => handleNavigate("/estadodetrafico")}
                          className={`nav-link ${location.pathname === "/estadodetrafico" ? "active" : ""}`}
                        >
                          <i className="bi-cone-striped me-2"></i>
                          <strong>Estado del Trafico</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/reportes")}
                          className={`nav-link ${location.pathname === "/reportes" ? "active" : ""}`}
                        >
                          <i className="bi-file-earmark-text-fill me-2"></i>
                          <strong>Reportes</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={handleLogout}
                          className="nav-link"
                        >
                          <i className="bi-box-arrow-right me-2"></i>
                          <strong>Cerrar Sesión</strong>
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