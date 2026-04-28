import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { icon: "⊞", label: "Dashboard",     path: "/home" },
  { icon: "◎", label: "Calificaciones", path: "/grades" },
  { icon: "▤",  label: "Kardex",        path: "/kardex" },
  { icon: "◈", label: "Mi Perfil",     path: "/profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "E";

  const displayName = user?.nombre || user?.name || "Estudiante";
  const displayEmail = user?.email || user?.correo || "";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⬡</span>
        <div>
          <span className="brand-name">SII</span>
          <span className="brand-sub-sm"> Celaya</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar" title="Mi perfil" onClick={() => navigate("/profile")}>
          {initials}
        </div>
        <div className="user-info">
          <p className="user-name">{displayName}</p>
          <p className="user-email">{displayEmail}</p>
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
  );
}