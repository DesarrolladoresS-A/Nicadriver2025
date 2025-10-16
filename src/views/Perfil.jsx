import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import { db } from "../database/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Perfil.css";

const Perfil = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPerfil(snap.data());
        } else {
          setPerfil({
            nombre: user.displayName || "",
            apellido: "",
            celular: "",
            cedula: "",
            email: user.email || "",
            profileImage: null,
          });
        }
      } catch (e) {
        console.error("Error cargando perfil:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn && !loading) {
      navigate("/login");
    }
  }, [isLoggedIn, loading, navigate]);

  const handleConfig = () => {
    navigate("/perfil/configuracion", { replace: false });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/inicio");
  };

  if (loading) {
    return (
      <div className="perfil-container"><div className="perfil-card"><p>Cargando perfil...</p></div></div>
    );
  }

  if (!perfil) {
    return (
      <div className="perfil-container"><div className="perfil-card"><p>No hay datos de perfil.</p></div></div>
    );
  }

  const fullName = `${perfil.nombre || ""} ${perfil.apellido || ""}`.trim();
  const avatarSrc = perfil.profileImage ? `data:image/jpeg;base64,${perfil.profileImage}` : null;
  const initials = (perfil.nombre?.[0] || "").toUpperCase() + (perfil.apellido?.[0] || "").toUpperCase();

  return (
    <div className="perfil-overlay">
      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Foto de perfil" />
            ) : (
              <div className="avatar-placeholder" title={fullName || "Usuario"}>
                {initials || ""}
              </div>
            )}
          </div>

          <div className="perfil-section">
            <h3>Datos:</h3>
            <div className="perfil-box">
              <p><strong>Usuario:</strong> {fullName || "Sin nombre"}</p>
              <p><strong>Cédula:</strong> {perfil.cedula || "—"}</p>
            </div>
          </div>

          <div className="perfil-section">
            <h3>Contacto:</h3>
            <div className="perfil-box">
              <p><strong>Teléfono:</strong> {perfil.celular || "—"}</p>
              <p><strong>Correo Electrónico:</strong> {perfil.email || user?.email || "—"}</p>
            </div>
          </div>

          <div className="perfil-actions">
            <button className="btn-config" onClick={handleConfig}>Configuración</button>
            <button className="btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
