import React from "react";

const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
}) => {
  return (
    <div className="report-table-container">
      <table className="report-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Ubicación</th>
            <th>Descripción</th>
            <th>Fecha y Hora</th>
            <th>Foto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => (
            <tr key={reporte.id}>
              <td>{reporte.titulo}</td>
              <td>{reporte.ubicacion}</td>
              <td>{reporte.descripcion}</td>
              <td>{reporte.fechaHora}</td>
              <td>
                {reporte.fotoURL ? (
                  <img
                    src={reporte.fotoURL}
                    alt="Incidente"
                    style={{ width: "60px", height: "auto", borderRadius: "4px" }}
                  />
                ) : (
                  "Sin imagen"
                )}
              </td>
              <td>
                <button
                  className="report-action-button edit"
                  onClick={() => {
                    setReporteSeleccionado(reporte);
                    setModalEditar(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="report-action-button delete"
                  onClick={() => {
                    setReporteSeleccionadoEliminar(reporte);
                    setModalEliminar(true);
                  }}
                >
                  Eliminar
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
