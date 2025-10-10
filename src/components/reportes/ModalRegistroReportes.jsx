import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../database/authcontext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

 // Flag para deshabilitar subida de imagen temporalmente si hay problemas de CORS
 const DISABLE_IMAGE_UPLOAD = import.meta.env?.VITE_DISABLE_IMAGE_UPLOAD === 'true';
 const UPLOAD_TIMEOUT_MS = 15000; // 15s de tiempo límite para la subida

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
      // Foto ya NO es obligatoria para evitar bloqueos por CORS/Storage
      foto: false
    };
    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some((error) => error);
  };

  // Subir archivo a Storage y devolver URL de descarga con subida reanudable
  const subirImagenYObtenerURL = async (archivo, uid) => {
    if (!uid) throw new Error("No hay uid de usuario para subir a Storage. Asegúrate de estar autenticado.");
    const nombreSeguro = archivo.name?.replace(/[^a-zA-Z0-9_.-]/g, "_") || `foto_${Date.now()}.jpg`;
    const ruta = `reportes/${uid}/${Date.now()}_${nombreSeguro}`;
    const storageRef = ref(storage, ruta);
    const metadata = { contentType: archivo.type || 'application/octet-stream' };

    const task = uploadBytesResumable(storageRef, archivo, metadata);
    // Subida con tiempo límite para evitar quedarse colgado por CORS
    await Promise.race([
      new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          undefined,
          (err) => reject(err),
          () => resolve()
        );
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout-upload')), UPLOAD_TIMEOUT_MS))
    ]);
    const url = await getDownloadURL(storageRef);
    return url;

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
    // Si la subida está deshabilitada por config, seguimos guardando sin foto


    setCargando(true);
    setMensajeError("");

    try {
      let fotoBase64 = null;

      if (foto) {
        try {
          console.log("[Reporte] Convirtiendo imagen a Base64...");
          fotoBase64 = await convertirABase64(foto);
        } catch (errImg) {
          console.warn("[Reporte] Falló/timeout la subida de imagen, se guardará sin foto:", errImg?.code || errImg?.message || errImg);
          if (typeof errImg?.message === 'string' && errImg.message.toLowerCase().includes('cors')) {
            console.warn('[Reporte] Sugerencia: Aplica cors.json al bucket y verifica orígenes permitidos.');
          }
          // Continuar sin imagen
          fotoURL = null;
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
          {DISABLE_IMAGE_UPLOAD && (
            <p style={{ marginTop: '8px', color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '6px' }}>
              La subida de imágenes está deshabilitada temporalmente. El reporte se guardará sin foto.
            </p>
          )}
          {/* Foto ya no es obligatoria */}
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
