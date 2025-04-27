import React, { useState, useEffect } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";

const ModalEdicionReportes = ({ setModalEditar, reporte, actualizar }) => {
  const [titulo, setTitulo] = useState(reporte.titulo || "");
  const [descripcion, setDescripcion] = useState(reporte.descripcion || "");
  const [ubicacion, setUbicacion] = useState(reporte.ubicacion || "");
  const [fechaHora, setFechaHora] = useState(reporte.fechaHora || "");
  const [foto, setFoto] = useState(null); // Para nueva foto, si el usuario quiere cambiarla

  const [errores, setErrores] = useState({});
  const [formEnviado, setFormEnviado] = useState(false);

  const validarCampos = () => {
    let erroresTemp = {};

    if (!titulo.trim()) erroresTemp.titulo = "El título es obligatorio.";
    if (!ubicacion.trim()) erroresTemp.ubicacion = "La ubicación es obligatoria.";
    if (!descripcion.trim()) erroresTemp.descripcion = "La descripción es obligatoria.";
    if (!fechaHora) erroresTemp.fechaHora = "La fecha y hora son obligatorias.";
    // La foto es opcional al editar

    setErrores(erroresTemp);

    return Object.keys(erroresTemp).length === 0;
  };

  const editarReporte = async () => {
    if (!validarCampos()) {
      setFormEnviado(false);
      return;
    }

    const reporteRef = doc(db, "reportes", reporte.id);

    const datosActualizados = {
      titulo,
      descripcion,
      ubicacion,
      fechaHora,
    };

    await updateDoc(reporteRef, datosActualizados);
    actualizar();
    setModalEditar(false);
  };

  useEffect(() => {
    if (formEnviado && Object.keys(errores).length === 0) {
      const timer = setTimeout(() => {
        setErrores({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errores, formEnviado]);

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <h2>Editar reporte</h2>

        <div>
          <label>Título del incidente</label>
          <input
            type="text"
            placeholder="Título breve"
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
            placeholder="Ej. Calle 123, Zona A"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className={`input ${errores.ubicacion ? "input-error shake" : ubicacion ? "input-success" : ""}`}
          />
          {errores.ubicacion && <p className="error-message">{errores.ubicacion}</p>}
        </div>

        <div>
          <label>Descripción del incidente</label>
          <textarea
            placeholder="Describe lo sucedido"
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

        <div>
          <label>Actualizar foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="input"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => setModalEditar(false)}>Cancelar</button>
          <button
            onClick={() => {
              setFormEnviado(true);
              editarReporte();
            }}
            disabled={Object.keys(errores).length > 0}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEdicionReportes;
