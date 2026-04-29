import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/Api"; 
import PageWrapper from "../components/PageWrapper";
import { LoadingState, ErrorState } from "../components/ApiState";
import { GraduationCap, BookOpen, UserCircle, CalendarDays } from "lucide-react";

const DAYS = [
  { key: "lunes",     salon: "lunes_clave_salon",    label: "Lun" },
  { key: "martes",    salon: "martes_clave_salon",   label: "Mar" },
  { key: "miercoles", salon: "miercoles_clave_salon",label: "Mié" },
  { key: "jueves",    salon: "jueves_clave_salon",   label: "Jue" },
  { key: "viernes",   salon: "viernes_clave_salon",  label: "Vie" },
  { key: "sabado",    salon: "sabado_clave_salon",   label: "Sáb" },
];

const PALETTE = [
  { bg: "rgba(0,245,196,0.08)",   border: "rgba(0,245,196,0.28)"   },
  { bg: "rgba(124,108,252,0.08)", border: "rgba(124,108,252,0.28)" },
  { bg: "rgba(252,164,60,0.08)",  border: "rgba(252,164,60,0.28)"  },
  { bg: "rgba(252,108,143,0.08)", border: "rgba(252,108,143,0.28)" },
  { bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.28)"  },
  { bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.28)"  },
  { bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.28)"  },
  { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.28)" },
];

const QUICK_CARDS = [
  { icon: <GraduationCap size={28} strokeWidth={1.5} />, label: "Calificaciones", desc: "Resultados del periodo actual", path: "/grades",  color: "#00f5c4" },
  { icon: <BookOpen size={28} strokeWidth={1.5} />,      label: "Kardex",         desc: "Historial académico completo",  path: "/kardex",  color: "#7c6cfc" },
  { icon: <CalendarDays size={28} strokeWidth={1.5} />,  label: "Planner PRO",    desc: "Proyecta tus próximos semestres", path: "/planner", color: "#60a5fa" },
  { icon: <UserCircle size={28} strokeWidth={1.5} />,    label: "Mi Perfil",      desc: "Datos personales y escolares",  path: "/profile", color: "#fca43c" },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [profile,  setProfile]  = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  useEffect(() => {
    Promise.allSettled([
      studentService.getProfile(),
      studentService.getSchedule(),
    ]).then(([profRes, schedRes]) => {
      if (profRes.status === "fulfilled") {
        setProfile(profRes.value?.data ?? profRes.value);
      }
      if (schedRes.status === "fulfilled") {
        setScheduleData(schedRes.value);
      } else {
        setError(schedRes.reason?.message ?? "Error al cargar horario");
      }
      setLoading(false);
    });
  }, []);

  const bloque  = scheduleData?.data?.[0] ?? null;
  const periodo = bloque?.periodo ?? null;
  const horario = bloque?.horario ?? [];

  const firstName = (profile?.persona || user?.email || "Estudiante").split(" ")[0];

  return (
    <PageWrapper profileName={profile?.persona}>
      <header className="content-header">
        <div>
          <h2 className="page-title">Hola, {firstName} 👋</h2>
          <p className="page-sub">Panel principal — SII TecNM Celaya</p>
        </div>
      </header>

      <section>
        <h3 className="section-title">Accesos rápidos</h3>
        <div className="menu-grid" style={{ marginTop: "0.8rem" }}>
          {QUICK_CARDS.map((c) => (
            <button key={c.path} className="menu-card" onClick={() => navigate(c.path)}>
              <div className="menu-icon" style={{ color: c.color }}>{c.icon}</div>
              <h4 className="menu-card-title">{c.label}</h4>
              <p className="menu-card-desc">{c.desc}</p>
              <span className="menu-card-btn" style={{ color: c.color }}>Ver →</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="schedule-header">
          <h3 className="section-title">Horario del semestre</h3>
          {periodo && (
            <span className="period-badge" style={{ fontSize: "0.8rem", color: "var(--muted)", marginLeft: "10px" }}>
              {periodo.descripcion_periodo}
            </span>
          )}
        </div>

        {loading && <LoadingState message="Cargando horario..." />}
        {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}

        {!loading && !error && horario.length === 0 && (
          <div className="empty-state">No hay horario disponible para este periodo.</div>
        )}

        {!loading && !error && horario.length > 0 && (
          <div className="table-wrapper" style={{ marginTop: "1rem" }}>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="th-materia">Materia</th>
                  <th className="th-grupo">Grupo</th>
                  {DAYS.map((d) => <th key={d.key} className="th-day">{d.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {horario.map((mat, idx) => {
                  const { bg, border } = PALETTE[idx % PALETTE.length];
                  return (
                    <tr key={mat.id_grupo ?? idx} className="schedule-row">
                      <td className="td-materia" style={{ borderLeft: `3px solid ${border}` }}>
                        <span className="mat-nombre" style={{ fontWeight: 600, display: "block" }}>{mat.nombre_materia}</span>
                        <span className="mat-clave" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{mat.clave_materia}</span>
                      </td>
                      <td className="td-grupo">
                        <span className="grupo-chip" style={{ background: bg, border: `1px solid ${border}`, padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>
                          {mat.letra_grupo}
                        </span>
                      </td>
                      {DAYS.map((d) => {
                        const hora  = mat[d.key];
                        const salon = mat[d.salon];
                        return (
                          <td key={d.key} className={`td-day ${hora ? "td-day--filled" : ""}`}>
                            {hora ? (
                              <div className="day-cell" style={{ background: bg, border: `1px solid ${border}`, padding: "6px", borderRadius: "8px", textAlign: "center" }}>
                                <span className="day-time" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600 }}>{hora}</span>
                                {salon && <span className="day-salon" style={{ display: "block", fontSize: "0.7rem", opacity: 0.8 }}>{salon}</span>}
                              </div>
                            ) : (
                              <span className="day-empty" style={{ color: "var(--muted)", opacity: 0.3 }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageWrapper>
  );
}