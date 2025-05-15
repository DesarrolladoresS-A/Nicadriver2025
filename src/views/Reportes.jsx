import React, { useState, useEffect } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import TablaReportes from "../components/reportes/TablaReportes";
import Paginacion from "../components/ordenamiento/Paginacion";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportes.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h1>Gestión de reportes</h1>
        <button 
          className="btn-registro"
          onClick={() => setModalRegistro(true)}
        >
          Registrar Reporte
        </button>
      </div>

      <div className="tabla-paginacion-container">
        <TablaReportes reportes={currentItems} />
        <Paginacion
          totalItems={reportes.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {modalRegistro && (
        <ModalRegistroReportes
          setModalRegistro={setModalRegistro}
          actualizar={obtenerReportes}
        />
      )}
    </div>
  );
};

export default Reportes;