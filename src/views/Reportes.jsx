import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import ModalEdicionReportes from "../components/reportes/ModalEdicionReportes";
import ModalEliminarReportes from "../components/reportes/ModalEliminacionReportes";
import TablaReportes from "../components/reportes/TablaReportes";
import Paginacion from "../components/ordenamiento/Paginacion";
import { FaSearch } from "react-icons/fa";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [errorEliminacion, setErrorEliminacion] = useState(null);
  const [busqueda, setBusqueda] = useState("");

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
    } else {
      const resultados = reportes.filter((reporte) => {
        return (
          reporte.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          reporte.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
          reporte.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        );
      });
      setReportesFiltrados(resultados);
    }
    setCurrentPage(1);
  }, [busqueda, reportes]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportesFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="reportes-container">
      <div className="reportes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <h1 style={{ margin: 0 }}>Gestión de reportes</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ 
              position: 'absolute', 
              left: '15px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#666',
              zIndex: 1
            }} />
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                padding: '10px 15px 10px 40px',
                borderRadius: '25px',
                border: '1px solid #ddd',
                width: '300px',
                outline: 'none',
                transition: 'all 0.3s',
                fontSize: '14px',
                position: 'relative'
              }}
            />
          </div>
          
          <button 
            className="btn-registro"
            onClick={() => setModalRegistro(true)}
            style={{
              backgroundColor: '#FF7E00',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            Registrar Reporte
          </button>
        </div>
      </div>

      {errorEliminacion && (
        <div className="error-message" style={{ 
          backgroundColor: '#ffebee',
          padding: '10px',
          borderRadius: '4px',
          margin: '10px 0',
          color: '#f44336'
        }}>
          {errorEliminacion}
        </div>
      )}

      <div className="tabla-paginacion-container">
        <TablaReportes 
          reportes={currentItems}
          setModalEditar={setModalEditar}
          setModalEliminar={setModalEliminar}
          setReporteSeleccionado={setReporteSeleccionado}
        />
        <Paginacion
          totalItems={reportesFiltrados.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

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

      {modalEliminar && reporteSeleccionado && (
        <ModalEliminarReportes
          setModalEliminar={setModalEliminar}
          reporte={reporteSeleccionado}
          actualizar={obtenerReportes}
          setError={setErrorEliminacion}
        />
      )}
    </div>
  );
};

export default Reportes;