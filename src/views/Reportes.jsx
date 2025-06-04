import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import ModalEdicionReportes from "../components/reportes/ModalEdicionReportes";
import ModalEliminarReportes from "../components/reportes/ModalEliminacionReportes";
import TablaReportes from "../components/reportes/TablaReportes";
import Paginacion from "../components/ordenamiento/Paginacion";
import { FaSearch, FaFilePdf, FaFileExcel, FaPlus } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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
          reporte.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          (reporte.estado && reporte.estado.toLowerCase().includes(busqueda.toLowerCase()))
        );
      });
      setReportesFiltrados(resultados);
    }
    setCurrentPage(1);
  }, [busqueda, reportes]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportesFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    // Título del documento
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("Reporte de Incidencias", 14, 15);

    // Fecha de generación
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generado el: ${fecha}`, 14, 22);

    // Datos de la tabla
    const headers = [
      "ID",
      "Título",
      "Ubicación",
      "Descripción",
      "Estado",
      "Fecha Reporte"
    ];

    const data = reportesFiltrados.map((reporte) => [
      reporte.id || "N/A",
      reporte.titulo || "Sin título",
      reporte.ubicacion || "Sin ubicación",
      reporte.descripcion || "Sin descripción",
      reporte.estado || "No especificado",
      reporte.fechaReporte || "No registrada"
    ]);

    // Configuración de la tabla
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 30,
      theme: "grid",
      headStyles: {
        fillColor: [255, 126, 0], // Color naranja
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 30 }
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${pageCount}`,
        280,
        200,
        null,
        null,
        "right"
      );
    }

    doc.save("reporte_incidencias.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reportesFiltrados.map((reporte) => ({
        ID: reporte.id || "N/A",
        Título: reporte.titulo || "Sin título",
        Ubicación: reporte.ubicacion || "Sin ubicación",
        Descripción: reporte.descripcion || "Sin descripción",
        Estado: reporte.estado || "No especificado",
        "Fecha Reporte": reporte.fechaReporte || "No registrada",
        Prioridad: reporte.prioridad || "No especificada"
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reportes");
    
    // Estilos para el archivo Excel
    const wscols = [
      { wch: 15 }, // ID
      { wch: 25 }, // Título
      { wch: 20 }, // Ubicación
      { wch: 40 }, // Descripción
      { wch: 15 }, // Estado
      { wch: 15 }, // Fecha Reporte
      { wch: 15 }  // Prioridad
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, "reporte_incidencias.xlsx");
  };

  return (
    <div className="reportes-container" style={{ padding: "20px" }}>
      <div 
        className="reportes-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        <h1 style={{ margin: 0, color: '#333' }}>Gestión de Reportes</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
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
                position: 'relative',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              ':hover': {
                backgroundColor: '#E67100'
              }
            }}
          >
            <FaPlus /> Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Sección de exportación */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '10px', 
        marginBottom: '15px'
      }}>
        <button 
          onClick={exportToExcel}
          style={{
            backgroundColor: '#21a366',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            ':hover': {
              backgroundColor: '#1a8a5a'
            }
          }}
        >
          <FaFileExcel /> Exportar a Excel
        </button>
        <button 
          onClick={exportToPDF}
          style={{
            backgroundColor: '#ff2c2c',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            ':hover': {
              backgroundColor: '#e60000'
            }
          }}
        >
          <FaFilePdf /> Exportar a PDF
        </button>
      </div>

      {errorEliminacion && (
        <div className="error-message" style={{ 
          backgroundColor: '#ffebee',
          padding: '10px',
          borderRadius: '4px',
          margin: '10px 0',
          color: '#f44336',
          borderLeft: '4px solid #f44336'
        }}>
          {errorEliminacion}
        </div>
      )}

      <div className="tabla-paginacion-container" style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <TablaReportes 
          reportes={currentItems}
          setModalEditar={setModalEditar}
          setModalEliminar={setModalEliminar}
          setReporteSeleccionado={setReporteSeleccionado}
        />
        <div style={{ padding: '15px' }}>
          <Paginacion
            totalItems={reportesFiltrados.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
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