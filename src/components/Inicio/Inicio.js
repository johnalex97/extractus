<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
import React from "react";
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
import {
  Box,
  SimpleGrid,
  Heading,
<<<<<<< HEAD
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Input,
  Button,
  HStack,
  useColorModeValue,
  Flex,
  Icon,
} from "@chakra-ui/react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import { FaCalendarAlt } from "react-icons/fa";
import api from "../../api/apiClient";

const fmtHNL = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

export default function Inicio() {

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [data, setData] = useState({
    mayorVendedor: {},
    productoTop: {},
    clientesActivos: 0,
    insumoTop: {}
  });

  const [ventasDia, setVentasDia] = useState([]);
  const [ventasVendedor, setVentasVendedor] = useState([]);

  // -------------------------------
  // COLORES ADAPTADOS A MODO OSCURO
  // -------------------------------
  const pageBg = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textPrimary = useColorModeValue("green.700", "green.300");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const iconColor = useColorModeValue("green.600", "green.300");
  const chartGrid = useColorModeValue("#ccc", "rgba(255,255,255,0.15)");
  const chartAxis = useColorModeValue("#555", "#ddd");
  const chartBar = useColorModeValue("#2F855A", "#4ADE80");

  // ============================================================
  //  PRIMERA CARGA AUTOMÁTICA
  // ============================================================
  useEffect(() => {
    const cargar = async () => {
      try {
        const r1 = await api.get("/contabilidad/dashboard");
        setData(r1.data);

        setDesde(r1.data.desde);
        setHasta(r1.data.hasta);

        const r2 = await api.get("/contabilidad/dashboard/ventas-dia");
        setVentasDia(r2.data);

        const r3 = await api.get("/contabilidad/dashboard/ventas-vendedor");
        setVentasVendedor(r3.data);

      } catch (error) {
        console.error("Error cargando dashboard inicial", error);
      }
    };

    cargar();
  }, []);

  // ============================================================
  //  CARGA MANUAL
  // ============================================================
  const cargarDashboard = async () => {
    try {
      const res = await api.get("/contabilidad/dashboard", {
        params: { desde, hasta }
      });
      setData(res.data);

      const ventasDiaRes = await api.get("/contabilidad/dashboard/ventas-dia", {
        params: { desde, hasta }
      });
      setVentasDia(ventasDiaRes.data);

      const ventasVendedorRes = await api.get("/contabilidad/dashboard/ventas-vendedor", {
        params: { desde, hasta }
      });
      setVentasVendedor(ventasVendedorRes.data);

    } catch (error) {
      console.error("Error cargando dashboard", error);
    }
  };

  return (
    <Box p={8} bg={pageBg} minH="100vh">

      {/* HEADER */}
      <Flex align="center" justify="space-between" mb={8}>
        <Heading size="lg" color={textPrimary}>
          Dashboard — Extractus
        </Heading>
      </Flex>

      {/* FILTROS */}
      <Card bg={cardBg} boxShadow="md" p={5} borderRadius="2xl" mb={8}>
        <HStack spacing={6}>

          <Box>
            <Text fontWeight="semibold" color={textSecondary} mb={1}>Desde</Text>
            <Flex gap={2} align="center">
              <Icon as={FaCalendarAlt} color={iconColor} />
              <Input
                type="date"
                bg={useColorModeValue("white", "gray.700")}
                color={useColorModeValue("black", "white")}
                borderColor={useColorModeValue("gray.300", "gray.600")}
                value={desde || ""}
                onChange={(e) => setDesde(e.target.value)}
              />
            </Flex>
          </Box>

          <Box>
            <Text fontWeight="semibold" color={textSecondary} mb={1}>Hasta</Text>
            <Flex gap={2} align="center">
              <Icon as={FaCalendarAlt} color={iconColor} />
              <Input
                type="date"
                bg={useColorModeValue("white", "gray.700")}
                color={useColorModeValue("black", "white")}
                borderColor={useColorModeValue("gray.300", "gray.600")}
                value={hasta || ""}
                onChange={(e) => setHasta(e.target.value)}
              />
            </Flex>
          </Box>

          <Button
            mt={5}
            colorScheme="green"
            px={8}
            borderRadius="lg"
            onClick={cargarDashboard}
          >
            Actualizar
          </Button>

        </HStack>
      </Card>

      {/* TARJETAS */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>

        <Card bg={cardBg} borderRadius="2xl" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textSecondary}>Mayor vendedor</StatLabel>
              <StatNumber color={textPrimary} fontSize="2xl">
                {data.mayorVendedor?.vendedor || "N/D"}
              </StatNumber>
              <StatHelpText color={textSecondary}>
                {fmtHNL.format(data.mayorVendedor?.total_vendido || 0)}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="2xl" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textSecondary}>Producto más vendido</StatLabel>
              <StatNumber color={textPrimary} fontSize="2xl">
                {data.productoTop?.nombre_producto || "N/D"}
              </StatNumber>
              <StatHelpText color={textSecondary}>
                {data.productoTop?.total_cantidad || 0} unidades
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="2xl" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textSecondary}>Clientes activos</StatLabel>
              <StatNumber color={textPrimary} fontSize="2xl">
                {data.clientesActivos}
              </StatNumber>
              <StatHelpText color={textSecondary}>En el período</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderRadius="2xl" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel color={textSecondary}>Insumo más comprado</StatLabel>
              <StatNumber color={textPrimary} fontSize="2xl">
                {data.insumoTop?.nombre_insumo || "N/D"}
              </StatNumber>
              <StatHelpText color={textSecondary}>
                {fmtHNL.format(data.insumoTop?.total_comprado || 0)}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

      </SimpleGrid>

      {/* GRAFICAS */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={10}>

        <Card bg={cardBg} borderRadius="2xl" p={4} boxShadow="md">
          <Heading size="sm" mb={4} color={textPrimary}>Ventas por día</Heading>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ventasDia}>
              <CartesianGrid stroke={chartGrid} />
              <XAxis dataKey="fecha" stroke={chartAxis} />
              <YAxis stroke={chartAxis} />
              <Tooltip formatter={(v) => fmtHNL.format(v)} />
              <Line type="monotone" dataKey="total" stroke={chartBar} strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card bg={cardBg} borderRadius="2xl" p={4} boxShadow="md">
          <Heading size="sm" mb={4} color={textPrimary}>Ventas por vendedor</Heading>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ventasVendedor}>
              <CartesianGrid stroke={chartGrid} />
              <XAxis dataKey="vendedor" stroke={chartAxis} />
              <YAxis stroke={chartAxis} />
              <Tooltip formatter={(v) => fmtHNL.format(v)} />
              <Bar dataKey="total" fill={chartBar} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </SimpleGrid>

    </Box>
  );
}
=======
  VStack,
  Link,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import {
  FaMoneyBillAlt,
  FaCogs,
  FaBoxes,
  FaTruck,
  FaChartLine,
  FaShoppingCart,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa";

// ============================================================
// 🎨 CONFIG DE SECCIONES (ICONOS + COLOR)
// ============================================================
const sectionConfig = {
  "Ventas y Reservas": { icon: FaMoneyBillAlt, color: "green.500" },
  "Producción": { icon: FaCogs, color: "green.500" },
  Inventarios: { icon: FaBoxes, color: "green.500" },
  Entregas: { icon: FaTruck, color: "green.500" },
  Contabilidad: { icon: FaChartLine, color: "green.500" },
  Compras: { icon: FaShoppingCart, color: "green.500" },
  Seguridad: { icon: FaShieldAlt, color: "green.500" },
  Mantenimiento: { icon: FaTools, color: "green.500" },
};

// ============================================================
// 📍 LISTA DE ITEMS POR MÓDULO
// ============================================================
const ventasYReservas = ["Clientes", "Factura", "Pedidos"];
const produccion = ["Productos", "Recetas", "Produccion", "Insumos usados"];
const inventarios = ["Productos", "Insumos", "Movimientos"];
const entregas = ["Entregas", "Detalle de Entregas"];
const contabilidad = ["Créditos", "Pagos", "Mora", "Reportes"];
const compras = ["Órdenes de Compra", "Detalle de Compras", "Proveedores"];
const mantenimiento = [
  "Clientes",
  "Proveedores",
  "Productos",
  "Pedidos",
  "Facturas",
  "Inventarios",
];

const seguridad = [
  { label: "Usuarios", to: "/app/seguridad/usuarios" },
  { label: "Roles", to: "/app/seguridad/roles" },
  { label: "Objetos", to: "/app/seguridad/objetos" },
  { label: "Permisos", to: "/app/seguridad/permisos" },
  { label: "Bitácora", to: "/app/seguridad/bitacora" },
  { label: "Cambiar Contraseña", to: "/app/seguridad/cambiarcontrasena" },
];

// ============================================================
// ORDEN PRINCIPAL DEL MENÚ
// ============================================================
const menuConfig = [
  { title: "Ventas y Reservas", items: ventasYReservas, basePath: "/app/Ventas" },
  { title: "Producción", items: produccion, basePath: "/app/produccion" },
  { title: "Inventarios", items: inventarios, basePath: "/app/inventarios" },
  { title: "Entregas", items: entregas, basePath: "/app/entregas" },
  { title: "Contabilidad", items: contabilidad, basePath: "/app/contabilidad" },
  { title: "Compras", items: compras, basePath: "/app/compras" },
  { title: "Seguridad", items: seguridad, basePath: "/app/seguridad" },
  { title: "Mantenimiento", items: mantenimiento, basePath: "/app/mantenimiento" },
];

// ============================================================
// Convertidor slug → url-friendly
// ============================================================
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Correcciones de rutas especiales
const routeOverrides = {
  "/app/entregas/entregas": "/app/entregas/gestion",
  "/app/entregas/detalle-de-entregas": "/app/entregas/detalle",

  "/app/compras/órdenes-de-compra": "/app/compras/orden",
  "/app/compras/detalle-de-compras": "/app/compras/detalle",
};

const Inicio = () => {
  const location = useLocation();

  // 🎨 SINGLE COLOR MODE
  const bgContainer = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgCard = useColorModeValue("gray.100", "gray.700");
  const textTitleColor = useColorModeValue("green.600", "green.300");

  // ============================================================
  // Render por cada módulo
  // ============================================================
  const renderSection = ({ title, items, basePath }) => {
    const cfg = sectionConfig[title];
    const IconComponent = cfg.icon;

    const isSeguridad = title === "Seguridad";

    return (
      <Box
        key={title}
        bg={bgCard}
        border="1px solid"
        borderColor={borderColor}
        borderLeft="5px solid"
        borderLeftColor={cfg.color}
        borderRadius="lg"
        p={5}
        transition="0.2s"
        _hover={{ shadow: "md" }}
      >
        {/* Título */}
        <Heading
          as="h3"
          size="md"
          mb={4}
          display="flex"
          alignItems="center"
          color={textTitleColor}
        >
          <Icon as={IconComponent} boxSize="6" mr={3} />
          {title}
        </Heading>

        {/* ITEMS */}
        {isSeguridad ? (
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
            {items.map(({ label, to }) => {
              const finalTo = routeOverrides[to] || to;
              const isActive = location.pathname === finalTo;

              return (
                <Link
                  key={label}
                  as={RouterLink}
                  to={finalTo}
                  p={2}
                  borderRadius="md"
                  bg={isActive ? hoverBgCard : "transparent"}
                  fontSize="sm"
                >
                  {label}
                </Link>
              );
            })}
          </SimpleGrid>
        ) : (
          <VStack align="stretch" spacing={2}>
            {items.map((item) => {
              const defaultTo = `${basePath}/${slugify(item)}`;
              const finalTo = routeOverrides[defaultTo] || defaultTo;
              const isActive = location.pathname === finalTo;

              return (
                <Link
                  key={item}
                  as={RouterLink}
                  to={finalTo}
                  p={2}
                  borderRadius="md"
                  bg={isActive ? hoverBgCard : "transparent"}
                  fontSize="sm"
                >
                  {item}
                </Link>
              );
            })}
          </VStack>
        )}
      </Box>
    );
  };

  return (
    <Box p={6} bg={bgContainer} minH="100vh">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {menuConfig.map(renderSection)}
      </SimpleGrid>
    </Box>
  );
};

export default Inicio;
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480
