// ==============================
// 📁 src/firebaseAdmin.js
// ==============================
const admin = require("firebase-admin");
const path = require("path");

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

// Inicializa Firebase solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
  console.log("[FIREBASE] ✅ Admin inicializado correctamente");
}

module.exports = admin;
