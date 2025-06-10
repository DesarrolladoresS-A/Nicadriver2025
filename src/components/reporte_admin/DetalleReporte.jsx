import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

const DetalleReporte = ({ 
    show, 
    handleClose, 
    reporte = {},
    onPDF,
    onExcel
}) => {
    if (!reporte || !reporte.id) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalle del Reporte #{reporte.id}</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <div className="detalle-reporte-container">
                    <div className="detalle-seccion">
                        <h5>Información Básica</h5>
                        <div className="detalle-item">
                            <span className="label">Fecha:</span>
                            <span className="value">{reporte.fecha || "Sin fecha"}</span>
                        </div>
                        <div className="detalle-item">
                            <span className="label">Tipo:</span>
                            <span className="value">{reporte.tipo || "Sin tipo"}</span>
                        </div>
                        <div className="detalle-item">
                            <span className="label">Ubicación:</span>
                            <span className="value">{reporte.ubicacion || "Sin ubicación"}</span>
                        </div>
                        <div className="detalle-item">
                            <span className="label">Estado:</span>
                            <span className="value">{reporte.estado || "Sin estado"}</span>
                        </div>
                    </div>

                    <div className="detalle-seccion mt-4">
                        <h5>Detalles del Reporte</h5>
                        <div className="detalle-item">
                            <span className="label">Descripción:</span>
                            <span className="value">{reporte.detalles || "Sin detalles"}</span>
                        </div>
                    </div>

                    {reporte.foto && (
                        <div className="detalle-seccion mt-4">
                            <h5>Evidencia</h5>
                            <div className="evidencia-container">
                                <img 
                                    src={reporte.foto} 
                                    alt="Evidencia del reporte" 
                                    className="evidencia-img"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
                <Button variant="success" onClick={() => onExcel(reporte)}>
                    <FaFileExcel /> Excel
                </Button>
                <Button variant="danger" onClick={() => onPDF(reporte)}>
                    <FaFilePdf /> PDF
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleReporte;
