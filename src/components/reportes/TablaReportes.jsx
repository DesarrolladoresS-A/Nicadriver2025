import React from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';


const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
}) => {
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
              <td className="px-4 py-2">
                {reporte.fechaHora?.seconds
                  ? new Date(reporte.fechaHora.seconds * 1000).toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sin fecha y hora"}
              </td>
              <td className="px-4 py-2">
                {reporte.fotoURL ? (
                  <img
                    src={reporte.fotoURL}
                    alt="Incidente"
                    className="w-16 h-auto rounded"
                  />
                ) : (
                  "Sin imagen"
                )}
              </td>
              <td className="px-4 py-2">
                <button
                  className="report-action-button edit flex items-center justify-center"
                  onClick={() => {
                    setReporteSeleccionado(reporte);
                    setModalEditar(true);
                  }}
                >
                  <i className="bi bi-pencil-fill text-blue-500"></i>
                  <span className="sr-only"></span> {/* Para accesibilidad */}
                </button>
                <button
                  className="report-action-button delete flex items-center justify-center"
                  onClick={() => {
                    setReporteSeleccionadoEliminar(reporte);
                    setModalEliminar(true);
                  }}
                >
                  <i className="bi bi-trash-fill text-red-500"></i>
                  <span className="sr-only"></span> {/* Para accesibilidad */}
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
