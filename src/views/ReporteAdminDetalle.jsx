import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/firebaseconfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [perfilLoading, setPerfilLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 900);
    // Siempre obtener el documento completo para asegurar campos de usuario

    let isMounted = true;
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
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
              userUid: d.userUid || d.uid || null,
              userEmail: d.userEmail || null,
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

  useEffect(() => {
    let active = true;
    const cargarPerfil = async () => {
      if (!reporte) return;
      const uid = reporte.userUid || reporte.raw?.userUid || null;
      const yaTiene = reporte.raw?.userNombre || reporte.raw?.userApellido || reporte.raw?.userCedula;
      const emailDoc = reporte.userEmail || reporte.raw?.userEmail || null;
      if (!uid && !yaTiene && !emailDoc) {
        setPerfilUsuario(null);
        return;
      }
      if (yaTiene) {
        if (active) setPerfilUsuario({
          nombres: reporte.raw?.userNombre || null,
          apellidos: reporte.raw?.userApellido || null,
          cedula: reporte.raw?.userCedula || null,
          email: reporte.userEmail || reporte.raw?.userEmail || null,
        });
        return;
      }
      try {
        setPerfilLoading(true);
        if (uid) {
          const ref = doc(db, 'users', uid);
          const snap = await getDoc(ref);
          if (!active) return;
          if (snap.exists()) {
            const d = snap.data();
            setPerfilUsuario({
              nombres: d.nombres || d.nombre || d.firstName || d.primerNombre || d.fullname || d.fullName || d.displayName || null,
              apellidos: d.apellidos || d.apellido || d.lastName || d.segundoNombre || null,
              cedula: d.cedula || d.cédula || d.dni || d.identificacion || d.identification || d.ci || d.numeroCedula || null,
              email: d.email || reporte.userEmail || null,
            });
            return;
          }
        }
        if (!uid && emailDoc) {
          const q = query(collection(db, 'users'), where('email', '==', emailDoc));
          const qs = await getDocs(q);
          if (!active) return;
          if (!qs.empty) {
            const d = qs.docs[0].data();
            setPerfilUsuario({
              nombres: d.nombres || d.nombre || d.firstName || d.primerNombre || d.fullname || d.fullName || d.displayName || null,
              apellidos: d.apellidos || d.apellido || d.lastName || d.segundoNombre || null,
              cedula: d.cedula || d.cédula || d.dni || d.identificacion || d.identification || d.ci || d.numeroCedula || null,
              email: d.email || emailDoc,
            });
          } else {
            setPerfilUsuario({ email: emailDoc });
          }
        }
        if (!uid && !emailDoc) {
          setPerfilUsuario(null);
        }
      } catch (_) {
        if (active) setPerfilUsuario({ email: reporte.userEmail || null });
      } finally {
        if (active) setPerfilLoading(false);
      }
    };
    cargarPerfil();
    return () => { active = false; };
  }, [reporte]);

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
  const [openMenu, setOpenMenu] = useState(false);
  const estadoActual = String(reporte?.estado || '').toLowerCase();

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
                <span className="label">Usuario</span>
                <span className="valor">
                  {perfilLoading ? 'Cargando...' : (
                    (perfilUsuario?.nombres || perfilUsuario?.apellidos)
                      ? `${perfilUsuario?.nombres || ''} ${perfilUsuario?.apellidos || ''}`.trim()
                      : 'Desconocido'
                  )}
                </span>
              </div>
              <div className="detalle-item">
                <span className="label">Correo</span>
                <span className="valor">{perfilUsuario?.email || reporte.userEmail || reporte.raw?.userEmail || 'Sin correo'}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Cédula</span>
                <span className="valor">{perfilUsuario?.cedula || 'Sin cédula'}</span>
              </div>
            </div>
            <div className="detalle-descripcion">
              <span className="label">Detalles</span>
              <p>{reporte.detalles || 'Sin detalles'}</p>
            </div>

            <div className="detalle-acciones mt-3">
              <label className="label mb-2">Cambiar estado</label>
              <div className={`estado-dropdown ${openMenu ? 'open' : ''}`}>
                <button
                  type="button"
                  className={`estado-button ${estadoActual}`}
                  onClick={() => setOpenMenu((v) => !v)}
                >
                  {reporte.estado || 'Pendiente'} <i className="bi bi-caret-down-fill" style={{ marginLeft: 8 }}></i>
                </button>
                {openMenu && (
                  <div className="estado-menu" onMouseLeave={() => setOpenMenu(false)}>
                    <button className="estado-option pendiente" onClick={() => { setOpenMenu(false); handleEstadoChange('pendiente'); }}>Pendiente</button>
                    <button className="estado-option proceso" onClick={() => { setOpenMenu(false); handleEstadoChange('proceso'); }}>En proceso</button>
                    <button className="estado-option aceptado" onClick={() => { setOpenMenu(false); handleEstadoChange('aceptado'); }}>Aceptado</button>
                    <button className="estado-option rechazado" onClick={() => { setOpenMenu(false); handleEstadoChange('rechazado'); }}>Rechazado</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
