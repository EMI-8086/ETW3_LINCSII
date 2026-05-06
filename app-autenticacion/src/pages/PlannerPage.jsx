import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/PageWrapper";
import jsPDF from "jspdf";

/* ============================
   DATOS ESTÁTICOS (RETÍCULA SISTEMAS)
   ============================ */
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const HOURS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30"
];

const CURRICULUM = [
  { id: "AED-1285", nombre: "Fundamentos de Programación", creditos: 5, semestre: 1, prereq: [], period: "22/2", grade: 91, groups: [] },
  { id: "AEF-1041", nombre: "Matemáticas Discretas", creditos: 5, semestre: 1, prereq: [], period: "22/2", grade: 92, groups: [] },
  { id: "ACF-2301", nombre: "Cálculo Diferencial", creditos: 5, semestre: 1, prereq: [], period: "22/2", grade: 81, groups: [] },
  { id: "AEC-1058", nombre: "Química", creditos: 4, semestre: 1, prereq: [], period: "22/2", grade: 78, groups: [] },
  { id: "ACC-0906", nombre: "Fundamentos de Investigación", creditos: 4, semestre: 1, prereq: [], period: "22/2", grade: 83, groups: [] },
  { id: "SCH-1024", nombre: "Taller de Administración", creditos: 4, semestre: 2, prereq: [], period: "23/2", grade: 90, groups: [] },
  { id: "AEF-1052", nombre: "Probabilidad y Estadística", creditos: 5, semestre: 2, prereq: [], period: "23/1", grade: 82, groups: [] },
  { id: "SCD-1003", nombre: "Sistemas Digitales", creditos: 5, semestre: 3, prereq: ["AED-1285"], period: "23/1", grade: 88, groups: [] },
  { id: "AED-1286", nombre: "Estructura de Datos", creditos: 5, semestre: 3, prereq: ["AED-1285"], period: "23/1", grade: 85, groups: [] },
  { id: "SCD-1015", nombre: "Arquitectura de Computadoras", creditos: 5, semestre: 4, prereq: ["SCD-1003"], period: "23/2", grade: 92, groups: [] },
  { id: "SCB-1001", nombre: "Bases de Datos", creditos: 5, semestre: 4, prereq: ["AED-1286"], period: "23/2", grade: 87, groups: [] },
  { id: "SCC-1007", nombre: "Redes de Computadoras I", creditos: 5, semestre: 5, prereq: [], period: "24/1", grade: 90, groups: [] },
  { id: "SCC-1012", nombre: "Sistemas Operativos I", creditos: 5, semestre: 5, prereq: ["AED-1286","SCD-1015"], period: "24/1", grade: 86, groups: [] },
  { id: "SCD-1016", nombre: "Ingeniería de Software I", creditos: 5, semestre: 6, prereq: ["SCB-1001"], period: "24/2", grade: 88, groups: [] },
  { id: "SCD-1027", nombre: "Lenguajes de Programación", creditos: 5, semestre: 6, prereq: ["AED-1286"], period: "24/2", grade: 91, groups: [] },
  { id: "SCD-1011", nombre: "Sistemas Operativos II", creditos: 5, semestre: 7, prereq: ["SCC-1012"], period: "25/1", grade: 82, groups: [] },
  { id: "SCD-1020", nombre: "Redes de Computadoras II", creditos: 5, semestre: 7, prereq: ["SCC-1007"], period: "25/1", grade: 82, groups: [] },
  { id: "SCA-1002", nombre: "Inteligencia Artificial", creditos: 5, semestre: 8, prereq: ["AEF-1052","AED-1286"], period: "25/2", grade: 93, groups: [] },
  { id: "SCD-1022", nombre: "Ingeniería de Software II", creditos: 5, semestre: 8, prereq: ["SCD-1016"], period: "25/2", grade: 87, groups: [] },
  // Semestre 9
  { id: "SCD-1025", nombre: "Sistemas Distribuidos", creditos: 5, semestre: 9, prereq: ["SCD-1020"], groups: [
      { id: "G1", days: ["Lunes", "Miércoles"], start: "07:00", end: "08:30", prof: "Dr. López", aula: "C-201" },
      { id: "G2", days: ["Martes", "Jueves"], start: "09:00", end: "10:30", prof: "Dr. Pérez", aula: "C-202" },
      { id: "G3", days: ["Lunes", "Miércoles"], start: "16:00", end: "17:30", prof: "Mtra. Gómez", aula: "Lab-Redes" }
    ] },
  { id: "SCD-1030", nombre: "Seguridad Informática", creditos: 5, semestre: 9, prereq: ["SCD-1020"], groups: [
      { id: "G1", days: ["Martes", "Jueves"], start: "07:00", end: "08:30", prof: "Ing. Ramírez", aula: "C-205" },
      { id: "G2", days: ["Lunes", "Miércoles"], start: "10:30", end: "12:00", prof: "Dr. Castillo", aula: "Lab-Seg" },
      { id: "G3", days: ["Martes", "Jueves"], start: "18:00", end: "19:30", prof: "Ing. Ramírez", aula: "C-205" }
    ] },
  { id: "SCD-1040", nombre: "Proyecto Integrador I", creditos: 6, semestre: 9, prereq: ["SCD-1022","SCD-1011"], groups: [
      { id: "G1", days: ["Viernes"], start: "09:00", end: "12:00", prof: "Comité", aula: "A-301" },
      { id: "G2", days: ["Viernes"], start: "15:00", end: "18:00", prof: "Comité", aula: "A-302" },
      { id: "G3", days: ["Sábado"], start: "07:00", end: "10:00", prof: "Comité", aula: "A-303" }
    ] },
  // Semestre 10
  { id: "SCD-1050", nombre: "Cómputo en la Nube", creditos: 5, semestre: 10, prereq: ["SCD-1025"], groups: [
      { id: "G1", days: ["Lunes", "Miércoles"], start: "07:00", end: "08:30", prof: "Dr. Nube", aula: "Lab-Nube" },
      { id: "G2", days: ["Martes", "Jueves"], start: "10:30", end: "12:00", prof: "Dr. Virtual", aula: "Lab-Nube" },
      { id: "G3", days: ["Lunes", "Miércoles"], start: "18:00", end: "19:30", prof: "Mtra. Servicios", aula: "Lab-Nube" }
    ] },
  { id: "SCD-1055", nombre: "Inteligencia de Negocios", creditos: 5, semestre: 10, prereq: ["SCA-1002"], groups: [
      { id: "G1", days: ["Martes", "Jueves"], start: "07:00", end: "08:30", prof: "Dr. Datos", aula: "C-301" },
      { id: "G2", days: ["Lunes", "Miércoles"], start: "09:00", end: "10:30", prof: "Mtra. BI", aula: "C-302" },
      { id: "G3", days: ["Martes", "Jueves"], start: "16:00", end: "17:30", prof: "Dr. Datos", aula: "C-301" }
    ] },
  { id: "SCD-1060", nombre: "Arquitectura de Software", creditos: 5, semestre: 10, prereq: ["SCD-1022"], groups: [
      { id: "G1", days: ["Miércoles", "Viernes"], start: "07:00", end: "08:30", prof: "Arq. Martínez", aula: "C-400" },
      { id: "G2", days: ["Lunes", "Jueves"], start: "12:00", end: "13:30", prof: "Arq. Martínez", aula: "C-401" },
      { id: "G3", days: ["Martes", "Viernes"], start: "18:00", end: "19:30", prof: "Mtra. Patrones", aula: "C-400" }
    ] },
  { id: "SCD-1065", nombre: "Proyecto Integrador II", creditos: 6, semestre: 10, prereq: ["SCD-1040"], groups: [
      { id: "G1", days: ["Viernes"], start: "12:00", end: "15:00", prof: "Comité", aula: "A-401" },
      { id: "G2", days: ["Sábado"], start: "07:00", end: "10:00", prof: "Comité", aula: "A-402" },
      { id: "G3", days: ["Viernes"], start: "15:00", end: "18:00", prof: "Comité", aula: "A-403" }
    ] }
];

const APROBADAS_IDS = CURRICULUM.filter(sub => sub.grade !== undefined).map(sub => sub.id);
const ULTIMAS_CURSADAS = CURRICULUM
  .filter(sub => sub.grade !== undefined)
  .sort((a, b) => b.period.localeCompare(a.period))
  .slice(0, 8);

/* ============================
   COLORES PASTEL (más bajitos)
   ============================ */
const COLORS = {
  primary: "#9f8ce0",    // morado pastel
  success: "#7ae0a0",    // verde pastel
  danger: "#ff8a80",     // rojo pastel
  warning: "#ffe082",    // amarillo pastel
  muted: "#6b7590",
  border: "#2a2f3d",
  bgCard: "rgba(255,255,255,0.03)",
  bgTableHeader: "#1a1d26",
  text: "#e2e8f0",
  textSecondary: "#a0aec0",
};

const btnBase = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
  transition: "all 0.2s",
};

/* ============================
   COMPONENTE
   ============================ */
export default function PlannerPage() {
  const { token } = useAuth();
  const currentSemester = 9;
  const nextSemester = currentSemester + 1;

  const nextSubjects = CURRICULUM.filter(s => s.semestre === nextSemester);
  const pendingPrevSubjects = CURRICULUM.filter(
    s => s.semestre <= currentSemester && !APROBADAS_IDS.includes(s.id)
  );

  const [selected, setSelected] = useState([]);
  const [notification, setNotification] = useState(null);

  // Auto‑ocultar notificación tras 4 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Verificar solapamiento horario entre dos ítems
  const hasConflict = (item1, item2) => {
    const days1 = item1.group.days;
    const days2 = item2.group.days;
    const commonDays = days1.filter(d => days2.includes(d));
    if (commonDays.length === 0) return false;
    const s1 = item1.group.start, e1 = item1.group.end;
    const s2 = item2.group.start, e2 = item2.group.end;
    return s1 < e2 && s2 < e1;
  };

  const addSubject = (materia, group) => {
    if (selected.some(item => item.materia.id === materia.id)) {
      setNotification({ type: "error", message: `La materia "${materia.nombre}" ya fue añadida al horario.` });
      return;
    }

    const newItem = { materia, group };
    const conflict = selected.some(item => hasConflict(item, newItem));
    if (conflict) {
      setNotification({ type: "warning", message: `El grupo ${group.id} de "${materia.nombre}" se solapa con otra materia.` });
    }

    setSelected(prev => [...prev, newItem]);
  };

  const removeSubject = (materiaId) => {
    setSelected(prev => prev.filter(item => item.materia.id !== materiaId));
  };

  const scheduleGrid = useMemo(() => {
    const grid = {};
    selected.forEach(({ materia, group }) => {
      group.days.forEach(day => {
        if (!grid[day]) grid[day] = [];
        grid[day].push({ materia, group });
      });
    });
    return grid;
  }, [selected]);

  const meetsPrereqs = (materia) =>
    materia.prereq.every(pre => APROBADAS_IDS.includes(pre));

  // Descargar PDF con diseño de tabla de horario
  const downloadPDF = () => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Título
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Horario Semestre 10", pageWidth / 2, 15, { align: "center" });

    // Configuración de la tabla
    const marginX = 10;
    const marginY = 20;
    const tableWidth = pageWidth - 2 * marginX;
    const rowHeight = 10;
    const timeColumnWidth = 18;
    const dayColumnWidth = (tableWidth - timeColumnWidth) / DAYS.length;

    // Días de la semana (encabezados)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(230, 230, 250); // lavanda claro
    pdf.rect(marginX, marginY, tableWidth, rowHeight, "F");
    pdf.setTextColor(50);
    pdf.text("Hora", marginX + 2, marginY + 7);
    DAYS.forEach((day, index) => {
      const x = marginX + timeColumnWidth + index * dayColumnWidth;
      pdf.text(day, x + dayColumnWidth / 2, marginY + 7, { align: "center" });
    });

    // Líneas verticales de la cabecera
    pdf.setDrawColor(180);
    pdf.setLineWidth(0.2);
    pdf.line(marginX + timeColumnWidth, marginY, marginX + timeColumnWidth, marginY + rowHeight);
    DAYS.forEach((_, i) => {
      const x = marginX + timeColumnWidth + (i + 1) * dayColumnWidth;
      pdf.line(x, marginY, x, marginY + rowHeight);
    });

    // Dibujar filas de horas
    pdf.setFont("helvetica", "normal");
    const startHourIndex = HOURS.findIndex(h => h === "07:00");
    const endHourIndex = HOURS.findIndex(h => h === "19:30");
    const visibleHours = HOURS.slice(startHourIndex, endHourIndex + 1);

    let currentY = marginY + rowHeight;
    visibleHours.forEach((hour, idx) => {
      if (idx % 2 === 0) { // solo dibujamos franjas de 30 min, pero pintamos por cada hora entera
        pdf.setFontSize(8);
        pdf.setTextColor(80);
        pdf.text(hour, marginX + 2, currentY + 6);
      }
      // Línea horizontal tenue
      pdf.setDrawColor(210);
      pdf.setLineWidth(0.1);
      pdf.line(marginX, currentY, marginX + tableWidth, currentY);

      // Ver qué materias caen en esta franja
      DAYS.forEach((day, dayIdx) => {
        const cellX = marginX + timeColumnWidth + dayIdx * dayColumnWidth;
        const cellClasses = (scheduleGrid[day] || []).filter(
          ({ group }) => group && hour >= group.start && hour < group.end
        );
        if (cellClasses.length > 0) {
          // Pintar rectángulo de color
          const conf = cellClasses.length > 1;
          pdf.setFillColor(conf ? 255 : 122, conf ? 138 : 224, conf ? 128 : 160); // rojo pastel / verde pastel
          pdf.rect(cellX, currentY, dayColumnWidth, rowHeight, "F");
          pdf.setTextColor(0);
          pdf.setFontSize(6);
          // Mostrar nombre de materia (abreviado)
          const text = cellClasses.map(({ materia }) => materia.nombre.substring(0, 12)).join("/");
          pdf.text(text, cellX + 1, currentY + 5, { maxWidth: dayColumnWidth - 2 });
        }
      });

      // Líneas verticales
      pdf.setDrawColor(180);
      pdf.setLineWidth(0.2);
      if (idx === visibleHours.length - 1) {
        pdf.line(marginX + timeColumnWidth, currentY, marginX + timeColumnWidth, currentY + rowHeight);
        DAYS.forEach((_, i) => {
          const x = marginX + timeColumnWidth + (i + 1) * dayColumnWidth;
          pdf.line(x, currentY, x, currentY + rowHeight);
        });
      }

      currentY += rowHeight;
    });

    // Borde exterior
    pdf.setDrawColor(100);
    pdf.setLineWidth(0.8);
    pdf.rect(marginX, marginY, tableWidth, currentY - marginY);

    pdf.save("mi_horario.pdf");
  };

  if (!token) {
    return (
      <PageWrapper>
        <p style={{ color: COLORS.danger }}>Debes iniciar sesión para usar el planificador.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Notificación temporal */}
        {notification && (
          <div
            style={{
              background: notification.type === "error" ? COLORS.danger : COLORS.warning,
              color: "#0a0f1a",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: 16,
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#0a0f1a",
                fontSize: "1.2rem",
                cursor: "pointer",
                marginLeft: 12,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <header className="content-header">
          <div>
            <h2 className="page-title">Planificador de Horario</h2>
            <p className="page-sub">Semestre actual: {currentSemester} | Planificando: Semestre {nextSemester}</p>
          </div>
        </header>

        {/* ÚLTIMAS MATERIAS CURSADAS */}
        <section style={{ marginTop: 32 }}>
          <h3 style={{ color: COLORS.text, marginBottom: 16 }}>Ultimas materias cursadas</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Materia</th>
                  <th>Creditos</th>
                  <th>Cal.</th>
                  <th>Periodo</th>
                </tr>
              </thead>
              <tbody>
                {ULTIMAS_CURSADAS.map((sub, idx) => (
                  <tr key={sub.id} className={idx % 2 === 0 ? "row-even" : "row-odd"}>
                    <td className="td-main">{sub.id}</td>
                    <td>{sub.nombre}</td>
                    <td className="td-center">{sub.creditos}</td>
                    <td className="td-center" style={{ color: COLORS.success, fontWeight: "bold" }}>{sub.grade}</td>
                    <td className="td-muted">{sub.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <hr style={{ borderColor: COLORS.border, margin: "24px 0" }} />

        {/* MATERIAS DEL SIGUIENTE SEMESTRE */}
        <section>
          <h3 style={{ color: COLORS.text, marginBottom: 16 }}>Materias del Semestre {nextSemester}</h3>
          {nextSubjects.map(sub => {
            const puede = meetsPrereqs(sub);
            return (
              <div
                key={sub.id}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ color: COLORS.text }}>
                    {sub.nombre} <span style={{ color: COLORS.muted, fontSize: "0.9rem" }}>({sub.id})</span>
                  </strong>
                  <span style={{ color: COLORS.textSecondary }}>{sub.creditos} creditos</span>
                </div>
                {puede ? (
                  <div>
                    <span style={{ fontSize: "0.9rem", color: COLORS.muted }}>Selecciona un grupo:</span>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {sub.groups.map(g => (
                        <button
                          key={g.id}
                          disabled={selected.some(item => item.materia.id === sub.id)}
                          onClick={() => addSubject(sub, g)}
                          style={{
                            ...btnBase,
                            background: COLORS.success,
                            color: "#0a0f1a",
                          }}
                        >
                          {g.id}: {g.days.join("/")} {g.start}-{g.end} ({g.prof}, {g.aula})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: COLORS.danger, fontStyle: "italic", marginTop: 8 }}>
                    Prerrequisito faltante:{" "}
                    {sub.prereq.filter(p => !APROBADAS_IDS.includes(p)).join(", ")}
                    {" "}(agrega la materia del semestre anterior)
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {/* MATERIAS PENDIENTES ANTERIORES */}
        {pendingPrevSubjects.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h3 style={{ color: COLORS.text, marginBottom: 16 }}>Materias pendientes de semestres anteriores</h3>
            {pendingPrevSubjects.map(sub => (
              <div
                key={sub.id}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong style={{ color: COLORS.text }}>
                    {sub.nombre} ({sub.id})
                  </strong>
                  <span style={{ color: COLORS.textSecondary }}>
                    {sub.creditos} creditos | Semestre {sub.semestre}
                  </span>
                </div>
                {sub.groups && sub.groups.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sub.groups.map(g => (
                      <button
                        key={g.id}
                        disabled={selected.some(item => item.materia.id === sub.id)}
                        onClick={() => addSubject(sub, g)}
                        style={{
                          ...btnBase,
                          background: COLORS.primary,
                          color: "#fff",
                        }}
                      >
                        {g.id}: {g.days.join("/")} {g.start}-{g.end} ({g.prof}, {g.aula})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        <hr style={{ borderColor: COLORS.border, margin: "24px 0" }} />

        {/* HORARIO ARMADO */}
        <section>
          <h3 style={{ color: COLORS.text, marginBottom: 16 }}>Mi horario armado</h3>
          {selected.length === 0 ? (
            <p style={{ color: COLORS.muted }}>No has agregado materias. Selecciona un grupo para comenzar.</p>
          ) : (
            <>
              <button
                onClick={downloadPDF}
                style={{ ...btnBase, background: COLORS.primary, color: "#fff", marginBottom: 16 }}
              >
                Descargar horario
              </button>

              <div className="table-wrapper" style={{ marginBottom: 24 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Grupo</th>
                      <th>Dias</th>
                      <th>Horario</th>
                      <th>Profesor / Aula</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.map(({ materia, group }) => (
                      <tr key={materia.id}>
                        <td className="td-main">{materia.nombre}</td>
                        <td>{group.id}</td>
                        <td>{group.days.join(", ")}</td>
                        <td>{group.start} - {group.end}</td>
                        <td>{group.prof} ({group.aula})</td>
                        <td>
                          <button
                            onClick={() => removeSubject(materia.id)}
                            style={{
                              ...btnBase,
                              background: COLORS.danger,
                              color: "#fff",
                              padding: "4px 12px",
                              fontSize: "0.8rem",
                            }}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-wrapper">
                <table className="data-table" style={{ minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: 70 }}>Hora</th>
                      {DAYS.map(day => <th key={day}>{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.slice(0, -1).map((hour, idx) => (
                      <tr key={hour}>
                        <td style={{ fontWeight: "bold", color: COLORS.textSecondary }}>{hour}</td>
                        {DAYS.map(day => {
                          const cellClasses = (scheduleGrid[day] || []).filter(
                            ({ group }) => group && hour >= group.start && hour < group.end
                          );
                          const conflict = cellClasses.length > 1;
                          return (
                            <td
                              key={day}
                              style={{
                                background: cellClasses.length ? (conflict ? COLORS.danger : COLORS.success) : "transparent",
                                color: "#0a0f1a",
                                fontSize: "0.8rem",
                                textAlign: "center",
                                padding: "4px",
                              }}
                            >
                              {cellClasses.map(({ materia }) => (
                                <div key={materia.id} style={{ fontWeight: 600 }}>{materia.nombre}</div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}