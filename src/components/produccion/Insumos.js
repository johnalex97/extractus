// ============================================================
// 📁 src/components/Produccion/Insumos.js
// 💎 Gestión de Insumos (DISEÑO estilo Clientes + Mini Dashboard + Export)
// ============================================================

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Divider,
  Spinner,
  useToast,
  useColorModeValue,
  Button,
  Tooltip,
  Icon,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  HStack,
} from "@chakra-ui/react";

import {
  FaArrowLeft,
  FaBoxes,
  FaCheckCircle,
  FaBan,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import CrudTabla from "../Seguridad/CrudTabla";
import api from "../../api/apiClient";

// 📦 Exportación
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Imagen logo PDF
import extractusLogo from "../login/log.png";

export default function Insumos() {
  // ============================================================
  // 🎨 Estilos (idénticos a Clientes)
  // ============================================================
  const accent = useColorModeValue("#009e73", "teal.300");
  const pageBg = useColorModeValue("#f7faf8", "#020617");
  const cardBg = useColorModeValue("white", "#0b1120");
  const borderColor = useColorModeValue("#c2d4c3", "#1f2937");

  const btnBackBg = useColorModeValue("teal.100", "teal.600");
  const btnBackColor = useColorModeValue("teal.800", "white");
  const btnBackHoverBg = useColorModeValue("teal.200", "teal.500");

  const statTotalBg = useColorModeValue("#e8f7f0", "rgba(0,158,115,0.12)");
  const statActivosBg = useColorModeValue("#e9f9ee", "rgba(56,161,105,0.12)");
  const statInactivosBg = useColorModeValue("#ffe9e9", "rgba(245,101,101,0.12)");

  const subtitleColor = useColorModeValue("gray.600", "gray.300");
  const activosNumberColor = useColorModeValue("green.600", "green.300");
  const inactivosNumberColor = useColorModeValue("red.500", "red.300");

  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Cargar insumos (MISMA LÓGICA)
  // ============================================================
  const cargarInsumos = useCallback(async () => {
    try {
      const res = await api.get("/produccion/insumos");
      setData(res.data);
    } catch (err) {
      console.error("❌ Error cargando insumos:", err);
      toast({
        title: "Error al cargar insumos",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [toast]);

  // ============================================================
  // 🔹 Cargar estados (MISMA LÓGICA)
  // ============================================================
  const cargarEstados = useCallback(async () => {
    try {
      const res = await api.get("/mantenimiento/estado-insumo");
      setEstados(res.data);
    } catch (err) {
      console.warn("⚠️ No se pudieron cargar los estados:", err.message);
      setEstados([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([cargarInsumos(), cargarEstados()]).finally(() =>
      setLoading(false)
    );
  }, [cargarInsumos, cargarEstados]);

  // ============================================================
  // 📊 Mini Dashboard
  // ============================================================
  const { totalInsumos, insumosActivos, insumosInactivos } = useMemo(() => {
    const total = data.length;

    const activos = data.filter((r) => {
      const estado = (r.nombre_estado_insumo || "")
        .toString()
        .toLowerCase();
      return estado === "activo";
    }).length;

    const inactivos = total - activos;

    return {
      totalInsumos: total,
      insumosActivos: activos,
      insumosInactivos: inactivos,
    };
  }, [data]);

  // ============================================================
  // 🔹 Fields (SIN MODIFICAR)
  // ============================================================
  const fields = [
    { name: "nombre_insumo", label: "Nombre del Insumo", type: "text", required: true },
    { name: "unidad_medida", label: "Unidad de Medida", type: "text", required: true },
    { name: "precio_unitario", label: "Precio Unitario (Lps)", type: "number", step: "0.01", min: "0", required: true },
    { name: "stock_minimo", label: "Stock Mínimo", type: "number", step: "0.01", min: "0", required: true },
    { name: "stock_maximo", label: "Stock Máximo", type: "number", step: "0.01", min: "0", required: true },
    {
      name: "id_estado_insumo",
      label: "Estado del Insumo",
      type: "select",
      required: true,
      options: estados.map((e) => ({
        value: e.id_estado_insumo,
        label: e.nombre_estado,
      })),
    },
  ];

  const columns = [
    "ID Insumo",
    "Nombre",
    "Unidad",
    "Precio Unitario",
    "Stock Mínimo",
    "Stock Máximo",
    "Estado",
    "Fecha Creación",
  ];

  const extractors = {
    "ID Insumo": (r) => r.id_insumo,
    Nombre: (r) => r.nombre_insumo,
    Unidad: (r) => r.unidad_medida,
    "Precio Unitario": (r) =>
      `L. ${parseFloat(r.precio_unitario || 0).toFixed(2)}`,
    "Stock Mínimo": (r) => parseFloat(r.stock_minimo || 0).toFixed(2),
    "Stock Máximo": (r) => parseFloat(r.stock_maximo || 0).toFixed(2),
    Estado: (r) => r.nombre_estado_insumo || "—",
    "Fecha Creación": (r) =>
      r.fecha_creacion
        ? new Date(r.fecha_creacion).toLocaleString("es-HN", {
            timeZone: "America/Tegucigalpa",
            hour12: false,
          })
        : "—",
  };

  // ============================================================
  // 🔹 CRUD (MISMA LÓGICA)
  // ============================================================
  const handleInsert = async (nuevo) => {
    try {
      await api.post("/produccion/insumos", {
        ...nuevo,
        stock_minimo: parseFloat(nuevo.stock_minimo) || 0,
        stock_maximo: parseFloat(nuevo.stock_maximo) || 0,
      });

      const res = await api.get("/produccion/insumos");
      setData(res.data);

      toast({ title: "✅ Insumo agregado correctamente", status: "success" });
    } catch (err) {
      toast({
        title: "Error al agregar insumo",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    }
  };

  const handleUpdate = async (editado) => {
    try {
      await api.put(`/produccion/insumos/${editado.id_insumo}`, {
        ...editado,
        stock_minimo: parseFloat(editado.stock_minimo) || 0,
        stock_maximo: parseFloat(editado.stock_maximo) || 0,
      });

      const res = await api.get("/produccion/insumos");
      setData(res.data);

      toast({ title: "✏️ Insumo actualizado", status: "success" });
    } catch (err) {
      toast({
        title: "Error al actualizar",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/produccion/insumos/${id}`);

      const res = await api.get("/produccion/insumos");
      setData(res.data);

      toast({ title: "🗑️ Insumo eliminado", status: "info" });
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    }
  };

  // ============================================================
  // 🧾 PDF & EXCEL
  // ============================================================
// ============================================================
// 🧾 Exportar PDF (MISMO DISEÑO QUE PRODUCTOS)
// ============================================================
const handleExportPDF = async () => {
  try {
    const doc = new jsPDF("landscape");
    const fechaHora = new Date().toLocaleString("es-HN");

    const img = new Image();
    img.src = extractusLogo;

    await new Promise((resolve, reject) => {
      img.onload = () => {
        doc.addImage(img, "PNG", 245, 5, 20, 15);
        resolve();
      };
      img.onerror = (err) => reject(err);
    });

    doc.setFontSize(14);
    doc.text("Listado de Insumos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado: ${fechaHora}`, 14, 22);

    const columns = [
      "ID",
      "Nombre",
      "Unidad",
      "Precio",
      "Stock Min",
      "Stock Max",
      "Estado",
      "Fecha",
    ];

    const rows = data.map((r) => [
      r.id_insumo,
      r.nombre_insumo,
      r.unidad_medida,
      `L. ${parseFloat(r.precio_unitario || 0).toFixed(2)}`,
      parseFloat(r.stock_minimo || 0).toFixed(2),
      parseFloat(r.stock_maximo || 0).toFixed(2),
      r.nombre_estado_insumo || "",
      r.fecha_creacion
        ? new Date(r.fecha_creacion).toISOString().split("T")[0]
        : "",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 158, 115] }, // 🔥 MISMO VERDE DE PRODUCTOS
    });

    doc.save(`Insumos_${new Date().toISOString().slice(0, 10)}.pdf`);

  } catch (err) {
    console.error("❌ Error exportando PDF:", err);
    toast({
      title: "Error al exportar PDF",
      description: err.message,
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "top",
    });
  }
};

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Insumos");

    sheet.addRow(["ID", "Nombre", "Unidad", "Precio", "Min", "Max", "Estado"]);

    data.forEach((r) =>
      sheet.addRow([
        r.id_insumo,
        r.nombre_insumo,
        r.unidad_medida,
        r.precio_unitario,
        r.stock_minimo,
        r.stock_maximo,
        r.nombre_estado_insumo || "",
      ])
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    saveAs(blob, `Insumos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh" bg={pageBg}>
        <Spinner size="xl" color={accent} />
      </Flex>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh" p={4}>
      <Tooltip label="Volver al menú Producción">
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate("/app/produccion")}
          bg={btnBackBg}
          color={btnBackColor}
          _hover={{ bg: btnBackHoverBg }}
          mb={4}
          borderRadius="full"
        >
          Atrás
        </Button>
      </Tooltip>

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <HStack>
              <FaBoxes color={accent} />
              <Heading size="md" color={accent}>
                Gestión de Insumos
              </Heading>
            </HStack>

            <HStack>
              <Button colorScheme="red" leftIcon={<FaFilePdf />} onClick={handleExportPDF}>PDF</Button>
              <Button colorScheme="green" leftIcon={<FaFileExcel />} onClick={handleExportExcel}>Excel</Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            <Stat bg={statTotalBg} p={4} borderRadius="lg">
              <StatLabel>Total</StatLabel>
              <StatNumber>{totalInsumos}</StatNumber>
            </Stat>

            <Stat bg={statActivosBg} p={4} borderRadius="lg">
              <StatLabel>Activos</StatLabel>
              <StatNumber color={activosNumberColor}>{insumosActivos}</StatNumber>
            </Stat>

            <Stat bg={statInactivosBg} p={4} borderRadius="lg">
              <StatLabel>Inactivos</StatLabel>
              <StatNumber color={inactivosNumberColor}>{insumosInactivos}</StatNumber>
            </Stat>
          </SimpleGrid>

          <Divider my={4} />

          <CrudTabla
            title="Insumos"
            columns={columns}
            extractors={extractors}
            fields={fields}
            idKey="id_insumo"
            initialData={data}
            onInsert={handleInsert}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onReload={cargarInsumos}
            apiUrl="/produccion/insumos"
          />
        </CardBody>
      </Card>
    </Box>
  );
}
