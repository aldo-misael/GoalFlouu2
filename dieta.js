import { db } from "./app.js";
import { collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const tabla = document.getElementById("tabla-dieta");
const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const horasDefault = ["07:00", "10:00", "13:00", "16:00", "19:00", "22:00"];

// ===== Crear tabla (7 días x 6 comidas) =====
for (let i = 0; i < 7; i++) {
  const row = document.createElement("tr");
  row.setAttribute("draggable", "true");   // 🔹 se puede arrastrar
  row.dataset.index = i;                   // 🔹 índice original

  let rowHTML = `<td>${dias[i]}</td>`;
  for (let c = 0; c < 6; c++) {
    rowHTML += `<td>
                  <input type="text" id="h${i+1}c${c+1}" value="${horasDefault[c]}" class="input-tabla" placeholder="Hora">
                  <input type="text" id="d${i+1}c${c+1}" class="input-tabla" placeholder="Alimento">
                </td>`;
  }

  row.innerHTML = rowHTML;
  tabla.appendChild(row);
}

// ===== Drag & Drop =====
let dragSrcRow = null;

tabla.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "TR") {
    dragSrcRow = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.4";
  }
});

tabla.addEventListener("dragend", (e) => {
  if (e.target.tagName === "TR") {
    e.target.style.opacity = "1";
  }
});

tabla.addEventListener("dragover", (e) => {
  e.preventDefault(); // necesario para permitir drop
});

tabla.addEventListener("drop", (e) => {
  e.preventDefault();
  const targetRow = e.target.closest("tr");

  if (dragSrcRow && targetRow && dragSrcRow !== targetRow) {
    const srcInputs = dragSrcRow.querySelectorAll("input, select, textarea");
    const targetInputs = targetRow.querySelectorAll("input, select, textarea");

    if (srcInputs.length === targetInputs.length) {
      srcInputs.forEach((input, i) => {
        const temp = input.value;
        input.value = targetInputs[i].value;
        targetInputs[i].value = temp;
      });
    }

    // 🔹 Reescribir primera columna con días
    Array.from(tabla.querySelectorAll("tr")).forEach((row, i) => {
      const firstCell = row.querySelector("td:first-child");
      if (firstCell) {
        firstCell.textContent = dias[i] || "";
      }
    });
  }
});


// ===== Cargar datos guardados =====
(async ()=>{
  const docRef = doc(db, "dieta", "semana1");
  const snap = await getDoc(docRef);
  if(snap.exists()) {
    const data = snap.data();
    for(let d=1; d<=7; d++){
      for(let c=1; c<=6; c++){
        const hInput = document.getElementById(`h${d}c${c}`);
        const dInput = document.getElementById(`d${d}c${c}`);
        if(data[`d${d}c${c}`]){
          hInput.value = data[`d${d}c${c}`].hora || horasDefault[c-1];
          dInput.value = data[`d${d}c${c}`].alimento || "";
        }
      }
    }
  }
})();

// ===== Guardar dieta =====
document.getElementById("guardar-dieta").addEventListener("click", async ()=>{
  let dieta = {};
  const rows = tabla.querySelectorAll("tr");

  rows.forEach((row, i) => {
    for(let c=1; c<=6; c++){
      const hInput = row.querySelector(`#h${i+1}c${c}`);
      const dInput = row.querySelector(`#d${i+1}c${c}`);
      if (hInput && dInput) {
        dieta[`d${i+1}c${c}`] = {
          hora: hInput.value,
          alimento: dInput.value,
        };
      }
    }
  });

  await setDoc(doc(db, "dieta", "semana1"), dieta);
  alert("Dieta guardada ✅");
});