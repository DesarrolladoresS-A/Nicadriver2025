import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";


const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  const [errores, setErrores] = useState({});

  const validarCampos = () => {
    let erroresTemp = {};
    if (!titulo.trim()) erroresTemp.titulo = "El título es obligatorio.";
    if (!ubicacion.trim()) erroresTemp.ubicacion = "La ubicación es obligatoria.";
    if (!descripcion.trim()) erroresTemp.descripcion = "La descripción es obligatoria.";
    if (!fechaHora) erroresTemp.fechaHora = "La fecha y hora son obligatorias.";
    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  const guardarReporte = async () => {
    const esValido = validarCampos();
    if (!esValido) return;

    try {
      const nuevoReporte = {
        titulo,
        descripcion,
        ubicacion,
        fechaHora: Timestamp.fromDate(new Date(fechaHora)),
        foto: null, // Imagen desactivada por ahora
      };
      

      await addDoc(collection(db, "reportes"), nuevoReporte);
      alert("✅ Reporte guardado con éxito.");
      actualizar();
      setModalRegistro(false);
    } catch (error) {
      console.error("❌ Error al guardar el reporte:", error);
      alert("Error al guardar el reporte.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <h2>Registrar reporte</h2>

        <div>
          <label>Título del incidente</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={`input ${errores.titulo ? "input-error shake" : titulo ? "input-success" : ""}`}
          />
          {errores.titulo && <p className="error-message">{errores.titulo}</p>}
        </div>

        <div>
          <label>Ubicación del incidente</label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className={`input ${errores.ubicacion ? "input-error shake" : ubicacion ? "input-success" : ""}`}
          />
          {errores.ubicacion && <p className="error-message">{errores.ubicacion}</p>}
        </div>

        <div>
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={`input ${errores.descripcion ? "input-error shake" : descripcion ? "input-success" : ""}`}
          />
          {errores.descripcion && <p className="error-message">{errores.descripcion}</p>}
        </div>

        <div>
          <label>Fecha y hora del incidente</label>
          <input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            className={`input ${errores.fechaHora ? "input-error shake" : fechaHora ? "input-success" : ""}`}
          />
          {errores.fechaHora && <p className="error-message">{errores.fechaHora}</p>}
        </div>

        {/* Campo de foto deshabilitado temporalmente */}
        {<div>
          <label>Subir foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="input"
          />
        </div>}

        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button onClick={guardarReporte}>Guardar reporte</button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;
