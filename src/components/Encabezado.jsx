import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useAuth } from "../database/authcontext";
import EditarPerfil from "../views/EditarPerfil";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";
import "../styles/Perfil.css";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      setShowPerfilModal(false);
      setShowEditarModal(false);
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

  const usuario = {
    nombre: user?.displayName || user?.email || 'Usuario',
    cedula: '123-123456-1234X',
    celular: user?.celular || '1234-5678',
    email: user?.email || 'usuario@ejemplo.com'
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
                    {/* <Nav.Link onClick={() => handleNavigate("/estadodetrafico")} className="nav-link">
                      <i className="bi-car-front me-2"></i>
                      <strong>Estado de Tráfico</strong>
                    </Nav.Link> */}
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
                          <strong>Inicio Admin</strong>
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
  onClick={() => handleNavigate("/graficos")}
  className={`nav-link ${location.pathname === "/graficos" ? "active" : ""}`}
>
  <i className="bi-graph-up me-2"></i>
  <strong>Gráficos</strong>
</Nav.Link>
                        <Nav.Link
                          onClick={() => handleNavigate("/catalogo")}
                          className={`nav-link ${location.pathname === "/catalogo" ? "active" : ""}`}
                        >
                          <i className="bi-bookmarks me-2"></i>
                          <strong>Catalogos</strong>
                        </Nav.Link>
                        <Nav.Link
                          onClick={() => setShowPerfilModal(true)}
                          className="nav-link d-flex align-items-center gap-2"
                        >
                          <img 
                            src={user?.photoURL || '/default-avatar.png'} 
                            alt="Perfil"
                            className="rounded-circle"
                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                          />
                          <strong>Mi Perfil Admin</strong>
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
                          onClick={() => setShowPerfilModal(true)}
                          className="nav-link d-flex align-items-center gap-2"
                        >
                          <img 
                            src={user?.photoURL || '/default-avatar.png'} 
                            alt="Perfil"
                            className="rounded-circle"
                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                          />
                          <strong>Mi Perfil</strong>
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

      {/* Modal de Perfil - Solo visible cuando está logueado */}
      {isLoggedIn && (
        <>
          <Modal show={showPerfilModal} onHide={() => setShowPerfilModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Mi Perfil</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-center mb-4">
                <img 
                  src={user?.photoURL || '/default-avatar.png'} 
                  alt="Perfil"
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <div className="border p-3 rounded mb-4">
                <h6 className="text-primary mb-3"><i className="bi-person me-2"></i>Información Personal</h6>
                <div className="d-flex justify-content-between">
                  <span><strong>Nombre:</strong></span>
                  <span>{usuario.nombre}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span><strong>Cédula:</strong></span>
                  <span>{usuario.cedula}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span><strong>Celular:</strong></span>
                  <span>{usuario.celular}</span>
                </div>
              </div>
              <div className="border p-3 rounded mb-4">
                <h6 className="text-primary mb-3"><i className="bi-envelope me-2"></i>Contacto</h6>
                <div className="d-flex justify-content-between">
                  <span><strong>Email:</strong></span>
                  <span>{usuario.email}</span>
                </div>
              </div>
              
              {/* Botones dentro del modal */}
              <div className="d-flex justify-content-between">
                <Button 
                  variant="outline-primary"
                  onClick={() => setShowEditarModal(true)}
                  className="mt-3"
                >
                  <i className="bi-pencil-fill me-2"></i>
                  Editar Perfil
                </Button>
                <Button 
                  variant="outline-danger"
                  onClick={handleLogout}
                  className="mt-3"
                >
                  <i className="bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Button>
              </div>
            </Modal.Body>
          </Modal>

          {/* Modal de Edición de Perfil - Solo visible cuando está logueado */}
          <EditarPerfil 
            show={showEditarModal} 
            onHide={() => setShowEditarModal(false)} 
          />
        </>
      )}
    </>
  );
};

export default Encabezado;