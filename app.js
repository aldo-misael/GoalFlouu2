import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6s4RHJm5HSNQgOEy-lIQ_zpHyW_Qc5-o",
  authDomain: "goalflouu.firebaseapp.com",
  projectId: "goalflouu",
  storageBucket: "goalflouu.firebasestorage.app",
  messagingSenderId: "916018616079",
  appId: "1:916018616079:web:81604cf8999fda77dad07a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


// Función utilitaria: obtener día actual (1=lunes,...,7=domingo)
export function getDiaSemana() {
  const d = new Date();
  let day = d.getDay(); // 0=domingo
  return day === 0 ? 7 : day; // Ajustar a 1-7
}

// Fecha YYYY-MM-DD en hora local
export function getFechaHoy() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


