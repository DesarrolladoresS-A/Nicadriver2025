import React from "react";
import { Pagination as BootstrapPagination } from "react-bootstrap";

const Paginacion = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <BootstrapPagination className="mt-0">
      <BootstrapPagination.First 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1}
      />
      <BootstrapPagination.Prev 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      />

      {Array.from({ length: totalPages }, (_, i) => (
        <BootstrapPagination.Item
          key={i + 1}
          active={i + 1 === currentPage}
          onClick={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </BootstrapPagination.Item>
      ))}

      <BootstrapPagination.Next 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      />
      <BootstrapPagination.Last 
        onClick={() => handlePageChange(totalPages)} 
        disabled={currentPage === totalPages}
      />
    </BootstrapPagination>
  );
};

export default Paginacion;