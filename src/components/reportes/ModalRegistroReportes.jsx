import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  
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

  const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const guardarReporte = async () => {
    // Validar antes de guardar
    if (!validarCampos()) return;

    setCargando(true);

    try {
      let fotoBase64 = null;
      
      // Si hay una foto seleccionada, convertirla a base64
      if (foto) {
        fotoBase64 = await convertirImagenABase64(foto);
      }

      const nuevoReporte = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        fechaHora,
        foto: fotoBase64, // Guardamos la imagen como base64
        fechaRegistro: new Date().toISOString() // Añadimos fecha de registro
      };

      await addDoc(collection(db, "reportes"), nuevoReporte);
      actualizar();
      setModalRegistro(false);
    } catch (error) {
      console.error("Error al guardar el reporte:", error);
    } finally {
      setCargando(false);
    }
  };

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
                style={{maxWidth: '100px', maxHeight: '100px'}}
              />
            </div>
          )}
        </div>

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