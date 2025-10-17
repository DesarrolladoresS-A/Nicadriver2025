import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { appfirebase } from "../database/firebaseconfig";
import "../styles/Auth.css";

const RegisUser = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    celular: "",
    email: "",
    password: "",
    profileImage: null, // base64 sin prefijo
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
          const MAX_SIZE = 240;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
      };
    });
  };

  const onImagePick = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) { setError("Selecciona una imagen válida"); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Imagen máxima 2MB"); return; }
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      setForm((f) => ({ ...f, profileImage: dataUrl.split(",")[1] }));
      setError(null);
    } catch {
      setError("No se pudo procesar la imagen");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCedula = (e) => {
    let raw = e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, "");
    const alnum = raw.replace(/-/g, "");
    const digits = alnum.replace(/[A-Z]/g, "").slice(0, 13);
    const letter = (alnum.match(/[A-Z]/) || [""])[0];
    let out = "";
    if (digits.length > 0) {
      out = digits.slice(0, 3);
      if (digits.length >= 4) out += "-" + digits.slice(3, 9);
      if (digits.length >= 10) out += "-" + digits.slice(9, 13);
    }
    if (digits.length === 13 && letter) out += letter;
    setForm((f) => ({ ...f, cedula: out }));
  };

  const handleCelular = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 4 ? `${digits.slice(0,4)}-${digits.slice(4)}` : digits;
    setForm((f) => ({ ...f, celular: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(form.cedula)) {
      setError("Cédula inválida. Formato: 123-123456-1234X"); setLoading(false); return;
    }
    if (!/^\d{4}-\d{4}$/.test(form.celular)) {
      setError("Celular inválido. Formato: xxxx-xxxx"); setLoading(false); return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", cred.user.uid), {
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        celular: form.celular,
        email: form.email,
        profileImage: form.profileImage,
        createdAt: new Date(),
      });
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/inicio");
    } catch (err) {
      setError(err?.message?.includes("email-already-in-use") ? "El correo ya está registrado" : "Error al registrar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-blobs">
        <div className="auth-blob a" />
        <div className="auth-blob b" />
        <div className="auth-blob c" />
      </div>

      <div className="auth-content">
        <div className="auth-left" style={{ width: '100%' }}>
          <div className="auth-card register" id="auth-card" style={{ maxWidth: 680 }}>
            <div className="auth-title">
              <h1>Registro de Nuevo Usuario</h1>
            </div>

            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <label htmlFor="avatar" style={{ cursor:'pointer' }}>
                <div style={{ width:96, height:96, borderRadius: "9999px", background:'#e5ecf5', border:'2px dashed #b8c6db', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {preview ? (
                    <img src={preview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <i className="bi bi-camera" style={{ fontSize:32, color:'#6b7a90' }} />
                  )}
                </div>
              </label>
              <input id="avatar" type="file" accept="image/*" onChange={onImagePick} style={{ display:'none' }} />
              <span style={{ color:'#6b7280', fontSize:14 }}>Subir imagen</span>
            </div>

            {error && <Alert variant="danger" className="alert alert-danger" style={{ marginTop: 12 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} className="grid-form" style={{ marginTop: 12 }}>
              <div className="form-group div1">
                <label className="label">Nombre</label>
                <input type="text" className="input" name="nombre" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group div2">
                <label className="label">Apellido</label>
                <input type="text" className="input" name="apellido" value={form.apellido} onChange={handleChange} required />
              </div>
              <div className="form-group div6">
                <label className="label">Cédula de Identidad</label>
                <input type="text" className="input" name="cedula" value={form.cedula} onChange={handleCedula} placeholder="123-123456-1234X" maxLength={16} required />
              </div>
              <div className="form-group div7">
                <label className="label">Número de celular</label>
                <input type="tel" className="input" name="celular" value={form.celular} onChange={handleCelular} placeholder="1234-5678" required />
              </div>
              <div className="form-group div8">
                <label className="label">Correo electrónico</label>
                <input type="email" className="input" name="email" value={form.email} onChange={handleChange} placeholder="usuario@gmail.com" required />
              </div>
              <div className="form-group div9">
                <label className="label">Contraseña</label>
                <input type="password" className="input" name="password" value={form.password} onChange={handleChange} minLength={6} required />
              </div>

              <button type="submit" className="btn-primary grid-submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrar Usuario"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisUser;
