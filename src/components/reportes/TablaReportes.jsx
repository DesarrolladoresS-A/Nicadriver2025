import React, { useState } from "react";
import jsPDF from "jspdf";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
}) => {
  const [imagenModal, setImagenModal] = useState(null);

  const formatearFechaHora = (fechaHora) => {
    try {
      if (!fechaHora) return "Sin fecha y hora";
      const fecha = fechaHora.toDate
        ? fechaHora.toDate()
        : fechaHora.seconds
        ? new Date(fechaHora.seconds * 1000)
        : new Date(fechaHora);
      return fecha.toLocaleString("es-NI", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Error de fecha";
    }
  };

  const generarPDF = async (reporte) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte de Incidente", 20, 20);
    doc.text(`Título: ${reporte.titulo}`, 20, 30);
    doc.text(`Ubicación: ${reporte.ubicacion}`, 20, 40);
    doc.text(`Descripción: ${reporte.descripcion}`, 20, 50);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fechaHora)}`, 20, 60);

    if (reporte.foto) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = reporte.foto;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 20, 70, 160, 100);
        doc.save(`${reporte.titulo}.pdf`);
      };
    } else {
      doc.text("Sin imagen", 20, 75);
      doc.save(`${reporte.titulo}.pdf`);
    }
  };

  return (
    <div className="tabla-reportes-container">
      <div className="tabla-reportes-header">
        <h2>Lista de Reportes</h2>
        <p>Administra los reportes de incidentes</p>
        <div className="tabla-reportes-actions">
          <button className="btn-pdf" onClick={() => generarPDF(reportes[0])}>
            <i className="bi bi-file-earmark-pdf-fill"></i>
            PDF
          </button>
          <button className="btn-export">
            <i className="bi bi-file-earmark-excel-fill"></i>
            Exportar
          </button>
        </div>
      </div>

      <table className="tabla-reportes">
        <thead>
          <tr>
            <th>Título</th>
            <th>Ubicación</th>
            <th>Descripción</th>
            <th>Fecha y Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => (
            <tr key={reporte.id}>
              <td>{reporte.titulo}</td>
              <td>{reporte.ubicacion}</td>
              <td>{reporte.descripcion}</td>
              <td>{formatearFechaHora(reporte.fechaHora)}</td>
              <td className="acciones">
                <button
                  className="btn-accion btn-editar"
                  onClick={() => {
                    setReporteSeleccionado(reporte);
                    setModalEditar(true);
                  }}
                  title="Editar"
                >
                  <i className="bi bi-pencil-fill"></i>
                </button>
                <button
                  className="btn-accion btn-eliminar"
                  onClick={() => {
                    console.log("Preparando para eliminar reporte:", reporte.id);
                    setReporteSeleccionado(reporte);
                    setModalEliminar(true);
                  }}
                  title="Eliminar"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
                <button
                  className="btn-accion btn-ver"
                  onClick={() => {
                    // Implementar vista detallada
                  }}
                  title="Ver"
                >
                  <i className="bi bi-eye-fill"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaReportes;
