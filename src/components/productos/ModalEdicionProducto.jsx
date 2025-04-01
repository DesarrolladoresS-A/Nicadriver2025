//----------------------------------------------------------------- ModalEdicionProducto.jsx
import React from "react";
import { Modal, Form, Button, Image } from "react-bootstrap";

const ModalEdicionProducto = ({
  showEditModal,
  setShowEditModal,
  productoEditado,
  handleEditInputChange,
  handleEditImageChange,
  handleEditProducto,
  categorias
}) => {
  if (!productoEditado) return null;

  return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={productoEditado.nombre}
              onChange={handleEditInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={productoEditado.precio}
              onChange={handleEditInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={productoEditado.categoria}
              onChange={handleEditInputChange}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Imagen Actual</Form.Label>
            {productoEditado.imagen && (
              <Image src={productoEditado.imagen} width="100" className="mb-2" />
            )}
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleEditProducto}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;