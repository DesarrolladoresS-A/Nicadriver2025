import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/firebaseconfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/ReporteAdminDetalle.css';
import LoaderTractor from '../components/common/LoaderTractor';

const formatoFecha = (fechaHora) => {
  try {
    if (!fechaHora) return 'Sin fecha y hora';
    const fecha = fechaHora.toDate
      ? fechaHora.toDate()
      : fechaHora.seconds
      ? new Date(fechaHora.seconds * 1000)
      : new Date(fechaHora);
    return fecha.toLocaleString('es-NI', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Fecha inválida';
  }
};

export default function ReporteAdminDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const reporteState = state?.reporte;

  const [reporte, setReporte] = useState(reporteState || null);
  const [loading, setLoading] = useState(!reporteState);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 900);
    if (reporteState) return; // ya tenemos los datos por state

    let isMounted = true;
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        // Intentar en ambas colecciones
        const tryFetch = async (col) => {
          const ref = doc(db, col, id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data();
            return {
              id: snap.id,
              fecha: formatoFecha(d.fechaHora),
              tipo: d.titulo,
              ubicacion: d.ubicacion,
              estado: d.estado || 'Pendiente',
              detalles: d.descripcion,
              foto: d.foto,
              origen: col,
              raw: d,
            };
          }
          return null;
        };

        const deReportes = await tryFetch('reportes');
        const deAdmin = !deReportes ? await tryFetch('TablaReportesdamin') : null;
        const found = deReportes || deAdmin;
        if (!found) throw new Error('No se encontró el reporte');
        if (isMounted) setReporte(found);
      } catch (e) {
        console.error(e);
        if (isMounted) setError('No se pudo cargar el reporte.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargar();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id, reporteState]);

  const handleEstadoChange = async (nuevoEstado) => {
    try {
      if (!reporte?.id) return;
      const col = reporte.origen === 'TablaReportesdamin' ? 'TablaReportesdamin' : 'reportes';
      const ref = doc(db, col, reporte.id);
      await updateDoc(ref, { estado: nuevoEstado });
      setReporte((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
    } catch (e) {
      console.error('Error al actualizar estado:', e);
      alert(
        e.code === 'permission-denied'
          ? 'No tienes permisos para cambiar el estado. Contacta al administrador.'
          : 'Hubo un error al cambiar el estado. Por favor, inténtalo de nuevo.'
      );
    }
  };

  const titulo = useMemo(() => reporte?.tipo || 'Detalle del reporte', [reporte]);

  return (
    <div className="detalle-container">
      <div className="detalle-header">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Volver
        </button>
        <h2 className="detalle-titulo" title={titulo}>{titulo}</h2>
      </div>

      {(loading || !minDelayDone) && (
        <LoaderTractor mensaje="Cargando reporte..." overlay={true} />
      )}

      {error && !loading && (
        <div className="detalle-error">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {reporte && !loading && (
        <div className="detalle-card">
          {reporte.foto ? (
            <div className="detalle-media">
              <img src={reporte.foto} alt={reporte.tipo || 'Reporte'} />
            </div>
          ) : null}

          <div className="detalle-info">
            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="label">Estado</span>
                <span className={`valor badge ${String(reporte.estado || '').toLowerCase()}`}>{reporte.estado}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Fecha</span>
                <span className="valor">{reporte.fecha}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Ubicación</span>
                <span className="valor" title={reporte.ubicacion}>{reporte.ubicacion || 'Sin ubicación'}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Origen</span>
                <span className="valor">{reporte.origen || 'reportes'}</span>
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="detalle-acciones mt-3">
              <label className="label mb-2">Cambiar estado</label>
              <select
                className="form-select estado-select"
                value={String(reporte.estado || '').toLowerCase()}
                onChange={(e) => handleEstadoChange(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="proceso">En proceso</option>
                <option value="aceptado">Aceptado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <div className="detalle-descripcion">
              <span className="label">Detalles</span>
              <p>{reporte.detalles || 'Sin detalles'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
