import React, { useState, useEffect } from "react";
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
  const [particles, setParticles] = useState([]);
  const [floatingElements, setFloatingElements] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  // Crear partículas de fondo
  useEffect(() => {
    createParticles();
    createFloatingElements();
  }, []);

  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 3 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 6,
      });
    }
    setParticles(newParticles);
  };

  const createFloatingElements = () => {
    const elements = [];
    for (let i = 0; i < 8; i++) {
      elements.push({
        id: i,
        size: Math.random() * 100 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 8,
      });
    }
    setFloatingElements(elements);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("adminEmail", email);
      
      // Animación de éxito antes de navegar
      document.querySelector('.login-container').style.animation = 'successPulse 0.6s ease';
      
      setTimeout(() => {
        if (email === "desarrolladoressa2000@gmail.com") {
          navigate("/administrador");
        } else {
          navigate("/inicio");
        }
      }, 600);
      
    } catch (error) {
      setError("Credenciales incorrectas. Por favor verifica.");
      // Animación de error
      document.querySelector('.login-container').style.animation = 'errorShake 0.5s ease';
      setTimeout(() => {
        document.querySelector('.login-container').style.animation = '';
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate("/inicio");
    return null;
  }

  return (
    <div className="login-page bg-background text-foreground">
      {/* Partículas de fondo */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Elementos flotantes */}
      <div className="floating-elements">
        {floatingElements.map(element => (
          <div
            key={element.id}
            className="floating-element"
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDelay: `${element.animationDelay}s`,
            }}
          />
        ))}
      </div>

      <div>
        <div className="login-background">
          <div className="login-container">
            <div className="login-header">
              <h1>Bienvenido</h1>
              <p>Inicia sesión en tu cuenta</p>
            </div>
            
            {error && (
              <Alert variant="danger" className="alert alert-danger">
                {error}
              </Alert>
            )}
          
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
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
                  placeholder="••••••••"
                />
              </div>
              
              <div className="btn-container">
                <button 
                  type="submit" 
                  className="btn btn-default"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading-dots">Ingresando</span>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </div>
            </form>

            <div className="register-link text-center mt-4">
              <p className="text-gray-600 mb-2">¿No tienes cuenta?</p>
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

      <style jsx>{`
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(76, 175, 80, 0.4); }
          100% { transform: scale(1); }
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Login;