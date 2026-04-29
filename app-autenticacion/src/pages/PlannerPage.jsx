import { useState, useMemo, useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import jsPDF from "jspdf";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function PlannerPage() {

  const [bank] = useState([
    { id: "1", nombre: "Fundamentos", creditos: 5, prereq: [] },
    { id: "2", nombre: "Estructura de Datos", creditos: 5, prereq: ["1"] },
    { id: "3", nombre: "Base de Datos", creditos: 4, prereq: ["1"] },
    { id: "4", nombre: "Sistemas Operativos", creditos: 4, prereq: ["2"] },
    { id: "5", nombre: "Redes", creditos: 4, prereq: ["2"] },
    { id: "6", nombre: "Ing. Software", creditos: 5, prereq: ["2","3"] },
  ]);

  const [semesters, setSemesters] = useState({
    s1: [],
    s2: [],
    s3: []
  });

  const [error, setError] = useState("");

  // 💾 Guardado
  useEffect(() => {
    const saved = localStorage.getItem("planner");
    if (saved) setSemesters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("planner", JSON.stringify(semesters));
  }, [semesters]);

  const plannedIds = useMemo(() =>
    Object.values(semesters).flat().map(s => s.id)
  , [semesters]);

  const canAdd = (sub) =>
    sub.prereq.every(p => plannedIds.includes(p));

  // 📊 progreso
  const totalCredits = bank.reduce((a,b)=>a+b.creditos,0);
  const plannedCredits = Object.values(semesters)
    .flat()
    .reduce((a,b)=>a+b.creditos,0);

  const progress = Math.round((plannedCredits / totalCredits) * 100);

  // 🧠 ya terminó?
  const isComplete = plannedIds.length === bank.length;

  // ➕ agregar manual (con elección de semestre)
  const addToSemester = (sub, sem) => {
    setError("");

    if (!canAdd(sub)) {
      setError("Faltan prerrequisitos");
      return;
    }

    if (plannedIds.includes(sub.id)) return;

    setSemesters({
      ...semesters,
      [sem]: [...semesters[sem], sub]
    });
  };

  // 🧲 drag
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceClone = [...semesters[source.droppableId]];
    const destClone = [...semesters[destination.droppableId]];

    const moved = sourceClone[source.index];

    sourceClone.splice(source.index, 1);
    destClone.splice(destination.index, 0, moved);

    setSemesters({
      ...semesters,
      [source.droppableId]: sourceClone,
      [destination.droppableId]: destClone
    });
  };

  // 📄 PDF bonito
  const downloadPDF = () => {
    const pdf = new jsPDF();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Planeación Académica", 105, 20, null, null, "center");

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    pdf.text(`Progreso: ${progress}%`, 20, 36);

    let y = 50;

    Object.keys(semesters).forEach((sem, index) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`Semestre ${index + 1}`, 20, y);
      y += 6;

      pdf.setFont("helvetica", "normal");

      semesters[sem].forEach(sub => {
        pdf.text(`• ${sub.nombre} (${sub.creditos} créditos)`, 25, y);
        y += 5;
      });

      y += 5;
    });

    pdf.save("planeacion_academica.pdf");
  };

  return (
    <PageWrapper>

      <h2>🎓 Planner PRO</h2>
      <p>Progreso: {progress}%</p>

      {/* PDF solo si terminó */}
      {isComplete && (
        <button onClick={downloadPDF}>
          📄 Descargar PDF Final
        </button>
      )}

      {error && <p style={{color:"red"}}>{error}</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{display:"flex", gap:"20px"}}>

          {Object.keys(semesters).map((sem, i) => (
            <Droppable droppableId={sem} key={sem}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    border:"1px solid #444",
                    padding:"10px",
                    width:"220px",
                    minHeight:"300px",
                    borderRadius:"10px"
                  }}
                >
                  <h3>Semestre {i+1}</h3>

                  {semesters[sem].map((sub, index) => (
                    <Draggable key={sub.id} draggableId={sub.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding:"10px",
                            margin:"5px 0",
                            background:"#222",
                            borderRadius:"6px",
                            ...provided.draggableProps.style
                          }}
                        >
                          {sub.nombre}
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>

      <hr />

      <h3>Materias disponibles</h3>

      {bank.filter(b => !plannedIds.includes(b.id)).map(sub => (
        <div key={sub.id} style={{margin:"10px 0", padding:"8px", border:"1px solid #333"}}>
          <strong>{sub.nombre}</strong>

          <div style={{display:"flex", gap:"5px", marginTop:"5px"}}>
            {Object.keys(semesters).map((sem, i) => (
              <button key={sem} onClick={() => addToSemester(sub, sem)}>
                Sem {i+1}
              </button>
            ))}
          </div>
        </div>
      ))}

    </PageWrapper>
  );
}