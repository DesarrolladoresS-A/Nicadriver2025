import React, { useState, useEffect, useMemo } from "react";
import { db } from "../database/firebaseconfig";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../database/authcontext";
import ModalRegistroReportes from "../components/reportes/ModalRegistroReportes";
import Paginacion from "../components/ordenamiento/Paginacion";
import ReporteCards from "../components/reporte_admin/ReporteCards";
import LoaderTractor from "../components/common/LoaderTractor";
import { FaSearch, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import "../styles/Reporte.css";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  const [modalRegistro, setModalRegistro] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [errorEliminacion, setErrorEliminacion] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const { user } = useAuth();
  const obtenerReportes = async () => {
    // Mantenemos esta función para compatibilidad con "actualizar",
    // pero la fuente principal será onSnapshot. Forzamos un refetch simple.
    if (!user?.email) {
      setReportes([]);
      setReportesFiltrados([]);
      return;
    }
    try {
      const data = await getDocs(query(collection(db, "reportes"), where("userEmail", "==", user.email)));
      const propios = data.docs.map((docu) => ({ ...docu.data(), id: docu.id }));
      propios.sort((a, b) => {
        const getTime = (x) => {
          try {
            if (x?.fechaRegistro) return new Date(x.fechaRegistro).getTime();
            if (x?.fechaHora?.toDate) return x.fechaHora.toDate().getTime();
            if (x?.fechaHora?.seconds) return x.fechaHora.seconds * 1000;
            if (x?.fechaHora) return new Date(x.fechaHora).getTime();
          } catch (_) {}
          return 0;
        };
        return getTime(b) - getTime(a);
      });
      setReportes(propios);
      setReportesFiltrados(propios);
    } catch (error) {
      console.error("Error al obtener los reportes (refetch):", error);
      setErrorEliminacion(
        error.code === "permission-denied"
          ? "No tienes permisos para ver los reportes. Contacta al administrador."
          : "Hubo un error al cargar los reportes. Por favor, inténtalo de nuevo."
      );
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), 700);
    // Suscripción en tiempo real filtrada por usuario
    setErrorEliminacion(null);
    setLoading(true);
    
    if (!user?.email) {
      // Si no hay usuario, limpiamos y dejamos de cargar
      setReportes([]);
      setReportesFiltrados([]);
      setLoading(false);
      return () => clearTimeout(t);
    }

    const q = query(collection(db, "reportes"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const propios = snapshot.docs.map((docu) => ({ ...docu.data(), id: docu.id }));
        propios.sort((a, b) => {
          const getTime = (x) => {
            try {
              if (x?.fechaRegistro) return new Date(x.fechaRegistro).getTime();
              if (x?.fechaHora?.toDate) return x.fechaHora.toDate().getTime();
              if (x?.fechaHora?.seconds) return x.fechaHora.seconds * 1000;
              if (x?.fechaHora) return new Date(x.fechaHora).getTime();
            } catch (_) {}
            return 0;
          };
          return getTime(b) - getTime(a);
        });
        setReportes(propios);
        setReportesFiltrados(propios);
        setLoading(false);
      },
      (error) => {
        console.error("Error en suscripción de reportes:", error);
        setErrorEliminacion(
          error.code === "permission-denied"
            ? "No tienes permisos para ver los reportes. Contacta al administrador."
            : "Hubo un error al cargar los reportes. Por favor, inténtalo de nuevo."
        );
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(t);
      unsubscribe();
    };
  }, [user?.email]);

  useEffect(() => {
    if (busqueda.trim() === "") {
      setReportesFiltrados(reportes);
      setFiltroActivo(false);
    } else {
      const resultados = reportes.filter((reporte) => {
        const q = busqueda.toLowerCase();
        const t = (reporte.titulo || "").toLowerCase();
        const u = (reporte.ubicacion || "").toLowerCase();
        const d = (reporte.descripcion || "").toLowerCase();
        return t.includes(q) || u.includes(q) || d.includes(q);
      });
      setReportesFiltrados(resultados);
      setFiltroActivo(true);
    }
    setCurrentPage(1);
  }, [busqueda, reportes]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroActivo(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportesFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const mostrarInicio = reportesFiltrados.length === 0 ? 0 : indexOfFirstItem + 1;
  const mostrarFin = Math.min(indexOfLastItem, reportesFiltrados.length);

  const actualizarReportes = () => {
    obtenerReportes();
  };

  const tarjetas = useMemo(() => {
    // Mapear a la estructura usada por ReporteCards (como en admin)
    return reportesFiltrados.map((r) => {
      // fecha a string legible
      const fecha = (() => {
        try {
          if (r.fechaHora && typeof r.fechaHora === 'object' && r.fechaHora.toDate) {
            return r.fechaHora.toDate().toLocaleString('es-NI');
          }
          if (r.fechaRegistro) return new Date(r.fechaRegistro).toLocaleString('es-NI');
          if (r.fechaHora) return new Date(r.fechaHora).toLocaleString('es-NI');
        } catch (_) {}
        return 'Sin fecha y hora';
      })();
      return {
        id: r.id,
        fecha,
        tipo: r.titulo,
        ubicacion: r.ubicacion,
        estado: r.estado || 'pendiente',
        detalles: r.descripcion,
        foto: r.foto,
      };
    });
  }, [reportesFiltrados]);

  if (loading || !minDelayDone) {
    return <LoaderTractor mensaje="Cargando tus reportes..." overlay={true} />;
  }

  return (
    <div className="reportes-container bg-background text-foreground full-bleed">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading state */}
        {/* Loader manejado arriba con LoaderTractor */}

        {/* Error message */}
        {errorEliminacion && (
          <div className="error-message card p-4 rounded-lg" style={{ backgroundColor: '#ffebee', color: '#f44336' }}>
            <FaExclamationTriangle style={{ marginRight: '10px' }} />
            {errorEliminacion}
          </div>
        )}

        <div className="reportes-header flex flex-col gap-4">
          <div className="header-title">
            <h1 className="text-3xl font-bold">Gestión de Reportes</h1>
            <p className="subtitle text-muted-foreground">Administra y revisa todos los reportes de incidentes</p>
          </div>

          <div className="header-controls flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Barra de búsqueda */}
            <div className="search-container card p-2 rounded-lg flex-1">
              <div className="search-icon">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Buscar reportes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
                disabled={loading}
              />
              {filtroActivo && (
                <button 
                  onClick={limpiarFiltros}
                  className="clear-filter-btn btn btn-outline btn-sm"
                  disabled={loading}
                >
                  Limpiar
                </button>
              )}
            </div>
            
            {/* Botón de registro y selector de cantidad por página */
            }
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Por página:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="form-select"
                disabled={loading}
                style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
              <button 
                className="btn btn-default btn-md"
                onClick={() => setModalRegistro(true)}
                disabled={loading}
              >
                <FaPlus /> Nuevo Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        <div className="stats-container grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="stat-card">
            <h3>Total Reportes</h3>
            <p>{reportes.length}</p>
          </div>
          <div className="stat-card">
            <h3>Mostrando</h3>
            <p>{mostrarInicio}–{mostrarFin} de {reportesFiltrados.length}</p>
          </div>
          <div className="stat-card">
            <h3>Página Actual</h3>
            <p>{currentPage} de {Math.ceil(reportesFiltrados.length / itemsPerPage)}</p>
          </div>
        </div>

        {/* Mensajes de estado */}
        {!user?.email && (
          <div className="no-reports-message card p-8 rounded-xl text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <h3>Inicia sesión para ver tus reportes</h3>
            <p>Ingresa con tu cuenta para crear y visualizar tus reportes.</p>
          </div>
        )}

        {user?.email && (!loading && reportes.length === 0) && (
          <div className="no-reports-message card p-8 rounded-xl text-center" style={{ backgroundColor: '#f8f9fa' }}>
            <FaPlus style={{ fontSize: '48px', color: '#1e3d87' }} />
            <h3>No hay reportes disponibles</h3>
            <p>¡Crea tu primer reporte haciendo clic en el botón "Nuevo Reporte"!</p>
          </div>
        )}

        {/* Tarjetas y paginación */}
        <div className="card p-4 rounded-xl mt-4">
          <ReporteCards reportes={currentItems.map((r) => tarjetas.find(t => t.id === r.id) || r)} />

          {reportesFiltrados.length > 0 ? (
            <Paginacion
              totalItems={reportesFiltrados.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          ) : (
            <div className="no-results text-center text-muted-foreground">
              <p>No se encontraron reportes con los criterios de búsqueda</p>
              <button className="btn btn-outline btn-sm" onClick={limpiarFiltros} disabled={loading}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Modales */}
        {modalRegistro && (
          <ModalRegistroReportes
            setModalRegistro={setModalRegistro}
            actualizar={actualizarReportes}
          />
        )}
      </div>
    </div>
  );
};

export default Reportes;