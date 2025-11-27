// ============================================================
// 📁 src/components/Entregas/GestionEntregas.js
// 🎯 Gestión de Entregas con Filtros, Detalle y Observaciones
// ============================================================

import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Card,
  CardBody,
} from "@chakra-ui/react";

export default function GestionEntregas() {
  // ============================================================
  // 🔹 DATOS FICTICIOS — EMPRESA EXTRACTUS (con fechas reales)
  // ============================================================

  const hoy = new Date().toISOString().split("T")[0];
  const hace2dias = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const pedidosIniciales = [
    {
      id_pedido: 1,
      fecha: hoy,
      producto: "Extractus Limón 1L",
      cantidad: 12,
      precio_unitario: 48,
      destino: "San Pedro Sula",
      estado: "Pendiente",
      observaciones: "Cliente solicita entregar después de las 2PM",
    },
    {
      id_pedido: 2,
      fecha: hace2dias,
      producto: "Extractus Naranja 1L",
      cantidad: 8,
      precio_unitario: 52,
      destino: "La Lima",
      estado: "Pendiente",
      observaciones: "Pago contra entrega",
    },
    {
      id_pedido: 3,
      fecha: hoy,
      producto: "Extractus Mora - Galón",
      cantidad: 3,
      precio_unitario: 165,
      destino: "Choloma",
      estado: "Pendiente",
      observaciones: "Cliente habitual",
    },
  ];

  // Estados principales
  const [filtroFecha, setFiltroFecha] = useState("");
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [entregados, setEntregados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // ============================================================
  // 🔍 FILTRO POR FECHA PARA PENDIENTES Y ENTREGADOS
  // ============================================================
  const pedidosFiltrados = useMemo(() => {
    if (!filtroFecha) return pedidos;
    return pedidos.filter((p) => p.fecha === filtroFecha);
  }, [filtroFecha, pedidos]);

  const entregadosFiltrados = useMemo(() => {
    if (!filtroFecha) return entregados;
    return entregados.filter((p) => p.fecha === filtroFecha);
  }, [filtroFecha, entregados]);

  // ============================================================
  // 🔢 TOTALES DEL PANEL DERECHO
  // ============================================================
  const totalPendientes = pedidos.reduce(
    (acc, p) => (p.estado === "Pendiente" ? acc + p.cantidad : acc),
    0
  );

  const totalAPagar = pedidos.reduce(
    (acc, p) =>
      p.estado === "Pendiente"
        ? acc + p.cantidad * p.precio_unitario
        : acc,
    0
  );

  // ============================================================
  // 🔵 SELECCIONAR PEDIDO PARA MOSTRAR EN PANEL DERECHO
  // ============================================================
  const seleccionarPedido = (p) => {
    setPedidoSeleccionado(p);
  };

  // ============================================================
  // 🟢 MARCAR COMO ENTREGADO
  // ============================================================
  const marcarComoEntregado = (pedido) => {
    setPedidoSeleccionado(pedido);
    onOpen();
  };

  // ============================================================
  // 🟢 CONFIRMAR ENTREGA (GUARDA EN ENTREGADOS)
  // ============================================================
  const confirmarEntrega = () => {
    const actualizado = pedidos.map((p) =>
      p.id_pedido === pedidoSeleccionado.id_pedido
        ? { ...p, estado: "Entregado" }
        : p
    );

    setPedidos(actualizado);
    setEntregados([
      ...entregados,
      { ...pedidoSeleccionado, estado: "Entregado" },
    ]);

    setPedidoSeleccionado(null);
    onClose();
  };

  // ============================================================
  // RENDER DEL COMPONENTE
  // ============================================================
  return (
    <Flex p={6} gap={6}>
      {/* ============================================================
            COLUMNA IZQUIERDA (TABLAS Y FILTROS)
      ============================================================ */}
      <Box flex="3">
        <Heading mb={4}>Gestión de Entregas</Heading>

        {/* FILTRO POR FECHA */}
        <Box mb={4}>
          <FormControl>
            <FormLabel>Filtrar por fecha</FormLabel>
            <Input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              width="250px"
            />
          </FormControl>
        </Box>

        {/* ============================================================
              TABLA DE PENDIENTES
        ============================================================ */}
        <Heading size="md" mb={3}>
          Pedidos pendientes
        </Heading>

        <Table variant="simple" mb={8}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Producto</Th>
              <Th>Cant.</Th>
              <Th>Precio (L.)</Th>
              <Th>Total (L.)</Th>
              <Th>Destino</Th>
              <Th>Fecha</Th>
              <Th>Observaciones</Th>
              <Th>Estado</Th>
              <Th></Th>
            </Tr>
          </Thead>

          <Tbody>
            {pedidosFiltrados.map((p) => (
              <Tr key={p.id_pedido} onClick={() => seleccionarPedido(p)} style={{ cursor: "pointer" }}>
                <Td>{p.id_pedido}</Td>
                <Td>{p.producto}</Td>
                <Td>{p.cantidad}</Td>
                <Td>{p.precio_unitario}</Td>
                <Td>{p.cantidad * p.precio_unitario}</Td>
                <Td>{p.destino}</Td>
                <Td>{p.fecha}</Td>
                <Td>{p.observaciones}</Td>
                <Td>
                  <Badge colorScheme="yellow">Pendiente</Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => marcarComoEntregado(p)}
                  >
                    Entregar
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* ============================================================
              TABLA DE ENTREGADOS
        ============================================================ */}
        <Heading size="md" mb={3}>
          Entregas realizadas
        </Heading>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Producto</Th>
              <Th>Fecha</Th>
              <Th>Destino</Th>
              <Th>Observaciones</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entregadosFiltrados.map((e, i) => (
              <Tr key={i} onClick={() => seleccionarPedido(e)} style={{ cursor: "pointer" }}>
                <Td>{e.id_pedido}</Td>
                <Td>{e.producto}</Td>
                <Td>{e.fecha}</Td>
                <Td>{e.destino}</Td>
                <Td>{e.observaciones}</Td>
                <Td>
                  <Badge colorScheme="green">Entregado</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* ============================================================
            PANEL DERECHO — DETALLE DE PEDIDO
      ============================================================ */}
      {/* ============================================================
      PANEL DERECHO — DETALLE DE PEDIDO (ACTUALIZADO)
============================================================ */}
<Card 
  flex="1.2"                 // 🔥 Más ancho
  height="fit-content" 
  shadow="lg"
  bg="gray.100"              // 🔥 Fondo gris claro para resaltar
  borderRadius="lg"
>
  <CardBody>
    <Heading size="md" mb={4}>
      Detalle del pedido
    </Heading>

    {!pedidoSeleccionado ? (
      <Text color="gray.600">
        Seleccione un pedido para ver su información.
      </Text>
    ) : (
      <VStack align="stretch" spacing={3}>
        <Text><b>ID Pedido:</b> {pedidoSeleccionado.id_pedido}</Text>
        <Text><b>Producto:</b> {pedidoSeleccionado.producto}</Text>
        <Text><b>Cantidad:</b> {pedidoSeleccionado.cantidad}</Text>
        <Text><b>Precio unitario:</b> L. {pedidoSeleccionado.precio_unitario}</Text>
        <Text><b>Total:</b> L. {pedidoSeleccionado.cantidad * pedidoSeleccionado.precio_unitario}</Text>
        <Text><b>Destino:</b> {pedidoSeleccionado.destino}</Text>
        <Text><b>Fecha:</b> {pedidoSeleccionado.fecha}</Text>
        <Text><b>Observaciones:</b> {pedidoSeleccionado.observaciones}</Text>

        <Divider />

        
      </VStack>
    )}
  </CardBody>
</Card>


      {/* ============================================================
            MODAL DE ENTREGA
      ============================================================ */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar entrega</ModalHeader>
          <ModalBody>
            <Text fontWeight="bold">Información del pedido</Text>
            <Text>Producto: {pedidoSeleccionado?.producto}</Text>
            <Text>Destino: {pedidoSeleccionado?.destino}</Text>
            <Text>Total: L. {pedidoSeleccionado?.cantidad * pedidoSeleccionado?.precio_unitario}</Text>

            <Divider my={3} />

            <FormControl mb={3}>
              <FormLabel>¿Pago en efectivo?</FormLabel>
              <Select defaultValue="si">
                <option value="si">Sí</option>
                <option value="no">No</option>
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Detalle de pago pendiente</FormLabel>
              <Textarea placeholder="Ej: Falta cancelar L.100" />
            </FormControl>

            <FormControl>
              <FormLabel>Observaciones adicionales</FormLabel>
              <Textarea placeholder="Escriba observaciones…" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" onClick={confirmarEntrega}>
              Confirmar entrega
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
