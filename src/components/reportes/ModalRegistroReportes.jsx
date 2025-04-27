import React, { useState, useEffect } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";


const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);

  const [errores, setErrores] = useState({});
  const [formEnviado, setFormEnviado] = useState(false);

  const validarCampos = () => {
    let erroresTemp = {};

    if (!titulo.trim()) erroresTemp.titulo = "El título es obligatorio.";
    if (!ubicacion.trim()) erroresTemp.ubicacion = "La ubicación es obligatoria.";
    if (!descripcion.trim()) erroresTemp.descripcion = "La descripción es obligatoria.";
    if (!fechaHora) erroresTemp.fechaHora = "La fecha y hora son obligatorias.";
    if (!foto) erroresTemp.foto = "La fotografía es obligatoria.";
    else if (!foto.type.startsWith("image/")) erroresTemp.foto = "El archivo debe ser una imagen.";

    setErrores(erroresTemp);

    return Object.keys(erroresTemp).length === 0;
  };

  const guardarReporte = async () => {
    if (!validarCampos()) {
      setFormEnviado(false);
      return;
    }

    const nuevoReporte = {
      titulo,
      descripcion,
      ubicacion,
      fechaHora,
    };

    await addDoc(collection(db, "reportes"), nuevoReporte);
    actualizar();
    setModalRegistro(false);
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
        <h2>Registrar reporte</h2>

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
          <label>Descripción</label>
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
          <label>Subir foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="input"
          />
          {errores.foto && <p className="error-message">{errores.foto}</p>}
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button
            onClick={() => {
              setFormEnviado(true);
              guardarReporte();
            }}
            disabled={Object.keys(errores).length > 0}
          >
            Guardar reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;