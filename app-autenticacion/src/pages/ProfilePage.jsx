import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("El nombre y el correo son obligatorios");
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const updates = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
      };
      if (form.newPassword) updates.password = form.newPassword;
      updateProfile(updates);
      setSuccess("¡Perfil actualizado correctamente!");
      setForm((f) => ({ ...f, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">NexAuth</span>
        </div>
        <nav className="sidebar-nav">
          <a
            href="#"
            className="nav-item"
            onClick={(e) => { e.preventDefault(); navigate("/home"); }}
          >
            <span>◈</span> Dashboard
          </a>
          <a href="#" className="nav-item"><span>◉</span> Proyectos</a>
          <a href="#" className="nav-item"><span>◎</span> Mensajes</a>
          <a href="#" className="nav-item active"><span>◈</span> Mi Perfil</a>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button
            className="logout-btn"
            onClick={() => { logout(); navigate("/login"); }}
            title="Cerrar sesión"
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h2 className="page-title">Mi Perfil</h2>
            <p className="page-sub">Administra tu información personal</p>
          </div>
          <button className="btn-outline" onClick={() => navigate("/home")}>
            ← Volver al inicio
          </button>
        </header>

        <div className="profile-layout">
          {/* Avatar card */}
          <div className="profile-avatar-card">
            <div className="profile-avatar-big">{initials}</div>
            <h3 className="profile-avatar-name">{user?.name}</h3>
            <p className="profile-avatar-email">{user?.email}</p>
            {user?.bio && <p className="profile-avatar-bio">{user.bio}</p>}
            <div className="profile-badge">Usuario activo</div>
          </div>

          {/* Form */}
          <div className="profile-form-card">
            <h3 className="form-section-title">Información personal</h3>
            <form onSubmit={handleSubmit} className="auth-form profile-form">
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="usuario@correo.com"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Teléfono (opcional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="+52 000 000 0000"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Biografía (opcional)</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="field-input field-textarea"
                  placeholder="Cuéntanos algo sobre ti..."
                  rows={3}
                />
              </div>

              <div className="form-divider">
                <span>Cambiar contraseña</span>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Nueva contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="Dejar vacío para no cambiar"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              {error && <p className="error-msg">⚠ {error}</p>}
              {success && <p className="success-msg">✓ {success}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}