// Importa los módulos necesarios
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  useToast,
  Button,
  HStack,
  Flex,
  Input,
  Card,
  CardBody,
  SimpleGrid,
  Text,
  useColorModeValue, // Para los colores
} from "@chakra-ui/react";
import { FaSync, FaFilter, FaBroom, FaFilePdf, FaFileExcel, FaArrowLeft, FaPlus } from "react-icons/fa";  // Agrega FaPlus
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import api from "../../api/apiClient";
import logoSrc from "../login/log.png";
import { useNavigate } from "react-router-dom";  // Hook para la navegación

export default function MovimientosInsumos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const toast = useToast();
  const navigate = useNavigate(); // Hook de navegación

  // Define la variable de color (accent)
  const accent = useColorModeValue("teal.600", "teal.300");

  // Cargar movimientos desde el backend
  const cargarMovimientos = async (params = null) => {
    try {
      setLoading(true);
      const { data } = await api.get("/inventario/movimientos", { params });
      setMovimientos(data || []);
    } catch (error) {
      toast({
        title: "Error al cargar movimientos",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrado dinámico automático
  useEffect(() => {
    const filtros = {};
    if (fechaInicio) filtros.fecha_inicio = fechaInicio;
    if (fechaFin) filtros.fecha_fin = fechaFin;
    cargarMovimientos(filtros);
  }, [fechaInicio, fechaFin]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
  };

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const img = new Image();
    img.src = logoSrc;
    doc.addImage(img, "PNG", 15, 10, 20, 20);

    doc.setFontSize(16);
    doc.text("Historial de Movimientos de Insumos", 105, 20, { align: "center" });

    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString("es-HN");
    const horaStr = fecha.toLocaleTimeString("es-HN", { hour12: true });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${fechaStr} - ${horaStr}`, 105, 27, { align: "center" });
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Insumo", "Tipo", "Cantidad", "Fecha", "Usuario", "Observación"]],
      body: movimientos.map((m) => [
        m.id_movimiento,
        m.nombre_insumo,
        m.tipo_movimiento,
        m.cantidad,
        new Date(m.fecha_movimiento).toLocaleString("es-HN"),
        m.usuario_registro || "Sistema",
        m.observacion || "—",
      ]),
      headStyles: { fillColor: [0, 158, 115], textColor: 255, halign: "center" },
      bodyStyles: { halign: "center" },
      alternateRowStyles: { fillColor: [245, 252, 247] },
      didDrawPage: (data) => {
        const pageNumber = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(
          `Página ${pageNumber}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      },
    });

    let y = doc.lastAutoTable.finalY + 12;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(80); // gris elegante
    doc.text("RESUMEN DE MOVIMIENTOS", 15, y);

    y += 8;
    doc.setTextColor(0); // texto normal negro
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const addRow = (label, value) => {
      doc.text(label, 15, y); // columna izquierda
      doc.text(String(value), 90, y); // columna derecha
      y += 7;
    };

    const totalMovimientos = movimientos.length;
    const totalEntradas = movimientos.filter((m) => m.tipo_movimiento === "Entrada").length;
    const totalSalidas = movimientos.filter((m) => m.tipo_movimiento === "Salida").length;
    const cantidadEntradas = movimientos
      .filter((m) => m.tipo_movimiento === "Entrada")
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);
    const cantidadSalidas = movimientos
      .filter((m) => m.tipo_movimiento === "Salida")
      .reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

    addRow("Total Movimientos:", totalMovimientos);
    addRow("Entradas:", totalEntradas);
    addRow("Salidas:", totalSalidas);
    addRow("Cantidad Entradas:", cantidadEntradas);
    addRow("Cantidad Salidas:", cantidadSalidas);

    const pageNumber = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.text(
      `Página ${pageNumber}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );

    doc.save("Movimientos_Insumos.pdf");
  };

  // Exportar Excel
  const exportarExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Movimientos");
    ws.addRow(["EXTRACTUS - MOVIMIENTOS DE INSUMOS"]);
    ws.addRow([]);
    ws.addRow([
      "ID",
      "Insumo",
      "Tipo",
      "Cantidad",
      "Fecha",
      "Usuario",
      "Observación",
    ]);

    movimientos.forEach((m) => {
      ws.addRow([
        m.id_movimiento,
        m.nombre_insumo,
        m.tipo_movimiento,
        m.cantidad,
        new Date(m.fecha_movimiento).toLocaleString("es-HN"),
        m.usuario_registro || "Sistema",
        m.observacion || "—",
      ]);
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Movimientos_Insumos.xlsx");
  };

  return (
    <Box p={6}>
      {/* Botón Atrás */}
      <Flex justify="space-between" align="center" mb={5}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate("/app/inventarios")} // Asegúrate de colocar la ruta correcta
          colorScheme="teal"
          size="sm"
          variant="outline"
          mr={3} // Espacio entre el botón y el título
        >
          Atrás
        </Button>
            </Flex>
        <Heading size="md" color="teal.700">
          Historial de Movimientos de Insumos
        </Heading>
  

      <SimpleGrid columns={[1, 4]} spacing={4} mb={6}>
        <Card p={4} borderRadius="lg" bg="#e8f7f0">
          <Text fontSize="sm" color="gray.600">Total Movimientos</Text>
          <Text fontSize="2xl" fontWeight="bold" color="#006e52">
            {movimientos.length}
          </Text>
        </Card>

        <Card p={4} borderRadius="lg" bg="#e9f9ee">
          <Text fontSize="sm" color="gray.600">Entradas</Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            {movimientos.filter((m) => m.tipo_movimiento === "Entrada").length}
          </Text>
        </Card>

        <Card p={4} borderRadius="lg" bg="#ffe9e9">
          <Text fontSize="sm" color="gray.600">Salidas</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.600">
            {movimientos.filter((m) => m.tipo_movimiento === "Salida").length}
          </Text>
        </Card>

        <Card p={4} borderRadius="lg" bg="#fff4e6">
          <Text fontSize="sm" color="gray.600">Último Movimiento</Text>
          <Text fontSize="md" fontWeight="bold">
            {movimientos[0]
              ? new Date(movimientos[0].fecha_movimiento).toLocaleString("es-HN")
              : "—"}
          </Text>
        </Card>
      </SimpleGrid>

        {/* Alineación de botones a la derecha */}
  <Flex justify="flex-end" align="center">
    <HStack spacing={2}>
      <Button colorScheme="gray" leftIcon={<FaBroom />} onClick={limpiarFiltros} size="sm">
        Limpiar
      </Button>

      <Button colorScheme="teal" leftIcon={<FaSync />} onClick={() => cargarMovimientos()} size="sm">
        Refrescar
      </Button>

      <Button colorScheme="red" leftIcon={<FaFilePdf />} size="sm" onClick={exportarPDF}>
        PDF
      </Button>

      <Button colorScheme="green" leftIcon={<FaFileExcel />} size="sm" onClick={exportarExcel}>
        Excel
      </Button>
    </HStack>
  </Flex>


      <HStack mb={4} spacing={3}>
        <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} maxW="200px" />
        <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} maxW="200px" />
      </HStack>

      <Table size="sm" variant="simple">
        <Thead bg="gray.100">
          <Tr>
            <Th>ID</Th>
            <Th>Insumo</Th>
            <Th>Tipo</Th>
            <Th>Cantidad</Th>
            <Th>Fecha</Th>
            <Th>Usuario</Th>
            <Th>Observación</Th>
          </Tr>
        </Thead>

        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={7} textAlign="center" py={10}>
                <Spinner size="lg" color="teal.500" />
              </Td>
            </Tr>
          ) : (
            movimientos.map((m) => (
              <Tr key={m.id_movimiento}>
                <Td>{m.id_movimiento}</Td>
                <Td>{m.nombre_insumo}</Td>
                <Td color={m.tipo_movimiento === "Entrada" ? "green.600" : "red.600"}>{m.tipo_movimiento}</Td>
                <Td>{m.cantidad}</Td>
                <Td>{new Date(m.fecha_movimiento).toLocaleString("es-HN")}</Td>
                <Td>{m.usuario_registro || "Sistema"}</Td>
                <Td>{m.observacion || "—"}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
