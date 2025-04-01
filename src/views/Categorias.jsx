// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Importaciones de componentes personalizados
import TablaCategorias from "../components/categorias/tablaCategorias";
import ModalRegistroCategoria from "../components/categorias/modalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/modalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/modalELiminacionCategoria";


const Categorias = () => {
  
  // Estados para manejo de datos
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  // Referencia a la colección de categorías en Firestore
  const categoriasCollection = collection(db, "categorias");

  // Función para obtener todas las categorías de Firestore
  const fetchCategorias = async () => {
    try {
      const data = await getDocs(categoriasCollection);
      const fetchedCategorias = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  // Hook useEffect para carga inicial de datos
  useEffect(() => {
    fetchCategorias();
  }, []);

  // Manejador de cambios en inputs del formulario de nueva categoría
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejador de cambios en inputs del formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCategoriaEditada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para agregar una nueva categoría (CREATE)
  const handleAddCategoria = async () => {
    if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }
    try {
      await addDoc(categoriasCollection, nuevaCategoria);
      setShowModal(false);
      setNuevaCategoria({ nombre: "", descripcion: "" });
      await fetchCategorias();
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
    }
  };

  // Función para actualizar una categoría existente (UPDATE)
  const handleEditCategoria = async () => {
    if (!categoriaEditada.nombre || !categoriaEditada.descripcion) {
      alert("Por favor, completa todos los campos antes de actualizar.");
      return;
    }
    try {
      const categoriaRef = doc(db, "categorias", categoriaEditada.id);
      await updateDoc(categoriaRef, categoriaEditada);
      setShowEditModal(false);
      await fetchCategorias();
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
    }
  };

  // Función para eliminar una categoría (DELETE)
  const handleDeleteCategoria = async () => {
    if (categoriaAEliminar) {
      try {
        const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
        await deleteDoc(categoriaRef);
        setShowDeleteModal(false);
        await fetchCategorias();
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
      }
    }
  };

  // Función para abrir el modal de edición con datos prellenados
  const openEditModal = (categoria) => {
    setCategoriaEditada({ ...categoria });
    setShowEditModal(true);
  };

  // Función para abrir el modal de eliminación
  const openDeleteModal = (categoria) => {
    setCategoriaAEliminar(categoria);
    setShowDeleteModal(true);
  };

  // Renderizado del componente
  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Categorías</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar categoría
      </Button>
      <TablaCategorias
        categorias={categorias}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      <ModalRegistroCategoria
        showModal={showModal}
        setShowModal={setShowModal}
        nuevaCategoria={nuevaCategoria}
        handleInputChange={handleInputChange}
        handleAddCategoria={handleAddCategoria}
      />
      <ModalEdicionCategoria
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        categoriaEditada={categoriaEditada}
        handleEditInputChange={handleEditInputChange}
        handleEditCategoria={handleEditCategoria}
      />
      <ModalEliminacionCategoria
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteCategoria={handleDeleteCategoria}
      />
    </Container>
  );
};

export default Categorias;