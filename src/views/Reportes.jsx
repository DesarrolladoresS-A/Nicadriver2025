import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import ModalEdicionReportes from "../components/reportes/ModalEdicionReportes";
import ModalEliminarReportes from "../components/reportes/ModalEliminacionReportes";
import TablaReportes from "../components/reportes/TablaReportes";
import Paginacion from "../components/ordenamiento/Paginacion";
import { FaSearch, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import "../styles/Reporte.css";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [reporteSeleccionadoEliminar, setReporteSeleccionadoEliminar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorEliminacion, setErrorEliminacion] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState(false);
  const [loading, setLoading] = useState(true);

  const obtenerReportes = async () => {
    setLoading(true);
    setErrorEliminacion(null);
    try {
      const data = await getDocs(collection(db, "reportes"));
      const reportesData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setReportes(reportesData);
      setReportesFiltrados(reportesData);
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
      setErrorEliminacion(
        error.code === "permission-denied"
          ? "No tienes permisos para ver los reportes. Contacta al administrador."
          : "Hubo un error al cargar los reportes. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerReportes();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === "") {
      setReportesFiltrados(reportes);
      setFiltroActivo(false);
    } else {
      const resultados = reportes.filter((reporte) => {
        return (
          reporte.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          reporte.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
          reporte.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        );
      });
      setReportesFiltrados(resultados);
      setFiltroActivo(true);
    }
    setCurrentPage(1);
  }, [busqueda, reportes]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroActivo(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportesFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const actualizarReportes = () => {
    obtenerReportes();
  };

  return (
    <div className="reportes-container">
      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      )}

      {/* Error message */}
      {errorEliminacion && (
        <div className="error-message" style={{
          backgroundColor: '#ffebee',
          color: '#f44336',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <FaExclamationTriangle style={{ marginRight: '10px' }} />
          {errorEliminacion}
        </div>
      )}

      {/* Header con título y controles */}
      <div className="reportes-header">
        <div className="header-title">
          <h1>Gestión de Reportes</h1>
          <p className="subtitle">Administra y revisa todos los reportes de incidentes</p>
        </div>
        
        <div className="header-controls">
          {/* Barra de búsqueda */}
          <div className="search-container">
            <div className="search-icon">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
              disabled={loading}
            />
            {filtroActivo && (
              <button 
                onClick={limpiarFiltros}
                className="clear-filter-btn"
                disabled={loading}
              >
                Limpiar
              </button>
            )}
          </div>
          
          {/* Botón de registro */}
          <button 
            className="btn-registro"
            onClick={() => setModalRegistro(true)}
            disabled={loading}
          >
            <FaPlus /> Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Reportes</h3>
          <p>{reportes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Mostrando</h3>
          <p>{reportesFiltrados.length}</p>
        </div>
        <div className="stat-card">
          <h3>Página Actual</h3>
          <p>{currentPage} de {Math.ceil(reportesFiltrados.length / itemsPerPage)}</p>
        </div>
      </div>

      {/* Mensaje cuando no hay reportes */}
      {(!loading && reportes.length === 0) && (
        <div className="no-reports-message" style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <FaPlus style={{ fontSize: '48px', color: '#1e3d87' }} />
          <h3>No hay reportes disponibles</h3>
          <p>¡Crea tu primer reporte haciendo clic en el botón "Nuevo Reporte"!</p>
        </div>
      )}

      {/* Tabla y paginación */}
      <div className="tabla-paginacion-container">
        <TablaReportes 
          reportes={currentItems}
          setModalEditar={setModalEditar}
          setModalEliminar={setModalEliminar}
          setReporteSeleccionado={setReporteSeleccionado}
          setReporteSeleccionadoEliminar={setReporteSeleccionadoEliminar}
          reporteSeleccionadoEliminar={reporteSeleccionadoEliminar}
        />
        
        {reportesFiltrados.length > 0 ? (
          <Paginacion
            totalItems={reportesFiltrados.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <div className="no-results">
            <p>No se encontraron reportes con los criterios de búsqueda</p>
            <button onClick={limpiarFiltros} disabled={loading}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalRegistro && (
        <ModalRegistroReportes
          setModalRegistro={setModalRegistro}
          actualizar={actualizarReportes}
        />
      )}

      {modalEditar && reporteSeleccionado && (
        <ModalEdicionReportes
          setModalEditar={setModalEditar}
          reporte={reporteSeleccionado}
          actualizar={actualizarReportes}
        />
      )}

      {modalEliminar && reporteSeleccionadoEliminar && (
        <ModalEliminarReportes
          setModalEliminar={setModalEliminar}
          reporte={reporteSeleccionadoEliminar}
          actualizar={actualizarReportes}
          setError={setErrorEliminacion}
          onClose={() => {
            setModalEliminar(false);
            setReporteSeleccionadoEliminar(null);
            setErrorEliminacion(null);
          }}
        />
      )}
    </div>
  );
};

export default Reportes;