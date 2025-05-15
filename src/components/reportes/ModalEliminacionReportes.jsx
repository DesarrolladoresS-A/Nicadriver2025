import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { FaTrash, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const ModalEliminarReportes = ({ setModalEliminar, reporte, actualizar, setError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState(null);

  const eliminarReporte = async () => {
    setLoading(true);
    setLocalError(null);
    setError(null); // Limpiar errores anteriores

    try {
      console.log("Iniciando eliminación del reporte:", reporte.id);
      
      // 1. Eliminar imagen de Storage si existe
      if (reporte.foto) {
        try {
          console.log("Intentando eliminar imagen:", reporte.foto);
          const storage = getStorage();
          const fotoRef = ref(storage, reporte.foto);
          await deleteObject(fotoRef);
          console.log("Imagen eliminada con éxito");
        } catch (error) {
          console.warn("⚠️ La imagen no se pudo eliminar:", error.message);
          // No es crítico si falla la eliminación de la imagen
        }
      }

      // 2. Eliminar el documento de Firestore
      console.log("Intentando eliminar documento de Firestore");
      const reporteRef = doc(db, "reportes", reporte.id);
      await deleteDoc(reporteRef);
      console.log("Documento eliminado con éxito");

      // Actualizar lista y cerrar modal
      actualizar();
      setModalEliminar(false);
    } catch (error) {
      console.error("❌ Error completo al eliminar el reporte:", error);
      
      let errorMessage = "Hubo un error al eliminar el reporte. Por favor, inténtalo de nuevo.";
      
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
        
        {/* Mostrar error local si existe */}
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
            <FaExclamationTriangle /> {error}
          </div>
        )}
        
        <p style={{ marginBottom: '25px', fontSize: '1.1rem' }}>
          ¿Estás seguro de que quieres eliminar el reporte: <strong>"{reporte.titulo}"</strong>?
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '15px',
          marginTop: '30px'
        }}>
          <button
            onClick={() => setModalEliminar(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s'
            }}
            disabled={loading}
          >
            <FaTimes /> Cancelar
          </button>
          <button
            onClick={eliminarReporte}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s'
            }}
            disabled={loading}
          >
            <FaTrash /> {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarReportes;