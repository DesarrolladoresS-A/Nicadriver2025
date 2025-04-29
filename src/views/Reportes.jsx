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
  const [reporteSeleccionadoEditar, setReporteSeleccionadoEditar] = useState(null);
  const [reporteSeleccionadoEliminar, setReporteSeleccionadoEliminar] = useState(null);

  const obtenerReportes = async () => {
    try {
      const data = await getDocs(collection(db, "reportes"));
      setReportes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
    }
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
        setReporteSeleccionado={setReporteSeleccionadoEditar}
        setModalEliminar={setModalEliminar}
        setReporteSeleccionadoEliminar={setReporteSeleccionadoEliminar}
      />

      {modalRegistro && (
        <ModalRegistroReportes
          setModalRegistro={setModalRegistro}
          actualizar={obtenerReportes}
        />
      )}

      {modalEditar && reporteSeleccionadoEditar && (
        <ModalEdicionReportes
          setModalEditar={setModalEditar}
          reporte={reporteSeleccionadoEditar}
          actualizar={obtenerReportes}
        />
      )}

      {modalEliminar && reporteSeleccionadoEliminar && (
        <ModalEliminarReportes
          setModalEliminar={setModalEliminar}
          reporte={reporteSeleccionadoEliminar}
          actualizar={obtenerReportes}
        />
      )}
    </div>
  );
};

export default Reportes;
