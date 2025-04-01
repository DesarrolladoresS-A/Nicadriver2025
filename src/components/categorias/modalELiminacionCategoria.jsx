import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCategoria = ({
  showDeleteModal,
  setShowDeleteModal,
  handleDeleteCategoria,
}) => {
  return (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar esta categoría?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteCategoria}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionCategoria;