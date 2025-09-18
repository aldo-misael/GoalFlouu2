import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { initializeFirestore, persistentLocalCache } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

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
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

const auth = getAuth();

onAuthStateChanged(auth, user => {
  if (!user) {
    // Redirigir a login si no hay sesión
    window.location.href = "index.html";
  }
  // Si hay sesión, puedes inicializar tus funciones
});

// Función utilitaria: obtener día actual (1=lunes,...,7=domingo)
export function getDiaSemana() {
  const hoy = new Date(); // Ya está en hora local
  const day = hoy.getDay(); // 0=domingo,...6=sábado
  return day === 0 ? 7 : day; // Ajustar a 1-7 (lunes=1,...,domingo=7)
}

// Fecha YYYY-MM-DD (hora local del usuario)
export function getFechaHoy() {
  const tzOffset = new Date().getTimezoneOffset() * 60000; // diferencia en ms
  const localISO = new Date(Date.now() - tzOffset).toISOString().split("T")[0];
  return localISO;
}

