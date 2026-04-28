import { useEffect, useState } from "react";
import { studentService } from "../services/Api";
import PageWrapper from "../components/PageWrapper";
import { LoadingState, ErrorState } from "../components/ApiState";

// 1. Nueva lógica para evaluar si está aprobada basándonos en la calificación
function isAprobada(calificacion) {
  const cal = parseInt(calificacion);
  return !isNaN(cal) && cal >= 70;
}

// 2. Colores dinámicos basados en la calificación y descripción
function statusColor(calificacion, descripcion) {
  const desc = (descripcion || "").toLowerCase();
  if (desc.includes("cursando")) return "#7c6cfc"; // Morado para materias en curso
  if (calificacion === "NA") return "#ff4d6d"; // Rojo explícito
  
  return isAprobada(calificacion) ? "#00f5c4" : "#ff4d6d"; // Verde (aprobada) o Rojo (reprobada)
}

export default function KardexPage() {
  const [kardex, setKardex] = useState([]);
  const [avance, setAvance] = useState(0); // Nuevo estado para el porcentaje de avance
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  const fetchKardex = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await studentService.getKardex();
      
      // 3. Accedemos a la nueva estructura: res.data.kardex y res.data.porcentaje_avance
      if (res?.data?.kardex) {
        setKardex(res.data.kardex);
        setAvance(res.data.porcentaje_avance || 0);
      } else {
        setKardex([]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKardex(); }, []);

  // 4. Usamos la propiedad exacta "semestre" de la API para los filtros
  const semesters = [
    "all",
    ...new Set(kardex.map((k) => k.semestre).filter(Boolean)),
  ].sort((a, b) => (a === "all" ? -1 : a - b));

  const filtered = filterSemester === "all"
    ? kardex
    : kardex.filter((k) => k.semestre === filterSemester);

  // 5. Acumulamos créditos solo de las materias que tengan calificación aprobatoria
  const creditosAcum = kardex.reduce((acc, k) => {
    return acc + (isAprobada(k.calificacion) ? parseInt(k.creditos || 0) : 0);
  }, 0);

  return (
    <PageWrapper>
      <header className="content-header">
        <div>
          <h2 className="page-title">Kardex</h2>
          <p className="page-sub">Historial académico completo</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Badge para el Porcentaje de Avance */}
          {avance > 0 && (
            <div className="avg-badge">
              <span className="avg-label">Avance</span>
              <span className="avg-value" style={{ color: "#00f5c4" }}>{avance}%</span>
            </div>
          )}
          {/* Badge para Créditos Acumulados */}
          {creditosAcum > 0 && (
            <div className="avg-badge">
              <span className="avg-label">Créditos</span>
              <span className="avg-value" style={{ color: "#7c6cfc" }}>{creditosAcum}</span>
            </div>
          )}
        </div>
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
              {s === "all" ? "Todos" : `Semestre ${s}`}
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
                <th>Periodo</th>
                <th>Créditos</th>
                <th>Calificación</th>
                <th>Evaluación</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => {
                // 6. Mapeo exacto a las llaves del JSON
                const nombre = k.nombre_materia || `—`;
                const clave = k.clave_materia || `—`;
                const periodo = k.periodo || "—";
                const creditos = k.creditos || "—";
                const cal = k.calificacion || "—";
                const descripcion = k.descripcion || "—";

                const color = statusColor(cal, descripcion);

                return (
                  <tr key={i}>
                    <td className="td-main">
                      {nombre}
                      {/* Agregamos la clave de la materia debajo del nombre sutilmente */}
                      <div style={{ fontSize: "0.8rem", color: "#6b7590", marginTop: "2px" }}>
                        {clave}
                      </div>
                    </td>
                    <td className="td-muted">Sem {k.semestre} ({periodo})</td>
                    <td className="td-center">{creditos}</td>
                    <td className="td-center" style={{ fontWeight: "bold", color }}>{cal}</td>
                    <td>
                      <span
                        className="status-chip"
                        style={{
                          color,
                          background: `${color}18`,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        {descripcion}
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