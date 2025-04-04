import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";

const ModalEdicionReportes = ({ setModalEditar, reporte, actualizar }) => {
  const [titulo, setTitulo] = useState(reporte.titulo);
  const [descripcion, setDescripcion] = useState(reporte.descripcion);

  const editarReporte = async () => {
    const reporteRef = doc(db, "reportes", reporte.id);
    await updateDoc(reporteRef, { titulo, descripcion });
    setModalEditar(false);
    actualizar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        <h2 className="text-lg font-bold mb-4">Editar Reporte</h2>
        <input
          type="text"
          placeholder="Título"
          className="border p-2 mb-2 w-full"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          className="border p-2 mb-2 w-full"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={() => setModalEditar(false)} className="mr-2">
            Cancelar
          </button>
          <button onClick={editarReporte} className="bg-yellow-500 text-white px-4 py-2 rounded">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEdicionReportes;
