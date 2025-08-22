import { db } from "./app.js";
import { collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const tabla = document.getElementById("tabla-pnl");
const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const horasDefault = ["07:00", "10:00"];

// ===== Crear tabla (7 días x 6 comidas) =====
for (let i = 0; i < 7; i++) {
  const row = document.createElement("tr");
  let rowHTML = `<td>${dias[i]}</td>`;

  for (let c = 0; c < 2; c++) {
    rowHTML += `<td>
                  <input type="text" id="h${i+1}c${c+1}" value="${horasDefault[c]}" class="input-tabla" placeholder="Hora">
                  <input type="text" id="p${i+1}c${c+1}" class="input-tabla" placeholder="Ejercicio">
                </td>`;
  }

  row.innerHTML = rowHTML;
  tabla.appendChild(row);
}

// ===== Cargar datos guardados =====
(async ()=>{
  const docRef = doc(db, "pnl", "semana1");
  const snap = await getDoc(docRef);
  if(snap.exists()) {
    const data = snap.data();
    for(let d=1; d<=7; d++){
      for(let c=1; c<=2; c++){
        const hInput = document.getElementById(`h${d}c${c}`);
        const dInput = document.getElementById(`p${d}c${c}`);
        if(data[`p${d}c${c}`]){
          hInput.value = data[`p${d}c${c}`].hora || horasDefault[c-1];
          dInput.value = data[`p${d}c${c}`].tecnica || "";
        }
      }
    }
  }
})();

// ===== Guardar pnl =====
document.getElementById("guardar-pnl").addEventListener("click", async ()=>{
  let pnl = {};
  for(let d=1; d<=7; d++){
    for(let c=1; c<=2; c++){
      const hInput = document.getElementById(`h${d}c${c}`);
      const dInput = document.getElementById(`p${d}c${c}`);
      pnl[`p${d}c${c}`] = {
        hora: hInput.value,
        tecnica: dInput.value,
      };
    }
  }

  await setDoc(doc(db, "pnl", "semana1"), pnl);
  alert("PNL guardada ✅");
});