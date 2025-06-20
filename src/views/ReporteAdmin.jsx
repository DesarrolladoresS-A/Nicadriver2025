import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TablaReporte_Admin from "../components/reporte_admin/TablaReporte_Admin";
import { db } from "../database/firebaseconfig";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { autoTable } from 'jspdf-autotable';
import '../styles/ReporteAdmin.css';

const reporteAdmin = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarReportes = async () => {
            try {
                // Get data from reportes collection
                const qReportes = query(
                    collection(db, "reportes"),
                    orderBy("fechaHora", "desc")
                );
                const reportesSnapshot = await getDocs(qReportes);
                
                // Get data from TablaReportesdamin collection
                const qReportesAdmin = query(
                    collection(db, "TablaReportesdamin"),
                    orderBy("fechaHora", "desc")
                );
                const reportesAdminSnapshot = await getDocs(qReportesAdmin);
                
                const reportesData = [];
                
                // Process reportes collection
                reportesSnapshot.forEach((doc) => {
                    const reporte = {
                        id: doc.id,
                        fecha: formatearFechaHora(doc.data().fechaHora),
                        tipo: doc.data().titulo,
                        ubicacion: doc.data().ubicacion,
                        estado: doc.data().estado || "Pendiente",
                        detalles: doc.data().descripcion,
                        foto: doc.data().foto,
                        origen: 'reportes'
                    };
                    reportesData.push(reporte);
                });
                
                // Process TablaReportesdamin collection
                reportesAdminSnapshot.forEach((doc) => {
                    const reporte = {
                        id: doc.id,
                        fecha: formatearFechaHora(doc.data().fechaHora),
                        tipo: doc.data().titulo,
                        ubicacion: doc.data().ubicacion,
                        estado: doc.data().estado || "Pendiente",
                        detalles: doc.data().descripcion,
                        foto: doc.data().foto,
                        origen: 'TablaReportesdamin'
                    };
                    reportesData.push(reporte);
                });
                
                // Sort all reports by date
                reportesData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                
                setReportes(reportesData);
            } catch (error) {
                console.error("Error al cargar los reportes:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarReportes();
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

    // Función para generar PDF de todos los reportes
    const handleExportAllPDF = () => {
        try {
            // Crear documento
            const doc = new jsPDF();
            
            // Configurar encabezado con rectángulo y título
            doc.setFillColor(28, 41, 51);
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
            
            // Título centrado con texto blanco
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.text(
                "Reportes de Incidentes", 
                doc.internal.pageSize.getWidth() / 2, 
                18, 
                { align: "center" }
            );

            // Definir columnas y filas
            const columns = ["ID", "Fecha", "Tipo", "Ubicación", "Estado", "Detalles"];
            const rows = reportes.map((reporte, index) => [
                reporte.id,
                reporte.fecha,
                reporte.tipo,
                reporte.ubicacion,
                reporte.estado,
                reporte.detalles
            ]);

            // Configuración de la tabla
            autoTable(doc, {
                head: [columns],
                body: rows,
                startY: 48,
                theme: 'grid',
                styles: { 
                    fontSize: 10, 
                    cellPadding: 2,
                    textColor: [0, 0, 0]
                },
                headStyles: {
                    fillColor: [28, 41, 51],
                    textColor: [255, 255, 255]
                },
                margin: { top: 20, left: 14, right: 16 },
                tableWidth: 'auto',
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 'auto' },
                    4: { cellWidth: 'auto' },
                    5: { cellWidth: 'auto' }
                },
                didDrawPage: function (data) {
                    // Pie de página con número de página
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    doc.text(
                        `Página ${data.pageNumber} de ${pageCount}`,
                        doc.internal.pageSize.getWidth() / 2,
                        doc.internal.pageSize.getHeight() - 10,
                        { align: "center" }
                    );
                }
            });

            // Generar archivo con nombre basado en fecha
            const fecha = new Date();
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const nombreArchivo = `reportes_${dia}${mes}${anio}.pdf`;

            // Guardar PDF
            const pdfBlob = new Blob([doc.output()], { type: 'application/pdf' });
            saveAs(pdfBlob, nombreArchivo);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Error al generar el PDF. Por favor, intenta nuevamente.");
        }
    };

    // Función para generar Excel de todos los reportes
    const handleExportAllExcel = () => {
    try {
        // Crear datos para Excel
        const headers = ["ID", "Fecha", "Tipo", "Ubicación", "Estado", "Detalles"];
        const data = reportes.map(reporte => ({
            ID: reporte.id,
            Fecha: reporte.fecha,
            Tipo: reporte.tipo,
            Ubicación: reporte.ubicacion,
            Estado: reporte.estado,
            Detalles: reporte.detalles
        }));

        // Crear worksheet y workbook
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reportes");

        // Escribir y descargar
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([wbout], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(excelBlob, `reportes_todos.xlsx`);
    } catch (error) {
        console.error("Error al generar Excel:", error);
        alert("Error al generar el Excel. Por favor, intenta nuevamente.");
    }
};


    // Función para cambiar el estado de un reporte
    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            // Aquí necesitamos saber si el reporte viene de la colección 'reportes' o 'TablaReportesdamin'
            // Podemos obtener esto del objeto reporte, pero necesitamos encontrar el reporte en el estado
            const reporte = reportes.find(r => r.id === id);
            
            if (!reporte) {
                throw new Error('Reporte no encontrado');
            }

            const ref = doc(db, reporte.origen === 'reportes' ? 'reportes' : 'TablaReportesdamin', id);
            await updateDoc(ref, { estado: nuevoEstado });
            
            // Actualizar el estado local
            setReportes(prevReportes =>
                prevReportes.map(reporte =>
                    reporte.id === id ? { ...reporte, estado: nuevoEstado } : reporte
                )
            );
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert(
                error.code === "permission-denied"
                    ? "No tienes permisos para cambiar el estado. Contacta al administrador."
                    : "Hubo un error al cambiar el estado. Por favor, inténtalo de nuevo."
            );
        }
    };

    // Función para visualizar el reporte
    const handleVisualizar = (reporte) => {
        navigate(`/reporteAdmin/${reporte.id}/detalle`);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando reportes...</p>
            </div>
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
                    <button 
                        className="btn btn-success"
                        onClick={handleExportAllExcel}
                        title="Exportar todos a Excel"
                    >
                        <i className="bi bi-file-earmark-excel me-2"></i>
                        Excel (Todos)
                    </button>
                    <button 
                        className="btn btn-danger"
                        onClick={handleExportAllPDF}
                        title="Exportar todos a PDF"
                    >
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        PDF (Todos)
                    </button>
                </div>
            </div>
            
            <TablaReporte_Admin 
                reportes={reportes}
                onVisualizar={handleVisualizar}
                loading={loading}
                handleEstadoChange={handleEstadoChange}
            />
        </div>
    );
};

export default reporteAdmin;