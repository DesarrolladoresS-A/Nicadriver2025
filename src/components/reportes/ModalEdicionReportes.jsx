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
    if (!titulo.trim()) erroresTemp.titulo = "El tipo de incidente es obligatorio.";
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

      if (foto) {
        try {
          const fotoBase64 = await convertirImagenABase64(foto);
          datosActualizados.foto = fotoBase64;
        } catch (error) {
          console.error("Error al convertir la imagen:", error);
        }
      } else if (fotoPrevia === null) {
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

      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPrevia(e.target.result);
      };
      reader.readAsDataURL(file);

      setFoto(file);
    } else {
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
          <label>Tipo de incidente</label>
          <select
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={errores.titulo ? 'campo-error' : ''}
          >
            <option value="">Seleccione un tipo de incidente</option>
            <optgroup label="Daños en la superficie de la vía">
              <option value="Baches">Baches</option>
              <option value="Fisuras o grietas">Fisuras o grietas</option>
              <option value="Hundimientos">Hundimientos</option>
              <option value="Deformaciones del pavimento">Deformaciones del pavimento</option>
              <option value="Desnivel entre carriles">Desnivel entre carriles</option>
            </optgroup>
            <optgroup label="Problemas de señalización">
              <option value="Señal de tránsito caída o ausente">Señal de tránsito caída o ausente</option>
              <option value="Señalización horizontal desgastada">Señalización horizontal desgastada</option>
              <option value="Señales confusas o ilegibles">Señales confusas o ilegibles</option>
              <option value="Semáforo dañado o fuera de servicio">Semáforo dañado o fuera de servicio</option>
            </optgroup>
            <optgroup label="Obstáculos en la vía">
              <option value="Escombros o materiales de construcción">Escombros o materiales de construcción</option>
              <option value="Árboles caídos">Árboles caídos</option>
              <option value="Animales sueltos">Animales sueltos</option>
              <option value="Vehículos abandonados">Vehículos abandonados</option>
              <option value="Acumulación de basura">Acumulación de basura</option>
            </optgroup>
            <optgroup label="Condiciones ambientales o estructurales">
              <option value="Inundación o charcos permanentes">Inundación o charcos permanentes</option>
              <option value="Erosión en cunetas o bordes de la vía">Erosión en cunetas o bordes de la vía</option>
              <option value="Deslizamientos de tierra">Deslizamientos de tierra</option>
              <option value="Falta de drenaje pluvial">Falta de drenaje pluvial</option>
              <option value="Derrumbes o grietas en taludes">Derrumbes o grietas en taludes</option>
            </optgroup>
            <optgroup label="Infraestructura dañada o faltante">
              <option value="Tapa de alcantarilla ausente o rota">Tapa de alcantarilla ausente o rota</option>
              <option value="Barandas de seguridad dañadas">Barandas de seguridad dañadas</option>
              <option value="Puentes o pasos elevados con fallas">Puentes o pasos elevados con fallas</option>
              <option value="Vallas caídas o mal colocadas">Vallas caídas o mal colocadas</option>
            </optgroup>
            <optgroup label="Problemas de iluminación">
              <option value="Luminarias apagadas o dañadas">Luminarias apagadas o dañadas</option>
              <option value="Poste inclinado o en riesgo de caída">Poste inclinado o en riesgo de caída</option>
              <option value="Cortocircuito visible">Cortocircuito visible</option>
            </optgroup>
            <optgroup label="Otros">
              <option value="Mal diseño vial">Mal diseño vial</option>
              <option value="Falta de pasos peatonales">Falta de pasos peatonales</option>
              <option value="Cruces peligrosos sin semáforo">Cruces peligrosos sin semáforo</option>
              <option value="Otro / No clasificado">Otro / No clasificado</option>
            </optgroup>
          </select>
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
