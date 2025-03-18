// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6FZFTvpxkrOrgw1Z0JEdmgrmvk90d6Uw",
    authDomain: "qr-invitacion.firebaseapp.com",
    databaseURL: "https://qr-invitacion-default-rtdb.firebaseio.com",
    projectId: "qr-invitacion",
    storageBucket: "qr-invitacion.firebasestorage.app",
    messagingSenderId: "124413297394",
    appId: "1:124413297394:web:ff5ff4d6f1fcc0a442466b",
    measurementId: "G-YTTBK2K02V"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Elementos del DOM
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const result = document.getElementById("result");
const mesaNumero = document.getElementById("mesa-numero");
const mesaEstado = document.getElementById("mesa-estado");

// Acceder a la cámara
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(tick);
    })
    .catch(function(err) {
        console.error("Error al acceder a la cámara:", err);
    });

// Función para escanear el QR
function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            const numeroMesa = code.data;
            result.innerText = `Mesa escaneada: ${numeroMesa}`;
            verificarMesa(numeroMesa); // Verificar el estado de la mesa
        }
    }
    requestAnimationFrame(tick);
}

// Función para verificar el estado de la mesa
function verificarMesa(numeroMesa) {
    const mesaRef = ref(database, `mesas/${numeroMesa}`);
    onValue(mesaRef, (snapshot) => {
        const mesa = snapshot.val();
        if (mesa && mesa.ocupada) {
            mesaNumero.innerText = numeroMesa;
            mesaEstado.innerText = "Ocupada";
            alert(`La mesa ${numeroMesa} está ocupada.`);
        } else {
            mesaNumero.innerText = numeroMesa;
            mesaEstado.innerText = "Disponible";
            alert(`La mesa ${numeroMesa} está disponible.`);
            // Marcar la mesa como ocupada
            set(mesaRef, { ocupada: true });
        }
        // Actualizar la lista de mesas
        mostrarEstadoMesas();
    });
}

// Función para mostrar el estado de las mesas
function mostrarEstadoMesas() {
    const mesasRef = ref(database, "mesas");
    onValue(mesasRef, (snapshot) => {
        const mesas = snapshot.val(); // Obtener los datos de las mesas
        const mesasContainer = document.getElementById("mesas-container");

        // Limpiar el contenedor antes de agregar los nuevos datos
        mesasContainer.innerHTML = "";

        // Recorrer las mesas y mostrarlas en la página
        for (const mesa in mesas) {
            const estado = mesas[mesa].ocupada ? "Ocupada" : "Disponible";
            const mesaElement = document.createElement("div");
            mesaElement.innerHTML = `<strong>${mesa}:</strong> ${estado}`;
            mesasContainer.appendChild(mesaElement);
        }
    });
}

// Llamar a la función para mostrar el estado de las mesas al cargar la página
mostrarEstadoMesas();

