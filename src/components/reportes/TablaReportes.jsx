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
    <div className="report-table-container overflow-x-auto p-4 bg-white rounded shadow border border-gray-300">
      <table className="table-auto min-w-full border border-gray-300">
        <thead className="bg-gray-100 text-gray-800">
          <tr>
            <th className="px-4 py-2 border">Título</th>
            <th className="px-4 py-2 border">Ubicación</th>
            <th className="px-4 py-2 border">Descripción</th>
            <th className="px-4 py-2 border">Fecha y Hora</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => (
            <tr key={reporte.id} className="text-center hover:bg-gray-50">
              <td className="px-4 py-2 border">{reporte.titulo}</td>
              <td className="px-4 py-2 border">{reporte.ubicacion}</td>
              <td className="px-4 py-2 border">{reporte.descripcion}</td>
              <td className="px-4 py-2 border">
                {formatearFechaHora(reporte.fechaHora)}
              </td>
              <td className="px-4 py-2 border">
                <div className="flex justify-center gap-3">
                  <button
                    className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center"
                    onClick={() => {
                      setReporteSeleccionado(reporte);
                      setModalEditar(true);
                    }}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>
                 <button
                  className="w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"onClick={() => {
                  console.log("Preparando para eliminar reporte:", reporte.id);
                  setReporteSeleccionado(reporte);
                  setModalEliminar(true);
                    }}
                  >
                  <i className="bi bi-trash-fill"></i>
                  </button>
                  <button
                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
                    onClick={() => generarPDF(reporte)}
                  >
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaReportes;
