//----------------------------------------------------------------- ModalEliminacionProducto.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionProducto = ({
  showDeleteModal,
  setShowDeleteModal,
  handleDeleteProducto,
}) => {
  return (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar este producto?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteProducto}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionProducto;