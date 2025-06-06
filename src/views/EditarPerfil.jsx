import React, { useState } from 'react';
import { useAuth } from "../database/authcontext";
import { updateProfile } from "firebase/auth";
import { Modal, Button, Form, Image } from 'react-bootstrap';
import { FaUser, FaPhone, FaEnvelope, FaCamera } from 'react-icons/fa';
import "../styles/Perfil.css";

const EditarPerfil = ({ show, onHide }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    celular: user?.celular || '',
    email: user?.email || '',
    foto: null
  });
  const [preview, setPreview] = useState(user?.photoURL || '/default-avatar.png');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Actualizar el perfil en Firebase
      await updateProfile(user, {
        photoURL: formData.foto ? URL.createObjectURL(formData.foto) : preview,
        email: formData.email,
        celular: formData.celular
      });
      
      // Cerrar el modal
      onHide();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="perfil-modal-header" closeButton>
        <Modal.Title style={{ color: 'black', fontWeight: 'bold' }}>Editar Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="form-editar-perfil">
          <div className="foto-perfil-container text-center mb-4">
            <Image 
              src={preview}
              roundedCircle
              className="foto-perfil"
            />
            <label className="btn-cambiar-foto" htmlFor="foto-input">
              <FaCamera />
              <input 
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <FaPhone className="me-2" />
              <Form.Label>Celular</Form.Label>
            </div>
            <Form.Control 
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="Número de celular"
              className="form-control"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <FaEnvelope className="me-2" />
              <Form.Label>Email</Form.Label>
            </div>
            <Form.Control 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              className="form-control"
            />
          </div>

          <div className="d-flex justify-content-end">
            <Button 
              className="btn-formulario btn-cancelar me-2"
              onClick={onHide}
            >
              Cancelar
            </Button>
            <Button 
              className="btn-formulario btn-guardar"
              type="submit"
            >
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditarPerfil;
