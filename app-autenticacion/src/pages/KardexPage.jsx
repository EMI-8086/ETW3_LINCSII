import { useEffect, useState } from "react";
import { studentService } from "../services/Api";
import PageWrapper from "../components/PageWrapper";
import { LoadingState, ErrorState } from "../components/ApiState";

function normalizeKardex(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw.data && Array.isArray(raw.data)) return raw.data;
  if (raw.kardex && Array.isArray(raw.kardex)) return raw.kardex;
  if (raw.materias && Array.isArray(raw.materias)) return raw.materias;
  return [];
}

function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("acredit") || s.includes("aprob") || s === "a") return "#00f5c4";
  if (s.includes("reprob") || s === "r") return "#ff4d6d";
  if (s.includes("cursando") || s === "c") return "#7c6cfc";
  return "#6b7590";
}

export default function KardexPage() {
  const [kardex, setKardex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  const fetchKardex = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentService.getKardex();
      setKardex(normalizeKardex(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKardex(); }, []);

  const semesters = [
    "all",
    ...new Set(kardex.map((k) => k.semestre || k.periodo || k.semester || "").filter(Boolean)),
  ];

  const filtered = filterSemester === "all"
    ? kardex
    : kardex.filter(
        (k) => (k.semestre || k.periodo || k.semester || "") === filterSemester
      );

  const creditosAcum = kardex.reduce((acc, k) => {
    const s = (k.estatus || k.status || "").toLowerCase();
    const aprob = s.includes("acredit") || s.includes("aprob") || s === "a";
    return acc + (aprob ? parseInt(k.creditos || k.credits || 0) : 0);
  }, 0);

  return (
    <PageWrapper>
      <header className="content-header">
        <div>
          <h2 className="page-title">Kardex</h2>
          <p className="page-sub">Historial académico completo</p>
        </div>
        {creditosAcum > 0 && (
          <div className="avg-badge">
            <span className="avg-label">Créditos</span>
            <span className="avg-value" style={{ color: "#7c6cfc" }}>{creditosAcum}</span>
          </div>
        )}
      </header>

      {/* Filter */}
      {semesters.length > 1 && (
        <div className="filter-row">
          {semesters.map((s) => (
            <button
              key={s}
              className={`filter-btn ${filterSemester === s ? "active" : ""}`}
              onClick={() => setFilterSemester(s)}
            >
              {s === "all" ? "Todos" : s}
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingState message="Cargando kardex..." />}
      {error && !loading && <ErrorState message={error} onRetry={fetchKardex} />}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">No hay registros en el kardex.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Semestre</th>
                <th>Créditos</th>
                <th>Calificación</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => {
                const nombre = k.materia || k.asignatura || k.subject || k.nombre || `—`;
                const semestre = k.semestre || k.periodo || k.semester || "—";
                const creditos = k.creditos || k.credits || "—";
                const cal = k.calificacion ?? k.calificacion_final ?? k.grade ?? "—";
                const estatus = k.estatus || k.status || k.estado || "—";
                const color = statusColor(estatus);
                return (
                  <tr key={i}>
                    <td className="td-main">{nombre}</td>
                    <td className="td-muted">{semestre}</td>
                    <td className="td-center">{creditos}</td>
                    <td className="td-center">{cal}</td>
                    <td>
                      <span
                        className="status-chip"
                        style={{
                          color,
                          background: `${color}18`,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        {estatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}