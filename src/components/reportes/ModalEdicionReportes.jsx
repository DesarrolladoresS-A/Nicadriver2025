import React, { useState, useEffect } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../database/firebaseconfig";

const ModalEdicionReportes = ({ setModalEditar, reporte, actualizar }) => {
  const [titulo, setTitulo] = useState(reporte.titulo || "");
  const [descripcion, setDescripcion] = useState(reporte.descripcion || "");
  const [ubicacion, setUbicacion] = useState(reporte.ubicacion || "");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  const [errores, setErrores] = useState({});

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

  const editarReporte = async () => {
    if (!validarCampos()) return;

    const reporteRef = doc(db, "reportes", reporte.id);
    let datosActualizados = {
      titulo,
      descripcion,
      ubicacion,
      fechaHora: new Date(fechaHora), // Conversión importante
    };

    try {
      if (foto) {
        try {
          const nombreArchivo = `${Date.now()}-${foto.name}`;
          const storageRef = ref(storage, `fotosReportes/${nombreArchivo}`);
          await uploadBytes(storageRef, foto);
          const urlFoto = await getDownloadURL(storageRef);
          datosActualizados.foto = urlFoto;
        } catch (error) {
          console.error("Error al subir la imagen:", error);
          // Mostrar un mensaje de error o manejar el fallo de alguna manera
        }
      }

      await updateDoc(reporteRef, datosActualizados);
      actualizar();            // Refrescar la lista
      setModalEditar(false);   // Cerrar modal
    } catch (error) {
      console.error("Error al editar el reporte:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(file); // Verifica si el archivo está correctamente cargado
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (file && !allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG o PNG');
      return;
    }
    setFoto(file);
  };
  

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <h2>Editar reporte</h2>

        <div>
          <label>Título del incidente</label>
          <input
            type="text"
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
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className={`input ${errores.ubicacion ? "input-error shake" : ubicacion ? "input-success" : ""}`}
          />
          {errores.ubicacion && <p className="error-message">{errores.ubicacion}</p>}
        </div>

        <div>
          <label>Descripción del incidente</label>
          <textarea
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
          <label>Foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => setModalEditar(false)}>Cancelar</button>
          <button onClick={editarReporte}>Guardar cambios</button>

        </div>
      </div>
    </div>
  );
};

export default ModalEdicionReportes;
