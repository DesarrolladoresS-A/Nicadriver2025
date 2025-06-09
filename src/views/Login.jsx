import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Alert } from "react-bootstrap";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../database/authcontext";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    cedula: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError("Por favor, selecciona un archivo de imagen válido (JPEG, PNG)");
      return;
    }
    
    if (file.size > 1 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Máximo 1MB permitido.");
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      const base64String = compressedImage.split(',')[1];
      setRegisterData({ ...registerData, profileImage: base64String });
      setPreviewImage(compressedImage);
      setError(null);
    } catch (error) {
      setError("Error al procesar la imagen");
    }
  };

  const handleCedulaChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^0-9A-Z-]/g, '');
    
    const numeros = value.replace(/[^0-9]/g, '');
    const letras = value.replace(/[^A-Z]/g, '');
    const tieneLetra = letras.length > 0;
    const letra = tieneLetra ? letras[letras.length - 1] : '';
    
    let formato = '';
    let digitosIngresados = 0;
    
    if (numeros.length > 0) {
      formato = numeros.slice(0, 3);
      digitosIngresados = Math.min(numeros.length, 3);
      
      if (numeros.length > 3 || formato.length === 3) {
        formato += '-';
        
        const segmento2 = numeros.slice(3, 9);
        formato += segmento2;
        digitosIngresados += segmento2.length;
        
        if (numeros.length > 9 || digitosIngresados >= 9) {
          formato += '-';
          
          const segmento3 = numeros.slice(9, 13);
          formato += segmento3;
          digitosIngresados += segmento3.length;
        }
      }
    }
    
    if (tieneLetra) {
      if (digitosIngresados < 13) {
        const cerosFaltantes = '0'.repeat(13 - digitosIngresados);
        formato = formato.slice(0, -1 * (4 - (13 - digitosIngresados))) + cerosFaltantes;
      }
      
      if (formato.replace(/-/g, '').length === 13) {
        formato = formato.slice(0, 15) + letra;
      }
    }
    
    setRegisterData({ ...registerData, cedula: formato });
  };

  const handleCelularChange = (e) => {
    let value = e.target.value.replace(/[^0-9-]/g, '');
    
    if (value.length > 4 && !value.includes('-')) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`;
    }
    
    if (value.length > 9) value = value.slice(0, 9);
    
    setRegisterData({ ...registerData, celular: value });
  };

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(registerData.cedula)) {
      setError("Formato de cédula inválido. Debe ser exactamente: 123-123456-1234X");
      setLoading(false);
      return;
    }

    if (!/^\d{4}-\d{4}$/.test(registerData.celular)) {
      setError("Formato de celular inválido. Use: xxxx-xxxx");
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      const db = getFirestore(appfirebase);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        celular: registerData.celular,
        cedula: registerData.cedula,
        email: registerData.email,
        profileImage: registerData.profileImage,
        createdAt: new Date()
      });

      setShowRegister(false);
      setRegisterData({
        nombre: "",
        apellido: "",
        celular: "",
        cedula: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImage: null
      });
      setPreviewImage(null);

      alert("¡Registro exitoso! Ahora puedes iniciar sesión");
    } catch (error) {
      setError(error.message.includes("email-already-in-use") 
        ? "El correo ya está registrado" 
        : "Error en el registro. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  if (user) {
    navigate("/inicio");
    return null;
  }

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-header">
          <h1>Inicio de Sesión</h1>
        </div>
        <div className="login-body">
          {error && <Alert variant="danger" className="alert-danger">{error}</Alert>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          
          <div className="text-center mt-2">
            <button 
              className="btn-link" 
              onClick={() => setShowRegister(true)}
            >
              Crear nueva cuenta
            </button>
          </div>
        </div>
      </div>

      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Registro de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <form onSubmit={handleRegister}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={registerData.nombre}
                onChange={handleRegisterChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control"
                name="apellido"
                value={registerData.apellido}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Imagen de perfil</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="mt-2 text-center">
                  <img 
                    src={previewImage} 
                    alt="Vista previa" 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover', 
                      borderRadius: '50%',
                      border: '2px solid #ddd'
                    }}
                  />
                  <p className="text-muted small mt-1">Vista previa (imagen comprimida)</p>
                </div>
              )}
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Cédula (123-123456-1234X)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="cedula"
                    value={registerData.cedula}
                    onChange={handleCedulaChange}
                    placeholder="Ej: 001-123456-7890A"
                    required
                    maxLength={16}
                  />
                  <small className="text-muted">Formato exacto: 3-6-4 dígitos + 1 letra mayúscula</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Celular (xxxx-xxxx)</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="celular"
                    value={registerData.celular}
                    onChange={handleCelularChange}
                    placeholder="Ej: 1234-5678"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    minLength="6"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Confirmar</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    minLength="6"
                  />
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block mt-2"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Completar Registro"}
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login;