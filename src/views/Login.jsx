import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { appfirebase } from "../database/firebaseconfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../database/authcontext";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const auth = getAuth(appfirebase);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Usuario autenticado:", userCredential.user);
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        navigate("/inicio");
      })
      .catch((error) => {
        setError("Error de autenticación. Verifica tus credenciales.");
        console.error(error);
      });
  };

  if (user) {
    navigate("/inicio");
  }

  return (
    <Container className="d-flex vh-100 justify-content-center align-items-center">
      <div className="login-container">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-input"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="form-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="form-button">Iniciar sesión</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </Container>
  );
};

export default Login;
