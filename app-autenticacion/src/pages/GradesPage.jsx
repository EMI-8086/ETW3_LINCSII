import { useEffect, useState } from "react";
import { studentService } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { LoadingState, ErrorState } from "../components/ApiState";

function getGradeColor(grade) {
  if (grade === null || grade === undefined) return "#6b7590";
  if (grade >= 90) return "#00f5c4";
  if (grade >= 70) return "#fca43c";
  return "#ff4d6d";
}

function normalizeGrades(raw) {
  if (!raw) return [];
  let items = [];
  if (Array.isArray(raw)) items = raw;
  else if (raw.data && Array.isArray(raw.data)) items = raw.data;
  else if (raw.calificaciones && Array.isArray(raw.calificaciones)) items = raw.calificaciones;
  return items;
}

export default function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGrades = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentService.getGrades();
      setGrades(normalizeGrades(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrades(); }, []);

  const promedio = grades.length
    ? (
        grades.reduce((acc, g) => {
          const val = parseFloat(g.calificacion ?? g.grade ?? g.promedio ?? 0);
          return acc + val;
        }, 0) / grades.length
      ).toFixed(1)
    : null;

  return (
    <PageWrapper>
      <header className="content-header">
        <div>
          <h2 className="page-title">Calificaciones</h2>
          <p className="page-sub">Periodo actual</p>
        </div>
        {promedio && (
          <div className="avg-badge">
            <span className="avg-label">Promedio</span>
            <span className="avg-value" style={{ color: getGradeColor(parseFloat(promedio)) }}>
              {promedio}
            </span>
          </div>
        )}
      </header>

      {loading && <LoadingState message="Cargando calificaciones..." />}
      {error && !loading && <ErrorState message={error} onRetry={fetchGrades} />}

      {!loading && !error && grades.length === 0 && (
        <div className="empty-state">No hay calificaciones registradas.</div>
      )}

      {!loading && !error && grades.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Docente</th>
                <th>Parcial 1</th>
                <th>Parcial 2</th>
                <th>Parcial 3</th>
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => {
                const final = g.calificacion ?? g.final ?? g.promedio ?? g.grade;
                const nombre = g.materia || g.asignatura || g.subject || g.nombre || `Materia ${i + 1}`;
                const docente = g.docente || g.profesor || g.teacher || "—";
                const p1 = g.parcial1 ?? g.p1 ?? "—";
                const p2 = g.parcial2 ?? g.p2 ?? "—";
                const p3 = g.parcial3 ?? g.p3 ?? "—";
                return (
                  <tr key={i}>
                    <td className="td-main">{nombre}</td>
                    <td className="td-muted">{docente}</td>
                    <td>{p1 !== "—" ? <GradeChip val={p1} /> : "—"}</td>
                    <td>{p2 !== "—" ? <GradeChip val={p2} /> : "—"}</td>
                    <td>{p3 !== "—" ? <GradeChip val={p3} /> : "—"}</td>
                    <td>
                      <GradeChip val={final} bold />
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

function GradeChip({ val, bold }) {
  const num = parseFloat(val);
  const color = getGradeColor(isNaN(num) ? null : num);
  return (
    <span
      className="grade-chip"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        fontWeight: bold ? 700 : 500,
      }}
    >
      {val ?? "—"}
    </span>
  );
}