import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  
  // Estados para manejar errores
  const [errores, setErrores] = useState({
    titulo: false,
    descripcion: false,
    ubicacion: false,
    fechaHora: false
  });
  
  // Mensajes de error
  const mensajesError = {
    titulo: "Por favor ingrese el título del incidente",
    descripcion: "Por favor describa el incidente",
    ubicacion: "Por favor indique la ubicación del incidente",
    fechaHora: "Por favor seleccione la fecha y hora del incidente"
  };

  const validarCampos = () => {
    const nuevosErrores = {
      titulo: !titulo.trim(),
      descripcion: !descripcion.trim(),
      ubicacion: !ubicacion.trim(),
      fechaHora: !fechaHora
    };
    
    setErrores(nuevosErrores);
    
    // Retorna true si no hay errores
    return !Object.values(nuevosErrores).some(error => error);
  };

  const guardarReporte = async () => {
    // Validar antes de guardar
    if (!validarCampos()) return;

    const nuevoReporte = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
      fechaHora,
      // foto: aquí deberías subir a Firebase Storage y guardar la URL
    };

    try {
      await addDoc(collection(db, "reportes"), nuevoReporte);
      actualizar();
      setModalRegistro(false);
    } catch (error) {
      console.error("Error al guardar el reporte:", error);
    }
  };

  // Estilo para campos con error
    return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <div className="modal-title">
          <h2>Registrar reporte</h2>
          <button className="close-modal-btn" onClick={() => setModalRegistro(false)}>
            ×
          </button>
        </div>

        <div className="form-field-container">
          <label>Título del incidente</label>
          <input
            type="text"
            placeholder="Título breve"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={errores.titulo ? 'campo-error' : ''}
          />
          {errores.titulo && (
            <p className="mensaje-error">
              {mensajesError.titulo}
            </p>
          )}
        </div>

        <div className="form-field-container">
          <label>Ubicación del incidente</label>
          <input
            type="text"
            placeholder="Ej. Calle 123, Zona A"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className={errores.ubicacion ? 'campo-error' : ''}
          />
          {errores.ubicacion && (
            <p className="mensaje-error">
              {mensajesError.ubicacion}
            </p>
          )}
        </div>

        <div className="form-field-container">
          <label>Descripción</label>
          <textarea
            placeholder="Describe lo sucedido"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={errores.descripcion ? 'campo-error' : ''}
          />
          {errores.descripcion && (
            <p className="mensaje-error">
              {mensajesError.descripcion}
            </p>
          )}
        </div>

        <div className="form-field-container">
          <label>Fecha y hora del incidente</label>
          <input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            className={errores.fechaHora ? 'campo-error' : ''}
          />
          {errores.fechaHora && (
            <p className="mensaje-error">
              {mensajesError.fechaHora}
            </p>
          )}
        </div>

        <div className="file-input-container">
          <label htmlFor="foto">
            <i className="bi bi-camera-fill"></i>
            Subir foto
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
          />
        </div>

        <div className="action-buttons">
          <button className="btn-cancelar" onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button className="btn-guardar" onClick={guardarReporte}>Guardar reporte</button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;