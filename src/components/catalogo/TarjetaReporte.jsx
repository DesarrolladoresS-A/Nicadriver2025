import { Card, Col, Button } from "react-bootstrap";

const TarjetaReporte = ({ reporte, openEditModal }) => {
  return (
    <Col lg={3} md={4} sm={12} className="mb-4">
      <Card>
        {reporte.imagen && (
          <Card.Img 
            variant="top" 
            src={reporte.imagen} 
            alt={reporte.nombre} 
            style={{ height: "200px", objectFit: "cover" }}
          />
        )}
        <Card.Body>
          <Card.Title>{reporte.nombre}</Card.Title>
          <Card.Text>
            Descripción: {reporte.descripcion} <br />
            Categoría: {reporte.categoria}
          </Card.Text>
          <Button variant="warning" onClick={() => openEditModal(reporte)}>
            Editar
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default TarjetaReporte;