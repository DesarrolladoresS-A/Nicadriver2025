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
    // Obtener estadísticas
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usuariosCount = usersSnapshot.size;

        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesCount = reportesSnapshot.size;

        const traficoCount = 150; // Simulado

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

          <Card className="stats-card">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <FaChartLine className="stat-icon" />
                  <span>Traffic</span>
                </div>
                <h3 className="stat-number">{stats.trafico}</h3>
              </Card.Title>
            </Card.Body>
          </Card>

          <Card className="stats-card">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <FaDatabase className="stat-icon" />
                  <span>Catálogos</span>
                </div>
                <h3 className="stat-number">{stats.catalogos}</h3>
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
              <th>Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.titulo}</td>
                <td>{reporte.descripcion}</td>
                <td>{reporte.estado}</td>
                <td>
                  <select
                    value={reporte.estado || 'pendiente'}
                    onChange={(e) => handleEstadoChange(reporte.id, e.target.value)}
                    className="form-select"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Row className="mt-4">
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <h3 className="card-title mb-4">Reportes por Categoría</h3>
                <div className="chart-placeholder">
                  Gráfico de reportes por categoría (pendiente)
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Body>
                <h3 className="card-title mb-4">Últimas Actividades</h3>
                <div className="activities-list">
                  <div className="activity-item">
                    <span className="activity-icon">📝</span>
                    <span>Nuevo reporte recibido</span>
                    <span className="activity-time">Hace 5 minutos</span>
                  </div>
                  {/* Aquí puedes agregar más actividades si gustas */}
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
