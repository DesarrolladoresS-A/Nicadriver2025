// src/components/CuadrosDeReportes.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/firebaseconfig";
import jsPDF from "jspdf";

import "../App.css";

const CuadrosDeReportes = () => {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const fetchReportes = async () => {
      const snapshot = await getDocs(collection(db, "reportes"));
      const reportesArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReportes(reportesArray);
    };

    fetchReportes();
  }, []);

  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return "Sin fecha";
    const fecha = fechaHora.toDate
      ? fechaHora.toDate()
      : new Date(fechaHora);
    return fecha.toLocaleString("es-NI");
  };

  const generarPDF = (reporte) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte de Incidente", 20, 20);
    doc.text(`Título: ${reporte.titulo}`, 20, 30);
    doc.text(`Ubicación: ${reporte.ubicacion}`, 20, 40);
    doc.text(`Descripción: ${reporte.descripcion}`, 20, 50);
    doc.text(`Fecha y Hora: ${formatearFechaHora(reporte.fechaHora)}`, 20, 60);
    doc.save(`${reporte.titulo}.pdf`);
  };

  return (
    <div className="cuadros-container">
      <h2>Documentos de Reportes</h2>
      <div className="cuadros-grid">
        {reportes.map((reporte) => (
          <div
            key={reporte.id}
            className="cuadro-reporte"
            onClick={() => generarPDF(reporte)}
          >
            <i className="bi bi-file-earmark-pdf-fill icono-pdf" />
            <h4>{reporte.titulo}</h4>
            <p>{formatearFechaHora(reporte.fechaHora)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuadrosDeReportes;
