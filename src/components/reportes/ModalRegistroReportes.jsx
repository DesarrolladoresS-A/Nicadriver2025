import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../database/firebaseconfig"; // usa el storage inicializado

const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null);
  const [errores, setErrores] = useState({});

  const validarCampos = () => {
    const erroresTemp = {};
    if (!titulo.trim()) erroresTemp.titulo = "El título es obligatorio.";
    if (!ubicacion.trim()) erroresTemp.ubicacion = "La ubicación es obligatoria.";
    if (!descripcion.trim()) erroresTemp.descripcion = "La descripción es obligatoria.";
    if (!fechaHora) erroresTemp.fechaHora = "La fecha y hora son obligatorias.";
    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  const registrarReporte = async () => {
    if (!validarCampos()) return;

    const datosReporte = {
      titulo,
      descripcion,
      ubicacion,
      fechaHora,
    };

    try {
      if (foto) {
        const nombreArchivo = `${Date.now()}-${foto.name}`;
        const storageRef = ref(storage, `fotosReportes/${nombreArchivo}`);
        
        // Sube la imagen a Firebase Storage
        await uploadBytes(storageRef, foto);

        // Obtiene la URL de la imagen subida
        const urlFoto = await getDownloadURL(storageRef);

        // Añade la URL de la foto al reporte
        datosReporte.foto = urlFoto;
      }

      // Guarda el reporte en Firestore
      await addDoc(collection(db, "reportes"), datosReporte);

      // Actualiza la lista de reportes
      actualizar();

      // Cierra el modal de registro
      setModalRegistro(false);
    } catch (error) {
      console.error("Error al registrar reporte:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (file && !allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG o PNG');
      return;
    }
    console.log("Imagen seleccionada:", file); // Para depuración
    setFoto(file);
  };

  return (
    <div className="modal-overlay">
      <div className="registro-reporte-formulario">
        <h2>Registrar reporte</h2>

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
          <button onClick={() => setModalRegistro(false)}>Cancelar</button>
          <button onClick={registrarReporte}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;
