import React, { useState } from "react";
import jsPDF from "jspdf";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
  reporteSeleccionadoEliminar,
}) => {
  const [modalVer, setModalVer] = useState(false);
  const [reporteAVisualizar, setReporteAVisualizar] = useState(null);

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
    doc.text(`Tipo de incidente: ${reporte.titulo}`, 20, 30);
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

  const abrirModalVisualizacion = (reporte) => {
    setReporteAVisualizar(reporte);
    setModalVer(true);
  };

  return (
    <div className="tabla-reportes-container">
      {/* Modal de Visualización */}
      {modalVer && reporteAVisualizar && (
        <div className="modal-overlay">
          <div className="modal-ver-reporte">
            <div className="modal-header">
              <h2>Detalles del Reporte</h2>
              <button
                className="close-modal-btn"
                onClick={() => setModalVer(false)}
              >
                ×
              </button>
            </div>

            <div className="reporte-detalles">
              <div className="detalle-item">
                <strong>Tipo de incidente:</strong>
                <p>{reporteAVisualizar.titulo}</p>
              </div>

              <div className="detalle-item">
                <strong>Ubicación:</strong>
                <p>{reporteAVisualizar.ubicacion}</p>
              </div>

              <div className="detalle-item">
                <strong>Descripción:</strong>
                <p>{reporteAVisualizar.descripcion}</p>
              </div>

              <div className="detalle-item">
                <strong>Fecha y Hora:</strong>
                <p>{formatearFechaHora(reporteAVisualizar.fechaHora)}</p>
              </div>

              {reporteAVisualizar.foto && (
                <div className="detalle-item">
                  <strong>Imagen:</strong>
                  <div className="imagen-container">
                    <img
                      src={reporteAVisualizar.foto}
                      alt="Imagen del reporte"
                      className="imagen-reporte"
                    />
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button
                  className="btn-generar-pdf"
                  onClick={() => generarPDF(reporteAVisualizar)}
                >
                  <i className="bi bi-file-earmark-pdf"></i> Generar PDF
                </button>
                <button
                  className="btn-cerrar"
                  onClick={() => setModalVer(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Reportes */}
      <div className="tabla-reportes-header">
        <h2>Lista de Reportes</h2>
        <p>Administra los reportes de incidentes</p>
      </div>

      <table className="tabla-reportes">
        <thead>
          <tr>
            <th>Tipo de incidente</th>
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
              <td>
                {reporte.descripcion.substring(0, 50)}
                {reporte.descripcion.length > 50 ? "..." : ""}
              </td>
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
                    setReporteSeleccionadoEliminar(null);
                    setReporteSeleccionadoEliminar(reporte);
                    setModalEliminar(true);
                  }}
                  title="Eliminar"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
                <button
                  className="btn-accion btn-ver"
                  onClick={() => abrirModalVisualizacion(reporte)}
                  title="Ver detalles"
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