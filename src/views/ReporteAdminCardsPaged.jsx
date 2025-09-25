import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ReporteCards from "../components/reporte_admin/ReporteCards";
import Paginacion from "../components/ordenamiento/Paginacion";
import { db } from "../database/firebaseconfig";
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { autoTable } from 'jspdf-autotable';
import '../styles/ReporteAdmin.css';
import '../styles/Administrador.css';
import LoaderTractor from "../components/common/LoaderTractor";

const ReporteAdminCardsPaged = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minDelayDone, setMinDelayDone] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState(null); // 'pendiente' | 'proceso' | 'aceptado' | 'rechazado' | null
  const itemsPerPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), 900);
    
    const cargarReportes = async () => {
      try {
        const qReportes = query(
          collection(db, "reportes"),
          orderBy("fechaHora", "desc")
        );
        const reportesSnapshot = await getDocs(qReportes);

        const qReportesAdmin = query(
          collection(db, "TablaReportesdamin"),
          orderBy("fechaHora", "desc")
        );
        const reportesAdminSnapshot = await getDocs(qReportesAdmin);

        const reportesData = [];

        reportesSnapshot.forEach((d) => {
          const data = d.data();
          reportesData.push({
            id: d.id,
            fecha: formatearFechaHora(data.fechaHora),
            tipo: data.titulo,
            ubicacion: data.ubicacion,
            estado: data.estado || "Pendiente",
            detalles: data.descripcion,
            foto: data.foto,
            origen: 'reportes'
          });
        });

        reportesAdminSnapshot.forEach((d) => {
          const data = d.data();
          reportesData.push({
            id: d.id,
            fecha: formatearFechaHora(data.fechaHora),
            tipo: data.titulo,
            ubicacion: data.ubicacion,
            estado: data.estado || "Pendiente",
            detalles: data.descripcion,
            foto: data.foto,
            origen: 'TablaReportesdamin'
          });
        });

        reportesData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setReportes(reportesData);
      } catch (error) {
        console.error("Error al cargar los reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarReportes();
    return () => clearTimeout(timer);
  }, []);

  const formatearFechaHora = (fechaHora) => {
    try {
      if (!fechaHora) return "Sin fecha y hora";
      const fecha = fechaHora.toDate
        ? fechaHora.toDate()
        : fechaHora.seconds
        ? new Date(fechaHora.seconds * 1000)
        : new Date(fechaHora);
      return fecha.toLocaleString("es-NI", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Error de fecha";
    }
  };

  const handleExportAllPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(28, 41, 51);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("Reportes de Incidentes", doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });

      const columns = ["ID", "Fecha", "Tipo", "Ubicación", "Estado", "Detalles"];
      const rows = reportes.map((reporte) => [
        reporte.id,
        reporte.fecha,
        reporte.tipo,
        reporte.ubicacion,
        reporte.estado,
        reporte.detalles,
      ]);

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 48,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, textColor: [0, 0, 0] },
        headStyles: { fillColor: [28, 41, 51], textColor: [255, 255, 255] },
        margin: { top: 20, left: 14, right: 16 },
        tableWidth: 'auto',
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        },
      });

      const fecha = new Date();
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      const nombreArchivo = `reportes_${dia}${mes}${anio}.pdf`;
      const pdfBlob = new Blob([doc.output()], { type: 'application/pdf' });
      saveAs(pdfBlob, nombreArchivo);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor, intenta nuevamente.");
    }
  };

  const handleExportAllExcel = () => {
    try {
      const data = reportes.map((reporte) => ({
        ID: reporte.id,
        Fecha: reporte.fecha,
        Tipo: reporte.tipo,
        Ubicación: reporte.ubicacion,
        Estado: reporte.estado,
        Detalles: reporte.detalles,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reportes");
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(excelBlob, `reportes_todos.xlsx`);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      alert("Error al generar el Excel. Por favor, intenta nuevamente.");
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      const reporte = reportes.find((r) => r.id === id);
      if (!reporte) throw new Error('Reporte no encontrado');
      const ref = doc(db, reporte.origen === 'reportes' ? 'reportes' : 'TablaReportesdamin', id);
      await updateDoc(ref, { estado: nuevoEstado });
      setReportes((prev) => prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r)));
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert(
        error.code === "permission-denied"
          ? "No tienes permisos para cambiar el estado. Contacta al administrador."
          : "Hubo un error al cambiar el estado. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleVisualizar = (reporte) => {
    navigate(`/reporteAdmin/${reporte.id}/detalle`, { state: { reporte } });
  };

  // Aplicar búsqueda y filtro por estado
  const reportesFiltrados = reportes
    .filter((r) => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      return (
        (r.tipo || "").toLowerCase().includes(q) ||
        (r.ubicacion || "").toLowerCase().includes(q) ||
        (r.detalles || "").toLowerCase().includes(q)
      );
    })
    .filter((r) => {
      if (!filtroEstado) return true;
      return String(r.estado || '').toLowerCase() === filtroEstado;
    });

  // Reiniciar a la primera página cuando cambie la búsqueda, el total o el filtro de estado
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, reportes.length, filtroEstado]);

  const toggleFiltro = (estado) => {
    setFiltroEstado((prev) => (prev === estado ? null : estado));
  };

  const totalItems = reportesFiltrados.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReportes = reportesFiltrados.slice(startIndex, startIndex + itemsPerPage);

  if (loading || !minDelayDone) {
    return (
      <LoaderTractor mensaje="Cargando reportes..." overlay={true} />
    );
  }

  return (
    <div className="reporte-admin-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex flex-column">
          <h2 className="mb-0">Reportes de Incidentes</h2>
          <small className="text-muted">Administración de reportes</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleExportAllExcel} title="Exportar todos a Excel">
            <i className="bi bi-file-earmark-excel me-2"></i> Excel (Todos)
          </button>
          <button className="btn btn-danger" onClick={handleExportAllPDF} title="Exportar todos a PDF">
            <i className="bi bi-file-earmark-pdf me-2"></i> PDF (Todos)
          </button>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por tipo, ubicación o detalles..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros por estado (estilo similar al Administrador) */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          className={`action-btn btn btn-nuevos ${filtroEstado === 'pendiente' ? 'active' : ''}`}
          onClick={() => toggleFiltro('pendiente')}
          aria-pressed={filtroEstado === 'pendiente'}
          title="Mostrar reportes nuevos"
        >
          <i className="bi bi-file-earmark-plus-fill me-2"></i>Nuevos
        </button>
        <button
          className={`action-btn btn btn-proceso ${filtroEstado === 'proceso' ? 'active' : ''}`}
          onClick={() => toggleFiltro('proceso')}
          aria-pressed={filtroEstado === 'proceso'}
          title="Mostrar reportes en proceso"
        >
          <i className="bi bi-arrow-repeat me-2"></i>Proceso
        </button>
        <button
          className={`action-btn btn btn-aceptado ${filtroEstado === 'aceptado' ? 'active' : ''}`}
          onClick={() => toggleFiltro('aceptado')}
          aria-pressed={filtroEstado === 'aceptado'}
          title="Mostrar reportes aceptados"
        >
          <i className="bi bi-check-circle-fill me-2"></i>Aceptado
        </button>
        <button
          className={`action-btn btn btn-rechazado ${filtroEstado === 'rechazado' ? 'active' : ''}`}
          onClick={() => toggleFiltro('rechazado')}
          aria-pressed={filtroEstado === 'rechazado'}
          title="Mostrar reportes rechazados"
        >
          <i className="bi bi-x-circle-fill me-2"></i>Rechazado
        </button>
      </div>

      <ReporteCards reportes={currentReportes} onVisualizar={handleVisualizar} />

      {totalItems > itemsPerPage && (
        <div className="d-flex justify-content-center mt-4">
          <Paginacion
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ReporteAdminCardsPaged;
