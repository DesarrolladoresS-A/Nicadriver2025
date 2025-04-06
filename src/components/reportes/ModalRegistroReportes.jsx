import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [foto, setFoto] = useState(null); // Nota: aquí solo se guarda el archivo localmente

  const guardarReporte = async () => {
    if (!titulo || !descripcion || !ubicacion || !fechaHora) return;

    const nuevoReporte = {
      titulo,
      descripcion,
      ubicacion,
      fechaHora,
      // foto: aquí deberías subir a Firebase Storage y guardar la URL
    };

    

    await addDoc(collection(db, "reportes"), nuevoReporte);
    actualizar();
    setModalRegistro(false);
  };

  return (
    <div className="registro-reporte-formulario">
      <h2>Registrar reporte</h2>

      <div>
        <label>Título del incidente</label>
        <input
          type="text"
          placeholder="Título breve"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div>
        <label>Ubicación del incidente</label>
        <input
          type="text"
          placeholder="Ej. Calle 123, Zona A"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
        />
      </div>

      <div>
        <label>Descripción</label>
        <textarea
          placeholder="Describe lo sucedido"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div>
        <label>Fecha y hora del incidente</label>
        <input
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
        />
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
  );
};

export default ModalRegistroReportes;
