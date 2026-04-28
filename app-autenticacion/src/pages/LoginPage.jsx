import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ERROR_MESSAGES = {
  "Failed to fetch": "No se pudo conectar con el servidor. Verifica tu conexión.",
  "401": "Correo o contraseña incorrectos.",
  "422": "Datos inválidos. Verifica el formato del correo.",
  "500": "Error interno del servidor. Intenta más tarde.",
};

function friendlyError(msg) {
  for (const [key, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return friendly;
  }
  return msg;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("El correo es obligatorio"); return; }
    if (!form.password) { setError("La contraseña es obligatoria"); return; }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) { setError("Ingresa un correo electrónico válido"); return; }

    setLoading(true);
    setError("");
    try {
      await login(form.email.trim(), form.password);
      navigate("/home");
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">⬡</div>
          <div>
            <h1 className="brand-name">SII Celaya</h1>
            <p className="brand-sub">TecNM Campus Celaya</p>
          </div>
        </div>

        <h2 className="auth-title">Iniciar sesión</h2>
        <p className="auth-subtitle">Ingresa tus credenciales institucionales</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field-group">
            <label className="field-label">Correo institucional</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="l000@celaya.tecnm.mx"
              className="field-input"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="field-input"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-msg" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Autenticando...</>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="auth-divider" />
        <p className="auth-footer">
          ¿Problemas para acceder?{" "}
          <a
            href="https://sii.celaya.tecnm.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-link"
          >
            Ir al portal web
          </a>
        </p>
      </div>
    </div>
  );
}