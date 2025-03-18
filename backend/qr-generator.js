const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Crear la carpeta assets si no existe
const assetsPath = path.join(__dirname, '../frontend/assets');
if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
    console.log(`Carpeta 'assets' creada en: ${assetsPath}`);
} else {
    console.log(`La carpeta 'assets' ya existe en: ${assetsPath}`);
}

// Función para generar el QR
function generarQR(numeroMesa) {
    // Validar que el número de mesa no esté vacío
    if (!numeroMesa || typeof numeroMesa !== 'string') {
        console.error("Error: El número de mesa no es válido.");
        return;
    }

    const filePath = path.join(assetsPath, `mesa_${numeroMesa.replace(/ /g, '_')}.png`); // Reemplazar espacios con guiones bajos
    const qrOptions = {
        color: {
            dark: '#000000', // Color del código QR (negro)
            light: '#ffffff' // Color de fondo (blanco)
        },
        width: 500, // Ancho del código QR (500px)
        margin: 1 // Margen del código QR
    };

    QRCode.toFile(filePath, numeroMesa, qrOptions, (err) => {
        if (err) {
            console.error(`Error al generar el QR para ${numeroMesa}:`, err);
        } else {
            console.log(`Código QR generado para ${numeroMesa} en: ${filePath}`);
        }
    });
}

// Generar códigos QR para varias mesas
const mesas = [
    "Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", 
    "Mesa 6", "Mesa 7", "Mesa 8", "Mesa 9", "Mesa 10", 
    "Mesa 11", "Mesa 12", "Mesa 13", "Mesa 14", "Mesa 15", 
    "Mesa 16", "Mesa 17", "Mesa 18", "Mesa 19", "Mesa 20"
];

console.log("Iniciando la generación de códigos QR...");
mesas.forEach((mesa) => {
    generarQR(mesa);
});
console.log("Generación de códigos QR completada.");