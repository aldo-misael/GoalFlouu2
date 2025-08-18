import { db } from "./app.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const tabla = document.getElementById("tabla-ejercicio");
const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

for (let i=0;i<7;i++) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${dias[i]}</td>
    <td><input type="text" id="hora${i+1}"></td>
    <td><input type="text" id="ej${i+1}"></td>
    <td><input type="text" id="rec${i+1}"></td>
  `;
  tabla.appendChild(row);
}

// Cargar datos guardados
(async ()=>{
  const docRef = doc(db, "ejercicio", "semana1");
  const snap = await getDoc(docRef);
  if(snap.exists()){
    const data = snap.data();
    for(let d=1;d<=7;d++){
      document.getElementById(`hora${d}`).value = data[`hora${d}`] || "";
      document.getElementById(`ej${d}`).value = data[`ej${d}`] || "";
      document.getElementById(`rec${d}`).value = data[`rec${d}`] || "";
    }
  }
})();

// Guardar
document.getElementById("guardar-ejercicio").addEventListener("click", async ()=>{
  let plan = {};
  for(let d=1;d<=7;d++){
    plan[`hora${d}`] = document.getElementById(`hora${d}`).value;
    plan[`ej${d}`] = document.getElementById(`ej${d}`).value;
    plan[`rec${d}`] = document.getElementById(`rec${d}`).value;
  }
  await setDoc(doc(db, "ejercicio", "semana1"), plan);
  alert("Ejercicio guardado ✅");
});
