import React from 'react';
import { Table, Modal } from 'react-bootstrap';
import '../../styles/ReporteAdmin.css';
import { FaFilePdf, FaEye } from 'react-icons/fa';

const TablaReporteAdmin = ({
  reportes = [],
  onPDF = () => {},
  onExcel = () => {},
  onVisualizar = () => {},
  loading = false,
  handleEstadoChange = () => {},
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = React.useState(false);
  const [selectedReporte, setSelectedReporte] = React.useState(null);

  const getEstadoColor = (estado) => {
    if (!estado) return 'secondary';
    const estadoLower = estado.toString().toLowerCase();
    if (estadoLower === 'pendiente') return 'pendiente';
    if (estadoLower === 'proceso') return 'proceso';
    if (estadoLower === 'aceptado') return 'aceptado';
    if (estadoLower === 'rechazado') return 'rechazado';
    return 'secondary';
  };

  const handleVisualizar = (reporte) => {
    setSelectedReporte(reporte);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReporte(null);
  };

  const getCurrentPage = () => {
    const firstIndex = (currentPage - 1) * itemsPerPage;
    const lastIndex = firstIndex + itemsPerPage;
    return reportes.slice(firstIndex, lastIndex);
  };

  const totalPages = Math.ceil(reportes.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando reportes...</p>
      </div>
    );
  }

  if (reportes.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>No hay reportes disponibles</h4>
      </div>
    );
  }

  return (
    <div className="tabla-reportes-container">
      <div className="table-responsive">
        <Table hover className="reporte-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Cambiar Estado</th>
              <th>Detalles</th>
              <th>Imagen</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPage().map((reporte, index) => {
              const numeroReporte = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr key={reporte.id}>
                  <td>{numeroReporte}</td>
                  <td>{reporte.fecha}</td>
                  <td>{reporte.tipo}</td>
                  <td>{reporte.ubicacion}</td>
                  <td>
                    <span
                      className={`estado-badge ${getEstadoColor(reporte.estado)}`}
                      style={{ backgroundColor: getEstadoColor(reporte.estado) }}
                    >
                      {reporte.estado}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select estado-select"
                      value={reporte.estado}
                      onChange={(e) => handleEstadoChange(reporte.id, e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="proceso">En proceso</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  </td>
                  <td>{reporte.detalles}</td>
                  <td>
                    {reporte.foto && (
                      <img src={reporte.foto} alt="Evidencia" className="evidencia-thumbnail" />
                    )}
                  </td>
                  <td className="text-center">
                    <div className="acciones-container">
                      <button
                        className="btn btn-visualizar me-2"
                        onClick={() => handleVisualizar(reporte)}
                        title="Visualizar detalles"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-pdf"
                        onClick={() => onPDF(reporte.id)}
                        title="Exportar a PDF"
                      >
                        <FaFilePdf />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4 pagination-container">
        <div className="pagination-group">
          <button
            className="pagination-button prev"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            title="Página anterior"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <span className="pagination-info">
            <span className="current-page">{currentPage}</span>
            <span className="separator">/</span>
            <span className="total-pages">{totalPages}</span>
          </span>
          <button
            className="pagination-button next"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Página siguiente"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Modal Detalles */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" className="modal-reporte" centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReporte && (
            <div className="detalles-reporte-container">
              {/* Información básica */}
              <div className="detalle-card">
                <h3 className="detalle-title">Información Básica</h3>
                <div className="detalle-list">
                  <div className="detalle-item">
                    <span className="detalle-label">ID:</span>
                    <span className="detalle-value">{selectedReporte.id}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha:</span>
                    <span className="detalle-value">{selectedReporte.fecha}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Tipo:</span>
                    <span className="detalle-value">{selectedReporte.tipo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    <span className="detalle-value">
                      <span className={`estado-badge ${getEstadoColor(selectedReporte.estado)}`}>
                        {selectedReporte.estado || 'Sin estado'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="detalle-card">
                <h3 className="detalle-title">Ubicación</h3>
                <div className="detalle-list">
                  <div className="detalle-item">
                    <span className="detalle-label">Dirección:</span>
                    <span className="detalle-value">{selectedReporte.ubicacion || 'Sin ubicación'}</span>
                  </div>
                  {selectedReporte.coordenadas && (
                    <div className="detalle-item">
                      <span className="detalle-label">Coordenadas:</span>
                      <span className="detalle-value">
                        {selectedReporte.coordenadas.lat}, {selectedReporte.coordenadas.lng}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="detalle-card">
                <h3 className="detalle-title">Descripción</h3>
                <div className="detalle-list">
                  <div className="detalle-item">
                    <span className="detalle-label">Detalles:</span>
                    <span className="detalle-value">{selectedReporte.detalles || 'Sin detalles'}</span>
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              {selectedReporte.imagenes?.length > 0 && (
                <div className="detalle-card">
                  <h3 className="detalle-title">Imágenes</h3>
                  <div className="imagenes-container">
                    {selectedReporte.imagenes.map((imagen, index) => (
                      <div key={index} className="imagen-item">
                        <img src={imagen.url} alt={`Imagen ${index + 1}`} className="img-fluid" />
                        <div className="imagen-caption">
                          {imagen.titulo || `Imagen ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="botones-acciones">
                <button
                  className="btn-accion btn-aceptar"
                  onClick={() => handleEstadoChange(selectedReporte.id, 'aceptado')}
                >
                  Aceptar
                </button>
                <button
                  className="btn-accion btn-rechazar"
                  onClick={() => handleEstadoChange(selectedReporte.id, 'rechazado')}
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TablaReporteAdmin;
