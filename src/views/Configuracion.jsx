import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";
import "../styles/Configuracion.css";

const Configuracion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({});
  const fileRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) navigate(-1);
  };

  const errors = useMemo(() => {
    const errs = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!apellido.trim()) errs.apellido = "El apellido es obligatorio";
    if (!cedula.trim()) errs.cedula = "La cédula es obligatoria";
    if (!celular.trim()) errs.celular = "El celular es obligatorio";
    if (!correo.trim()) {
      errs.correo = "El correo es obligatorio";
    } else if (!/^[^@\s]+@gmail\.com$/i.test(correo)) {
      errs.correo = "Debe ser un correo @gmail.com válido";
    }
    if (!password) errs.password = "La contraseña es obligatoria";
    if (!confirmPassword) errs.confirmPassword = "Confirma la contraseña";
    if (password && confirmPassword && password !== confirmPassword) {
      errs.confirmPassword = "Las contraseñas no coinciden";
    }
    return errs;
  }, [nombre, apellido, cedula, celular, correo, password, confirmPassword]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ nombre: true, apellido: true, cedula: true, celular: true, correo: true, password: true, confirmPassword: true });
    if (!isValid) return;
    // Aquí puedes integrar guardado en Firebase/tu backend si corresponde
    navigate(-1);
  };

  return (
    <div className="cfg-overlay" onClick={handleOverlayClick}>
      <div className="cfg-container">
        <div className="cfg-card">
          <div className="cfg-header">
            <button className="cfg-back" onClick={() => navigate(-1)} aria-label="Volver">‹</button>
            <h2>Configuración</h2>
          </div>

          <form onSubmit={onSubmit} className="profile-grid">
            {/* Cuadro 1: Encabezado */}
            <div className="cell div1">
              <div className="profile-header" role="heading" aria-level={3}>
                <span className="profile-title">Registro de Usuario</span>
                <button type="submit" className="btn" disabled={!isValid}>Guardar</button>
              </div>
            </div>

            {/* Cuadro 2: Avatar circular */}
            <div className="cell div2">
              <div className="avatar-wrap">
                <div className="avatar" aria-label="Foto de perfil">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" />
                  ) : (
                    <span className="muted">Sube tu foto</span>
                  )}
                </div>
                <div className="avatar-actions">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setAvatarUrl(url);
                  }} />
                  <button type="button" className="btn secondary" onClick={() => fileRef.current?.click()}>Subir</button>
                  <button type="button" className="btn secondary" onClick={() => { setAvatarUrl(""); if (fileRef.current) fileRef.current.value = ""; }}>Quitar</button>
                </div>
              </div>
            </div>

            {/* Cuadro 3: Nombre */}
            <div className="cell div3 stretch">
              <div className="field">
                <label className="label" htmlFor="nombre">Nombre</label>
                <input id="nombre" className="input" value={nombre} onBlur={() => setTouched((t) => ({ ...t, nombre: true }))} onChange={(e) => setNombre(e.target.value)} required />
                {touched.nombre && errors.nombre && <span className="error">{errors.nombre}</span>}
              </div>
            </div>

            {/* Cuadro 4: Apellido */}
            <div className="cell div4 stretch">
              <div className="field">
                <label className="label" htmlFor="apellido">Apellido</label>
                <input id="apellido" className="input" value={apellido} onBlur={() => setTouched((t) => ({ ...t, apellido: true }))} onChange={(e) => setApellido(e.target.value)} required />
                {touched.apellido && errors.apellido && <span className="error">{errors.apellido}</span>}
              </div>
            </div>

            {/* Cuadro 5: Cédula */}
            <div className="cell div5 stretch">
              <div className="field">
                <label className="label" htmlFor="cedula">Cédula de identidad</label>
                <input id="cedula" className="input" value={cedula} onBlur={() => setTouched((t) => ({ ...t, cedula: true }))} onChange={(e) => setCedula(e.target.value)} required />
                {touched.cedula && errors.cedula && <span className="error">{errors.cedula}</span>}
              </div>
            </div>

            {/* Cuadro 6: Celular */}
            <div className="cell div6 stretch">
              <div className="field">
                <label className="label" htmlFor="celular">Número de celular</label>
                <input id="celular" className="input" inputMode="tel" value={celular} onBlur={() => setTouched((t) => ({ ...t, celular: true }))} onChange={(e) => setCelular(e.target.value.replace(/[^0-9+\s-]/g, ""))} required />
                {touched.celular && errors.celular && <span className="error">{errors.celular}</span>}
              </div>
            </div>

            {/* Cuadro 7: Correo Gmail */}
            <div className="cell div7 stretch">
              <div className="field">
                <label className="label" htmlFor="correo">Correo electrónico</label>
                <input id="correo" className="input" type="email" value={correo} placeholder="tucorreo@gmail.com" onBlur={() => setTouched((t) => ({ ...t, correo: true }))} onChange={(e) => setCorreo(e.target.value)} required />
                {touched.correo && errors.correo && <span className="error">{errors.correo}</span>}
              </div>
            </div>

            {/* Cuadro 8: Contraseña */}
            <div className="cell div8 stretch">
              <div className="field">
                <label className="label" htmlFor="password">Contraseña</label>
                <input id="password" className="input" type="password" value={password} onBlur={() => setTouched((t) => ({ ...t, password: true }))} onChange={(e) => setPassword(e.target.value)} required />
                {touched.password && errors.password && <span className="error">{errors.password}</span>}
              </div>
            </div>

            {/* Cuadro 9: Confirmación */}
            <div className="cell div9 stretch">
              <div className="field">
                <label className="label" htmlFor="confirm">Confirmar contraseña</label>
                <input id="confirm" className="input" type="password" value={confirmPassword} onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))} onChange={(e) => setConfirmPassword(e.target.value)} required />
                {touched.confirmPassword && errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
