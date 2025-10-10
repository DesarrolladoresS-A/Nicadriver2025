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
  const [mensajeError, setMensajeError] = useState("");

  const { user } = useAuth();

  const [errores, setErrores] = useState({
    titulo: false,
    descripcion: false,
    ubicacion: false,
    fechaHora: false,
    foto: false
  });

  const mensajesError = {
    titulo: "Por favor seleccione el tipo de incidente",
    descripcion: "Por favor describa el incidente",
    ubicacion: "Por favor indique la ubicación del incidente",
    fechaHora: "Por favor seleccione la fecha y hora del incidente",
    foto: "Por favor seleccione una imagen del incidente"
  };

  const validarCampos = () => {
    const nuevosErrores = {
      titulo: !titulo.trim(),
      descripcion: !descripcion.trim(),
      ubicacion: !ubicacion.trim(),
      fechaHora: !fechaHora,
      foto: !foto
    };
    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some((error) => error);
  };

  // Función para convertir archivo en Base64
  const convertirABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const guardarReporte = async () => {
    if (!validarCampos()) return;
    if (!user) {
      alert("Debes iniciar sesión para enviar un reporte.");
      return;
    }

    setCargando(true);
    setMensajeError("");

    try {
      let fotoBase64 = null;

      if (foto) {
        try {
          console.log("[Reporte] Convirtiendo imagen a Base64...");
          fotoBase64 = await convertirABase64(foto);
        } catch (errImg) {
          console.warn("[Reporte] Error al convertir imagen, se guardará sin foto:", errImg);
          fotoBase64 = null;
        }
      }

      const ahora = new Date();

      const nuevoReporte = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        fechaHora, // string de input datetime-local
        foto: fotoBase64, // 🔹 aquí guardamos la imagen en Base64
        fechaRegistro: ahora.toISOString(),
        estado: "pendiente",
        userEmail: user?.email || null
      };

      console.log("[Reporte] Guardando documento en Firestore...");
      await addDoc(collection(db, "reportes"), nuevoReporte);
      console.log("[Reporte] Reporte guardado correctamente ✅");

      if (actualizar) actualizar();
      setModalRegistro(false);
    } catch (error) {
      console.error("Error al guardar el reporte:", error);
      const msg = error?.code === "permission-denied"
        ? "No tienes permisos para crear reportes. Inicia sesión o contacta al administrador."
        : error?.message || "Ocurrió un error al guardar el reporte.";
      setMensajeError(msg);
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

        {/* Tipo de incidente */}
        <div className="form-field-container">
          <label>Tipo de incidente</label>
          <select
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={errores.titulo ? "campo-error" : ""}
          >
            <option value="">Seleccione un tipo de incidente</option>
            <optgroup label="Daños en la superficie de la vía">
              <option value="Baches">Baches</option>
              <option value="Fisuras o grietas">Fisuras o grietas</option>
              <option value="Hundimientos">Hundimientos</option>
              <option value="Deformaciones del pavimento">Deformaciones del pavimento</option>
              <option value="Desnivel entre carriles">Desnivel entre carriles</option>
            </optgroup>
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
            className={errores.ubicacion ? "campo-error" : ""}
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
            className={errores.descripcion ? "campo-error" : ""}
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
            className={errores.fechaHora ? "campo-error" : ""}
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
          {errores.foto && <p className="mensaje-error">{mensajesError.foto}</p>}
          {foto && (
            <div className="imagen-previa">
              <img
                src={URL.createObjectURL(foto)}
                alt="Vista previa"
                style={{ maxWidth: "100px", maxHeight: "100px" }}
              />
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="action-buttons">
          <button className="btn-cancelar" onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button className="btn-guardar" onClick={guardarReporte} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar reporte"}
          </button>
        </div>

        {mensajeError && (
          <div style={{ marginTop: "12px", color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "8px" }}>
            {mensajeError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalRegistroReportes;
