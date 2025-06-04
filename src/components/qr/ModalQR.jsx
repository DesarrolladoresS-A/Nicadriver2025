import React from "react";
import { Modal, Button } from "react-bootstrap";
import QRCode from "react-qr-code";

const ModalQR = ({ show, handleClose, qrUrl }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Código QR del PDF</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        {qrUrl ? (
          <QRCode
            title="Escanea para descargar el PDF"
            value={qrUrl}
            size={200}
            fgColor="#0000FF"
            bgColor="#FFFFFF"
            style={{ borderRadius: "8px" }}
            level="L"
          />
        ) : (
          <p>No hay URL disponible para generar el QR.</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQR;
