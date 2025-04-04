import React from "react";

const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
}) => {
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Título</th>
          <th className="p-2 border">Descripción</th>
          <th className="p-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {reportes.map((reporte) => (
          <tr key={reporte.id}>
            <td className="p-2 border">{reporte.titulo}</td>
            <td className="p-2 border">{reporte.descripcion}</td>
            <td className="p-2 border">
              <button
                className="bg-yellow-400 text-white px-3 py-1 rounded"
                onClick={() => {
                  setReporteSeleccionado(reporte);
                  setModalEditar(true);
                }}
              >
                Editar
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded ml-2"
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
  );
};

export default TablaReportes;
