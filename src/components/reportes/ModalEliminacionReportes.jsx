import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, deleteDoc } from "firebase/firestore";
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

      // Eliminar el documento de Firestore
      const reporteRef = doc(db, "reportes", reporte.id);
      await deleteDoc(reporteRef);
      console.log("✅ Documento eliminado con éxito");

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
      backgroundColor: 'rgb(255, 255, 255)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgb(255, 255, 255)',
        border: '1px solid #e0e0e0'
      }}>
        <h2 style={{
          color: '#000',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.5rem'
        }}>
          <FaTrash style={{ color: '#dc3545' }} /> Eliminar Reporte
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fff',
            color: '#dc3545',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #dc3545'
          }}>
            <FaExclamationTriangle style={{ color: '#dc3545' }} />
            {error}
          </div>
        )}

        <p style={{ color: '#000', marginBottom: '10px', fontSize: '1rem' }}>
          ¿Estás seguro que deseas eliminar el reporte "{reporte.titulo}"?
        </p>
        <p style={{ color: '#000', marginBottom: '20px', fontSize: '1rem' }}>
          Esta acción no se puede deshacer.
        </p>

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
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={eliminarReporte}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spinner 1s linear infinite'
                }}></div>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash style={{ color: '#fff' }} />
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
