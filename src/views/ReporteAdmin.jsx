import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TablaReporte_Admin from "../components/reporte_admin/TablaReporte_Admin";
import { db } from "../database/firebaseconfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './ReporteAdmin.css';

const reporteAdmin = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarReportes = async () => {
            try {
                const q = query(
                    collection(db, "reportes"),
                    orderBy("fechaHora", "desc")
                );
                
                const querySnapshot = await getDocs(q);
                const reportesData = [];
                
                querySnapshot.forEach((doc) => {
                    const reporte = {
                        id: doc.id,
                        fecha: formatearFechaHora(doc.data().fechaHora),
                        tipo: doc.data().titulo,
                        ubicacion: doc.data().ubicacion,
                        estado: doc.data().estado || "Pendiente",
                        detalles: doc.data().descripcion,
                        foto: doc.data().foto
                    };
                    reportesData.push(reporte);
                });
                
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
            const doc = new jsPDF({ orientation: 'landscape' });
            
            // Título
            doc.setFontSize(16);
            doc.text("Reportes de Incidentes", 20, 15);
            doc.setFontSize(12);
            
            // Encabezados
            const headers = [
                { label: 'ID', dataKey: 'id' },
                { label: 'Fecha', dataKey: 'fecha' },
                { label: 'Tipo', dataKey: 'tipo' },
                { label: 'Ubicación', dataKey: 'ubicacion' },
                { label: 'Estado', dataKey: 'estado' },
                { label: 'Detalles', dataKey: 'detalles' }
            ];

            // Generar encabezados
            let y = 30;
            headers.forEach((header, index) => {
                doc.text(header.label, 20 + (index * 50), y);
            });
            y += 15;

            // Generar datos
            reportes.forEach((reporte, rowIndex) => {
                doc.setFontSize(10);
                headers.forEach((header, colIndex) => {
                    const value = reporte[header.dataKey];
                    doc.text(value || '-', 20 + (colIndex * 50), y + (rowIndex * 10));
                });
            });
            y += (reportes.length + 1) * 10;

            // Agregar imágenes
            let imageCount = 0;
            reportes.forEach((reporte, index) => {
                if (reporte.foto) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = reporte.foto;
                    
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        const imgData = canvas.toDataURL("image/png");
                        
                        // Agregar nueva página para cada imagen
                        if (imageCount > 0 && imageCount % 3 === 0) {
                            doc.addPage();
                            y = 30;
                        }
                        
                        doc.addImage(imgData, "PNG", 10, y, 100, 50);
                        y += 60;
                        
                        // Guardar PDF cuando todas las imágenes estén procesadas
                        if (index === reportes.length - 1) {
                            const pdfBlob = new Blob([doc.output()], { type: 'application/pdf' });
                            saveAs(pdfBlob, `reportes_todos.pdf`);
                        }
                    };
                    imageCount++;
                }
            });
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
            const data = [headers, ...reportes.map(reporte => [
                reporte.id,
                reporte.fecha,
                reporte.tipo,
                reporte.ubicacion,
                reporte.estado,
                reporte.detalles
            ])];

            // Crear worksheet principal
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Reportes");

            // Agregar imágenes
            let imageCount = 0;
            reportes.forEach((reporte, index) => {
                if (reporte.foto) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = reporte.foto;
                    
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        const imgData = canvas.toDataURL("image/png");
                        
                        // Crear worksheet para la imagen
                        const imgWs = XLSX.utils.json_to_sheet([]);
                        
                        // Agregar la imagen
                        XLSX.utils.sheet_add_aoa(imgWs, [["Imagen"]], { origin: 'A1' });
                        
                        // Agregar la imagen usando XLSX
                        XLSX.utils.add_image(imgWs, {
                            image: imgData,
                            type: "base64",
                            position: { col: 1, row: 1 },
                            size: { width: 100, height: 50 }
                        });
                        
                        // Agregar worksheet con la imagen
                        XLSX.utils.book_append_sheet(wb, imgWs, `Imagen_${imageCount + 1}`);
                        
                        // Guardar Excel cuando todas las imágenes estén procesadas
                        if (index === reportes.length - 1) {
                            const wbout = XLSX.write(wb, { 
                                bookType: 'xlsx', 
                                type: 'array' 
                            });
                            const excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                            saveAs(excelBlob, `reportes_todos.xlsx`);
                        }
                    };
                    imageCount++;
                }
            });
        } catch (error) {
            console.error("Error al generar Excel:", error);
            alert("Error al generar el Excel. Por favor, intenta nuevamente.");
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
            />
        </div>
    );
};

export default reporteAdmin;