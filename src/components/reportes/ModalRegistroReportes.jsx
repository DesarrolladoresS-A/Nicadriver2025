import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../database/authcontext";

const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { user } = useAuth();

  const [errores, setErrores] = useState({
    titulo: false,
    descripcion: false,
    ubicacion: false,
    fechaHora: false
  });

  const mensajesError = {
    titulo: "Por favor seleccione el tipo de incidente",
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
    return !Object.values(nuevosErrores).some((error) => error);
  };

  const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const guardarReporte = async () => {
    if (!validarCampos()) return;

    setCargando(true);

    try {
      let fotoBase64 = null;
      if (foto) {
        fotoBase64 = await convertirImagenABase64(foto);
      }

      const ahora = new Date();
      const nuevoReporte = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        fechaHora,
        foto: fotoBase64,
        fechaRegistro: ahora.toISOString(),
        estado: "pendiente", // Campo extra útil para gestión de reportes
        userEmail: user?.email || null
      };

      await addDoc(collection(db, "reportes"), nuevoReporte);
      console.log("Reporte guardado:", nuevoReporte);

      if (actualizar) actualizar();
      setModalRegistro(false);
    } catch (error) {
      console.error("Error al guardar el reporte:", error);
      alert("Ocurrió un error al guardar el reporte.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <div className="modal-title">
          <h2>Registrar reporte</h2>
          <button className="close-modal-btn" onClick={() => setModalRegistro(false)}>×</button>
        </div>

        {/* Campo tipo de incidente */}
        <div className="form-field-container">
          <label>Tipo de incidente</label>
          <select
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={errores.titulo ? 'campo-error' : ''}
          >
            <option value="">Seleccione un tipo de incidente</option>
            {/* Opciones organizadas */}
            <optgroup label="Daños en la superficie de la vía">
              <option value="Baches">Baches</option>
              <option value="Fisuras o grietas">Fisuras o grietas</option>
              <option value="Hundimientos">Hundimientos</option>
              <option value="Deformaciones del pavimento">Deformaciones del pavimento</option>
              <option value="Desnivel entre carriles">Desnivel entre carriles</option>
            </optgroup>
            {/* Más opciones omitidas por brevedad */}
          </select>
          {errores.titulo && <p className="mensaje-error">{mensajesError.titulo}</p>}
        </div>

        {/* Ubicación */}
        <div className="form-field-container">
          <label>Ubicación del incidente</label>
          <input
            type="text"
            placeholder="Ej. Calle 123, Zona A"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className={errores.ubicacion ? 'campo-error' : ''}
          />
          {errores.ubicacion && <p className="mensaje-error">{mensajesError.ubicacion}</p>}
        </div>

        {/* Descripción */}
        <div className="form-field-container">
          <label>Descripción</label>
          <textarea
            placeholder="Describe lo sucedido"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={errores.descripcion ? 'campo-error' : ''}
          />
          {errores.descripcion && <p className="mensaje-error">{mensajesError.descripcion}</p>}
        </div>

        {/* Fecha y hora */}
        <div className="form-field-container">
          <label>Fecha y hora del incidente</label>
          <input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            className={errores.fechaHora ? 'campo-error' : ''}
          />
          {errores.fechaHora && <p className="mensaje-error">{mensajesError.fechaHora}</p>}
        </div>

        {/* Imagen */}
        <div className="file-input-container">
          <label htmlFor="foto">
            <i className="bi bi-camera-fill"></i>
            {foto ? "Imagen seleccionada" : "Subir foto"}
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
          />
          {foto && (
            <div className="imagen-previa">
              <img
                src={URL.createObjectURL(foto)}
                alt="Vista previa"
                style={{ maxWidth: '100px', maxHeight: '100px' }}
              />
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="action-buttons">
          <button className="btn-cancelar" onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button
            className="btn-guardar"
            onClick={guardarReporte}
            disabled={cargando}
          >
            {cargando ? "Guardando..." : "Guardar reporte"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;
