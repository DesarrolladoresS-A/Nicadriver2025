import React, { useState, useEffect } from 'react';
import { Container, Pagination } from 'react-bootstrap';
import { db } from '../database/firebaseconfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import '../styles/Administrador.css';

const Administrador = () => {
  const [stats, setStats] = useState({ reportes: 0 });
  const [reportes, setReportes] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState(null); // 'pendiente' | 'proceso' | 'aceptado' | 'rechazado' | null
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

  const exportarExcel = () => {
    if (reportes.length === 0) return;

    const datos = reportes.map((reporte) => ({
      Título: reporte.titulo,
      Descripción: reporte.descripcion,
      Estado: reporte.estado,
      Fecha: reporte.fechaHora ? new Date(reporte.fechaHora).toLocaleString() : "Sin fecha",
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reportes');

    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(archivo, 'reportes.xlsx');
  };

  const listaFiltrada = filtroEstado
    ? reportes.filter((r) => String(r.estado || '').toLowerCase() === filtroEstado)
    : reportes;

  const indiceUltimoReporte = paginaActual * reportesPorPagina;
  const indicePrimerReporte = indiceUltimoReporte - reportesPorPagina;
  const reportesActuales = listaFiltrada.slice(indicePrimerReporte, indiceUltimoReporte);
  const totalPaginas = Math.ceil(listaFiltrada.length / reportesPorPagina) || 1;

  // Totales por estado para el cuadro 9
  const totalReportes = reportes.length;
  const contarPorEstado = (value) =>
    reportes.filter((r) => String(r.estado || '').toLowerCase() === value).length;
  const totalNuevos = contarPorEstado('pendiente');
  const totalProceso = contarPorEstado('proceso');
  const totalAceptado = contarPorEstado('aceptado');
  const totalRechazado = contarPorEstado('rechazado');

  const toggleFiltro = (estado) => {
    setPaginaActual(1);
    setFiltroEstado((prev) => (prev === estado ? null : estado));
  };

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
      <div className="parent">
        {/* 7: Encabezado del proyecto */}
        <div className="div7">
          <Container fluid className="p-3">
            <h1 className="m-0 text-center">NICADRIVER - Panel de Administración</h1>
          </Container>
        </div>

        {/* 8: Texto centrado */}
        <div className="div8 d-flex align-items-center justify-content-center">
          <h2 className="m-0 text-center">Dashboard de Administrador</h2>
        </div>

        {/* 9 y 10: alineados horizontalmente dentro de un contenedor dedicado */}
        <div className="div9_10_row">
          <div className="div9 card-tile">
            <div className="kpi-header">
              <div className="kpi-title">Total de reportes</div>
              <div className="kpi-icon"><i className="bi bi-graph-up"></i></div>
            </div>
            <div className="kpi-value text-center mb-3">{totalReportes}</div>
            <div className="kpi4-grid">
              <div className="kpi4-card nuevos">
                <div className="kpi4-icon secondary"><i className="bi bi-file-earmark-plus-fill"></i></div>
                <div className="kpi4-meta">
                  <div className="kpi4-label">Nuevos</div>
                  <div className="kpi4-value">{totalNuevos}</div>
                </div>
              </div>
              <div className="kpi4-card proceso">
                <div className="kpi4-icon info"><i className="bi bi-arrow-repeat"></i></div>
                <div className="kpi4-meta">
                  <div className="kpi4-label">Proceso</div>
                  <div className="kpi4-value">{totalProceso}</div>
                </div>
              </div>
              <div className="kpi4-card aceptado">
                <div className="kpi4-icon success"><i className="bi bi-check-circle-fill"></i></div>
                <div className="kpi4-meta">
                  <div className="kpi4-label">Aceptado</div>
                  <div className="kpi4-value">{totalAceptado}</div>
                </div>
              </div>
              <div className="kpi4-card rechazado">
                <div className="kpi4-icon danger"><i className="bi bi-x-circle-fill"></i></div>
                <div className="kpi4-meta">
                  <div className="kpi4-label">Rechazado</div>
                  <div className="kpi4-value">{totalRechazado}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="div10 card-tile d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div className="fw-semibold mb-1">Cuadro 10</div>
              <div className="text-muted small">Contenido a definir</div>
            </div>
          </div>
        </div>

        {/* 12: Texto "Gestión de reportes" */}
        <div className="div12 d-flex align-items-center">
          <h3 className="m-0">Gestión de reportes</h3>
        </div>

        {/* 17 + 13-16: Acciones en una sola fila */}
        <div className="acciones_row">
          <div className="div17 d-flex align-items-center">
            <button className="action-btn btn btn-excel" onClick={exportarExcel}>
              <i className="bi bi-file-earmark-spreadsheet me-2"></i>
              Generar Excel (Todos los reportes)
            </button>
          </div>

          <div className="div13 d-flex align-items-center">
            <button
              className={`action-btn btn btn-nuevos ${filtroEstado === 'pendiente' ? 'active' : ''}`}
              onClick={() => toggleFiltro('pendiente')}
              aria-pressed={filtroEstado === 'pendiente'}
            >
              <i className="bi bi-file-earmark-plus-fill me-2"></i>Nuevos
            </button>
          </div>
          <div className="div14 d-flex align-items-center">
            <button
              className={`action-btn btn btn-proceso ${filtroEstado === 'proceso' ? 'active' : ''}`}
              onClick={() => toggleFiltro('proceso')}
              aria-pressed={filtroEstado === 'proceso'}
            >
              <i className="bi bi-arrow-repeat me-2"></i>Proceso
            </button>
          </div>
          <div className="div15 d-flex align-items-center">
            <button
              className={`action-btn btn btn-aceptado ${filtroEstado === 'aceptado' ? 'active' : ''}`}
              onClick={() => toggleFiltro('aceptado')}
              aria-pressed={filtroEstado === 'aceptado'}
            >
              <i className="bi bi-check-circle-fill me-2"></i>Aceptado
            </button>
          </div>
          <div className="div16 d-flex align-items-center">
            <button
              className={`action-btn btn btn-rechazado ${filtroEstado === 'rechazado' ? 'active' : ''}`}
              onClick={() => toggleFiltro('rechazado')}
              aria-pressed={filtroEstado === 'rechazado'}
            >
              <i className="bi bi-x-circle-fill me-2"></i>Rechazado
            </button>
          </div>
        </div>

        {/* 11: Tabla con todos los reportes */}
        <div className="div11">
          <Container fluid className="p-0">
            <div className="table-responsive">
              <div className="tabla-admin-wrapper card overflow-hidden">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reportesActuales.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">
                        {filtroEstado ? `No hay reportes con estado "${filtroEstado}"` : 'No hay reportes para mostrar'}
                      </td>
                    </tr>
                  ) : reportesActuales.map((reporte) => (
                    <tr key={reporte.id}>
                      <td>{reporte.titulo}</td>
                      <td>{reporte.descripcion}</td>
                      <td>{reporte.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {renderPaginacion()}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Administrador;
