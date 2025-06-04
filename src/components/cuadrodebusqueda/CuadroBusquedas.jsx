import React from "react";

const CuadroBusquedas = ({ searchText, handleSearchChange }) => {
  return (
    <input
      type="text"
      placeholder="Buscar categoría..."
      value={searchText}
      onChange={handleSearchChange}
      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
    />
  );
};

export default CuadroBusquedas;