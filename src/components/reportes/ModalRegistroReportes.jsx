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
  const estiloError = {
    border: "1px solid red",
    backgroundColor: "#fff0f0"
  };

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
            style={errores.titulo ? estiloError : {}}
          />
          {errores.titulo && (
            <p className="mensaje-error" style={{color: "red", fontSize: "0.8rem", marginTop: "0.2rem"}}>
              {mensajesError.titulo}
            </p>
          )}
        </div>

        <div>
          <label>Ubicación del incidente</label>
          <input
            type="text"
            placeholder="Ej. Calle 123, Zona A"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            style={errores.ubicacion ? estiloError : {}}
          />
          {errores.ubicacion && (
            <p className="mensaje-error" style={{color: "red", fontSize: "0.8rem", marginTop: "0.2rem"}}>
              {mensajesError.ubicacion}
            </p>
          )}
        </div>

        <div>
          <label>Descripción</label>
          <textarea
            placeholder="Describe lo sucedido"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={errores.descripcion ? estiloError : {}}
          />
          {errores.descripcion && (
            <p className="mensaje-error" style={{color: "red", fontSize: "0.8rem", marginTop: "0.2rem"}}>
              {mensajesError.descripcion}
            </p>
          )}
        </div>

        <div>
          <label>Fecha y hora del incidente</label>
          <input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            style={errores.fechaHora ? estiloError : {}}
          />
          {errores.fechaHora && (
            <p className="mensaje-error" style={{color: "red", fontSize: "0.8rem", marginTop: "0.2rem"}}>
              {mensajesError.fechaHora}
            </p>
          )}
        </div>

        <div>
          <label>Subir foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button onClick={guardarReporte}>Guardar reporte</button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;