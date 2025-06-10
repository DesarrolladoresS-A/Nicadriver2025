import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import GraficoEstadoReporte from '../components/estadisticas/GraficoEstadoReporte';
import GraficoTipoReporte from '../components/estadisticas/GraficosTipoReporte';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

const Graficos = () => {
  const [reportes, setReportes] = useState([]);
  const [reportesPorEstado, setReportesPorEstado] = useState([]);
  const [reportesPorTipo, setReportesPorTipo] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reportes'));
        const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReportes(lista);
      } catch (error) {
        console.error('Error al obtener reportes:', error);
      }
    };

    fetchReportes();
  }, []);

  useEffect(() => {
    // Calcular los reportes por estado
    const estados = ['pendiente', 'en progreso', 'resuelto'];
    const reportesEstado = estados.map((estado) => ({
      nombre: estado,
      cantidad: reportes.filter((reporte) => reporte.estado === estado).length
    }));

    setReportesPorEstado(reportesEstado);

    // Calcular los reportes por tipo
    const tipos = ['Incidencia', 'Sugerencia', 'Consulta']; // Ajusta esto según tus tipos de reportes
    const reportesTipo = tipos.map((tipo) => ({
      nombre: tipo,
      cantidad: reportes.filter((reporte) => reporte.tipo === tipo).length
    }));

    setReportesPorTipo(reportesTipo);
  }, [reportes]);

  return (
    <Container fluid className="p-4">
      <h2 className="text-center mb-4">Gráficos de Reportes</h2>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h3 className="card-title mb-4">Reportes por Tipo</h3>
              <GraficoTipoReporte data={reportesPorTipo} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h3 className="card-title mb-4">Reportes por Estado</h3>
              <GraficoEstadoReporte data={reportesPorEstado} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Graficos;
