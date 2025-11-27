import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Flex,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
<<<<<<< HEAD
import {
  FaChartLine,
  FaShoppingCart,
  FaClipboardList,
  FaFilePdf,
  FaFileExcel,
  FaArrowLeft 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Importar useNavigate aquí

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

=======
import { FaChartLine, FaShoppingCart, FaClipboardList } from "react-icons/fa";
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
import api from "../../api/apiClient";

const fmtHNL = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  minimumFractionDigits: 2,
});

const hoyISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export default function ReportesContabilidad() {
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("teal.50", "gray.800");
  const titleColor = useColorModeValue("teal.700", "teal.200");
  const subtleText = useColorModeValue("gray.600", "gray.400");

<<<<<<< HEAD
=======
  // filtros generales (rango de fechas)
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
  const [filtros, setFiltros] = useState({
    desde: hoyISO(),
    hasta: hoyISO(),
  });

  const [productos, setProductos] = useState([]);
  const [ventasVendedor, setVentasVendedor] = useState([]);
  const [pedidosDia, setPedidosDia] = useState([]);
<<<<<<< HEAD
const navigate = useNavigate();
=======

>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((f) => ({ ...f, [name]: value }));
  };

  const cargarProductosMasVendidos = async () => {
    try {
<<<<<<< HEAD
      const res = await api.get(
        "/contabilidad/reportes-contabilidad/productos-mas-vendidos",
        {
          params: { desde: filtros.desde, hasta: filtros.hasta, top: 10 },
        }
      );
=======
      const res = await api.get("/contabilidad/reportes-contabilidad/productos-mas-vendidos", {
        params: { desde: filtros.desde, hasta: filtros.hasta, top: 10 },
      });
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
      setProductos(res.data || []);
    } catch (err) {
      toast({
        title: "Error cargando productos más vendidos",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    }
  };

  const cargarVentasVendedor = async () => {
    try {
<<<<<<< HEAD
      const res = await api.get(
        "/contabilidad/reportes-contabilidad/ventas-vendedor",
        {
          params: { desde: filtros.desde, hasta: filtros.hasta },
        }
      );
=======
      const res = await api.get("/contabilidad/reportes-contabilidad/ventas-vendedor", {
        params: { desde: filtros.desde, hasta: filtros.hasta },
      });
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
      setVentasVendedor(res.data || []);
    } catch (err) {
      toast({
        title: "Error cargando ventas por vendedor",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    }
  };

  const cargarPedidosDiarios = async () => {
    try {
<<<<<<< HEAD
      const res = await api.get(
        "/contabilidad/reportes-contabilidad/pedidos-diarios",
        {
          params: { desde: filtros.desde, hasta: filtros.hasta },
        }
      );
=======
      const res = await api.get("/contabilidad/reportes-contabilidad/pedidos-diarios", {
        params: { desde: filtros.desde, hasta: filtros.hasta },
      });
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
      setPedidosDia(res.data || []);
    } catch (err) {
      toast({
        title: "Error cargando pedidos diarios",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    }
  };

<<<<<<< HEAD
=======
  // por defecto, al entrar, cargamos todo del día
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
  useEffect(() => {
    cargarProductosMasVendidos();
    cargarVentasVendedor();
    cargarPedidosDiarios();
    // eslint-disable-next-line
  }, []);

<<<<<<< HEAD
  // ================= EXPORTACIONES =================

  // PRODUCTOS
  const exportarProductosPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte: Productos más vendidos", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["ID", "Producto", "Cantidad vendida", "Total vendido"]],
      body: productos.map((p) => [
        p.id_producto,
        p.nombre_producto,
        p.total_cantidad,
        fmtHNL.format(p.total_vendido || 0),
      ]),
    });

    doc.save("productos_mas_vendidos.pdf");
  };

  const exportarProductosExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Productos más vendidos");

    ws.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Producto", key: "producto", width: 40 },
      { header: "Cantidad", key: "cantidad", width: 20 },
      { header: "Total", key: "total", width: 20 },
    ];

    productos.forEach((p) => {
      ws.addRow({
        id: p.id_producto,
        producto: p.nombre_producto,
        cantidad: p.total_cantidad,
        total: Number(p.total_vendido || 0),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "productos_mas_vendidos.xlsx");
  };

  // VENDEDOR
  const exportarVendedoresPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte: Ventas por vendedor", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Vendedor", "Fecha", "# Facturas", "Total vendido"]],
      body: ventasVendedor.map((v) => [
        v.vendedor,
        v.fecha,
        v.cantidad_facturas,
        fmtHNL.format(v.total_vendido || 0),
      ]),
    });

    doc.save("ventas_por_vendedor.pdf");
  };

  const exportarVendedoresExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Ventas por vendedor");

    ws.columns = [
      { header: "Vendedor", key: "vendedor", width: 30 },
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Facturas", key: "facturas", width: 15 },
      { header: "Total", key: "total", width: 20 },
    ];

    ventasVendedor.forEach((v) => {
      ws.addRow({
        vendedor: v.vendedor,
        fecha: v.fecha,
        facturas: v.cantidad_facturas,
        total: Number(v.total_vendido || 0),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "ventas_por_vendedor.xlsx");
  };

  // PEDIDOS
  const exportarPedidosPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte: Pedidos diarios", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Fecha", "# Pedidos", "Total"]],
      body: pedidosDia.map((p) => [
        p.fecha,
        p.cantidad_pedidos,
        fmtHNL.format(p.total_pedidos || 0),
      ]),
    });

    doc.save("pedidos_diarios.pdf");
  };

  const exportarPedidosExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Pedidos diarios");

    ws.columns = [
      { header: "Fecha", key: "fecha", width: 20 },
      { header: "Pedidos", key: "cantidad", width: 20 },
      { header: "Total", key: "total", width: 20 },
    ];

    pedidosDia.forEach((p) => {
      ws.addRow({
        fecha: p.fecha,
        cantidad: p.cantidad_pedidos,
        total: Number(p.total_pedidos || 0),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "pedidos_diarios.xlsx");
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" mb={4}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate("/app/contabilidad")} // Asegúrate de colocar la ruta correcta
          colorScheme="teal"
          size="sm"
          variant="outline"
          mr={3}  // Espacio entre el botón y el título
        >
          Atrás
        </Button>
  </Flex>
        <Heading size="lg" color={titleColor} mb={4}>
          Reportes de Contabilidad
        </Heading>
      

      <Card bg={cardBg} borderWidth="1px" borderColor={border} boxShadow="xl">
        <CardBody>

          {/* ======= FILTROS ======= */}
=======
  return (
    <Box p={4}>
      <Heading size="lg" color={titleColor} mb={4}>
        Reportes de Contabilidad
      </Heading>

      <Card bg={cardBg} borderWidth="1px" borderColor={border} boxShadow="xl">
        <CardBody>
          {/* Filtros globales de fechas */}
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
          <Flex justify="space-between" align="flex-end" mb={4} gap={4} flexWrap="wrap">
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Desde</FormLabel>
                <Input
                  type="date"
                  name="desde"
                  value={filtros.desde}
                  onChange={handleChangeFiltro}
                  size="sm"
                />
              </FormControl>
<<<<<<< HEAD

=======
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
              <FormControl>
                <FormLabel fontSize="sm">Hasta</FormLabel>
                <Input
                  type="date"
                  name="hasta"
                  value={filtros.hasta}
                  onChange={handleChangeFiltro}
                  size="sm"
                />
              </FormControl>
            </HStack>

            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => {
                cargarProductosMasVendidos();
                cargarVentasVendedor();
                cargarPedidosDiarios();
              }}
            >
              Actualizar todos
            </Button>
          </Flex>

<<<<<<< HEAD
          {/* ======= TABS ======= */}
=======
          {/* Tabs de reportes */}
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
          <Tabs colorScheme="teal" isFitted>
            <TabList mb={4}>
              <Tab>
                <HStack spacing={2}>
                  <FaShoppingCart />
                  <Text>Productos más vendidos</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FaChartLine />
                  <Text>Ventas por vendedor</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FaClipboardList />
                  <Text>Pedidos diarios</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
<<<<<<< HEAD

              {/* ---------- PRODUCTOS ---------- */}
              <TabPanel>
                <HStack mb={3}>
                  <Button leftIcon={<FaFilePdf />} colorScheme="red" onClick={exportarProductosPDF}>
                    PDF
                  </Button>
                  <Button leftIcon={<FaFileExcel />} colorScheme="green" onClick={exportarProductosExcel}>
                    Excel
                  </Button>
                </HStack>

                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Producto</Th>
                        <Th isNumeric>Cantidad</Th>
                        <Th isNumeric>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {productos.map((p) => (
                        <Tr key={p.id_producto}>
                          <Td>{p.id_producto}</Td>
                          <Td>{p.nombre_producto}</Td>
                          <Td isNumeric>{p.total_cantidad}</Td>
                          <Td isNumeric>{fmtHNL.format(p.total_vendido || 0)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* ---------- VENTAS ---------- */}
              <TabPanel>
                <HStack mb={3}>
                  <Button leftIcon={<FaFilePdf />} colorScheme="red" onClick={exportarVendedoresPDF}>
                    PDF
                  </Button>
                  <Button leftIcon={<FaFileExcel />} colorScheme="green" onClick={exportarVendedoresExcel}>
                    Excel
                  </Button>
                </HStack>

                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>Vendedor</Th>
                        <Th>Fecha</Th>
                        <Th isNumeric>Facturas</Th>
                        <Th isNumeric>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {ventasVendedor.map((v, i) => (
                        <Tr key={i}>
                          <Td>{v.vendedor}</Td>
                          <Td>{v.fecha}</Td>
                          <Td isNumeric>{v.cantidad_facturas}</Td>
                          <Td isNumeric>{fmtHNL.format(v.total_vendido || 0)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* ---------- PEDIDOS ---------- */}
              <TabPanel>
                <HStack mb={3}>
                  <Button leftIcon={<FaFilePdf />} colorScheme="red" onClick={exportarPedidosPDF}>
                    PDF
                  </Button>
                  <Button leftIcon={<FaFileExcel />} colorScheme="green" onClick={exportarPedidosExcel}>
                    Excel
                  </Button>
                </HStack>

                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>Fecha</Th>
                        <Th isNumeric>Pedidos</Th>
                        <Th isNumeric>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pedidosDia.map((p, i) => (
                        <Tr key={i}>
                          <Td>{p.fecha}</Td>
                          <Td isNumeric>{p.cantidad_pedidos}</Td>
                          <Td isNumeric>{fmtHNL.format(p.total_pedidos || 0)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

            </TabPanels>
          </Tabs>

=======
              {/* ---------- TAB 1: PRODUCTOS ---------- */}
              <TabPanel>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color={subtleText}>
                    Top de productos más vendidos por cantidad en el rango seleccionado.
                  </Text>
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Producto</Th>
                          <Th isNumeric>Cantidad vendida</Th>
                          <Th isNumeric>Total vendido</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {productos.map((p) => (
                          <Tr key={p.id_producto}>
                            <Td>{p.id_producto}</Td>
                            <Td>{p.nombre_producto}</Td>
                            <Td isNumeric>{p.total_cantidad}</Td>
                            <Td isNumeric>{fmtHNL.format(p.total_vendido || 0)}</Td>
                          </Tr>
                        ))}
                        {productos.length === 0 && (
                          <Tr>
                            <Td colSpan={4}>
                              <Text textAlign="center" color={subtleText} py={3}>
                                Sin datos para el rango seleccionado.
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </VStack>
              </TabPanel>

              {/* ---------- TAB 2: VENTAS POR VENDEDOR ---------- */}
              <TabPanel>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color={subtleText}>
                    Facturas emitidas y montos vendidos por vendedor y fecha.
                  </Text>
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th>Vendedor</Th>
                          <Th>Fecha</Th>
                          <Th isNumeric># Facturas</Th>
                          <Th isNumeric>Total vendido</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {ventasVendedor.map((v, idx) => (
                          <Tr key={idx}>
                            <Td>{v.vendedor}</Td>
                            <Td>{v.fecha}</Td>
                            <Td isNumeric>{v.cantidad_facturas}</Td>
                            <Td isNumeric>{fmtHNL.format(v.total_vendido || 0)}</Td>
                          </Tr>
                        ))}
                        {ventasVendedor.length === 0 && (
                          <Tr>
                            <Td colSpan={4}>
                              <Text textAlign="center" color={subtleText} py={3}>
                                Sin datos para el rango seleccionado.
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </VStack>
              </TabPanel>

              {/* ---------- TAB 3: PEDIDOS DIARIOS ---------- */}
              <TabPanel>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color={subtleText}>
                    Cantidad de pedidos y total diario en el rango seleccionado.
                  </Text>
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th>Fecha</Th>
                          <Th isNumeric># Pedidos</Th>
                          <Th isNumeric>Total pedidos</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pedidosDia.map((p, idx) => (
                          <Tr key={idx}>
                            <Td>{p.fecha}</Td>
                            <Td isNumeric>{p.cantidad_pedidos}</Td>
                            <Td isNumeric>{fmtHNL.format(p.total_pedidos || 0)}</Td>
                          </Tr>
                        ))}
                        {pedidosDia.length === 0 && (
                          <Tr>
                            <Td colSpan={3}>
                              <Text textAlign="center" color={subtleText} py={3}>
                                Sin datos para el rango seleccionado.
                              </Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
        </CardBody>
      </Card>
    </Box>
  );
}
