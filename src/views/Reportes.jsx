import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import ModalEdicionReportes from "../components/reportes/ModalEdicionReportes";
import ModalEliminarReportes from "../components/reportes/ModalEliminacionReportes";
import TablaReportes from "../components/reportes/TablaReportes";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  const obtenerReportes = async () => {
    const data = await getDocs(collection(db, "reportes"));
    setReportes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    obtenerReportes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gestión de reportes</h1>
      <button className="boton-flotante" onClick={() => setModalRegistro(true)}>
        Registrar Reporte
      </button>

      <TablaReportes
        reportes={reportes}
        setModalEditar={setModalEditar}
        setReporteSeleccionado={setReporteSeleccionado}
        setModalEliminar={setModalEliminar}
        setReporteSeleccionadoEliminar={setReporteSeleccionado}
      />
      {modalRegistro && (
        <ModalRegistroReportes
          setModalRegistro={setModalRegistro}
          actualizar={obtenerReportes}
        />
      )}
      {modalEditar && (
        <ModalEdicionReportes
          setModalEditar={setModalEditar}
          reporte={reporteSeleccionado}
          actualizar={obtenerReportes}
        />
      )}
      {modalEliminar && (
        <ModalEliminarReportes
          setModalEliminar={setModalEliminar}
          reporte={reporteSeleccionado}
          actualizar={obtenerReportes}
        />
      )}
    </div>
  );
};

export default Reportes;
