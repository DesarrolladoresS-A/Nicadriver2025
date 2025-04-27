import React from "react";
import { db } from "../../database/firebaseconfig";
import { doc, deleteDoc } from "firebase/firestore";

const ModalEliminarReportes = ({ setModalEliminar, reporte, actualizar }) => {
  const eliminarReporte = async () => {
    const reporteRef = doc(db, "reportes", reporte.id);
    await deleteDoc(reporteRef);
    setModalEliminar(false);
    actualizar();
  };

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <h2>Eliminar Reporte</h2>
        <p className="text-lg">
          ¿Estás seguro de que quieres eliminar el reporte: <strong>{reporte.titulo}</strong>?
        </p>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setModalEliminar(false)}
            className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={eliminarReporte}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarReportes;
