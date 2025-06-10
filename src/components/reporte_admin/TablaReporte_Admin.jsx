import React from 'react';
import { Table } from 'react-bootstrap';
import '../../styles/TablaReporteAdmin.css';
import { FaFilePdf, FaFileExcel, FaEye } from 'react-icons/fa';

const TablaReporteAdmin = ({ 
    reportes = [], 
    onPDF = () => {},
    onExcel = () => {},
    onVisualizar = () => {},
    loading = false
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10; // Número de reportes por página

  const getEstadoColor = (estado) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'pendiente') return 'warning';
    if (estadoLower === 'en proceso') return 'info';
    if (estadoLower === 'completado') return 'success';
    return 'secondary';
  };

  // Función para obtener la página actual
  const getCurrentPage = () => {
    const firstIndex = (currentPage - 1) * itemsPerPage;
    const lastIndex = firstIndex + itemsPerPage;
    return reportes.slice(firstIndex, lastIndex);
  };

  // Función para obtener el número total de páginas
  const totalPages = Math.ceil(reportes.length / itemsPerPage);

  // Función para cambiar de página
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
              <th>ID</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Detalles</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPage().map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.id}</td>
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
                <td>{reporte.detalles}</td>
                <td className="text-center">
                  <div className="acciones-container">
                    <button 
                      className="btn btn-sm me-2" 
                      style={{ backgroundColor: '#dc3545', color: '#fff' }}
                      title="PDF"
                      onClick={() => onPDF(reporte)}
                    >
                      <FaFilePdf />
                    </button>
                    <button 
                      className="btn btn-sm me-2" 
                      style={{ backgroundColor: '#28a745', color: '#fff' }}
                      title="Excel"
                      onClick={() => onExcel(reporte)}
                    >
                      <FaFileExcel />
                    </button>
                    <button 
                      className="btn btn-sm" 
                      style={{ backgroundColor: '#007bff', color: '#fff' }}
                      title="Visualizar"
                      onClick={() => onVisualizar(reporte)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Controles de paginación */}
      <div className="mt-4">
        <div className="pagination-container">
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
      </div>
    </div>
  );
};

export default TablaReporteAdmin;