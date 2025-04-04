import React, { useState } from "react";
import { db } from "../../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const ModalRegistroReportes = ({ setModalRegistro, actualizar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const guardarReporte = async () => {
    await addDoc(collection(db, "reportes"), { titulo, descripcion });
    setModalRegistro(false);
    actualizar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        <h2 className="text-lg font-bold mb-4">Registrar Reporte</h2>
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
          <button onClick={() => setModalRegistro(false)} className="mr-2">
            Cancelar
          </button>
          <button onClick={guardarReporte} className="bg-blue-500 text-white px-4 py-2 rounded">
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRegistroReportes;
