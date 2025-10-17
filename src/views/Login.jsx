import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../database/authcontext";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  useEffect(() => {
    return () => {
      const card = document.getElementById("auth-card");
      if (card) {
        card.classList.remove("form-anim-success", "form-anim-error");
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("adminEmail", email);

      const card = document.getElementById("auth-card");
      if (card) {
        card.classList.remove("form-anim-error");
        card.classList.add("form-anim-success");
      }

      setTimeout(() => {
        if (email === "desarrolladoressa2000@gmail.com") {
          navigate("/administrador");
        } else {
          navigate("/inicio");
        }
      }, 600);

    } catch (error) {
      setError("Credenciales incorrectas. Por favor verifica.");
      const card = document.getElementById("auth-card");
      if (card) {
        card.classList.remove("form-anim-success");
        card.classList.add("form-anim-error");
        setTimeout(() => card.classList.remove("form-anim-error"), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate("/inicio");
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-blobs">
        <div className="auth-blob a" />
        <div className="auth-blob b" />
        <div className="auth-blob c" />
      </div>

      <div className="auth-content">
        {/* Left - Form */}
        <div className="auth-left">
          <div className="auth-card" id="auth-card">
            <div className="auth-brand">
              <img src="/Logo.png" alt="NicaDriver" className="brand-mark" />
              <span className="brand-name">NicaDriver</span>
            </div>
            <div className="auth-title">
              <h1>Bienvenido de nuevo</h1>
              <p>Ingresa tus credenciales para acceder a tu cuenta</p>
            </div>

            {error && (
              <Alert variant="danger" className="alert alert-danger">
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="form-group">
                <label className="label">Correo electrónico</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label className="label">Contraseña</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="auth-actions">
                <span></span>
                <button type="button" className="link">¿Olvidaste tu contraseña?</button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <div className="auth-footer">
              <span>¿No tienes una cuenta? </span>
              <button type="button" className="link" onClick={() => navigate('/regisuser')}>
                Registrar usuario
              </button>
            </div>
          </div>
        </div>

        {/* Right - Info */}
        <div className="auth-right">
          <div className="right-card">
            <div className="right-pattern">
              <div className="shape s1" />
              <div className="shape s2" />
              <div className="shape s3" />
            </div>
            <div className="right-content">
              <img src="/Logo.png" alt="NicaDriver" className="brand-logo" />
              <h2>Seguridad y confianza</h2>
              <p>Tu información está protegida con los más altos estándares de seguridad y encriptación.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;