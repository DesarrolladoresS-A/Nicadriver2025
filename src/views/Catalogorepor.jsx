import React, { useState, useEffect } from "react";
import { Container, Row, Form, Col } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import TarjetaReporte from "../components/catalogo/TarjetaReporte";
import ModalEdicionReporte from "../components/catalogo/ModalEdicionReporte";

const Catalogo = () => {
  const [reportes, setReportes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [showEditModal, setShowEditModal] = useState(false);
  const [reporteEditado, setReporteEditado] = useState(null);

  const reportesCollection = collection(db, "reportes");
  const categoriasCollection = collection(db, "categorias");

  // Obtener datos de Firebase
  const fetchData = async () => {
    try {
      const reportesData = await getDocs(reportesCollection);
      const fetchedReportes = reportesData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setReportes(fetchedReportes);

      const categoriasData = await getDocs(categoriasCollection);
      const fetchedCategorias = categoriasData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Funciones para edición
  const openEditModal = (reporte) => {
    setReporteEditado({ ...reporte });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setReporteEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReporteEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditReporte = async () => {
    if (!reporteEditado.nombre || !reporteEditado.descripcion || !reporteEditado.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      const reporteRef = doc(db, "reportes", reporteEditado.id);
      await updateDoc(reporteRef, reporteEditado);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Error al actualizar reporte:", error);
    }
  };

  // Filtrar reportes
  const reportesFiltrados = categoriaSeleccionada === "Todas"
    ? reportes
    : reportes.filter((reporte) => reporte.categoria === categoriaSeleccionada);

  return (
    <Container className="mt-5">
      <br />
      <h4>Catálogo de Reportes</h4>

      {/* Filtro de Categorías */}
      <Row>
        <Col lg={3} md={3} sm={6}>
          <Form.Group className="mb-3">
            <Form.Label>Filtrar por categoría:</Form.Label>
            <Form.Select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nombre}>
                  {categoria.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Tarjetas de Reportes */}
      <Row>
        {reportesFiltrados.length > 0 ? (
          reportesFiltrados.map((reporte) => (
            <TarjetaReporte
              key={reporte.id}
              reporte={reporte}
              openEditModal={openEditModal}
            />
          ))
        ) : (
          <p>No hay reportes en esta categoría.</p>
        )}
      </Row>

      {/* Modal de Edición */}
      <ModalEdicionReporte
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        reporteEditado={reporteEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditReporte={handleEditReporte}
        categorias={categorias}
      />
    </Container>
  );
};

export default Catalogo;