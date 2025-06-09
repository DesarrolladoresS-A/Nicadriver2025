import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import ModalEdicionReportes from "../components/reportes/ModalEdicionReportes";
import ModalEliminarReportes from "../components/reportes/ModalEliminacionReportes";
import TablaReportes from "../components/reportes/TablaReportes";
import Paginacion from "../components/ordenamiento/Paginacion";
import { FaSearch, FaPlus, FaFilter } from "react-icons/fa";
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

  const obtenerReportes = async () => {
    try {
      const data = await getDocs(collection(db, "reportes"));
      const reportesData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setReportes(reportesData);
      setReportesFiltrados(reportesData);
      setErrorEliminacion(null);
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
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
            />
            {filtroActivo && (
              <button 
                onClick={limpiarFiltros}
                className="clear-filter-btn"
              >
                Limpiar
              </button>
            )}
          </div>
          
          {/* Botón de registro */}
          <button 
            className="btn-registro"
            onClick={() => setModalRegistro(true)}
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

      {/* Mensaje de error */}
      {errorEliminacion && (
        <div className="error-message">
          {errorEliminacion}
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
            <button onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalRegistro && (
        <ModalRegistroReportes
          setModalRegistro={setModalRegistro}
          actualizar={obtenerReportes}
        />
      )}

      {modalEditar && reporteSeleccionado && (
        <ModalEdicionReportes
          setModalEditar={setModalEditar}
          reporte={reporteSeleccionado}
          actualizar={obtenerReportes}
        />
      )}

      {modalEliminar && reporteSeleccionadoEliminar && (
        <ModalEliminarReportes
          setModalEliminar={setModalEliminar}
          reporte={reporteSeleccionadoEliminar}
          actualizar={actualizarReportes}
          setError={setErrorEliminacion}
        />
      )}
    </div>
  );
};

export default Reportes;