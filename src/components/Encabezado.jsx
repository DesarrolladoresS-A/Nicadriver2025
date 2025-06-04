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
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/");
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
              <Nav.Link
                onClick={() => handleNavigate("/inicio")}
                className={`nav-link ${location.pathname === "/inicio" ? "active" : ""}`}
              >
                <i className="bi-house-door-fill me-2"></i>
                <strong>Inicio</strong>
              </Nav.Link>

              {isLoggedIn && (
                <>
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
                    onClick={() => handleNavigate("/catalogo")}
                    className={`nav-link ${location.pathname === "/catalogo" ? "active" : ""}`}
                  >
                   <i className="bi-collection-fill me-2"></i>
                   <strong>Catálogo</strong>
                  </Nav.Link>
                  
                </>
              )}

              {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className="nav-link">
                  <i className="bi-box-arrow-right me-2"></i>
                  <strong>Cerrar Sesión</strong>
                </Nav.Link>
              ) : location.pathname === "/" && (
                <Nav.Link onClick={() => handleNavigate("/")} className="nav-link">
                  <i className="bi-box-arrow-in-right me-2"></i>
                  <strong>Iniciar Sesión</strong>
                </Nav.Link>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;