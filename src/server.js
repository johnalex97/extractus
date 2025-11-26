// ==========================
// 📁 src/server.js
// ==========================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { pool } = require("./db"); // conexión PostgreSQL

const app = express();

/* ============================================================
   🔹 CORS (ahora acepta x-user-email)
   ============================================================ */
const corsOptions = {
  origin: "http://localhost:3000", // dirección del frontend React
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "x-user-email"], // 👈 IMPORTANTE
};
app.use(cors(corsOptions));

app.use(express.json());

/* ============================================================
   🔹 Healthcheck
   ============================================================ */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ============================================================
   🔹 Consultar estado del MFA
   ============================================================ */
app.get("/mfa/status", async (req, res) => {
  const { uid, email } = req.query;
  if (!uid && !email)
    return res.status(400).json({ error: "uid o email requerido" });

  try {
    const result = await pool.query(
      `
      SELECT mfa_secret, mfa_enabled
      FROM seguridad.tbl_usuarios
      WHERE uid_firebase = $1 OR username = $2 OR LOWER(username) = LOWER($2)
      `,
      [uid, email]
    );

    const enrolled =
      result.rows.length > 0 &&
      !!result.rows[0].mfa_secret &&
      result.rows[0].mfa_enabled === true;

    res.json({ uid, enrolled });
  } catch (err) {
    console.error("❌ Error consultando estado MFA:", err);
    res.status(500).json({ error: "Error consultando estado MFA" });
  }
});

/* ============================================================
   🔹 Generar o reutilizar QR (2FA)
   ============================================================ */
app.get("/mfa/generate", async (req, res) => {
  try {
    const { uid, email } = req.query;
    if (!uid && !email)
      return res.status(400).json({ error: "uid o email requeridos" });

    const existing = await pool.query(
      `
      SELECT mfa_secret, mfa_enabled
      FROM seguridad.tbl_usuarios
      WHERE uid_firebase = $1 OR username = $2 OR LOWER(username) = LOWER($2)
      `,
      [uid, email]
    );

    let secret;
    if (existing.rows.length && existing.rows[0].mfa_secret) {
      // ♻️ Reutilizar secreto existente
      secret = existing.rows[0].mfa_secret;
      console.log(`♻️ Reutilizando secreto guardado para ${email}`);
    } else {
      // 🔐 Crear nuevo secreto
      const newSecret = speakeasy.generateSecret({
        length: 32,
        name: `Extractus (${email})`,
        issuer: "Extractus",
      });

      secret = newSecret.base32;

      await pool.query(
        `
        UPDATE seguridad.tbl_usuarios
        SET mfa_secret = $1, mfa_enabled = true
        WHERE uid_firebase = $2 OR username = $3 OR LOWER(username) = LOWER($3)
        `,
        [secret, uid, email]
      );

      console.log(`🔐 Nuevo secreto generado y guardado para ${email}`);
    }

    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: `Extractus:${email}`,
      issuer: "Extractus",
      encoding: "base32",
    });

    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

    res.json({ uid, qr: qrDataUrl, secret });
  } catch (err) {
    console.error("❌ Error generando QR:", err);
    res.status(500).json({ error: "No se pudo generar el QR" });
  }
});

/* ============================================================
   🔹 Verificar código TOTP (2FA)
   ============================================================ */
app.post("/mfa/verify", async (req, res) => {
  try {
    const { uid, token, email } = req.body;

    if ((!uid && !email) || !token)
      return res.status(400).json({ error: "Faltan datos para verificar." });

    const result = await pool.query(
      `
      SELECT username, mfa_secret
      FROM seguridad.tbl_usuarios
      WHERE uid_firebase = $1 OR username = $2 OR LOWER(username) = LOWER($2)
      `,
      [uid, email]
    );

    if (!result.rows.length || !result.rows[0].mfa_secret) {
      console.log(`⚠️ Usuario sin secreto 2FA → ${email || uid}`);
      return res.status(404).json({ error: "Usuario sin secreto 2FA." });
    }

    const { username, mfa_secret } = result.rows[0];

    const verified = speakeasy.totp.verify({
      secret: mfa_secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      console.log(`❌ Código inválido → Usuario: ${username}`);
      return res.json({ success: false, message: "Código inválido o expirado." });
    }

    console.log(`✅ Código verificado correctamente → Usuario: ${username}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error verificando código:", err);
    res.status(500).json({ error: "Error verificando código 2FA" });
  }
});

/* ============================================================
   🔹 Rutas principales (sin /api)
   ============================================================ */
const contabilidadRoutes = require("./routes/contabilidad.routes");
const mantenimientoRoutes = require("./routes/mantenimiento.routes");
const seguridadRoutes = require("./routes/Seguridad.routes");
const bitacoraRoutes = require("./routes/bitacora.routes");
const ventasRoutes = require("./routes/ventas.routes");
const comprasRoutes = require("./routes/compras.routes");
const produccionRoutes = require("./routes/produccion.routes");
const inventarioRoutes = require("./routes/Inventario.routes");
const pagosFacturaRoutes = require("./routes/pagosFactura.routes");
const reportesContabilidadRoutes = require("./routes/reportesContabilidad.routes");


app.use("/contabilidad", contabilidadRoutes);
app.use("/seguridad", seguridadRoutes);
app.use("/mantenimiento", mantenimientoRoutes);
app.use("/bitacora", bitacoraRoutes);
app.use("/ventas", ventasRoutes);
app.use("/compras", comprasRoutes);
app.use("/produccion", produccionRoutes);
app.use("/inventario", inventarioRoutes);
app.use("/ventas/pagos-factura", pagosFacturaRoutes);
app.use("/contabilidad/reportes-contabilidad", reportesContabilidadRoutes);

/* ============================================================
   🚀 Iniciar servidor
   ============================================================ */
const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});
