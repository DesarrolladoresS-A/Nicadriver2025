import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionCategoria = ({
  showEditModal,
  setShowEditModal,
  categoriaEditada,
  handleEditInputChange,
  handleEditCategoria,
}) => {
  if (!categoriaEditada) return null;

  return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={categoriaEditada.nombre}
              onChange={handleEditInputChange}
              placeholder="Ingresa el nombre"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={categoriaEditada.descripcion}
              onChange={handleEditInputChange}
              placeholder="Ingresa la descripción"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleEditCategoria}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionCategoria;