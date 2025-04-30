import React from "react";

const GenerarPDFButton = ({ generarPDF }) => {
  return (
    <button
      className="report-action-button generar-pdf"
      onClick={generarPDF}
    >
      <i className="fas fa-file-pdf"></i>
    </button>
  );
};

export default GenerarPDFButton;
