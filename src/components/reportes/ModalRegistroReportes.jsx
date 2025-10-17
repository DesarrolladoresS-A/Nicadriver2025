import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
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
      // Foto ya NO es obligatoria para evitar bloqueos por CORS/Storage
      foto: false
    };
    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some((error) => error);
  };

  // Convertir archivo a base64
  const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
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

      // Convertir imagen a base64 si existe
      if (foto) {
        try {
          console.log("[Reporte] Convirtiendo imagen a base64...");
          fotoBase64 = await convertirImagenABase64(foto);
          console.log("[Reporte] Imagen convertida a base64 exitosamente");
        } catch (errImg) {
          console.warn("[Reporte] Error al convertir imagen a base64:", errImg);
          // Continuar sin imagen
          fotoBase64 = null;
        }
      }

      const ahora = new Date();

      let perfil = {};
      try {
        if (user?.uid) {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data();
            perfil = {
              userNombre: d.nombres || d.nombre || null,
              userApellido: d.apellidos || d.apellido || null,
              userCedula: d.cedula || d.cédula || null,
            };
          }
        }
      } catch (_) {}

      const nuevoReporte = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        fechaHora,
        foto: fotoBase64,
        fechaRegistro: ahora.toISOString(),
        estado: "pendiente",
        userEmail: user?.email || null,
        userUid: user?.uid || null,
        ...perfil,
      };

      const fotoInfo = fotoBase64 ? `base64 image (${fotoBase64.length} chars)` : 'no image';
      console.log("[Reporte] Guardando documento en Firestore... foto=", fotoInfo);
      await addDoc(collection(db, "reportes"), nuevoReporte);
      console.log("[Reporte] Reporte guardado correctamente.")

      if (actualizar) actualizar();
      setModalRegistro(false);
    } catch (error) {
      console.error("Error al guardar el reporte:", error);
      const msg = error?.code === 'permission-denied'
        ? 'No tienes permisos para crear reportes. Inicia sesión o contacta al administrador.'
        : error?.message || 'Ocurrió un error al guardar el reporte.';

      // Si el error es por tamaño de la propiedad foto (>1MiB), reintentar sin foto
      const isFotoMuyGrande = typeof error?.message === 'string' && error.message.includes('The value of property "foto" is longer than');
      if (isFotoMuyGrande) {
        try {
          console.warn('[Reporte] Reintentando guardado sin imagen por límite de Firestore...');
          const ahora = new Date();
          let perfil = {};
          try {
            if (user?.uid) {
              const ref = doc(db, 'users', user.uid);
              const snap = await getDoc(ref);
              if (snap.exists()) {
                const d = snap.data();
                perfil = {
                  userNombre: d.nombres || d.nombre || null,
                  userApellido: d.apellidos || d.apellido || null,
                  userCedula: d.cedula || d.cédula || null,
                };
              }
            }
          } catch (_) {}
          const fallback = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            ubicacion: ubicacion.trim(),
            fechaHora,
            foto: null,
            fechaRegistro: ahora.toISOString(),
            estado: 'pendiente',
            userEmail: user?.email || null,
            userUid: user?.uid || null,
            ...perfil,
          };
          await addDoc(collection(db, 'reportes'), fallback);
          console.log('[Reporte] Guardado exitoso sin imagen tras reintento.');
          if (actualizar) actualizar();
          setModalRegistro(false);
          return;
        } catch (e2) {
          console.error('[Reporte] Falló el reintento sin imagen:', e2);
        }
      }
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
            {foto ? "Imagen seleccionada" : "Subir foto (opcional)"}
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
          />
          <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
            La imagen se guardará en formato base64 directamente en la base de datos.
          </p>
          {/* Vista previa de la imagen */}
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

        {mensajeError && (
          <div style={{ marginTop: '12px', color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '8px' }}>
            {mensajeError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalRegistroReportes;
