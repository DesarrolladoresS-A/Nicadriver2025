import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

const ReporteAdmin = () => {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reportes'));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setReportes(lista);
      } catch (error) {
        console.error('Error al obtener reportes:', error);
      }
    };

    fetchReportes();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Reportes Administrativos</h2>
      <Row className="mb-4">
        <Col>
          <Button variant="primary" className="mb-3">
            Generar Nuevo Reporte
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte.id}>
                  <td>{reporte.id}</td>
                  <td>{reporte.titulo || 'Sin título'}</td>
                  <td>{reporte.fecha || 'Sin fecha'}</td>
                  <td>{reporte.estado || 'Pendiente'}</td>
                  <td>
                    <Button variant="info" size="sm" className="mx-1">
                      Ver
                    </Button>
                    <Button variant="warning" size="sm" className="mx-1">
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" className="mx-1">
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default ReporteAdmin;