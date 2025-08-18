import { db } from "./app.js";
import { collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const tabla = document.getElementById("tabla-dieta");
const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const horasDefault = ["07:00", "10:00", "13:00", "16:00", "19:00", "22:00"];

// ===== Crear tabla (7 días x 6 comidas) =====
for (let i = 0; i < 7; i++) {
  const row = document.createElement("tr");
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
  for(let d=1; d<=7; d++){
    for(let c=1; c<=6; c++){
      const hInput = document.getElementById(`h${d}c${c}`);
      const dInput = document.getElementById(`d${d}c${c}`);
      dieta[`d${d}c${c}`] = {
        hora: hInput.value,
        alimento: dInput.value,
        
      };
    }
  }

  await setDoc(doc(db, "dieta", "semana1"), dieta);
  alert("Dieta guardada ✅");
});
