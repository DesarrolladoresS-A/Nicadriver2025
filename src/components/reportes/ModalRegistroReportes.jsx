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
    if (!validarCampos()) return;

    setCargando(true);

    try {
      let fotoBase64 = null;
      if (foto) {
        fotoBase64 = await convertirImagenABase64(foto);
      }

      const nuevoReporte = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        ubicacion: ubicacion.trim(),
        fechaHora,
        foto: fotoBase64,
        fechaRegistro: new Date().toISOString()
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
          <button className="close-modal-btn" onClick={() => setModalRegistro(false)}>×</button>
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
                style={{ maxWidth: '100px', maxHeight: '100px' }}
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
