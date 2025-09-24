import React, { useMemo } from 'react';
import { FaFilePdf, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import '../../styles/ReporteCards.css';

const estadoClase = (estadoRaw) => {
  const estado = (estadoRaw || '').toString().toLowerCase();
  if (estado === 'aceptado' || estado === 'aprobado') return 'estado aceptado';
  if (estado === 'rechazado') return 'estado rechazado';
  if (estado === 'proceso' || estado === 'en proceso') return 'estado proceso';
  return 'estado pendiente';
};

const ReporteCards = ({ reportes = [], onVisualizar = () => {} }) => {
  const elementos = useMemo(() => reportes, [reportes]);

  const onPDF = (reporte) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Reporte: ${reporte.tipo}`, 10, 16);
      doc.setFontSize(12);
      doc.text(`ID: ${reporte.id}`, 10, 26);
      doc.text(`Fecha: ${reporte.fecha}`, 10, 34);
      doc.text(`Estado: ${reporte.estado}`, 10, 42);
      doc.text(`Ubicación: ${reporte.ubicacion || 'Sin ubicación'}`, 10, 50);
      doc.text('Detalles:', 10, 60);
      const detalles = (reporte.detalles || '').toString();
      const lines = doc.splitTextToSize(detalles, 180);
      doc.text(lines, 10, 68);
      doc.save(`reporte_${reporte.id}.pdf`);
    } catch (e) {
      console.error('Error al generar PDF:', e);
    }
  };

  if (!elementos || elementos.length === 0) {
    return (
      <div className="cards-empty">No hay reportes para mostrar</div>
    );
  }

  return (
    <div className="reporte-cards-grid">
      {elementos.map((r) => (
        <article key={r.id} className="reporte-card-item">
          <div className="card-inner">
            <div className="card-media">
              {r.foto ? (
                <img src={r.foto} alt={r.tipo || 'Reporte'} loading="lazy" />
              ) : (
                <div className="no-image">Sin imagen</div>
              )}
              <span className={estadoClase(r.estado)}>{r.estado || 'pendiente'}</span>
            </div>
            <div className="card-body">
              <h3 className="card-title" title={r.tipo}>{r.tipo}</h3>
              <div className="card-meta">
                <div className="meta-row">
                  <span className="meta-label">Ubicación</span>
                  <span className="meta-value" title={r.ubicacion}>{r.ubicacion || 'Sin ubicación'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Fecha</span>
                  <span className="meta-value">{r.fecha}</span>
                </div>
              </div>
              <p className="card-detalles" title={r.detalles}>{r.detalles || 'Sin detalles'}</p>
            </div>
            <div className="card-actions">
              <button className="btn-ver" onClick={() => onVisualizar(r)}>
                <FaEye /> Ver más
              </button>
              <button className="btn-pdf" onClick={() => onPDF(r)}>
                <FaFilePdf /> PDF
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ReporteCards;
