import { db, getDiaSemana, getFechaHoy } from "./app.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const dia = getDiaSemana(); // 1=Lunes, 2=Martes, etc.
const fecha = getFechaHoy(); // yyyy-mm-dd

const comidasDiv = document.getElementById("comidas");
const ejerciciosDiv = document.getElementById("ejercicios");

// Obtener hora actual en formato HH:MM
function horaActual() {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
}

// ===== Función para cargar plan del día =====
async function cargarPlanHoy() {
  const horaNow = horaActual();

  // ===== DIETA =====
  const dietaRef = doc(db, "dieta", "semana1");
  const dietaSnap = await getDoc(dietaRef);
  let dietaHoy = [];

  if (dietaSnap.exists()) {
    const data = dietaSnap.data();
    for (let c = 1; c <= 6; c++) {
      const comidaObj = data[`d${dia}c${c}`];
      if (comidaObj) dietaHoy.push(comidaObj);
    }
  }

  // ===== EJERCICIO =====
  const ejRef = doc(db, "ejercicio", "semana1");
  const ejSnap = await getDoc(ejRef);
  let ejHoy = null;
  if (ejSnap.exists()) {
    const data = ejSnap.data();
    ejHoy = {
      ej: data[`ej${dia}`] || "",
      rec: data[`rec${dia}`] || "",
      hora: data[`hora${dia}`] || ""
    };
  }

  // ===== Crear checkeos del día si no existen =====
  const checkRef = doc(db, "checkeos", fecha);
  const checkSnap = await getDoc(checkRef);
  if (!checkSnap.exists()) {
    let registroInit = { comidas: {}, ejercicios: {}, agua: {} };
    dietaHoy.forEach((cObj, i) => {
      registroInit.comidas[`c${i + 1}`] = false;
    });
    registroInit.ejercicios = { ej: false, rec: false };
    registroInit.agua = { vs1: false, vs2: false, vs3: false, vs4: false, vs5: false, vs6: false };
    await setDoc(checkRef, registroInit);
  }

  // ===== Mostrar solo la comida correspondiente a la hora actual =====
  let comidaMostrada = null;
  for (let i = 0; i < dietaHoy.length; i++) {
    if (horaNow >= dietaHoy[i].hora) {
      comidaMostrada = { ...dietaHoy[i], index: i + 1 };
    }
  }

  let htmlComidas = "<h3>Comida actual</h3>";
  if (comidaMostrada) {
    htmlComidas += `<label><input type="checkbox" id="c${comidaMostrada.index}"> ${comidaMostrada.hora} - ${comidaMostrada.alimento}</label>
                    <label><input type="checkbox" id="vs${comidaMostrada.index}"> ${comidaMostrada.hora} - 1 vaso de agua de 500ml</label>`;
  } else {
    htmlComidas += `<p>(No hay comida programada para esta hora)</p>`;
  }
  comidasDiv.innerHTML = htmlComidas;

  // ===== Mostrar ejercicio solo si la hora coincide =====
  let htmlEj = "<h3>Ejercicio actual</h3>";
  if (ejHoy && horaNow >= ejHoy.hora) {
    htmlEj += `<label><input type="checkbox" id="ej"> ${ejHoy.hora} - ${ejHoy.ej}</label>
               <label><input type="checkbox" id="rec"> ${ejHoy.hora} - ${ejHoy.rec}</label>`;
  } else {
    htmlEj += `<p>(No hay ejercicio programado para esta hora)</p>`;
  }
  ejerciciosDiv.innerHTML = htmlEj;

  // ===== Cargar checkeos previos solo de lo mostrado =====
  const checkSnap2 = await getDoc(checkRef);
  if (checkSnap2.exists()) {
    const checks = checkSnap2.data();
    if (comidaMostrada) {
      const box = document.getElementById(`c${comidaMostrada.index}`);
      if (box) box.checked = checks.comidas[`c${comidaMostrada.index}`] || false;
    }
    if (ejHoy && document.getElementById("ej")) document.getElementById("ej").checked = checks.ejercicios.ej || false;
    if (ejHoy && document.getElementById("rec")) document.getElementById("rec").checked = checks.ejercicios.rec || false;
    if (document.getElementById(`vs${comidaMostrada.index}`)) document.getElementById(`vs${comidaMostrada.index}`).checked = checks.agua[`vs${comidaMostrada.index}`] || false;
  }
}

// ===== Guardar solo lo mostrado =====
document.getElementById("guardar-checks").addEventListener("click", async () => {
  const checkRef = doc(db, "checkeos", fecha);
  const checkSnap = await getDoc(checkRef);
  if (!checkSnap.exists()) return;

  let updates = {};

  // Solo actualizar las comidas visibles
  const comidasInputs = comidasDiv.querySelectorAll("input[type='checkbox']");
  const vsInput = document.getElementById("vs");
  comidasInputs.forEach(input => {
    if (input.id.startsWith('vs')) {
      updates[`agua.${input.id}`] = input.checked;
      console.log(`agua.${input.id}`);
    } else if (input.id.startsWith('c')) {
      updates[`comidas.${input.id}`] = input.checked;
      console.log(`comidas.${input.id}`);
    } else {
      console.warn(`ID no reconocido: ${input.id}`);
    }
  });

  // Solo actualizar los ejercicios visibles
  const ejInput = document.getElementById("ej");
  const recInput = document.getElementById("rec");
  if (ejInput) updates["ejercicios.ej"] = ejInput.checked;
  if (recInput) updates["ejercicios.rec"] = recInput.checked;

  // Solo actualiza el vaso de agua

  // 🔥 Esto actualiza SOLO las propiedades específicas
  await updateDoc(checkRef, updates);

  alert("Progreso guardado ✅");
});

cargarPlanHoy();
