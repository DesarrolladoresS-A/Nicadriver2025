import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardGroup, Pagination } from 'react-bootstrap';
import { FaUsers, FaChartLine, FaFileAlt } from 'react-icons/fa';
import { db } from '../database/firebaseconfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

import '../styles/Administrador.css';

const Administrador = () => {
  const [stats, setStats] = useState({ reportes: 0 });
  const [reportes, setReportes] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const reportesPorPagina = 5;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesCount = reportesSnapshot.size;

        setStats({ reportes: reportesCount });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    const fetchReportes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reportes'));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  // Cálculo de la paginación
  const indiceUltimoReporte = paginaActual * reportesPorPagina;
  const indicePrimerReporte = indiceUltimoReporte - reportesPorPagina;
  const reportesActuales = reportes.slice(indicePrimerReporte, indiceUltimoReporte);
  const totalPaginas = Math.ceil(reportes.length / reportesPorPagina);

  const renderPaginacion = () => (
    <Pagination className="justify-content-center mt-3">
      <Pagination.Prev onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} />
      {[...Array(totalPaginas).keys()].map((num) => (
        <Pagination.Item
          key={num + 1}
          active={num + 1 === paginaActual}
          onClick={() => setPaginaActual(num + 1)}
        >
          {num + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} />
    </Pagination>
  );

  return (
    <div className="administrador-container">
      <Container fluid className="p-4">
        <h2 className="text-center mb-4">Dashboard de Administrador</h2>

        <CardGroup className="mb-4">
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

          <Card className="stats-card activities-card">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <FaChartLine className="stat-icon" />
                  <span>Actividades</span>
                </div>
              </Card.Title>
              <div className="activities-list">
                {reportes
                  .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
                  .slice(0, 5)
                  .map((reporte) => (
                    <div className="activity-item" key={reporte.id}>
                      <span className="activity-icon">📝</span>
                      <div className="activity-details">
                        <div className="activity-title">{reporte.titulo}</div>
                        <div className="activity-time">{calcularTiempoTranscurrido(reporte.fechaHora)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </CardGroup>

        {/* Tabla de gestión de reportes con paginación */}
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
            {reportesActuales.map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.titulo}</td>
                <td>{reporte.descripcion}</td>
                <td>{reporte.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {renderPaginacion()}
      </Container>
    </div>
  );
};

export default Administrador;
