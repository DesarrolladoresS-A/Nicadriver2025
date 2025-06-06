import React from 'react';
import { useAuth } from "../database/authcontext";
import { useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Image } from 'react-bootstrap';
import { FaUser, FaIdCard, FaPhone, FaEnvelope } from 'react-icons/fa';

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Datos del usuario (simulados - deberían venir de Firebase)
  const usuario = {
    nombre: user?.displayName || 'Usuario',
    cedula: '123-123456-1234X',
    celular: '1234-5678',
    email: user?.email || 'usuario@ejemplo.com'
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <Row className="align-items-center mb-4">
                <Col md={4} className="text-center">
                  <Image 
                    src={user?.photoURL || '/default-avatar.png'} 
                    roundedCircle 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <h5 className="mt-3 text-center text-primary">{user?.email}</h5>
                  <p className="text-center text-muted">Usuario</p>
                </Col>
                <Col md={8}>
                  <h2 className="mb-3">{usuario.nombre}</h2>
                  <div className="d-flex gap-3">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/editar-perfil')}
                    >
                      Editar Perfil
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => navigate('/cambiar-contrasena')}
                    >
                      Cambiar Contraseña
                    </button>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Card className="mb-3 p-3">
                    <Card.Title className="d-flex align-items-center mb-3">
                      <FaUser className="me-2" />
                      Información Personal
                    </Card.Title>
                    <Card.Text>
                      <div className="d-flex justify-content-between mb-2">
                        <span><strong>Nombre:</strong></span>
                        <span>{usuario.nombre.split(' ')[0]}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span><strong>Apellido:</strong></span>
                        <span>{usuario.nombre.split(' ').slice(1).join(' ')}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span><strong>Cédula:</strong></span>
                        <span>{usuario.cedula}</span>
                      </div>
                    </Card.Text>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3 p-3">
                    <Card.Title className="d-flex align-items-center mb-3">
                      <FaEnvelope className="me-2" />
                      Contacto
                    </Card.Title>
                    <Card.Text>
                      <div className="d-flex justify-content-between mb-2">
                        <span><strong>Email:</strong></span>
                        <span>{usuario.email}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span><strong>Celular:</strong></span>
                        <span>{usuario.celular}</span>
                      </div>
                    </Card.Text>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Perfil;
