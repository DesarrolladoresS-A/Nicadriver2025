import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCategoria = ({
  showModal,
  setShowModal,
  nuevaCategoria,
  handleInputChange,
  handleAddCategoria,
}) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevaCategoria.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={nuevaCategoria.descripcion}
              onChange={handleInputChange}
              placeholder="Ingresa la descripción"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddCategoria}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCategoria;