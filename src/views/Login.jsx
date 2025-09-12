import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../database/authcontext";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("adminEmail", email);
      
      if (email === "desarrolladoressa2000@gmail.com") {
        navigate("/administrador");
      } else {
        navigate("/inicio");
      }
    } catch (error) {
      setError("Credenciales incorrectas. Por favor verifica.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate("/inicio");
    return null;
  }

  return (
    <div className="bg-background text-foreground">
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="card w-full max-w-md p-6 rounded-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Inicio de Sesión</h1>
          </div>
          {error && <Alert variant="danger" className="alert-danger">{error}</Alert>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-default btn-md w-full"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="register-link">
            <p>¿No tienes cuenta?</p>
            <button
              type="button"
              className="register-btn"
              onClick={() => navigate('/register')}
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;