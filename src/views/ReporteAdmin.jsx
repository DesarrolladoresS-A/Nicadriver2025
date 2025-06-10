import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TablaReporte_Admin from "../components/reporte_admin/TablaReporte_Admin";
import { db } from "../database/firebaseconfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

const reporteAdmin = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarReportes = async () => {
            try {
                // Consulta para obtener todos los reportes ordenados por fecha
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

    // Función para formatear fechas
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

    // Función para generar PDF
    const handleExportPDF = (reporte) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text(`Reporte #${reporte.id}`, 10, 10);
        doc.text(`Fecha: ${reporte.fecha}`, 10, 20);
        doc.text(`Tipo: ${reporte.tipo}`, 10, 30);
        doc.text(`Ubicación: ${reporte.ubicacion}`, 10, 40);
        doc.text(`Estado: ${reporte.estado}`, 10, 50);
        doc.text(`Detalles: ${reporte.detalles}`, 10, 60);
        
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
                doc.addImage(imgData, "PNG", 10, 70, 180, 100);
                doc.save(`reporte_${reporte.id}.pdf`);
            };
        } else {
            doc.save(`reporte_${reporte.id}.pdf`);
        }
    };

    // Función para generar Excel
    const handleExportExcel = (reporte) => {
        const XLSX = window.XLSX;
        const data = [
            ["ID", "Fecha", "Tipo", "Ubicación", "Estado", "Detalles"],
            [reporte.id, reporte.fecha, reporte.tipo, reporte.ubicacion, reporte.estado, reporte.detalles]
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb, `reporte_${reporte.id}.xlsx`);
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
                <h2>Reportes Pendientes</h2>
            </div>
            
            <TablaReporte_Admin 
                reportes={reportes}
                onPDF={handleExportPDF}
                onExcel={handleExportExcel}
                onVisualizar={handleVisualizar}
                loading={loading}
            />
        </div>
    );
};

export default reporteAdmin;