import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { FaTrash, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const ModalEliminarReportes = ({ setModalEliminar, reporte, actualizar, setError, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState(null);

  const eliminarReporte = async () => {
    setLoading(true);
    setLocalError(null);
    setError(null);

    try {
      console.log("Iniciando eliminación del reporte:", reporte.id);

      // 1. Eliminar imagen de Storage si existe
      if (reporte.foto) {
        try {
          const storage = getStorage();
          const url = new URL(reporte.foto);
          const path = decodeURIComponent(url.pathname.split("/o/")[1]?.split("?")[0]);

          if (path) {
            const fotoRef = ref(storage, path);
            await deleteObject(fotoRef);
            console.log("✅ Imagen eliminada con éxito");
          } else {
            console.warn("⚠️ Ruta de la imagen no válida.");
          }
        } catch (imgError) {
          console.warn("⚠️ No se pudo eliminar la imagen. Continuando con el reporte:", imgError.message);
        }
      }

      // 2. Eliminar el documento de Firestore
      try {
        const reporteRef = doc(db, "reportes", reporte.id);
        await deleteDoc(reporteRef);
        console.log("✅ Documento eliminado con éxito");
      } catch (firestoreError) {
        console.error("❌ Error al eliminar el documento:", firestoreError);
        throw new Error("No se pudo eliminar el reporte");
      }

      // Actualizar lista y cerrar modal
      actualizar();
      onClose();
    } catch (error) {
      console.error("❌ Error completo al eliminar el reporte:", error);

      let errorMessage = error.message || "Hubo un error al eliminar el reporte. Por favor, inténtalo de nuevo.";

      if (error.code === "permission-denied") {
        errorMessage = "No tienes permisos para eliminar reportes. Contacta al administrador.";
      } else if (error.code === "not-found") {
        errorMessage = "El reporte no fue encontrado. Puede que ya haya sido eliminado.";
      }

      setLocalError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{
          color: '#1e3d87',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaTrash /> Eliminar Reporte
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#f44336',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        <p>¿Estás seguro que deseas eliminar el reporte "{reporte.titulo}"?</p>
        <p>Esta acción no se puede deshacer.</p>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => onClose()}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ccc',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={eliminarReporte}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spinner 1s linear infinite'
                }}></div>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarReportes;
