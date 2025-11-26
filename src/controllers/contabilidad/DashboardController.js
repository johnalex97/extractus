const { pool } = require("../../db");

// ============================================================
// DASHBOARD EJECUTIVO
// ============================================================

exports.dashboardEjecutivo = async (req, res) => {
  let { desde, hasta } = req.query;

  try {
    if (!desde || !hasta) {
      const rango = await pool.query(`
        SELECT MIN(fecha_emision)::date AS desde,
               MAX(fecha_emision)::date AS hasta
        FROM ventasyreserva.tbl_facturas
      `);

      desde = rango.rows[0].desde;
      hasta = rango.rows[0].hasta;
    }

    const mayorVendedor = await pool.query(`
      SELECT COALESCE(f.vendedor, 'SIN VENDEDOR') AS vendedor,
             COUNT(f.id_factura) AS total_facturas,
             SUM(f.total_a_pagar) AS total_vendido
      FROM ventasyreserva.tbl_facturas f
      WHERE f.fecha_emision >= $1::date
        AND f.fecha_emision < ($2::date + INTERVAL '1 day')
      GROUP BY f.vendedor
      ORDER BY total_vendido DESC
      LIMIT 1
    `, [desde, hasta]);

    const productoTop = await pool.query(`
      SELECT p.nombre_producto,
             SUM(d.cantidad) AS total_cantidad,
             SUM(d.total) AS total_vendido
      FROM ventasyreserva.tbl_detalle_facturas d
      JOIN produccion.tbl_productos p ON p.id_producto = d.id_producto
      JOIN ventasyreserva.tbl_facturas f ON f.id_factura = d.id_factura
      WHERE f.fecha_emision >= $1::date
        AND f.fecha_emision < ($2::date + INTERVAL '1 day')
      GROUP BY p.nombre_producto
      ORDER BY total_cantidad DESC
      LIMIT 1
    `, [desde, hasta]);

    const clientesActivos = await pool.query(`
      SELECT COUNT(DISTINCT f.id_cliente) AS clientes_activos
      FROM ventasyreserva.tbl_facturas f
      WHERE f.fecha_emision >= $1::date
        AND f.fecha_emision < ($2::date + INTERVAL '1 day')
    `, [desde, hasta]);

    const insumoTop = await pool.query(`
      SELECT i.nombre_insumo,
             SUM(doc.cantidad) AS cantidad_total,
             SUM(doc.subtotal) AS total_comprado
      FROM compras.tbl_detalle_ordencompra doc
      JOIN produccion.tbl_insumos i ON i.id_insumo = doc.id_insumo
      JOIN compras.tbl_orden_compra oc ON oc.id_orden_compra = doc.id_orden_compra
      WHERE oc.fecha_orden >= $1::date
        AND oc.fecha_orden < ($2::date + INTERVAL '1 day')
      GROUP BY i.nombre_insumo
      ORDER BY cantidad_total DESC
      LIMIT 1
    `, [desde, hasta]);

    res.json({
      desde,
      hasta,
      mayorVendedor: mayorVendedor.rows[0] || {},
      productoTop: productoTop.rows[0] || {},
      clientesActivos: clientesActivos.rows[0]?.clientes_activos || 0,
      insumoTop: insumoTop.rows[0] || {}
    });

  } catch (error) {
    console.error("❌ Error dashboard:", error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================================
// VENTAS POR DÍA
// ============================================================

exports.ventasPorDia = async (req, res) => {
  let { desde, hasta } = req.query;

  try {
    if (!desde || !hasta) {
      const rango = await pool.query(`
        SELECT MIN(fecha_emision)::date AS desde,
               MAX(fecha_emision)::date AS hasta
        FROM ventasyreserva.tbl_facturas
      `);
      desde = rango.rows[0].desde;
      hasta = rango.rows[0].hasta;
    }

    const result = await pool.query(`
      SELECT f.fecha_emision::date AS fecha,
             SUM(f.total_a_pagar) AS total
      FROM ventasyreserva.tbl_facturas f
      WHERE f.fecha_emision >= $1::date
        AND f.fecha_emision < ($2::date + INTERVAL '1 day')
      GROUP BY f.fecha_emision::date
      ORDER BY f.fecha_emision::date
    `, [desde, hasta]);

    res.json(result.rows);

  } catch (error) {
    console.error("❌ Error ventasPorDia:", error);
    res.status(500).json({ error: error.message });
  }
};


// ============================================================
// VENTAS POR VENDEDOR
// ============================================================

exports.ventasPorVendedor = async (req, res) => {
  let { desde, hasta } = req.query;

  try {
    if (!desde || !hasta) {
      const rango = await pool.query(`
        SELECT MIN(fecha_emision)::date AS desde,
               MAX(fecha_emision)::date AS hasta
        FROM ventasyreserva.tbl_facturas
      `);
      desde = rango.rows[0].desde;
      hasta = rango.rows[0].hasta;
    }

    const result = await pool.query(`
      SELECT COALESCE(vendedor, 'SIN VENDEDOR') AS vendedor,
             SUM(total_a_pagar) AS total
      FROM ventasyreserva.tbl_facturas
      WHERE fecha_emision >= $1::date
        AND fecha_emision < ($2::date + INTERVAL '1 day')
      GROUP BY vendedor
      ORDER BY total DESC
    `, [desde, hasta]);

    res.json(result.rows);

  } catch (error) {
    console.error("❌ Error ventasPorVendedor:", error);
    res.status(500).json({ error: error.message });
  }
};
