import React, { useState } from "react"; // Asegúrate de importar useState
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../database/firebaseconfig"; // Asegúrate de que esta ruta sea correcta

const TablaReportes = ({
  reportes,
  setModalEditar,
  setReporteSeleccionado,
  setModalEliminar,
  setReporteSeleccionadoEliminar,
  esAdmin = false, // nuevo prop
}) => {
  const [modalVer, setModalVer] = useState(false);
  const [reporteAVisualizar, setReporteAVisualizar] = useState(null);

  const formatearFechaHora = (fechaHora) => {
    try {
      if (!fechaHora) return "Sin fecha y hora";
      const fecha = fechaHora.toDate
        ? fechaHora.toDate()
        : fechaHora.seconds
        ? new Date(fechaHora.seconds * 1000)
        : new Date(fechaHora);
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

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      const docRef = doc(db, "reportes", id);
      await updateDoc(docRef, { estado: nuevoEstado });
      alert("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  const generarPDF = async (reporte) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte de Incidente", 20, 20);
    doc.text(`Tipo de incidente: ${reporte.titulo}`, 20, 30);
    doc.text(`Ubicación: ${reporte.ubicacion}`, 20, 40);
    doc.text(`Descripción: ${reporte.descripcion}`, 20, 50);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fechaHora)}`, 20, 60);
    doc.text(`Estado: ${reporte.estado || "Sin estado"}`, 20, 70);

    if (reporte.foto) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = reporte.foto;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 20, 80, 160, 100);
        doc.save(`${reporte.titulo}.pdf`);
      };
    } else {
      doc.text("Sin imagen", 20, 85);
      doc.save(`${reporte.titulo}.pdf`);
    }
  };

  const abrirModalVisualizacion = (reporte) => {
    setReporteAVisualizar(reporte);
    setModalVer(true);
  };

  return (
    <div className="tabla-reportes-container">
      {/* Modal de visualización, sin cambios */}

      {/* Tabla */}
      <div className="tabla-reportes-header">
        <h2>Lista de Reportes</h2>
        <p>Administra los reportes de incidentes</p>
      </div>

      <table className="tabla-reportes">
        <thead>
          <tr>
            <th>Tipo de incidente</th>
            <th>Ubicación</th>
            <th>Descripción</th>
            <th>Fecha y Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => (
            <tr key={reporte.id}>
              <td>{reporte.titulo}</td>
              <td>{reporte.ubicacion}</td>
              <td>
                {reporte.descripcion.substring(0, 50)}
                {reporte.descripcion.length > 50 ? "..." : ""}
              </td>
              <td>{formatearFechaHora(reporte.fechaHora)}</td>
              <td>
                {esAdmin ? (
                  <select
                    value={reporte.estado || "pendiente"}
                    onChange={(e) =>
                      handleEstadoChange(reporte.id, e.target.value)
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                ) : (
                  <span>{reporte.estado || "Sin estado"}</span>
                )}
              </td>
              <td className="acciones">
                <button
                  className="btn-accion btn-editar"
                  onClick={() => {
                    setReporteSeleccionado(reporte);
                    setModalEditar(true);
                  }}
                  title="Editar"
                >
                  <i className="bi bi-pencil-fill"></i>
                </button>
                <button
                  className="btn-accion btn-eliminar"
                  onClick={() => {
                    setReporteSeleccionadoEliminar(null);
                    setReporteSeleccionadoEliminar(reporte);
                    setModalEliminar(true);
                  }}
                  title="Eliminar"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
                <button
                  className="btn-accion btn-ver"
                  onClick={() => abrirModalVisualizacion(reporte)}
                  title="Ver detalles"
                >
                  <i className="bi bi-eye-fill"></i>
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
