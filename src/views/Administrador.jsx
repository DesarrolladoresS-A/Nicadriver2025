import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardGroup } from 'react-bootstrap';
import { FaUsers, FaChartLine, FaFileAlt, FaDatabase } from 'react-icons/fa';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import '../styles/Administrador.css';

const Administrador = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    reportes: 0,
    trafico: 0,
    catalogos: 0
  });

  useEffect(() => {
    // Obtener estadísticas
    const fetchStats = async () => {
      try {
        // Contar usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usuariosCount = usersSnapshot.size;

        // Contar reportes
        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesCount = reportesSnapshot.size;

        // Contar datos de tráfico (simulado)
        const traficoCount = 150; // Simulado

        // Contar catalogos
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

    fetchStats();
  }, []);

  return (
    <div className="administrador-container">
      <Container fluid className="p-4">
        <h2 className="text-center mb-4">Dashboard de Administrador</h2>
        
        {/* Tarjetas de estadísticas */}
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
                  <span>Catalogos</span>
                </div>
                <h3 className="stat-number">{stats.catalogos}</h3>
              </Card.Title>
            </Card.Body>
          </Card>
        </CardGroup>

        {/* Sección de gráficos y estadísticas */}
        <Row>
          <Col md={8}>
            {/* Gráfico de reportes */}
            <Card className="mb-4">
              <Card.Body>
                <h3 className="card-title mb-4">Reportes por Categoría</h3>
                {/* Aquí iría el gráfico */}
                <div className="chart-placeholder">
                  Gráfico de reportes por categoría
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            {/* Últimas actividades */}
            <Card>
              <Card.Body>
                <h3 className="card-title mb-4">Últimas Actividades</h3>
                {/* Aquí iría la lista de actividades */}
                <div className="activities-list">
                  <div className="activity-item">
                    <span className="activity-icon">📝</span>
                    <span>Nuevo reporte recibido</span>
                    <span className="activity-time">Hace 5 minutos</span>
                  </div>
                  {/* Más actividades... */}
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
