// ============================================================
// 📂 src/components/Seguridad/Bitacora.js
// ============================================================
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Text, HStack, Input, Button, useToast,
} from "@chakra-ui/react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import api from "../../api/apiClient"; // ✅ Cliente Axios centralizado

export default function Bitacora() {
  // ============================================================
  // 🎯 Estados
  // ============================================================
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState("");
  const [tabla, setTabla] = useState("");
  const [accion, setAccion] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  // ============================================================
  // 🔄 Cargar datos desde backend
  // ============================================================
  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (usuario) params.usuario = usuario;
      if (tabla) params.tabla = tabla;
      if (accion) params.accion = accion;
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;

      const { data } = await api.get("/bitacora", { params });
setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la bitácora");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ============================================================
  // 📤 Exportar a PDF
  // ============================================================
  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("Reporte de Bitácora - Extractus", 14, 15);

      const tableData = rows.map(r => [
        r.id_bitacora,
        r.usuario || "—",
        r.tabla || "—",
        r.accion || "—",
        r.descripcion || "—",
        r.ip_origen || "—",
        r.user_agent || "—",
        new Date(r.fecha).toLocaleString(),
      ]);

      doc.autoTable({
        head: [["ID", "Usuario", "Tabla", "Acción", "Descripción", "IP", "User-Agent", "Fecha"]],
        body: tableData,
        startY: 22,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 120, 170] },
      });

      doc.save("Bitacora_Extractus.pdf");
      toast({ title: "PDF generado correctamente", status: "success", duration: 2500 });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al generar PDF", status: "error", duration: 2500 });
    }
  };

  // ============================================================
  // 📊 Exportar a Excel
  // ============================================================
  const exportExcel = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Bitácora");

      ws.columns = [
        { header: "ID", key: "id_bitacora", width: 10 },
        { header: "Usuario", key: "usuario", width: 20 },
        { header: "Tabla", key: "tabla", width: 20 },
        { header: "Acción", key: "accion", width: 15 },
        { header: "Descripción", key: "descripcion", width: 40 },
        { header: "IP", key: "ip_origen", width: 15 },
        { header: "User-Agent", key: "user_agent", width: 30 },
        { header: "Fecha", key: "fecha", width: 20 },
      ];

      rows.forEach(r => {
        ws.addRow({
          id_bitacora: r.id_bitacora,
          usuario: r.usuario || "—",
          tabla: r.tabla || "—",
          accion: r.accion || "—",
          descripcion: r.descripcion || "—",
          ip_origen: r.ip_origen || "—",
          user_agent: r.user_agent || "—",
          fecha: new Date(r.fecha).toLocaleString(),
        });
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Bitacora_Extractus.xlsx");
      toast({ title: "Excel generado correctamente", status: "success", duration: 2500 });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al generar Excel", status: "error", duration: 2500 });
    }
  };

  // ============================================================
  // 🎨 Renderizado
  // ============================================================
  return (
    <Box p={6}>
      <Heading size="md" mb={4}>Bitácora del Sistema</Heading>

      {/* 🔍 Filtros */}
      <HStack spacing={3} mb={3}>
        <Input placeholder="Usuario" value={usuario} onChange={e => setUsuario(e.target.value)} />
        <Input placeholder="Tabla" value={tabla} onChange={e => setTabla(e.target.value)} />
        <Input placeholder="Acción" value={accion} onChange={e => setAccion(e.target.value)} />
        <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <Button colorScheme="teal" onClick={load}>Filtrar</Button>
      </HStack>

      {/* 📤 Botones de exportación */}
      <HStack spacing={3} mb={3}>
        <Button colorScheme="blue" onClick={exportPDF}>Exportar PDF</Button>
        <Button colorScheme="green" onClick={exportExcel}>Exportar Excel</Button>
      </HStack>

      {/* 🧾 Tabla */}
      {loading ? (
        <Spinner size="xl" />
      ) : error ? (
        <Text color="red.400">{error}</Text>
      ) : (
        <Table size="sm" variant="striped">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Usuario</Th>
              <Th>Tabla</Th>
              <Th>Acción</Th>
              <Th>Descripción</Th>
              <Th>IP</Th>
              <Th>User-Agent</Th>
              <Th>Fecha</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.length === 0 ? (
              <Tr><Td colSpan={8}><Text>No hay registros</Text></Td></Tr>
            ) : (
              rows.map(r => (
                <Tr key={r.id_bitacora}>
                  <Td>{r.id_bitacora}</Td>
                  <Td>{r.usuario}</Td>
                  <Td>{r.tabla}</Td>
                  <Td>{r.accion}</Td>
                  <Td>{r.descripcion}</Td>
                  <Td>{r.ip_origen}</Td>
                  <Td maxW="250px" isTruncated title={r.user_agent}>{r.user_agent}</Td>
                  <Td>{new Date(r.fecha).toLocaleString()}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
