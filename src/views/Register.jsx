import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../database/authcontext";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/Auth.css";

const Register = () => {
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    cedula: "",
    direccion: "",
    fechaNacimiento: "",
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
    // Permite dígitos y opcionalmente una letra A-Z al final
    let raw = e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, "");
    // Extraer solo dígitos y una única letra final si existe
    const alnum = raw.replace(/-/g, "");
    const digitsOnly = alnum.replace(/[A-Z]/g, "").slice(0, 13); // 13 dígitos
    const letter = (alnum.match(/[A-Z]/) || [""])[0]; // primera letra si la hay

    // Formatear 3-6-4
    let formatted = "";
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.slice(0, 3);
      if (digitsOnly.length >= 4) {
        formatted += "-" + digitsOnly.slice(3, 9);
      }
      if (digitsOnly.length >= 10) {
        formatted += "-" + digitsOnly.slice(9, 13);
      }
    }
    // Añadir la letra solo cuando ya hay 13 dígitos
    if (digitsOnly.length === 13 && letter) {
      formatted += letter;
    }
    setRegisterData({ ...registerData, cedula: formatted });
  };

  const handleCelularChange = (e) => {
    // Solo dígitos, formatear como xxxx-xxxx
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 4 ? `${digits.slice(0,4)}-${digits.slice(4)}` : digits;
    setRegisterData({ ...registerData, celular: formatted });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(registerData.cedula)) {
      setError("Formato de cédula inválido. Debe ser: 123-123456-1234X (X letra A-Z)");
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
        direccion: registerData.direccion,
        fechaNacimiento: registerData.fechaNacimiento,
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
    <div className="auth-page register-page">
      <div className="auth-blobs">
        <div className="auth-blob a" />
        <div className="auth-blob b" />
        <div className="auth-blob c" />
      </div>

      <div className="auth-content">
        {/* Left - Info */}
        <div className="auth-right">
          <div className="right-pattern">
            <div className="shape s1" />
            <div className="shape s2" />
            <div className="shape s3" />
          </div>
          <div className="right-content">
            <div className="icon-badge">🎉</div>
            <h2>Gracias por confiar en nosotros</h2>
            <p>Tu apoyo nos impulsa a mejorar cada día. ¡Bienvenido a la comunidad!</p>
          </div>
        </div>

        {/* Right - Form (in layout terms it's the left column on mobile) */}
        <div className="auth-left">
          <div className="auth-card register" id="auth-card">
            <div className="auth-title">
              <h1>Registro de Usuario</h1>
            </div>

            {error && <Alert variant="danger" className="alert alert-danger">{error}</Alert>}

            <form onSubmit={handleRegister} className="grid-form">
              <div className="form-group div1">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  name="nombre"
                  value={registerData.nombre}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group div2">
                <label className="label">Apellido</label>
                <input
                  type="text"
                  className="input"
                  name="apellido"
                  value={registerData.apellido}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group div4">
                <label className="label">Imagen de perfil</label>
                <input type="file" className="input" accept="image/*" onChange={handleImageChange} />
                {previewImage && (
                  <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                    <img
                      src={previewImage}
                      alt="Vista previa"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%", border: "2px solid #ddd" }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group div6">
                <label className="label">Cédula (123-123456-1234X)</label>
                <input
                  type="text"
                  className="input"
                  name="cedula"
                  value={registerData.cedula}
                  onChange={handleCedulaChange}
                  placeholder="001-123456-7890X"
                  required
                  maxLength={16}
                />
              </div>

              <div className="form-group div7">
                <label className="label">Celular (xxxx-xxxx)</label>
                <input
                  type="tel"
                  className="input"
                  name="celular"
                  value={registerData.celular}
                  onChange={handleCelularChange}
                  placeholder="1234-5678"
                  required
                />
              </div>

              <div className="form-group div9">
                <label className="label">Contraseña</label>
                <input
                  type="password"
                  className="input"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group div10">
                <label className="label">Confirmar</label>
                <input
                  type="password"
                  className="input"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group div3">
                <label className="label">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="input"
                  name="fechaNacimiento"
                  value={registerData.fechaNacimiento}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-group div5">
                <label className="label">Dirección</label>
                <input
                  type="text"
                  className="input"
                  name="direccion"
                  value={registerData.direccion}
                  onChange={handleRegisterChange}
                  placeholder="Barrio, calle, referencia"
                />
              </div>

              <div className="form-group div8">
                <label className="label">Correo electrónico</label>
                <input
                  type="email"
                  className="input"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <button type="submit" className="btn-primary grid-submit" disabled={loading}>
                {loading ? "Registrando..." : "Completar Registro"}
              </button>
            </form>

            <div className="register-note">
              <p>¡Gracias por apoyar nuestro programa!</p>
              <p>Tu registro nos ayuda a seguir mejorando Nicadriver 2025.</p>
              <p>Con tu apoyo, podemos ofrecer mejores funcionalidades, seguridad y una experiencia de conducción más informada para todos.</p>
            </div>

            <div className="auth-footer">
              <span>¿Ya tienes cuenta? </span>
              <button type="button" className="link" onClick={() => navigate('/login')}>Iniciar sesión</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
