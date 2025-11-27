// ============================================================
// 📁 src/components/Produccion/Productos.js
// 💎 Gestión de Productos con mini dashboard + PDF/Excel
// ============================================================

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

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
  FaFilePdf,
  FaFileExcel,
  FaBoxes,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import CrudTabla from "../Seguridad/CrudTabla";
import api from "../../api/apiClient";

// 📦 Exportación
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// 🖼️ Logo SOLO para el PDF (igual que Clientes)
import extractusLogo from "../login/log.png";

export default function Productos() {
  // 🎨 Colores adaptados a día/noche (igual estilo Clientes)
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
  // 🔹 Cargar productos
  // ============================================================
  const cargarProductos = useCallback(async () => {
    try {
      const res = await api.get("/produccion/productos");
      setData(res.data);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
      toast({
        title: "Error al cargar productos",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  }, [toast]);

  // ============================================================
  // 🔹 Cargar estados
  // ============================================================
  const cargarEstados = useCallback(async () => {
    try {
      const res = await api.get("/mantenimiento/estado-producto");
      setEstados(res.data);
    } catch (err) {
      console.error("❌ Error cargando estados de producto:", err);
      setEstados([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([cargarProductos(), cargarEstados()]).finally(() =>
      setLoading(false)
    );
  }, [cargarProductos, cargarEstados]);

  // ============================================================
  // 📊 Mini dashboard (totales)
  // ============================================================
  const { totalProductos, productosActivos, productosInactivos } = useMemo(() => {
    const total = data.length;

    const activos = data.filter((r) => {
      const estado = (r.estado_producto || "").toString().toLowerCase();
      return estado === "activo";
    }).length;

    const inactivos = total - activos;

    return {
      totalProductos: total,
      productosActivos: activos,
      productosInactivos: inactivos,
    };
  }, [data]);

  // ============================================================
  // 🔹 Campos del formulario CRUD (TU LÓGICA RESPETADA)
  // ============================================================
  const fields = [
    {
      name: "nombre_producto",
      label: "Nombre del Producto",
      type: "text",
      required: true,
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
    },
    {
      name: "unidad_medida",
      label: "Unidad de Medida",
      type: "text",
      required: true,
    },
    {
      name: "precio_unitario",
      label: "Precio Unitario (Lps)",
      type: "number",
      step: "0.01",
      min: "0",
      required: true,
    },
    {
      name: "stock_minimo",
      label: "Stock Mínimo",
      type: "number",
      min: 0,
      required: true,
    },
    {
      name: "stock_maximo",
      label: "Stock Máximo",
      type: "number",
      min: 0,
      required: true,
    },
    {
      name: "id_estado_producto",
      label: "Estado del Producto",
      type: "select",
      required: true,
      options: estados.map((e) => ({
        value: e.id_estado_producto,
        label: e.nombre_estado,
      })),
    },
  ];

  // ============================================================
  // 🔹 Columnas tabla
  // ============================================================
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

  const extractors = {
    ID: (r) => r.id_producto,
    Nombre: (r) => r.nombre_producto,
    Unidad: (r) => r.unidad_medida,
    Precio: (r) => `L. ${parseFloat(r.precio_unitario || 0).toFixed(2)}`,
    "Stock Min": (r) => r.stock_minimo,
    "Stock Max": (r) => r.stock_maximo,
    Estado: (r) => r.estado_producto || "—",
    Fecha: (r) =>
      r.fecha_creacion
        ? new Date(r.fecha_creacion).toLocaleString("es-HN", {
            timeZone: "America/Tegucigalpa",
          })
        : "—",
  };

  // ============================================================
  // 🔹 CRUD (TU LÓGICA ORIGINAL)
  // ============================================================
  const handleInsert = async (nuevo) => {
    try {
      await api.post("/produccion/productos", nuevo);
      await cargarProductos();

      toast({
        title: "Producto agregado",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al agregar",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleUpdate = async (editado) => {
    try {
      await api.put(`/produccion/productos/${editado.id_producto}`, editado);
      await cargarProductos();

      toast({
        title: "Producto actualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al actualizar",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/produccion/productos/${id}`);
      await cargarProductos();

      toast({
        title: "Producto eliminado",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al eliminar",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // ============================================================
  // 🧾 Exportar PDF
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
      doc.text("Listado de Productos", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generado: ${fechaHora}`, 14, 22);

      const columnsPDF = [
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
        r.id_producto,
        r.nombre_producto,
        r.unidad_medida,
        `L. ${parseFloat(r.precio_unitario || 0).toFixed(2)}`,
        r.stock_minimo,
        r.stock_maximo,
        r.estado_producto || "",
        r.fecha_creacion
          ? new Date(r.fecha_creacion).toISOString().split("T")[0]
          : "",
      ]);

      autoTable(doc, {
        head: [columnsPDF],
        body: rows,
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 158, 115] },
      });

      doc.save(`Productos_${new Date().toISOString().slice(0, 10)}.pdf`);
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

  // ============================================================
  // 📊 Exportar Excel
  // ============================================================
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Productos");

      sheet.addRow([
        "ID",
        "Nombre",
        "Unidad",
        "Precio",
        "Stock Min",
        "Stock Max",
        "Estado",
        "Fecha",
      ]);

      data.forEach((r) => {
        sheet.addRow([
          r.id_producto,
          r.nombre_producto,
          r.unidad_medida,
          parseFloat(r.precio_unitario || 0),
          r.stock_minimo,
          r.stock_maximo,
          r.estado_producto || "",
          r.fecha_creacion
            ? new Date(r.fecha_creacion).toISOString().split("T")[0]
            : "",
        ]);
      });

      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((col) => {
        col.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `Productos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("❌ Error exportando Excel:", err);
      toast({
        title: "Error al exportar Excel",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // ============================================================
  // 🔹 Loader
  // ============================================================
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh" bg={pageBg}>
        <Spinner size="xl" color={accent} />
      </Flex>
    );
  }

  // ============================================================
  // 🔹 Render principal
  // ============================================================
  return (
    <Box bg={pageBg} minH="100vh" p={4}>
      {/* Botón Atrás */}
      <Tooltip label="Volver al menú Producción" placement="bottom-start">
        <Button
          leftIcon={<Icon as={FaArrowLeft} />}
          bg={btnBackBg}
          color={btnBackColor}
          _hover={{ bg: btnBackHoverBg, transform: "scale(1.03)" }}
          onClick={() => navigate("/app/produccion")}
          size="sm"
          mb={4}
          boxShadow="sm"
          borderRadius="full"
        >
          Atrás
        </Button>
      </Tooltip>

      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        boxShadow="md"
      >
        {/* Encabezado con título + botones de exportación */}
        <CardHeader pb={3}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Box>
              <HStack spacing={2}>
                <FaBoxes color={accent} />
                <Heading size="md" color={accent}>
                  Gestión de Productos
                </Heading>
              </HStack>
              
            </Box>

            <HStack spacing={2}>
              <Tooltip label="Exportar listado a PDF">
                <Button
                  size="sm"
                  colorScheme="red"
                  leftIcon={<FaFilePdf />}
                  onClick={handleExportPDF}
                >
                  PDF
                </Button>
              </Tooltip>
              <Tooltip label="Exportar listado a Excel">
                <Button
                  size="sm"
                  colorScheme="green"
                  leftIcon={<FaFileExcel />}
                  onClick={handleExportExcel}
                >
                  Excel
                </Button>
              </Tooltip>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          {/* MINI DASHBOARD */}
          <Box py={3}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box
                as={Stat}
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg={statTotalBg}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>Total de productos</StatLabel>
                    <StatNumber>{totalProductos}</StatNumber>
                    <StatHelpText fontSize="xs">
                      Registrados en el sistema
                    </StatHelpText>
                  </Box>
                  <Icon as={FaBoxes} boxSize={8} color={accent} />
                </Flex>
              </Box>

              <Box
                as={Stat}
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg={statActivosBg}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>Productos activos</StatLabel>
                    <StatNumber color={activosNumberColor}>
                      {productosActivos}
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                      En estado &quot;Activo&quot;
                    </StatHelpText>
                  </Box>
                  <Icon as={FaCheckCircle} boxSize={8} color="green.400" />
                </Flex>
              </Box>

              <Box
                as={Stat}
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg={statInactivosBg}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>Productos inactivos</StatLabel>
                    <StatNumber color={inactivosNumberColor}>
                      {productosInactivos}
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                      No activos / dados de baja
                    </StatHelpText>
                  </Box>
                  <Icon as={FaBan} boxSize={8} color="red.400" />
                </Flex>
              </Box>
            </SimpleGrid>
          </Box>

          <Divider my={4} />

          {/* TABLA CRUD */}
          <Box overflowX="auto">
            <CrudTabla
              title="Productos"
              columns={columns}
              extractors={extractors}
              fields={fields}
              idKey="id_producto"
              initialData={data}
              onInsert={handleInsert}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReload={cargarProductos}
              apiUrl="/produccion/productos"
            />
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
