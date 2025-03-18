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
const popup = document.getElementById("popup");
const popupMesa = document.getElementById("popup-mesa");
const btnSi = document.getElementById("btn-si");
const btnNo = document.getElementById("btn-no");
const btnMostrarMesas = document.getElementById("btn-mostrar-mesas");
const mesasContainer = document.getElementById("mesas-container");
const mesasList = document.getElementById("mesas-list");

let mesaEscaneada = null; // Almacena la mesa escaneada

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
            // Verificar si la mesa escaneada existe en la base de datos
            verificarExistenciaMesa(numeroMesa);
        }
    }
    requestAnimationFrame(tick);
}

// Función para verificar si la mesa existe en la base de datos
function verificarExistenciaMesa(numeroMesa) {
    const mesaRef = ref(database, `mesas/${numeroMesa}`);
    onValue(mesaRef, (snapshot) => {
        if (snapshot.exists()) { // Si la mesa existe
            result.innerText = `Mesa escaneada: ${numeroMesa}`;
            mesaEscaneada = numeroMesa; // Guardar la mesa escaneada
            mostrarPopup(numeroMesa); // Mostrar el popup
        } else {
            result.innerText = `Mesa no válida: ${numeroMesa}`;
        }
    });
}

// Función para mostrar el popup
function mostrarPopup(numeroMesa) {
    popupMesa.innerText = `¿Asignar ${numeroMesa} como ocupada?`;
    popup.style.display = "block"; // Mostrar el popup
}

// Llamar a la función para mostrar el estado de las mesas al cargar la página
mostrarEstadoMesas();

// Función para actualizar el estado de la mesa
function actualizarEstadoMesa(ocupada) {
    if (!mesaEscaneada) return; // Si no hay una mesa escaneada, no hacer nada

    const mesaRef = ref(database, `mesas/${mesaEscaneada}`);
    set(mesaRef, ocupada) // Guardar directamente el valor booleano
        .then(() => {
            console.log(`Mesa ${mesaEscaneada} marcada como ${ocupada ? "ocupada" : "disponible"}.`);
            popup.style.display = "none"; // Ocultar el popup
            mostrarEstadoMesas(); // Actualizar la lista de mesas
        })
        .catch((error) => {
            console.error("Error al actualizar la mesa:", error);
        });
}

// Eventos para los botones del popup
btnSi.addEventListener("click", () => actualizarEstadoMesa(true));
btnNo.addEventListener("click", () => actualizarEstadoMesa(false));

// Función para mostrar/ocultar el estado de las mesas
btnMostrarMesas.addEventListener("click", () => {
    if (mesasContainer.style.display === "none") {
        mesasContainer.style.display = "block"; // Mostrar la lista
        mostrarEstadoMesas(); // Actualizar la lista
    } else {
        mesasContainer.style.display = "none"; // Ocultar la lista
    }
});

// Función para mostrar el estado de las mesas
function mostrarEstadoMesas() {
    const mesasRef = ref(database, "mesas");
    onValue(mesasRef, (snapshot) => {
        const mesas = snapshot.val(); // Obtener los datos de las mesas
        mesasList.innerHTML = ""; // Limpiar la lista antes de agregar los nuevos datos

        // Convertir las mesas en un array y ordenarlas numéricamente
        const mesasArray = Object.keys(mesas).map((mesa) => ({
            nombre: mesa,
            estado: mesas[mesa]
        }));

        // Ordenar las mesas numéricamente
        mesasArray.sort((a, b) => {
            const numeroA = parseInt(a.nombre.replace("Mesa ", ""), 10);
            const numeroB = parseInt(b.nombre.replace("Mesa ", ""), 10);
            return numeroA - numeroB;
        });

        // Mostrar las mesas ordenadas
        mesasArray.forEach((mesa) => {
            const estado = mesa.estado ? "Ocupada" : "Disponible";
            const color = mesa.estado ? "red" : "green"; // Asignar color según el estado

            // Crear un elemento para mostrar la mesa
            const mesaElement = document.createElement("div");
            mesaElement.innerHTML = `<strong>${mesa.nombre}:</strong> ${estado}`;
            mesaElement.style.color = "white"; // Texto en blanco para mejor contraste
            mesaElement.style.backgroundColor = color; // Fondo rojo o verde
            mesaElement.style.padding = "10px"; // Espaciado interno
            mesaElement.style.marginBottom = "5px"; // Margen inferior
            mesaElement.style.borderRadius = "5px"; // Bordes redondeados

            mesasList.appendChild(mesaElement); // Agregar la mesa a la lista
        });
    });
}