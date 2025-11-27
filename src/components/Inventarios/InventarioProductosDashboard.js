// ============================================================
// 💎 Dashboard Inventario de Productos - Extractus
// ============================================================

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Spinner,
  HStack,
  Button,
  Input,
  Badge,
  useToast,
  Divider,
  Checkbox,
  CheckboxGroup,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
} from "@chakra-ui/react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  FaFilePdf,
  FaFileExcel,
  FaSync,
  FaBroom,
  FaBoxes,
  FaSlidersH,
} from "react-icons/fa";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import api from "../../api/apiClient";
import logoSrc from "../login/log.png";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom"; // Asegúrate de importar useNavigate
import { FaArrowLeft } from "react-icons/fa";

=======
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480

export default function InventarioDashboardProductos() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedFields, setSelectedFields] = useState([
    "nombre_producto",
    "stock_minimo",
    "stock_maximo",
    "total_entradas",
    "total_salidas",
    "inventario_final",
    "unidad_medida",
    "fecha_movimiento",
    "nivel",
  ]);

  const audioRef = useRef(null);

  const bg = useColorModeValue("#f7faf8", "#1a202c");
  const cardBg = useColorModeValue("white", "#2d3748");
  const accent = useColorModeValue("#009e73", "teal.300");
  const headBg = useColorModeValue("#f1f8f4", "gray.700");

<<<<<<< HEAD
  const navigate = useNavigate(); // Agrega esto dentro de tu componente

=======
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
  // ============================================================
  // 📡 Cargar inventario productos
  // ============================================================
  const cargarInventario = async (paramsFechas = null) => {
    try {
      setLoading(true);

      if (paramsFechas) {
        const { data } = await api.get("/inventario/inventario-productos", {
          params: paramsFechas,
        });
        setInventario(data);
        return;
      }

      const inv = await api.get("/inventario/inventario-productos");

      const inventarioConDatosReales = inv.data.map((i) => ({
        ...i,
        total_entradas: i.entradas ?? 0,
        total_salidas: i.salidas ?? 0,
        inventario_final: i.stock_actual ?? 0,
        fecha_movimiento: i.fecha_de_movimiento || null,
        fecha_entrega_real: i.fecha_entrega_real || null,

      }));

      setInventario(inventarioConDatosReales);
    } catch (err) {
      toast({
        title: "Error al cargar inventario",
        description: err.message,
        status: "error",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {};
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;

    if (fechaInicio || fechaFin) cargarInventario(params);
    else cargarInventario();
  }, [fechaInicio, fechaFin]);

  const limpiarFiltros = async () => {
    setFechaInicio("");
    setFechaFin("");
    await cargarInventario();
  };

  // ============================================================
  // 📊 Reglas de nivel
  // ============================================================
  const sinExistencia = inventario.filter(
    (i) => Number(i.inventario_final) === 0
  );

  const productosBajos = inventario.filter(
    (i) =>
      Number(i.inventario_final) > 0 &&
      Number(i.inventario_final) < Number(i.stock_minimo)
  );

  const productosAltos = inventario.filter(
    (i) => Number(i.inventario_final) > Number(i.stock_maximo)
  );

  const productosNormales = inventario.filter(
    (i) =>
      Number(i.inventario_final) >= Number(i.stock_minimo) &&
      Number(i.inventario_final) <= Number(i.stock_maximo)
  );

  const totalProductos = inventario.length;

  const calcularNivel = (i) => {
    const stock = Number(i.inventario_final);
    const min = Number(i.stock_minimo);
    const max = Number(i.stock_maximo);

    if (stock === 0) return { text: "Sin existencia", color: "red" };
    if (stock < min) return { text: "Bajo", color: "orange" };
    if (stock > max) return { text: "Excedente", color: "green" };
    return { text: "Normal", color: "yellow" };
  };

  const chartData = useMemo(
    () =>
      inventario
        .map((i) => ({
          name: i.nombre_producto,
          Stock: Number(i.inventario_final ?? 0),
        }))
        .sort((a, b) => b.Stock - a.Stock)
        .slice(0, 8),
    [inventario]
  );

  // ============================================================
  // 🔔 Alertas automáticas
  // ============================================================
  useEffect(() => {
    if (inventario.length === 0) return;

    const play = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    if (productosBajos.length > 0) {
      toast({
        title: "⚠️ Productos en bajo stock",
        description: productosBajos.map((i) => i.nombre_producto).join(", "),
        status: "warning",
        duration: 9000,
        position: "top-right",
      });
      play();
    }

    if (productosAltos.length > 0) {
      toast({
        title: "🚨 Productos en excedente",
        description: productosAltos.map((i) => i.nombre_producto).join(", "),
        status: "error",
        duration: 9000,
        position: "top-right",
      });
      play();
    }

    if (sinExistencia.length > 0) {
      toast({
        title: "❌ Productos sin existencia",
        description: sinExistencia.map((i) => i.nombre_producto).join(", "),
        status: "error",
        duration: 9000,
        position: "top-right",
      });
      play();
    }
  }, [inventario]);

  // ============================================================
  // 🧾 (OPCIONAL) Exportar PDF / Excel
  // ============================================================
  const columnasDisponibles = [
    { id: "nombre_producto", label: "Producto" },
    { id: "stock_minimo", label: "Stock Mínimo" },
    { id: "stock_maximo", label: "Stock Máximo" },
    { id: "total_entradas", label: "Entradas" },
    { id: "total_salidas", label: "Salidas" },
    { id: "inventario_final", label: "Stock Actual" },
    { id: "unidad_medida", label: "Unidad" },
    { id: "fecha_movimiento", label: "Fecha Movimiento" },
    { id: "nivel", label: "Nivel" },
  ];

<<<<<<< HEAD
const exportarPDF = () => {
  const doc = new jsPDF("landscape");  // Cambiar a orientación "landscape" (horizontal)

  // Agregar imagen (logo)
  const img = new Image();
  img.src = logoSrc;
  img.onload = () => {
    doc.addImage(img, "PNG", 10, 8, 25, 15); // Logo en la parte superior izquierda
    doc.setFontSize(16);
    doc.text("Listado de Inventario de Productos", 70, 15); // Título del reporte

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 10, 30);

    // Definición de los datos de la tabla
=======
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.addImage(logoSrc, "PNG", 10, 8, 25, 15);
    doc.setFontSize(14);
    doc.text("Reporte de Inventario de Productos", 70, 15);

>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
    const data = inventario.map((i) => [
      i.nombre_producto,
      i.stock_minimo,
      i.stock_maximo,
      i.total_entradas,
      i.total_salidas,
      i.inventario_final,
      i.unidad_medida,
      i.fecha_movimiento
        ? new Date(i.fecha_movimiento).toLocaleDateString("es-HN")
        : "—",
      calcularNivel(i).text,
    ]);

<<<<<<< HEAD
    // Generar tabla con estilo
=======
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
    autoTable(doc, {
      head: [
        [
          "Producto",
          "Stock Min",
          "Stock Max",
          "Entradas",
          "Salidas",
          "Actual",
          "Unidad",
          "Fecha Mov.",
          "Nivel",
        ],
      ],
      body: data,
<<<<<<< HEAD
      startY: 40, // Desde donde empieza la tabla
      theme: 'grid', // Estilo de tabla
      margin: { top: 10, bottom: 10 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
      }
    });

    // Descargar archivo PDF
    doc.save("Inventario_Productos.pdf");
  };
};

const exportarExcel = async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Inventario Productos");

  // Definir las cabeceras de la tabla
  ws.addRow([
    "Producto",
    "Stock Min",
    "Stock Max",
    "Entradas",
    "Salidas",
    "Actual",
    "Unidad",
    "Fecha Mov.",
    "Nivel",
  ]);

  // Agregar los datos de inventario a la tabla
  inventario.forEach((i) => {
    ws.addRow([
      i.nombre_producto,
      i.stock_minimo,
      i.stock_maximo,
      i.total_entradas,
      i.total_salidas,
      i.inventario_final,
      i.unidad_medida,
      i.fecha_movimiento
        ? new Date(i.fecha_movimiento).toLocaleDateString("es-HN")
        : "—",
      calcularNivel(i).text,
    ]);
  });

  // Configurar la hoja para que las celdas se ajusten a un tamaño más grande
  ws.getColumn(1).width = 20;  // Producto
  ws.getColumn(2).width = 15;  // Stock Min
  ws.getColumn(3).width = 15;  // Stock Max
  ws.getColumn(4).width = 15;  // Entradas
  ws.getColumn(5).width = 15;  // Salidas
  ws.getColumn(6).width = 15;  // Actual
  ws.getColumn(7).width = 15;  // Unidad
  ws.getColumn(8).width = 20;  // Fecha Mov.
  ws.getColumn(9).width = 15;  // Nivel

  // Descargar archivo Excel
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Inventario_Productos.xlsx");
};


=======
      startY: 30,
    });

    doc.save("inventario_productos.pdf");
  };

  const exportarExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Inventario Productos");

    ws.addRow([
      "Producto",
      "Stock Min",
      "Stock Max",
      "Entradas",
      "Salidas",
      "Actual",
      "Unidad",
      "Fecha Mov.",
      "Nivel",
    ]);

    inventario.forEach((i) => {
      ws.addRow([
        i.nombre_producto,
        i.stock_minimo,
        i.stock_maximo,
        i.total_entradas,
        i.total_salidas,
        i.inventario_final,
        i.unidad_medida,
        i.fecha_movimiento
          ? new Date(i.fecha_movimiento).toLocaleDateString("es-HN")
          : "—",
        calcularNivel(i).text,
      ]);
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "inventario_productos.xlsx");
  };
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480

  // ============================================================
  // 💎 Render
  // ============================================================
  return (
    <Box bg={bg} minH="100vh" p={8}>
      <audio ref={audioRef}>
        <source
          src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
          type="audio/ogg"
        />
      </audio>

      {/* ENCABEZADO */}
<<<<<<< HEAD
  <Flex justify="space-between" align="center" mb={4}>
  {/* Botón Atrás al lado del título */}
  <HStack spacing={3}>
    <Button
      leftIcon={<FaArrowLeft />}
      onClick={() => navigate("/app/inventarios")} // Ruta a donde navegará el botón
      size="sm"
      colorScheme="teal"
    >
      Atrás
    </Button>

    <Heading size="md" color={accent}>
      Inventario de Productos
    </Heading>
  </HStack>

  {/* Filtros */}
  <HStack spacing={2}>
    <Input
      type="date"
      size="xs"
      w="110px"
      value={fechaInicio}
      onChange={(e) => setFechaInicio(e.target.value)}
    />
    <Input
      type="date"
      size="xs"
      w="110px"
      value={fechaFin}
      onChange={(e) => setFechaFin(e.target.value)}
    />
    <Button size="xs" leftIcon={<FaBroom />} onClick={limpiarFiltros}>
      Limpiar
    </Button>
    <Button
      size="xs"
      colorScheme="teal"
      leftIcon={<FaSync />}
      onClick={() => cargarInventario()}
    >
      Refrescar
    </Button>
  </HStack>
</Flex>

=======
      <Flex justify="space-between" mb={4} wrap="wrap" gap={3}>
        <HStack spacing={2}>
          <FaBoxes color={accent} size="18" />
          <Heading size="md" color={accent}>
            Inventario de Productos
          </Heading>
        </HStack>

        <HStack spacing={2}>
          <Input
            type="date"
            size="xs"
            w="110px"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <Input
            type="date"
            size="xs"
            w="110px"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
          <Button size="xs" leftIcon={<FaBroom />} onClick={limpiarFiltros}>
            Limpiar
          </Button>
          <Button
            size="xs"
            colorScheme="teal"
            leftIcon={<FaSync />}
            onClick={() => cargarInventario()}
          >
            Refrescar
          </Button>
        </HStack>
      </Flex>
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480

      {/* TARJETAS */}
      <SimpleGrid columns={[2, 4]} spacing={5} mb={6}>
        <Card p={4} bg="#e8f7f0">
          <HStack>
            <Box bg="#c4ecdf" p={3} borderRadius="full">
              <FaBoxes color="#008f6b" size="22" />
            </Box>
            <Box>
              <Text>Total de Productos</Text>
              <Text fontSize="2xl">{totalProductos}</Text>
            </Box>
          </HStack>
        </Card>

        <Card p={4} bg="#fff4e6">
          <HStack>
            <Box bg="#ffe1bf" p={3} borderRadius="full">
              <FaBoxes color="#cc6e14" size="22" />
            </Box>
            <Box>
              <Text>Productos Normales</Text>
              <Text fontSize="2xl">{productosNormales.length}</Text>
            </Box>
          </HStack>
        </Card>

        <Card p={4} bg="#e9f9ee">
          <HStack>
            <Box bg="#c9f0d6" p={3} borderRadius="full">
              <FaBoxes color="#2f855a" size="22" />
            </Box>
            <Box>
              <Text>Productos Excedentes</Text>
              <Text fontSize="2xl">{productosAltos.length}</Text>
            </Box>
          </HStack>
        </Card>

        <Card p={4} bg="#ffe9e9">
          <HStack>
            <Box bg="#ffcfcf" p={3} borderRadius="full">
              <FaBoxes color="#c53030" size="22" />
            </Box>
            <Box>
              <Text>Sin Existencia</Text>
              <Text fontSize="2xl">{sinExistencia.length}</Text>
            </Box>
          </HStack>
        </Card>
      </SimpleGrid>

      {/* CHART */}
      <Card bg={cardBg} mb={8}>
        <CardHeader>
          <Heading size="sm" color={accent}>
            Stock Actual por Producto
          </Heading>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Flex justify="center">
              <Spinner color={accent} />
            </Flex>
          ) : (
            <Box h="260px">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="Stock"
                    stroke={accent}
                    fill="url(#cStock)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* TABLA */}
      <Card bg={cardBg} border="1px solid #c2d4c3">
        <CardHeader>
          <Flex justify="space-between">
            <Heading size="sm" color={accent}>
              Detalle de Inventario
            </Heading>
            <HStack>
              <Button size="sm" leftIcon={<FaSlidersH />} onClick={onOpen}>
                Campos
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<FaFilePdf />}
                onClick={exportarPDF}
              >
                PDF
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<FaFileExcel />}
                onClick={exportarExcel}
              >
                Excel
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <Divider />

        <CardBody>
          {loading ? (
            <Flex justify="center">
              <Spinner color={accent} />
            </Flex>
          ) : (
            <Table size="sm">
              <Thead bg={headBg}>
                <Tr>
                  {columnasDisponibles
                    .filter((c) => selectedFields.includes(c.id))
                    .map((col) => (
                      <Th key={col.id}>{col.label}</Th>
                    ))}
                </Tr>
              </Thead>

              <Tbody>
                {inventario.map((i) => (
                  <Tr key={i.id_producto}>
                    {selectedFields.includes("nombre_producto") && (
                      <Td>{i.nombre_producto}</Td>
                    )}

                    {selectedFields.includes("stock_minimo") && (
                      <Td>{i.stock_minimo}</Td>
                    )}

                    {selectedFields.includes("stock_maximo") && (
                      <Td>{i.stock_maximo}</Td>
                    )}

                    {selectedFields.includes("total_entradas") && (
                      <Td>{Number(i.total_entradas).toFixed(0)}</Td>
                    )}

                    {selectedFields.includes("total_salidas") && (
                      <Td>{Number(i.total_salidas).toFixed(0)}</Td>
                    )}

                    {selectedFields.includes("inventario_final") && (
                      <Td>{Number(i.inventario_final).toFixed(0)}</Td>
                    )}

                    {selectedFields.includes("unidad_medida") && (
                      <Td>{i.unidad_medida}</Td>
                    )}

                    {selectedFields.includes("fecha_movimiento") && (
                      <Td>
                        {i.fecha_movimiento
                          ? new Date(i.fecha_movimiento).toLocaleDateString("es-HN")
                          : "—"}
                      </Td>
                    )}
                    {selectedFields.includes("fecha_entrega_real") && (
  <Td>
    {i.fecha_entrega_real
      ? new Date(i.fecha_entrega_real).toLocaleDateString("es-HN")
      : "—"}
  </Td>
)}

                    {selectedFields.includes("nivel") && (
                      <Td>
                        <Badge colorScheme={calcularNivel(i).color}>
                          {calcularNivel(i).text}
                        </Badge>
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* MODAL COLUMNAS */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Seleccionar columnas</ModalHeader>
          <ModalBody>
            <CheckboxGroup
              value={selectedFields}
              onChange={(vals) => setSelectedFields(vals)}
            >
              <Stack spacing={2}>
                {columnasDisponibles.map((col) => (
                  <Checkbox key={col.id} value={col.id}>
                    {col.label}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
