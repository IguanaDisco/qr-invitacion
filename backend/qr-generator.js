const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Crear la carpeta assets si no existe
const assetsPath = path.join(__dirname, '../frontend/assets');
if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
}

// Función para generar el QR
function generarQR(numeroMesa) {
    const filePath = path.join(assetsPath, `mesa_${numeroMesa}.png`);
    QRCode.toFile(filePath, numeroMesa, (err) => {
        if (err) {
            console.error("Error al generar el QR:", err);
        } else {
            console.log(`Código QR generado para ${numeroMesa} en ${filePath}`);
        }
    });
}

// Generar códigos QR para varias mesas
const mesas = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Mesa 6", "Mesa 7", "Mesa 8", "Mesa 9", "Mesa 10", "Mesa 11", "Mesa 12", "Mesa 13", "Mesa 14", "Mesa 15"];
mesas.forEach((mesa) => {
    generarQR(mesa);
});