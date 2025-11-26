import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
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
