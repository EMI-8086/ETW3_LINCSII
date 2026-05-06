import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, BookOpen, GraduationCap, CalendarDays, UserCircle, LogOut } from "lucide-react";
import logoTecnm from "../assets/logo-tecnm.png";

export default function PageWrapper({ children, profileName }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 

  const MENU_ITEMS = [
    { path: "/home",    label: "Inicio",         icon: <Home size={20} /> },
    { path: "/grades",  label: "Calificaciones", icon: <GraduationCap size={20} /> },
    { path: "/kardex",  label: "Kardex",         icon: <BookOpen size={20} /> },
    { path: "/planner", label: "Planificador",    icon: <CalendarDays size={20} /> }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = profileName || user?.email || "Estudiante";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="app-layout">
      
      <aside className="sidebar">
        
        <div className="sidebar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>
          <img 
            src={logoTecnm} 
            alt="TecNM" 
            style={{ height: "40px", width: "auto", objectFit: "contain" }} 
          />
          <div>
            <div className="brand-name" style={{ fontSize: "1.1rem" }}>LINCSII</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon" style={{ display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div 
            className="user-avatar" 
            onClick={() => navigate("/profile")}
            title="Ir a mi perfil"
          >
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-email">Mi Perfil</div>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout} 
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
        
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}