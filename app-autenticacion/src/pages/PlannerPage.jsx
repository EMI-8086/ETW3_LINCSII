import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/Api";
import PageWrapper from "../components/PageWrapper";
import jsPDF from "jspdf";

// Malla curricular simulada
const MOCK_CURRICULUM = [
  { id: "1", nombre: "Fundamentos de Programación", creditos: 5, prereq: [], semestre: 1 },
  { id: "2", nombre: "Matemáticas Discretas", creditos: 5, prereq: [], semestre: 1 },
  { id: "3", nombre: "Estructura de Datos", creditos: 5, prereq: ["1"], semestre: 2 },
  { id: "4", nombre: "Base de Datos", creditos: 4, prereq: ["1"], semestre: 2 },
  { id: "5", nombre: "Sistemas Operativos", creditos: 4, prereq: ["3"], semestre: 3 },
  { id: "6", nombre: "Redes de Computadoras", creditos: 4, prereq: ["3"], semestre: 3 },
  { id: "7", nombre: "Ingeniería de Software", creditos: 5, prereq: ["3", "4"], semestre: 4 },
  { id: "8", nombre: "Inteligencia Artificial", creditos: 4, prereq: ["2", "3"], semestre: 5 },
  { id: "9", nombre: "Proyecto Integrador", creditos: 6, prereq: ["5", "6", "7"], semestre: 6 },
];

const MAX_CREDITS_PER_SEMESTER = 25; // Ajustable

export default function PlannerPage() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [approvedIds, setApprovedIds] = useState([]);
  const [plan, setPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener perfil y kardex reales
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const profData = await studentService.getProfile();
        setProfile(profData?.data ?? profData);

        const kardexData = await studentService.getKardex();
        const kardexList = Array.isArray(kardexData?.data)
          ? kardexData.data
          : Array.isArray(kardexData)
          ? kardexData
          : [];

        const aprobadas = kardexList
          .filter((item) => {
            const cal = parseFloat(item.calificacion || item.calificacionFinal || 0);
            return cal >= 70;
          })
          .map((item) => item.clave || item.idMateria || item.materiaId || "");

        setApprovedIds(aprobadas);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError(err.message || "Error al cargar datos del planificador");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const currentSemester = profile?.semestre || profile?.semestreActual || 1;
  const totalSemesters = 9;

  const futureSemesters = useMemo(() => {
    const start = currentSemester + 1;
    return Array.from({ length: totalSemesters - start + 1 }, (_, i) => start + i);
  }, [currentSemester]);

  // Materias que aún no has aprobado
  const remainingSubjects = useMemo(() => {
    return MOCK_CURRICULUM
      .filter((sub) => !approvedIds.includes(sub.id))
      .sort((a, b) => a.semestre - b.semestre);
  }, [approvedIds]);

  // IDs de materias ya colocadas en algún semestre
  const plannedIds = useMemo(() => {
    const ids = [];
    Object.values(plan).forEach((arr) => ids.push(...arr));
    return ids;
  }, [plan]);

  const notPlanned = remainingSubjects.filter((sub) => !plannedIds.includes(sub.id));

  const totalPendingCredits = remainingSubjects.reduce((sum, s) => sum + s.creditos, 0);
  const plannedCredits = remainingSubjects
    .filter((s) => plannedIds.includes(s.id))
    .reduce((sum, s) => sum + s.creditos, 0);
  const progress = totalPendingCredits ? Math.round((plannedCredits / totalPendingCredits) * 100) : 0;

  const isComplete = remainingSubjects.every((sub) => plannedIds.includes(sub.id));

  // Agregar materia a un semestre (SIN validación de prerrequisitos)
  const addToSemester = (subjectId, sem) => {
    const subject = MOCK_CURRICULUM.find((s) => s.id === subjectId);
    if (!subject) return;

    setPlan((prev) => ({
      ...prev,
      [`s${sem}`]: [...(prev[`s${sem}`] || []), subjectId],
    }));
  };

  const removeFromSemester = (subjectId, sem) => {
    setPlan((prev) => ({
      ...prev,
      [`s${sem}`]: (prev[`s${sem}`] || []).filter((id) => id !== subjectId),
    }));
  };

  const moveUp = (index, sem) => {
    if (index === 0) return;
    setPlan((prev) => {
      const arr = [...(prev[`s${sem}`] || [])];
      [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
      return { ...prev, [`s${sem}`]: arr };
    });
  };

  const moveDown = (index, sem) => {
    setPlan((prev) => {
      const arr = [...(prev[`s${sem}`] || [])];
      if (index >= arr.length - 1) return prev;
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return { ...prev, [`s${sem}`]: arr };
    });
  };

  // Auto-planificar sin restricciones de prerrequisitos
  const autoPlan = () => {
    const newPlan = {};
    futureSemesters.forEach((sem) => (newPlan[`s${sem}`] = []));

    // Ordenar por semestre recomendado (solo para distribución visual)
    const sorted = [...remainingSubjects].sort((a, b) => a.semestre - b.semestre);

    for (const subject of sorted) {
      let placed = false;
      for (const sem of futureSemesters) {
        // Solo verificamos el límite de créditos
        const currentCredits = (newPlan[`s${sem}`] || [])
          .map((id) => MOCK_CURRICULUM.find((s) => s.id === id)?.creditos || 0)
          .reduce((a, b) => a + b, 0);
        if (currentCredits + subject.creditos <= MAX_CREDITS_PER_SEMESTER) {
          newPlan[`s${sem}`].push(subject.id);
          placed = true;
          break;
        }
      }
      // Si no cupo en ningún semestre, forzar en el último
      if (!placed) {
        const lastSem = futureSemesters[futureSemesters.length - 1];
        newPlan[`s${lastSem}`].push(subject.id);
      }
    }

    setPlan(newPlan);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Plan de estudios personalizado", 105, 20, { align: "center" });
    let y = 30;
    futureSemesters.forEach((sem) => {
      pdf.setFontSize(14);
      pdf.text(`Semestre ${sem}`, 20, y);
      y += 8;
      const materias = (plan[`s${sem}`] || [])
        .map((id) => MOCK_CURRICULUM.find((s) => s.id === id))
        .filter(Boolean);
      materias.forEach((m) => {
        pdf.text(`• ${m.nombre} (${m.creditos} cr)`, 25, y);
        y += 6;
      });
      y += 4;
    });
    pdf.save("mi_plan_academico.pdf");
  };

  // --- RENDER ---
  if (!token) {
    return (
      <PageWrapper>
        <p style={{ color: "red" }}>Debes iniciar sesión para usar el planificador.</p>
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper>
        <p>⏳ Cargando planificador...</p>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <p style={{ color: "red" }}>{error}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <h2>📅 Planificador de Semestres</h2>
      <p>Semestre actual: {currentSemester}</p>
      <p>
        Faltan {totalPendingCredits - plannedCredits} créditos por planear
        ({progress}% completado)
      </p>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={autoPlan} style={{ marginRight: "10px" }}>
          🤖 Auto-planificar
        </button>
        {isComplete && <button onClick={downloadPDF}>📄 Descargar Plan Final</button>}
        {!isComplete && (
          <span style={{ color: "#aaa", marginLeft: "10px" }}>
            Completa la planeación para descargar el PDF
          </span>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        {futureSemesters.map((sem) => {
          const materias = (plan[`s${sem}`] || [])
            .map((id) => MOCK_CURRICULUM.find((s) => s.id === id))
            .filter(Boolean);
          return (
            <div
              key={sem}
              style={{
                border: "1px solid #666",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
                background: "#1e1e1e",
              }}
            >
              <h3>Semestre {sem}</h3>
              {materias.length === 0 && (
                <p style={{ fontStyle: "italic", color: "#aaa" }}>Sin materias</p>
              )}
              {materias.map((sub, index) => (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px",
                    margin: "4px 0",
                    background: "#333",
                    borderRadius: "4px",
                  }}
                >
                  <span>
                    {sub.nombre} ({sub.creditos} cr)
                  </span>
                  <div>
                    <button onClick={() => moveUp(index, sem)} disabled={index === 0}>⬆️</button>
                    <button onClick={() => moveDown(index, sem)} disabled={index >= materias.length - 1}>⬇️</button>
                    <button onClick={() => removeFromSemester(sub.id, sem)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <hr />

      <h3>Materias pendientes</h3>
      {notPlanned.length === 0 && <p>✅ Todas las materias están planeadas.</p>}
      {notPlanned.map((sub) => (
        <div
          key={sub.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px",
            margin: "4px 0",
            background: "#2a2a2a",
            borderRadius: "4px",
          }}
        >
          <span>
            {sub.nombre} ({sub.creditos} cr)
          </span>
          <div>
            {futureSemesters.map((sem) => (
              <button
                key={sem}
                onClick={() => addToSemester(sub.id, sem)}
                style={{ marginLeft: "4px" }}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      ))}
    </PageWrapper>
  );
}