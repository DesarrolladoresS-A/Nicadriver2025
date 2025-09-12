import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../database/authcontext";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/Login.css";

const Register = () => {
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    cedula: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(appfirebase);
  const db = getFirestore(appfirebase);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
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
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Por favor, selecciona un archivo de imagen válido (JPEG, PNG)");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Máximo 1MB permitido.");
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      const base64String = compressedImage.split(",")[1];
      setRegisterData({ ...registerData, profileImage: base64String });
      setPreviewImage(compressedImage);
      setError(null);
    } catch (error) {
      setError("Error al procesar la imagen");
    }
  };

  const handleCedulaChange = (e) => {
    let value = e.target.value.replace(/[^0-9-]/g, "");
    const digits = value.replace(/-/g, "").slice(0, 13);
    let formatted = "";
    if (digits.length > 0) {
      formatted = digits.slice(0, 3);
      if (digits.length >= 4) {
        formatted += "-" + digits.slice(3, 9);
      }
      if (digits.length >= 10) {
        formatted += "-" + digits.slice(9, 13);
      }
    }
    setRegisterData({ ...registerData, cedula: formatted });
  };

  const handleCelularChange = (e) => {
    let value = e.target.value.replace(/[^0-9-]/g, "");

    if (value.length > 4 && !value.includes("-")) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`;
    }

    if (value.length > 9) value = value.slice(0, 9);

    setRegisterData({ ...registerData, celular: value });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!/^\d{3}-\d{6}-\d{4}$/.test(registerData.cedula)) {
      setError("Formato de cédula inválido. Debe ser: 123-123456-1234");
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

      await setDoc(doc(db, "users", userCredential.user.uid), {
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        celular: registerData.celular,
        cedula: registerData.cedula,
        email: registerData.email,
        profileImage: registerData.profileImage,
        createdAt: new Date(),
      });

      await signInWithEmailAndPassword(auth, registerData.email, registerData.password);
      navigate("/inicio");
    } catch (error) {
      setError(
        error.message.includes("email-already-in-use")
          ? "El correo ya está registrado"
          : "Error en el registro. Intenta nuevamente."
      );
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
        <div className="card w-full max-w-3xl p-6 rounded-2xl">
          <div className="mb-2 text-center">
            <h2 className="panel-title">Registro de Usuario</h2>
          </div>

          {error && <Alert variant="danger" className="alert-danger">{error}</Alert>}

          <form onSubmit={handleRegister}>
            <div className="row g-3">
              <div className="col-md-6">
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
              </div>
              <div className="col-md-6">
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
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Imagen de perfil</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              {previewImage && (
                <div className="mt-2 text-center">
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%", border: "2px solid #ddd" }}
                  />
                  <p className="text-muted small mt-1">Vista previa (imagen comprimida)</p>
                </div>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Cédula (123-123456-1234)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="cedula"
                    value={registerData.cedula}
                    onChange={handleCedulaChange}
                    placeholder="001-123456-7890"
                    required
                    maxLength={15}
                  />
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
                    placeholder="1234-5678"
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

            <div className="row g-3">
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

            <button type="submit" className="btn btn-default btn-md w-full mt-2" disabled={loading}>
              {loading ? "Registrando..." : "Completar Registro"}
            </button>
          </form>

          <div className="info-box mt-4">
            <h4>¡Gracias por apoyar nuestro programa!</h4>
            <p>
              Tu registro nos ayuda a seguir mejorando Nicadriver 2025. Con tu apoyo, podemos ofrecer mejores funcionalidades, seguridad y una
              experiencia de conducción más informada para todos.
            </p>
          </div>

          <div className="register-link" style={{ marginTop: "1rem" }}>
            <p>¿Ya tienes cuenta?</p>
            <button type="button" className="register-btn" onClick={() => navigate("/login")}>Iniciar sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
