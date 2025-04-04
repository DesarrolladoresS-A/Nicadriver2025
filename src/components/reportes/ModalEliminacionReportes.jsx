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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        <h2 className="text-lg font-bold mb-4">Eliminar Reporte</h2>
        <p>¿Estás seguro de que quieres eliminar el reporte: "{reporte.titulo}"?</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setModalEliminar(false)}
            className="mr-2 border border-gray-400 px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={eliminarReporte}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarReportes;
