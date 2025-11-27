// ============================================================
// 📂 src/controllers/seguridad/bitacora.controller.js
// ============================================================
const { pool } = require("../../db");

// ============================================================
// 📋 LISTAR BITÁCORA COMPLETA (adaptado a tu tabla actual)
// ============================================================
const listarBitacora = async (req, res) => {
  try {
    const { usuario, accion, desde, hasta } = req.query;

    const where = [];
    const params = [];

    // 🔍 Filtros dinámicos
    if (usuario && usuario.trim() !== "") {
      params.push(`%${usuario.trim().toLowerCase()}%`);
      where.push(`LOWER(COALESCE(u.username, '')) LIKE $${params.length}`);
    }

    if (accion && accion.trim() !== "") {
      params.push(accion.trim().toLowerCase());
      where.push(`LOWER(b.accion) = $${params.length}`);
    }

    if (desde && hasta) {
      params.push(desde, hasta);
      where.push(`b.fecha_evento BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    // ============================================================
    // 🧾 Consulta principal
    // ============================================================
    const sql = `
      SELECT
        b.id_bitacora,
        b.fecha_evento AS fecha,
        COALESCE(u.username, 'Desconocido') AS usuario,
        b.id_objeto,
        o.nombre_objeto AS nombre_objeto,
        b.tabla,
        b.accion,
        b.descripcion,
        b.detalle,
        b.id_usuario_creado,
        b.fecha_creado
      FROM seguridad.tbl_ms_bitacora b
      LEFT JOIN seguridad.tbl_usuarios u
        ON b.id_usuario::text = u.id_usuario::text
      LEFT JOIN seguridad.tbl_objetos o
        ON b.id_objeto = o.id_objeto
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY b.fecha_evento DESC
      LIMIT 1000;
    `;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al listar bitácora:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// 📤 Exportar módulo
// ============================================================
module.exports = { listarBitacora };
