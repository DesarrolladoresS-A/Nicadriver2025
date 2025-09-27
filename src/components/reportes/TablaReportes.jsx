import React, { useState } from "react";
import jsPDF from "jspdf";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
  handleEstadoChange
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
    doc.text(`Estado: ${reporte.estado || "Pendiente"}`, 20, 70);

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
        doc.addImage(imgData, "PNG", 20, 80, 160, 100);
        doc.save(`${reporte.titulo}.pdf`);
      };
    } else {
      doc.text("Sin imagen", 20, 85);
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

              <div className="detalle-item">
                <strong>Estado:</strong>
                <p>{reporteAVisualizar.estado || "Pendiente"}</p>
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

      {/* Contenedor responsivo con scroll en móvil */}
      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full border border-gray-300 bg-white text-sm">
          <thead className="bg-gray-100 hidden md:table-header-group">
            <tr>
              <th className="px-3 py-2 text-left border">Tipo de incidente</th>
              <th className="px-3 py-2 text-left border">Ubicación</th>
              <th className="px-3 py-2 text-left border">Descripción</th>
              <th className="px-3 py-2 text-left border">Fecha y Hora</th>
              <th className="px-3 py-2 text-left border">Estado</th>
              <th className="px-3 py-2 text-left border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte, index) => (
              <tr
                key={reporte.id}
                className={`border-b border-gray-300 md:table-row block md:table-row ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >
                {/* Tipo */}
                <td className="px-3 py-2 border md:table-cell block md:border-0 before:content-['Tipo:'] before:font-semibold before:mr-2 md:before:content-none">
                  {reporte.titulo}
                </td>
                {/* Ubicación */}
                <td className="px-3 py-2 border md:table-cell block md:border-0 before:content-['Ubicación:'] before:font-semibold before:mr-2 md:before:content-none">
                  {reporte.ubicacion}
                </td>
                {/* Descripción */}
                <td className="px-3 py-2 border md:table-cell block md:border-0 before:content-['Descripción:'] before:font-semibold before:mr-2 md:before:content-none">
                  {reporte.descripcion.substring(0, 50)}
                  {reporte.descripcion.length > 50 ? "..." : ""}
                </td>
                {/* Fecha */}
                <td className="px-3 py-2 border md:table-cell block md:border-0 before:content-['Fecha:'] before:font-semibold before:mr-2 md:before:content-none">
                  {formatearFechaHora(reporte.fechaHora)}
                </td>
                {/* Estado */}
                <td className="px-3 py-2 border md:table-cell block md:border-0 before:content-['Estado:'] before:font-semibold before:mr-2 md:before:content-none">
                  {reporte.estado || "Pendiente"}
                </td>
                {/* Acciones */}
                <td className="px-3 py-2 border md:table-cell block md:border-0 before:content-['Acciones:'] before:font-semibold before:mr-2 md:before:content-none">
                  <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                    <button
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                      onClick={() => abrirModalVisualizacion(reporte)}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                    <button
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                      onClick={() => {
                        setReporteSeleccionado(reporte);
                        setModalEditar(true);
                      }}
                      title="Editar"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      onClick={() => {
                        setReporteSeleccionadoEliminar(reporte);
                        setModalEliminar(true);
                      }}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TablaReportes;
