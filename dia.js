import { db, getDiaSemana, getFechaHoy } from "./app.js";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteField } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const dia = getDiaSemana(); // 1=Lunes, 2=Martes, etc.
const fecha = getFechaHoy(); // yyyy-mm-dd

const comidasDiv = document.getElementById("comidas");
const ejerciciosDiv = document.getElementById("ejercicios");
const tecnicasDiv = document.getElementById("tecnicas");
const creatinaDiv = document.getElementById("creatina");
const dormirDiv = document.getElementById("dormir");
const comidasHoyDiv = document.getElementById("comidas2");
const ejerciciosHoyDiv = document.getElementById("ejercicios2");
const tecnicasHoyDiv = document.getElementById("tecnicas2");
const creatinaHoyDiv = document.getElementById("creatina2");
const dormirHoyDiv = document.getElementById("dormir2");

// Obtener hora actual en formato HH:MM
function horaActual() {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
}

// ===== Función para cargar plan del día =====
async function cargarPlanHoy() {
  const horaNow = horaActual();

  // ===== CREA LOTTIES ======
  crearLottie("lottie-1", "carga2.json");
  crearLottie("lottie-2", "carga1.json");
  crearLottie("lottie-h", "hydration.json");

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
    let registroInit = {
      comidas: {},
      ejercicios: {},
      agua: {},
      pnl: {},
      creatina: {},
      dormir: {},
      pd: 0
    };
    dietaHoy.forEach((cObj, i) => {
      registroInit.comidas[`c${i + 1}`] = false;
    });
    registroInit.ejercicios = { ej: false, rec: false };
    registroInit.agua = { vs1: false, vs2: false, vs3: false, vs4: false, vs5: false, vs6: false };
    pnlHoy.forEach((cObj, i) => {
      registroInit.pnl[`p${i + 1}`] = false;
    });
    registroInit.creatina = { k: false };
    registroInit.dormir = { d: false, dv: 0.0 };
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

  // ===== Mostrar dormir todo el día =====
  let htmlD = "<h3>Dormir</h3>";
  htmlD += `<label>
  <input type="checkbox" id="d"> Dormir 7 horas al día.&nbsp;&nbsp;&nbsp;Horas:
  <input type="number" id="dv" name="horasDormidas"
       min="0" max="24" step="0.01" placeholder="h.mm"
       class="input-tabla">
  </label><br>`;

  dormirDiv.innerHTML = htmlD;


  // ===== Cargar checkeos previos solo de lo mostrado =====
  const checkSnap2 = await getDoc(checkRef);
  if (checkSnap2.exists()) {
    const checks = checkSnap2.data();
    //comida
    if (comidaMostrada) {
      const box = document.getElementById(`c${comidaMostrada.index}`);
      if (box) box.checked = checks.comidas[`c${comidaMostrada.index}`] || false;
      if (document.getElementById(`vs${comidaMostrada.index}`)) document.getElementById(`vs${comidaMostrada.index}`).checked = checks.agua[`vs${comidaMostrada.index}`] || false;
    }
    //ejercicio
    if (ejHoy && document.getElementById("ej")) document.getElementById("ej").checked = checks.ejercicios.ej || false;
    if (ejHoy && document.getElementById("rec")) document.getElementById("rec").checked = checks.ejercicios.rec || false;
    
    //visualizacion
    if (tecnicaMostrada) {
      const box = document.getElementById(`p${tecnicaMostrada.index}`);
      if (box) box.checked = checks.pnl[`p${tecnicaMostrada.index}`] || false;
    }
    //creatina
    if (document.getElementById("k")) document.getElementById("k").checked = checks.creatina.k || false;
    //dormir
    if (document.getElementById("d")) document.getElementById("d").checked = checks.dormir.d || false;
    if (document.getElementById("dv")) document.getElementById("dv").value = checks.dormir.dv || "";

    //Lottie progreso
    const checkS = await getDoc(checkRef);
    if (checkS.exists()) {
      const data = checkS.data();
      let progresoDiario = data.pd;

      let fechas = obtenerFechasSemanaHasta(fecha);
      let [progresoSemanal, progresos] = await calcularProgresoSemanal(fechas);
      let progresoHid = calcularHidratacion(data.agua);

      reproducirHasta("lottie-1", progresoDiario);
      reproducirHasta("lottie-2", progresoSemanal);
      reproducirHasta("lottie-h", progresoHid * 20, 1, 1.5);
      document.getElementById("litros").textContent = progresoHid * 0.5 + "L";
      graficoProms(progresos);
      updateProgress(daysElapsed('2025-08-18'));
      //reproducirLottieHasta("lottie-3", "carga.json", 100);
    }
  }

  //PLAN DEL DIA-
  const horaMenosUna = ((parseInt(horaNow.substring(0, 2)) + 23) % 24).toString().padStart(2, "0") + horaNow.substring(2);
  const checks = checkSnap2.data();

  if (checkSnap2.exists) {

    // ===== Mostrar dieta del día de hoy =====
    let htmlComidas2 = "<h3>Comida</h3>";
    for (let i = 0; i < dietaHoy.length; i++) {
      let checkEmoji = obtenerCheckEmoji(horaMenosUna, dietaHoy[i].hora, checks.comidas[`c${i + 1}`]);
      htmlComidas2 += `<label>🔸 ${dietaHoy[i].hora} - ${dietaHoy[i].alimento} ${checkEmoji}</label>`;
    }
    comidasHoyDiv.innerHTML = htmlComidas2;

    // ===== Mostrar ejercicio del día de hoy =====
    let htmlEjercicios2 = "<h3>Ejercicio</h3>";
    let checkEmoji = obtenerCheckEmoji(horaMenosUna, ejHoy.hora, checks.ejercicios.ej);
    htmlEjercicios2 += `<label>🔸 ${ejHoy.hora} - ${ejHoy.ej} ${checkEmoji}</label>`;
    checkEmoji = obtenerCheckEmoji(horaMenosUna, ejHoy.hora, checks.ejercicios.rec);
    htmlEjercicios2 += `<label>🔸 ${ejHoy.hora} - ${ejHoy.rec} ${checkEmoji}</label>`;
    ejerciciosHoyDiv.innerHTML = htmlEjercicios2;

    // ===== Mostrar tecnicas del día de hoy =====
    let htmlTecnicas2 = "<h3>Visualizaciones</h3>";
    for (let i = 0; i < pnlHoy.length; i++) {
      let checkEmoji = obtenerCheckEmoji(horaMenosUna, pnlHoy[i].hora, checks.pnl[`p${i + 1}`]);
      htmlTecnicas2 += `<label>🔸 ${pnlHoy[i].hora} - ${pnlHoy[i].tecnica} ${checkEmoji}</label>`;
    }
    tecnicasHoyDiv.innerHTML = htmlTecnicas2;

    // ===== Mostrar Creatina del día de hoy =====
    let htmlCreatina2 = "<h3>Creatina</h3>";
    checkEmoji = obtenerCheckEmoji(horaMenosUna, "00:00", checks.creatina.k);
    htmlCreatina2 += `<label>🔸 3–5 g diarios, idealmente con tu batido post-entrenamiento o con algún carbohidrato para mejorar la absorción ${checkEmoji}</ label>`;
    creatinaHoyDiv.innerHTML = htmlCreatina2;

    // ===== Mostrar Dormir del día de hoy =====
    let htmlD2 = "<h3>Dormir</h3>";
    checkEmoji = obtenerCheckEmoji(horaMenosUna, "00:00", checks.dormir.d);
    htmlD2 += `<label>🔸 Dormir 7 horas al día. Has dormido: ${checks.dormir.dv}[hr]. ${checkEmoji}</ label>`;
    dormirHoyDiv.innerHTML = htmlD2;
  }else alert("checkSnap2.exists. No existe. Revisar condición ❌");
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

  // Solo actualizar item dormir
  const dInput = document.getElementById("d");
  const dvInput = document.getElementById("dv");
  if (dvInput.value > 0) {
    updates["dormir.d"] = true;
    dInput.checked = true;
  } else {
    updates["dormir.d"] = false;
    dInput.checked = false;
  }
  if (dvInput) updates["dormir.dv"] = Math.max(0, dvInput.value);

  // 🔥 Esto actualiza SOLO las propiedades específicas
  await updateDoc(checkRef, updates);

  alert("Progreso guardado ✅");

  //Lottie progreso
  const checkS = await getDoc(checkRef);
  if (checkS.exists()) {
    const checks = checkS.data();
    let progresoDiario = calcularProgresoDiario(checks);
    await setDoc(checkRef, { pd: progresoDiario }, { merge: true });

    let fechas = obtenerFechasSemanaHasta(fecha);
    let [progresoSemanal, progresos] = await calcularProgresoSemanal(fechas);
    let progresoHid = calcularHidratacion(checks.agua);

    reproducirHasta("lottie-1", progresoDiario);
    reproducirHasta("lottie-2", progresoSemanal);
    reproducirHasta("lottie-h", progresoHid * 20, 1, 1.5);
    document.getElementById("litros").textContent = progresoHid * 0.5 + "L";
    graficoProms(progresos);
  }
});

const lottieInstances = {};
function crearLottie(containerId, jsonPath) {
  const container = document.getElementById(containerId);

  const animation = lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: jsonPath
  });

  lottieInstances[containerId] = animation;
}

function reproducirHasta(containerId, porcentaje, speed = 2, f = 2.5) {
  const animation = lottieInstances[containerId];
  if (!animation) {
    console.warn(`No se encontró animación para ${containerId}`);
    return;
  }

  const targetFrame = porcentaje * f;
  animation.stop();
  animation.setSpeed(speed);
  animation.play();

  const detener = (e) => {
    if (e.currentTime >= targetFrame + 1) {
      animation.goToAndStop(targetFrame, true);
      animation.removeEventListener("enterFrame", detener);
    }
  };

  animation.addEventListener("enterFrame", detener);
}

function calcularProgresoDiario(checks) {
  let progresoDiario = 0;
  let progreso = 0;
  let tareas = 0;

  //Calculo de ejercicio 30%
  if (checks.ejercicios.ej) progresoDiario += 30;

  //Calculo de comidas  25%
  for (let i = 0; i <= 6; i++) {
    if (checks.comidas[`c${i}`]) tareas++;
  }
  progreso = (tareas * 25) / 6;
  progresoDiario += progreso;

  //Calculo de dormir 20%
  const horas = Math.floor(checks.dormir.dv);
  const minutos = (checks.dormir.dv - horas) * 100;
  const totalHoras = horas + (minutos / 60);
  const horasDormidas = Math.min(totalHoras, 7);
  if (checks.dormir.d) progresoDiario += ((horasDormidas * 20) / 7);

  //Calculo de creatina 7%
  if (checks.creatina.k) progresoDiario += 7;

  //Calculo de hidratacion 10%
  tareas = 0;
  for (let i = 0; i <= 6; i++) {
    if (checks.agua[`vs${i}`]) tareas++;
  }
  progreso = (tareas * 10) / 6;
  progresoDiario += progreso;

  //Calculo de visualizaciones 5%
  if (checks.pnl[`p${1}`]) progresoDiario += 2.5;
  if (checks.pnl[`p${2}`]) progresoDiario += 2.5;

  //Calculo de recuperacion 3%
  if (checks.ejercicios.rec) progresoDiario += 3;

  return Math.round(progresoDiario);
}

async function calcularProgresoSemanal(fechas) {
  let progresoSemanal = 0;
  let progresos = new Array(8).fill(0);

  for (let i = 0; i < fechas.length; i++) {
    const checkRef = doc(db, "checkeos", fechas[i]);
    const checkS = await getDoc(checkRef);
    if (checkS.exists()) {
      let progresoDiario = checkS.data().pd;
      progresos[i + 1] = progresoDiario;
      progresoSemanal += progresoDiario;
    }
  }
  progresoSemanal = progresoSemanal / fechas.length;
  return [progresoSemanal, progresos];
}

function calcularHidratacion(agua) {
  let suma = 0;
  for (let key in agua) {
    if (agua[key] === true) {
      suma++;
    }
  }
  return suma;
}

function obtenerFechasSemanaHasta(fechaReferencia) {
  const [año, mes, día] = fechaReferencia.split("-").map(Number);
  const fechaBase = new Date(año, mes - 1, día);
  const diaSemana = fechaBase.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;

  const fechas = [];

  for (let i = 0; i <= diasDesdeLunes; i++) {
    const f = new Date(fechaBase); // Clon en cada iteración
    f.setDate(fechaBase.getDate() - diasDesdeLunes + i);

    const yyyy = f.getFullYear();
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const dd = String(f.getDate()).padStart(2, '0');

    fechas.push(`${yyyy}-${mm}-${dd}`);
  }
  return fechas;
}

async function graficoProms(progresos) {
  const dias = ['', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab', 'Dom'];

  try {
    // Mostrar gráfico
    const options = {
      chart: {
        type: 'area',
        background: '#111',
        toolbar: {
          show: false // Oculta el menú de herramientas (descarga, zoom, etc.)
        },
        zoom: {
          enabled: false // 🔒 Desactiva el zoom
        }
      },
      series: [
        {
          name: 'Progresos',
          data: progresos
        }
      ],
      xaxis: {
        categories: dias,
        labels: {
          style: {
            colors: '#FFF'
          }
        },
        axisBorder: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#FFF'
          }
        },
        show: false
      },
      legend: {
        labels: {
          colors: '#FFF'
        }
      },
      tooltip: {
        enabled: false // Desactiva los tooltips al pasar el mouse
      },
      legend: {
        show: false // Oculta la leyenda
      },
      grid: {
        borderColor: 'rgba(255,255,255,0.05)' // Líneas horizontales tenues sobre fondo #111
      }
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

  } catch (error) {
    console.error("Error al cargar datos para gráfico:", error);
    alert("No se pudieron cargar los datos para el gráfico");
  }
}

const totalDays = 365;
function updateProgress(currentDay) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const percentage = Math.min((currentDay / totalDays) * 100, 100);
  progressBar.style.width = percentage + '%';
  progressText.textContent = `Día ${currentDay} de ${totalDays}`;
}

function daysElapsed(startDateStr) {
  const startDate = new Date(startDateStr); // formato: 'YYYY-MM-DD'
  const today = new Date();

  // Normaliza ambas fechas a medianoche para evitar errores por horas
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today - startDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

cargarPlanHoy();