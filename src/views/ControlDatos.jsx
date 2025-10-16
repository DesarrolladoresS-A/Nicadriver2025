import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import { db, auth } from "../database/firebaseconfig";
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc, setDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import Swal from "sweetalert2";
import "../styles/Configuracion.css";

const DAY_MS = 24 * 60 * 60 * 1000;

const ControlDatos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : { email: user.email };
      setPerfil(data);
      if (data.deletionRequestedAt) {
        const t = data.deletionRequestedAt.toDate ? data.deletionRequestedAt.toDate().getTime() : data.deletionRequestedAt;
        setDeadline(new Date(t + 15 * DAY_MS));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const confirmDelete = async () => {
    if (!user) return;

    const step1 = await Swal.fire({
      title: "Confirmación requerida",
      html: "Al eliminar tu cuenta, todos tus datos personales se eliminarán de forma segura y no podrán recuperarse. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    });
    if (!step1.isConfirmed) return;

    // Programar eliminación en 15 días
    const ref = doc(db, "users", user.uid);
    if (!(await getDoc(ref)).exists()) {
      await setDoc(ref, { email: user.email });
    }
    await updateDoc(ref, { deletionRequestedAt: serverTimestamp() });

    // Limpiar historiales locales de notificaciones
    try {
      const key = `notif_history_${user.uid || user.email}`;
      localStorage.removeItem(key);
    } catch {}

    await Swal.fire({
      title: "Programada",
      html: "Tu cuenta será eliminada en 15 días. Podrás seguir usando NicaDriver hasta esa fecha. Si cambias de opinión, contáctanos para cancelar.",
      icon: "info",
      confirmButtonText: "Aceptar"
    });
    navigate(-1);
  };

  const cancelDeletion = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { deletionRequestedAt: null });
    setDeadline(null);
    await Swal.fire({ title: "Cancelado", text: "Se canceló la eliminación programada.", icon: "success" });
  };

  const tryImmediatePurge = async () => {
    // Permite eliminar inmediatamente si ya pasaron los 15 días
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid);
      await deleteDoc(ref).catch(() => {});
      await deleteUser(auth.currentUser);
    } catch (e) {
      console.warn("No se pudo eliminar inmediatamente (probable reautenticación requerida)", e);
    }
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) navigate(-1); };

  if (loading) return <div className="cfg-overlay" onClick={handleOverlayClick}><div className="cfg-container"><div className="cfg-card"><p>Cargando...</p></div></div></div>;

  const fullName = `${perfil?.nombre || ""} ${perfil?.apellido || ""}`.trim() || "Usuario";

  return (
    <div className="cfg-overlay" onClick={handleOverlayClick}>
      <div className="cfg-container">
        <div className="cfg-card">
        <div className="cfg-header">
          <button className="cfg-back" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
          <h2>Control de Datos</h2>
        </div>

        <section className="cfg-section">
          <h3>Datos</h3>
          <div className="cfg-box">
            <div className="perfil-box" style={{margin:0}}>
              <p><strong>Usuario:</strong> {fullName}</p>
              <p><strong>Cédula:</strong> {perfil?.cedula || "—"}</p>
            </div>
          </div>
        </section>

        <section className="cfg-section">
          <h3>Contacto</h3>
          <div className="cfg-box">
            <div className="perfil-box" style={{margin:0}}>
              <p><strong>Teléfono:</strong> {perfil?.celular || "—"}</p>
              <p><strong>Correo Electrónico:</strong> {perfil?.email || user?.email || "—"}</p>
            </div>
          </div>
        </section>

        <div className="cfg-actions">
          {!deadline ? (
            <button className="btn-logout" onClick={confirmDelete}>Eliminar Cuenta</button>
          ) : (
            <div className="col" style={{gap:12}}>
              <div className="cfg-alert">
                Tu cuenta será eliminada en 15 días. Fecha estimada: <strong>{deadline.toLocaleDateString()}</strong>.
              </div>
              <div className="row" style={{gap:12}}>
                <button className="btn-config" onClick={cancelDeletion}>Cancelar eliminación</button>
                <button className="btn-logout" onClick={tryImmediatePurge}>Eliminar ahora</button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ControlDatos;
