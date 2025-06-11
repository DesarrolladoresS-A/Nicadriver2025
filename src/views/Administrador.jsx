import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardGroup } from 'react-bootstrap';
import { FaUsers, FaChartLine, FaFileAlt, FaDatabase } from 'react-icons/fa';
import { db } from '../database/firebaseconfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

import '../styles/Administrador.css';

const Administrador = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    reportes: 0,
    trafico: 0,
    catalogos: 0
  });

  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usuariosCount = usersSnapshot.size;

        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesCount = reportesSnapshot.size;

        const traficoCount = 150;

        const catalogosSnapshot = await getDocs(collection(db, 'catalogos'));
        const catalogosCount = catalogosSnapshot.size;

        setStats({
          usuarios: usuariosCount,
          reportes: reportesCount,
          trafico: traficoCount,
          catalogos: catalogosCount
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

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

    fetchStats();
    fetchReportes();
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      const reporteRef = doc(db, 'reportes', id);
      await updateDoc(reporteRef, { estado: nuevoEstado });

      setReportes((prevReportes) =>
        prevReportes.map((reporte) =>
          reporte.id === id ? { ...reporte, estado: nuevoEstado } : reporte
        )
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const calcularTiempoTranscurrido = (fecha) => {
    if (!fecha) return "Sin fecha";

    const ahora = new Date();
    const fechaReporte = new Date(fecha);
    const diferencia = ahora - fechaReporte;

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return "Hace unos segundos";
  };

  return (
    <div className="administrador-container">
      <Container fluid className="p-4">
        <h2 className="text-center mb-4">Dashboard de Administrador</h2>

        <CardGroup className="mb-4">
          <Card className="stats-card">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <FaUsers className="stat-icon" />
                  <span>Usuarios</span>
                </div>
                <h3 className="stat-number">{stats.usuarios}</h3>
              </Card.Title>
            </Card.Body>
          </Card>

          <Card className="stats-card">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <FaFileAlt className="stat-icon" />
                  <span>Reportes</span>
                </div>
                <h3 className="stat-number">{stats.reportes}</h3>
              </Card.Title>
            </Card.Body>
          </Card>
        </CardGroup>

        {/* Tabla de gestión de reportes */}
        <h3 className="mt-5 mb-3">Gestión de Reportes</h3>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.titulo}</td>
                <td>{reporte.descripcion}</td>
                <td>{reporte.estado}</td>
              
              </tr>
            ))}
          </tbody>
        </table>

        {/* Actividades recientes */}
        <Row className="mt-4">
          <Col md={{ span: 4, offset: 8 }}>
            <Card>
              <Card.Body>
                <h3 className="card-title mb-4">Últimas Actividades</h3>
                <div className="activities-list">
                  {reportes
                    .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
                    .slice(0, 5)
                    .map((reporte) => (
                      <div className="activity-item" key={reporte.id}>
                        <span className="activity-icon">📝</span>
                        <span>{reporte.titulo}</span>
                        <span className="activity-time">{calcularTiempoTranscurrido(reporte.fechaHora)}</span>
                      </div>
                    ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Administrador;
