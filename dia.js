import { db, getDiaSemana, getFechaHoy } from "./app.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const dia = getDiaSemana(); // 1=Lunes, 2=Martes, etc.
const fecha = getFechaHoy(); // yyyy-mm-dd

const comidasDiv = document.getElementById("comidas");
const ejerciciosDiv = document.getElementById("ejercicios");
const tecnicasDiv = document.getElementById("tecnicas");
const creatinaDiv = document.getElementById("creatina");
const comidasHoyDiv = document.getElementById("comidas2");
const ejerciciosHoyDiv = document.getElementById("ejercicios2");
const tecnicasHoyDiv = document.getElementById("tecnicas2");
const creatinaHoyDiv = document.getElementById("creatina2");

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

  // ===== PNL =====
  const pnlRef = doc(db, "pnl", "semana1");
  const pnlSnap = await getDoc(pnlRef);
  let pnlHoy = [];

  if (pnlSnap.exists()) {
    const data = pnlSnap.data();
    for (let c = 1; c <= 2; c++) {
      const pnlObj = data[`p${dia}c${c}`];
      if (pnlObj) pnlHoy.push(pnlObj);
    }
  }

  // ===== Crear checkeos del día si no existen =====
  const checkRef = doc(db, "checkeos", fecha);
  const checkSnap = await getDoc(checkRef);
  if (!checkSnap.exists()) {
    let registroInit = { comidas: {}, ejercicios: {}, agua: {}, pnl: {}, creatina: {} };
    dietaHoy.forEach((cObj, i) => {
      registroInit.comidas[`c${i + 1}`] = false;
    });
    registroInit.ejercicios = { ej: false, rec: false };
    registroInit.agua = { vs1: false, vs2: false, vs3: false, vs4: false, vs5: false, vs6: false };
    console.log("Entro");
    pnlHoy.forEach((cObj, i) => {
      registroInit.pnl[`p${i + 1}`] = false;
      console.log(registroInit.pnl[`p${i + 1}`]);
    });
    registroInit.creatina = { k: false };
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

  // ===== Mostrar solo las tecnicas correspondiente a la hora actual =====
  let tecnicaMostrada = null;
  for (let i = 0; i < pnlHoy.length; i++) {
    if (horaNow >= pnlHoy[i].hora) {
      tecnicaMostrada = { ...pnlHoy[i], index: i + 1 };
    }
  }

  let htmlTecnicas = "<h3>Visualización actual</h3>";
  if (tecnicaMostrada) {
    htmlTecnicas += `<label><input type="checkbox" id="p${tecnicaMostrada.index}"> ${tecnicaMostrada.hora} - ${tecnicaMostrada.tecnica}</label>`;
  } else {
    htmlTecnicas += `<p>(No hay visualización programada para esta hora)</p>`;
  }
  tecnicasDiv.innerHTML = htmlTecnicas;

  // ===== Mostrar creatina todo el día =====
  let htmlK = "<h3>Creatina</h3>";
  htmlK += `<label><input type="checkbox" id="k"> 3–5 g diarios, idealmente con tu batido post-entrenamiento o con algún carbohidrato para mejorar la absorción</label>`;
  creatinaDiv.innerHTML = htmlK;

  // ===== Cargar checkeos previos solo de lo mostrado =====
  const checkSnap2 = await getDoc(checkRef);
  if (checkSnap2.exists()) {
    const checks = checkSnap2.data();
    //comida
    if (comidaMostrada) {
      const box = document.getElementById(`c${comidaMostrada.index}`);
      if (box) box.checked = checks.comidas[`c${comidaMostrada.index}`] || false;
    }
    //ejercicio
    if (ejHoy && document.getElementById("ej")) document.getElementById("ej").checked = checks.ejercicios.ej || false;
    if (ejHoy && document.getElementById("rec")) document.getElementById("rec").checked = checks.ejercicios.rec || false;
    if (document.getElementById(`vs${comidaMostrada.index}`)) document.getElementById(`vs${comidaMostrada.index}`).checked = checks.agua[`vs${comidaMostrada.index}`] || false;
    //visualizacion
    if (tecnicaMostrada) {
      const box = document.getElementById(`p${tecnicaMostrada.index}`);
      if (box) box.checked = checks.pnl[`p${tecnicaMostrada.index}`] || false;
    }
    //creatina
    if (document.getElementById("k")) document.getElementById("k").checked = checks.creatina.k || false;
  }

  //PLAN DEL DIA-
  const horaMenosUna = ((parseInt(horaNow.substring(0, 2)) + 23) % 24).toString().padStart(2, "0") + horaNow.substring(2);
  const checks = checkSnap2.data();

  if (checkSnap2.exists) {

    // ===== Mostrar dieta del día de hoy =====
    let htmlComidas2 = "<h3>Comida</h3>";
    for (let i = 0; i < dietaHoy.length; i++) {
      let checkEmoji = obtenerCheckEmoji(horaMenosUna,dietaHoy[i].hora,checks.comidas[`c${i + 1}`]);
      htmlComidas2 += `<label>🔸 ${dietaHoy[i].hora} - ${dietaHoy[i].alimento} ${checkEmoji}</label>`;
    }
    comidasHoyDiv.innerHTML = htmlComidas2;

    // ===== Mostrar ejercicio del día de hoy =====
    let htmlEjercicios2 = "<h3>Ejercicio</h3>";
    let checkEmoji = obtenerCheckEmoji(horaMenosUna,ejHoy.hora,checks.ejercicios.ej);
    htmlEjercicios2 += `<label>🔸 ${ejHoy.hora} - ${ejHoy.ej} ${checkEmoji}</label>`;
    checkEmoji = obtenerCheckEmoji(horaMenosUna,ejHoy.hora,checks.ejercicios.rec);
    htmlEjercicios2 += `<label>🔸 ${ejHoy.hora} - ${ejHoy.rec} ${checkEmoji}</label>`;
    ejerciciosHoyDiv.innerHTML = htmlEjercicios2;

    // ===== Mostrar tecnicas del día de hoy =====
    let htmlTecnicas2 = "<h3>Visualizaciones</h3>";
    for (let i = 0; i < pnlHoy.length; i++) {
      let checkEmoji = obtenerCheckEmoji(horaMenosUna,pnlHoy[i].hora,checks.pnl[`p${i + 1}`]);
      htmlTecnicas2 += `<label>🔸 ${pnlHoy[i].hora} - ${pnlHoy[i].tecnica} ${checkEmoji}</label>`;
    }
    tecnicasHoyDiv.innerHTML = htmlTecnicas2;

    // ===== Mostrar Creatina del día de hoy =====
    let htmlCreatina2 = "<h3>Creatina</h3>";
    checkEmoji = obtenerCheckEmoji(horaMenosUna,"00:00",checks.creatina.k);
    htmlCreatina2 += `<label>🔸 3–5 g diarios, idealmente con tu batido post-entrenamiento o con algún carbohidrato para mejorar la absorción ${checkEmoji}</ label>`;
    creatinaHoyDiv.innerHTML = htmlCreatina2;
    
  }

}

function obtenerCheckEmoji(horaActual, horaObjetivo, estadoEjercicio) {
  return !estadoEjercicio
           ? (horaActual >= horaObjetivo ? "❌" : "")
           : "✅";
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
    } else if (input.id.startsWith('c')) {
      updates[`comidas.${input.id}`] = input.checked;
    } else {
      console.warn(`ID no reconocido: ${input.id}`);
    }
  });

  // Solo actualizar los ejercicios visibles
  const ejInput = document.getElementById("ej");
  const recInput = document.getElementById("rec");
  if (ejInput) updates["ejercicios.ej"] = ejInput.checked;
  if (recInput) updates["ejercicios.rec"] = recInput.checked;

  // Solo actualizar las tecnicas visibles
  const tecnicasInputs = tecnicasDiv.querySelectorAll("input[type='checkbox']");
  tecnicasInputs.forEach(input => {
    if (input.id.startsWith('p')) {
      updates[`pnl.${input.id}`] = input.checked;
    } else {
      console.warn(`ID no reconocido: ${input.id}`);
    }
  });

  // Solo actualizar item creatina
  const kInput = document.getElementById("k");
  if (kInput) updates["creatina.k"] = kInput.checked;

  // 🔥 Esto actualiza SOLO las propiedades específicas
  await updateDoc(checkRef, updates);

  alert("Progreso guardado ✅");
});

cargarPlanHoy();
