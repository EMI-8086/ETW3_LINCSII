import { useEffect, useState } from "react";
import { studentService } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { LoadingState, ErrorState } from "../components/ApiState";

/*
  Estructura real:
  res.data[0].periodo   → { clave_periodo, anio, descripcion_periodo }
  res.data[0].materias  → array de materias
    materia.materia     → { id_grupo, nombre_materia, clave_materia, letra_grupo }
    materia.calificaiones (sic) → [
      { id_calificacion, numero_calificacion: 1|2|3|4, calificacion: "90" | "null" | null }
    ]
  numero_calificacion: 1=P1, 2=P2, 3=P3, 4=Final/Ordinario
*/

const PARCIALES = [
  { num: 1, label: "Parcial 1" },
  { num: 2, label: "Parcial 2" },
  { num: 3, label: "Parcial 3" },
  { num: 4, label: "Final"     },
];

function parseGrade(raw) {
  if (raw === null || raw === undefined) return null;
  if (raw === "null" || raw === "") return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

function gradeColor(n) {
  if (n === null) return { text: "#6b7590", bg: "transparent", border: "transparent" };
  if (n >= 70)   return { text: "#00f5c4", bg: "rgba(0,245,196,0.10)", border: "rgba(0,245,196,0.30)" };
  return           { text: "#ff4d6d", bg: "rgba(255,77,109,0.10)",  border: "rgba(255,77,109,0.30)" };
}

function calcPromedio(califs) {
  const vals = califs.map(parseGrade).filter((v) => v !== null);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

export default function GradesPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchGrades = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await studentService.getGrades();
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrades(); }, []);

  const bloque   = data?.data?.[0] ?? null;
  const periodo  = bloque?.periodo ?? null;
  const materias = bloque?.materias ?? [];

  // Promedio general: promedio de los finales (numero_calificacion === 4)
  const finales = materias
    .map((m) => {
      const final = (m.calificaiones ?? []).find((c) => c.numero_calificacion === 4);
      return parseGrade(final?.calificacion);
    })
    .filter((v) => v !== null);
  const promedioGeneral = finales.length
    ? (finales.reduce((a, b) => a + b, 0) / finales.length).toFixed(1)
    : null;

  return (
    <PageWrapper>
      <header className="content-header">
        <div>
          <h2 className="page-title">Calificaciones</h2>
          <p className="page-sub">
            {periodo ? periodo.descripcion_periodo : "Periodo actual"}
          </p>
        </div>

        {promedioGeneral && (
          <div className="avg-badge">
            <span className="avg-label">Promedio general</span>
            <span className="avg-value" style={{ color: gradeColor(parseFloat(promedioGeneral)).text }}>
              {promedioGeneral}
            </span>
          </div>
        )}
      </header>

      {loading && <LoadingState message="Cargando calificaciones..." />}
      {error && !loading && <ErrorState message={error} onRetry={fetchGrades} />}

      {!loading && !error && materias.length === 0 && (
        <div className="empty-state">No hay calificaciones registradas para este periodo.</div>
      )}

      {!loading && !error && materias.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table grades-table">
            <thead>
              <tr>
                <th className="th-materia">Materia</th>
                <th>Grupo</th>
                {PARCIALES.map((p) => (
                  <th key={p.num} className="th-grade">{p.label}</th>
                ))}
                <th className="th-grade">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((item, idx) => {
                const mat    = item.materia ?? {};
                // Nota: la API tiene typo "calificaiones" (sin 'c' en ciones)
                const califs = item.calificaiones ?? item.calificaciones ?? [];

                // Indexar por numero_calificacion para acceso rápido
                const byNum = {};
                califs.forEach((c) => { byNum[c.numero_calificacion] = c.calificacion; });

                const vals     = PARCIALES.map((p) => parseGrade(byNum[p.num]));
                const promedio = calcPromedio(Object.values(byNum));

                return (
                  <tr key={mat.id_grupo ?? idx}>
                    <td className="td-materia" style={{ borderLeft: `3px solid rgba(0,245,196,${0.15 + (idx % 3) * 0.1})` }}>
                      <span className="mat-nombre">{mat.nombre_materia ?? "—"}</span>
                      <span className="mat-clave">{mat.clave_materia ?? ""}</span>
                    </td>
                    <td className="td-center">
                      <span className="grupo-chip" style={{
                        background: "rgba(124,108,252,0.12)",
                        border: "1px solid rgba(124,108,252,0.3)",
                      }}>
                        {mat.letra_grupo ?? "—"}
                      </span>
                    </td>

                    {vals.map((val, i) => {
                      const c = gradeColor(val);
                      return (
                        <td key={i} className="td-center">
                          <span className="grade-chip" style={{
                            color: c.text, background: c.bg, border: `1px solid ${c.border}`,
                          }}>
                            {val ?? <span style={{ color: "#6b7590", fontSize: "0.75rem" }}>S/C</span>}
                          </span>
                        </td>
                      );
                    })}

                    {/* Promedio de parciales disponibles */}
                    <td className="td-center">
                      {promedio ? (
                        <span className="grade-chip" style={{
                          color: gradeColor(parseFloat(promedio)).text,
                          background: gradeColor(parseFloat(promedio)).bg,
                          border: `1px solid ${gradeColor(parseFloat(promedio)).border}`,
                          fontWeight: 700,
                        }}>
                          {promedio}
                        </span>
                      ) : (
                        <span style={{ color: "#6b7590", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      {!loading && !error && materias.length > 0 && (
        <div className="grades-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#00f5c4" }} /> Aprobado (≥70)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#ff4d6d" }} /> Reprobado (&lt;70)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#6b7590" }} /> Sin calificación (S/C)
          </span>
        </div>
      )}
    </PageWrapper>
  );
}