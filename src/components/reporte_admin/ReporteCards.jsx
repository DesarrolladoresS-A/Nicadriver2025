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

  const onPDF = async (reporte) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 12;

      doc.setFontSize(18);
      doc.text(`Reporte: ${reporte.tipo || 'Sin título'}`, margin, 18);
      doc.setFontSize(12);

      let cursorY = 26;

      // Imagen (si existe)
      if (reporte.foto) {
        try {
          const dataUrl = await (async function getImageDataUrl(url) {
            const res = await fetch(url);
            const blob = await res.blob();
            const reader = new FileReader();
            return await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          })(reporte.foto);

          // Determinar tipo de imagen por el dataURL
          const imgType = typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

          // Calcular tamaño respetando márgenes
          const maxWidth = pageWidth - margin * 2;
          const imgWidth = maxWidth;
          const imgHeight = imgWidth * 0.56; // relación aprox. 16:9 para no exagerar

          doc.addImage(dataUrl, imgType, margin, cursorY, imgWidth, imgHeight);
          cursorY += imgHeight + 10;
        } catch (imgErr) {
          console.warn('No se pudo incorporar la imagen en el PDF:', imgErr);
        }
      }

      doc.text(`ID: ${reporte.id}`, margin, cursorY);
      cursorY += 8;
      doc.text(`Fecha: ${reporte.fecha}`, margin, cursorY);
      cursorY += 8;
      doc.text(`Estado: ${reporte.estado}`, margin, cursorY);
      cursorY += 8;
      doc.text(`Ubicación: ${reporte.ubicacion || 'Sin ubicación'}`, margin, cursorY);
      cursorY += 10;

      doc.text('Detalles:', margin, cursorY);
      cursorY += 6;
      const detalles = (reporte.detalles || '').toString();
      const lines = doc.splitTextToSize(detalles, pageWidth - margin * 2);
      doc.text(lines, margin, cursorY);

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
