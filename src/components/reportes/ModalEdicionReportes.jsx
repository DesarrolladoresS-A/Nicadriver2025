import React, { useState, useEffect } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";

const ModalEdicionReportes = ({ setModalEditar, reporte, actualizar }) => {
  const [titulo, setTitulo] = useState(reporte.titulo || "");
  const [descripcion, setDescripcion] = useState(reporte.descripcion || "");
  const [ubicacion, setUbicacion] = useState(reporte.ubicacion || "");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPrevia, setFotoPrevia] = useState(reporte.foto || null);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (reporte.fechaHora) {
      let fechaFormateada = "";
      if (typeof reporte.fechaHora === "string") {
        fechaFormateada = reporte.fechaHora.substring(0, 16);
      } else if (reporte.fechaHora?.seconds) {
        const fecha = new Date(reporte.fechaHora.seconds * 1000);
        fechaFormateada = fecha.toISOString().substring(0, 16);
      }
      setFechaHora(fechaFormateada);
    }
  }, [reporte]);

  const validarCampos = () => {
    const erroresTemp = {};
    if (!titulo.trim()) erroresTemp.titulo = "El título es obligatorio.";
    if (!ubicacion.trim()) erroresTemp.ubicacion = "La ubicación es obligatoria.";
    if (!descripcion.trim()) erroresTemp.descripcion = "La descripción es obligatoria.";
    if (!fechaHora) erroresTemp.fechaHora = "La fecha y hora son obligatorias.";
    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const editarReporte = async () => {
    if (!validarCampos()) return;

    setCargando(true);
    const reporteRef = doc(db, "reportes", reporte.id);
    
    try {
      let datosActualizados = {
        titulo,
        descripcion,
        ubicacion,
        fechaHora: new Date(fechaHora),
      };

      // Si hay una nueva foto, convertirla a base64
      if (foto) {
        try {
          const fotoBase64 = await convertirImagenABase64(foto);
          datosActualizados.foto = fotoBase64;
        } catch (error) {
          console.error("Error al convertir la imagen:", error);
        }
      } else if (fotoPrevia === null) {
        // Si se eliminó la foto previa y no hay nueva foto
        datosActualizados.foto = null;
      }

      await updateDoc(reporteRef, datosActualizados);
      actualizar();
      setModalEditar(false);
    } catch (error) {
      console.error("Error al editar el reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG o PNG');
        return;
      }
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPrevia(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setFoto(file);
    } else {
      // Si no se selecciona archivo, mantener la foto previa si existe
      setFoto(null);
    }
  };

  const eliminarFoto = () => {
    setFoto(null);
    setFotoPrevia(null);
  };

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <div className="modal-title">
          <h2>Editar reporte</h2>
          <button className="close-modal-btn" onClick={() => setModalEditar(false)}>
            ×
          </button>
        </div>

        <div className="form-field-container">
          <label>Título del incidente</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={errores.titulo ? 'campo-error' : ''}
          />
          {errores.titulo && <p className="mensaje-error">{errores.titulo}</p>}
        </div>

        <div className="form-field-container">
          <label>Ubicación del incidente</label>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className={errores.ubicacion ? 'campo-error' : ''}
          />
          {errores.ubicacion && <p className="mensaje-error">{errores.ubicacion}</p>}
        </div>

        <div className="form-field-container">
          <label>Descripción del incidente</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={errores.descripcion ? 'campo-error' : ''}
          />
          {errores.descripcion && <p className="mensaje-error">{errores.descripcion}</p>}
        </div>

        <div className="form-field-container">
          <label>Fecha y hora del incidente</label>
          <input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            className={errores.fechaHora ? 'campo-error' : ''}
          />
          {errores.fechaHora && <p className="mensaje-error">{errores.fechaHora}</p>}
        </div>

        <div className="file-input-container">
          <label htmlFor="foto">
            <i className="bi bi-camera-fill"></i>
            {foto ? "Nueva imagen seleccionada" : "Cambiar imagen"}
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {(fotoPrevia || reporte.foto) && (
            <div className="imagen-previa-container">
              <img 
                src={fotoPrevia || reporte.foto} 
                alt="Vista previa" 
                className="imagen-previa"
              />
              <button 
                type="button" 
                className="btn-eliminar-foto"
                onClick={eliminarFoto}
              >
                Eliminar imagen
              </button>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="btn-cancelar"
            onClick={() => setModalEditar(false)}
          >
            Cancelar
          </button>
          <button 
            className="btn-guardar"
            onClick={editarReporte}
            disabled={cargando}
          >
            {cargando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEdicionReportes;