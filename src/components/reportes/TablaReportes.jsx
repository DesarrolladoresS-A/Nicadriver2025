import React, { useState } from "react";
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
      let fecha;

      if (!fechaHora) return "Sin fecha y hora";
      if (fechaHora.toDate) {
        fecha = fechaHora.toDate();
      } else if (fechaHora.seconds) {
        fecha = new Date(fechaHora.seconds * 1000);
      } else if (typeof fechaHora === "string" || typeof fechaHora === "number") {
        fecha = new Date(fechaHora);
      } else {
        return "Fecha no válida";
      }

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

  return (
    <div className="report-table-container overflow-x-auto">
      <table className="report-table table-auto min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Título</th>
            <th className="px-4 py-2">Ubicación</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Fecha y Hora</th>
            <th className="px-4 py-2">Foto</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => (
            <tr key={reporte.id}>
              <td className="px-4 py-2">{reporte.titulo}</td>
              <td className="px-4 py-2">{reporte.ubicacion}</td>
              <td className="px-4 py-2">{reporte.descripcion}</td>
              <td className="px-4 py-2">{formatearFechaHora(reporte.fechaHora)}</td>
              <td className="px-4 py-2">
                {reporte.foto ? (
                  <img
                    src={reporte.foto}
                    alt="Incidente"
                    className="w-16 h-16 object-cover rounded cursor-pointer border hover:scale-105 transition-transform"
                    onClick={() => setImagenModal(reporte.foto)}
                  />
                ) : (
                  "Sin imagen"
                )}
              </td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  className="report-action-button edit flex items-center justify-center"
                  onClick={() => {
                    setReporteSeleccionado(reporte);
                    setModalEditar(true);
                  }}
                >
                  <i className="bi bi-pencil-fill text-blue-500"></i>
                </button>
                <button
                  className="report-action-button delete flex items-center justify-center"
                  onClick={() => {
                    setReporteSeleccionadoEliminar(reporte);
                    setModalEliminar(true);
                  }}
                >
                  <i className="bi bi-trash-fill text-red-500"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para mostrar imagen en grande */}
      {imagenModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setImagenModal(null)}
        >
          <div className="relative">
            <img
              src={imagenModal}
              alt="Vista ampliada"
              className="max-w-4xl max-h-[90vh] rounded shadow-lg"
            />
            <button
              onClick={() => setImagenModal(null)}
              className="absolute top-2 right-2 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaReportes;
