import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    icon: "◈",
    title: "Dashboard",
    desc: "Resumen de tu actividad reciente",
    color: "#00f5c4",
  },
  {
    icon: "◉",
    title: "Proyectos",
    desc: "Gestiona y organiza tus proyectos",
    color: "#7c6cfc",
  },
  {
    icon: "◎",
    title: "Mensajes",
    desc: "Bandeja de entrada y notificaciones",
    color: "#fc6c8f",
  },
  {
    icon: "⬡",
    title: "Configuración",
    desc: "Preferencias y ajustes del sistema",
    color: "#fca43c",
  },
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
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
          <a href="#" className="nav-item active">
            <span>◈</span> Inicio
          </a>
          <a href="#" className="nav-item">
            <span>◉</span> Perfil Académico
          </a>
          <a href="#" className="nav-item">
            <span>◎</span> Calificaiones
          </a>
          <a href="#" className="nav-item">
            <span>⬡</span> Kardex
          </a>
          <a href="#" className="nav-item">
            <span>⬡</span> Configuración
          </a>
        </nav>

        <div className="sidebar-user">
          <div
            className="user-avatar"
            onClick={() => navigate("/profile")}
            title="Editar perfil"
          >
            {initials}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h2 className="page-title">
              Hola, {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="page-sub">Aquí está tu resumen de hoy</p>
          </div>
          <button className="btn-outline" onClick={() => navigate("/profile")}>
            ✎ Editar perfil
          </button>
        </header>

        {/*Stats*/ 
        <div className="stats-grid">
          {[
            { label: "Proyectos activos", value: "12", delta: "+2 este mes" },
            { label: "Tareas completadas", value: "48", delta: "+8 esta semana" },
            { label: "Mensajes nuevos", value: "5", delta: "Sin leer" },
            { label: "Horas trabajadas", value: "36h", delta: "Esta semana" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
              <p className="stat-delta">{s.delta}</p>
            </div>
          ))}
        </div>}

        {/* Menu cards */}
        <h3 className="section-title">Accesos rápidos</h3>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.title} className="menu-card">
              <div className="menu-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
              <h4 className="menu-card-title">{item.title}</h4>
              <p className="menu-card-desc">{item.desc}</p>
              <button className="menu-card-btn" style={{ color: item.color }}>
                Abrir →
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}