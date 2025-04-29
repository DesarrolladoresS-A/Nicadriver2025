import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

const ModalEliminarReportes = ({ setModalEliminar, reporte, actualizar }) => {
  const [loading, setLoading] = useState(false);

  const eliminarReporte = async () => {
    setLoading(true);

    try {
      // 1. Eliminar imagen de Storage si existe
      if (reporte.foto) {
        const storage = getStorage();
        const fotoRef = ref(storage, reporte.foto);
        await deleteObject(fotoRef).catch((err) => {
          console.warn("⚠️ Imagen no encontrada o ya eliminada:", err.message);
        });
      }

      // 2. Eliminar el documento de Firestore
      const reporteRef = doc(db, "reportes", reporte.id);
      await deleteDoc(reporteRef);

      actualizar();
      setModalEliminar(false);
    } catch (error) {
      console.error("❌ Error al eliminar el reporte:", error);
      alert("Hubo un error al eliminar el reporte.");
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={eliminarReporte}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarReportes;
