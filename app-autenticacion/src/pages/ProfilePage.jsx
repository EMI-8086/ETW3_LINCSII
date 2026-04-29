import { useEffect, useState } from "react";
import { studentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/PageWrapper";
import { LoadingState, ErrorState } from "../components/ApiState";

/*
  Estructura real del endpoint GET /api/movil/estudiante:
  {
    "code": 200,
    "flag": true,
    "data": {
      "numero_control", "persona", "email", "semestre",
      "num_mat_rep_no_acreditadas", "creditos_acumulados",
      "promedio_ponderado", "promedio_aritmetico",
      "materias_cursadas", "materias_reprobadas", "materias_aprobadas",
      "creditos_complementarios", "porcentaje_avance",
      "num_materias_rep_primera", "num_materias_rep_segunda",
      "percentaje_avance_cursando", "foto"
    }
  }
*/

const INFO_FIELDS = [
  { label: "No. de Control",    key: "numero_control" },
  { label: "Nombre",            key: "persona" },
  { label: "Correo",            key: "email" },
  { label: "Semestre",          key: "semestre" },
];

const STATS_FIELDS = [
  { label: "Créditos acumulados",      key: "creditos_acumulados" },
  { label: "Créditos complementarios", key: "creditos_complementarios" },
  { label: "Promedio ponderado",       key: "promedio_ponderado" },
  { label: "Promedio aritmético",      key: "promedio_aritmetico" },
  { label: "Materias cursadas",        key: "materias_cursadas" },
  { label: "Materias aprobadas",       key: "materias_aprobadas" },
  { label: "Materias reprobadas",      key: "materias_reprobadas" },
  { label: "Mat. rep. no acreditadas", key: "num_mat_rep_no_acreditadas" },
  { label: "Rep. en primera",          key: "num_materias_rep_primera" },
  { label: "Rep. en segunda",          key: "num_materias_rep_segunda" },
  { label: "Avance de carrera",        key: "porcentaje_avance",         suffix: "%" },
  { label: "Avance cursando",          key: "percentaje_avance_cursando", suffix: "%" },
];

const formatBase64Photo = (base64String) => {
  if (!base64String) return null;  
  if (base64String.startsWith("data:image")) {
    return base64String;
  }
  
  return `data:image/jpeg;base64,${base64String}`;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await studentService.getProfile();
      // La data real viene en res.data
      setProfile(res?.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const d = profile || {};
  const nombre    = d.persona || user?.email || "Estudiante";
  const initials  = nombre.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avance    = d.porcentaje_avance ? parseFloat(d.porcentaje_avance) : null;
  const fotoFormateada = formatBase64Photo(d.foto);

  return (
    <PageWrapper>
      <header className="content-header">
        <div>
          <h2 className="page-title">Mi Perfil</h2>
          <p className="page-sub">Información académica y personal</p>
        </div>
      </header>

      {loading && <LoadingState message="Cargando perfil..." />}
      {error && !loading && <ErrorState message={error} onRetry={fetchProfile} />}

      {!loading && !error && (
        <div className="profile-layout">

          {/* ── Avatar card ── */}
          <div className="profile-avatar-card">
            {fotoFormateada ? (
              <img src={fotoFormateada} alt={nombre} className="profile-photo" />
            ) : (
              <div className="profile-avatar-big">{initials}</div>
            )}

            <h3 className="profile-avatar-name">{nombre}</h3>
            <p className="profile-avatar-email">{d.email || user?.email}</p>

            {d.semestre && (
              <p className="profile-avatar-email">Semestre {d.semestre}</p>
            )}

            <div className="profile-badge">Estudiante activo</div>

            {/* Barra de avance */}
            {avance !== null && (
              <div className="progress-wrap">
                <div className="progress-header">
                  <span className="pf-label">Avance de carrera</span>
                  <span className="progress-pct">{avance}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(avance, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Info card ── */}
          <div className="profile-form-card">

            {/* Datos básicos */}
            <h3 className="form-section-title">Datos personales</h3>
            <div className="profile-fields">
              {INFO_FIELDS.map(({ label, key }) =>
                d[key] !== undefined && d[key] !== "" && d[key] !== null ? (
                  <div key={key} className="profile-field">
                    <span className="pf-label">{label}</span>
                    <span className="pf-value">{d[key]}</span>
                  </div>
                ) : null
              )}
            </div>

            {/* Estadísticas académicas */}
            <h3 className="form-section-title" style={{ marginTop: "1.5rem" }}>
              Estadísticas académicas
            </h3>
            <div className="stats-grid-mini">
              {STATS_FIELDS.map(({ label, key, suffix }) =>
                d[key] !== undefined && d[key] !== null && d[key] !== "" ? (
                  <div key={key} className="stat-mini">
                    <span className="stat-mini-val">
                      {d[key]}{suffix || ""}
                    </span>
                    <span className="stat-mini-label">{label}</span>
                  </div>
                ) : null
              )}
            </div>

          </div>
        </div>
      )}
    </PageWrapper>
  );
}