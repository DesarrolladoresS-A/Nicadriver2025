import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionReporte = ({
  showEditModal,
  setShowEditModal,
  reporteEditado,
  handleEditInputChange,
  handleEditImageChange,
  handleEditReporte,
  categorias
}) => {
  return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Reporte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={reporteEditado?.nombre || ""}
              onChange={handleEditInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="descripcion"
              value={reporteEditado?.descripcion || ""}
              onChange={handleEditInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={reporteEditado?.categoria || ""}
              onChange={handleEditInputChange}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nombre}>
                  {categoria.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
            />
            {reporteEditado?.imagen && (
              <img
                src={reporteEditado.imagen}
                alt="Preview"
                style={{ width: "100%", marginTop: "10px" }}
              />
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleEditReporte}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionReporte;