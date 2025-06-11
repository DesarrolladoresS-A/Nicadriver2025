import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
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
    const estados = ['pendiente', 'en progreso', 'resuelto'];
    const reportesEstado = estados.map((estado) => ({
      nombre: estado,
      cantidad: reportes.filter((reporte) =>
        (reporte.estado || '').toLowerCase().trim() === estado
      ).length
    }));

    setReportesPorEstado(reportesEstado);

    const tipos = ['Incidencia', 'Sugerencia', 'Consulta'];
    const reportesTipo = tipos.map((tipo) => ({
      nombre: tipo,
      cantidad: reportes.filter((reporte) => reporte.tipo === tipo).length
    }));

    setReportesPorTipo(reportesTipo);
  }, [reportes]);

  return (
    <Container fluid className="p-4">
      <h2 className="text-center mb-4">Gráficos de Reportes</h2>

      <div className="d-flex flex-wrap gap-4 justify-content-center">
        <Card style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <Card.Body>
            <h5 className="card-title text-center">Tipos de Reporte</h5>
            <GraficoTipoReporte data={reportesPorTipo} />
          </Card.Body>
        </Card>

        <Card style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <Card.Body>
            <h5 className="card-title text-center">Estado de Reportes</h5>
            <GraficoEstadoReporte data={reportesPorEstado} />
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Graficos;
