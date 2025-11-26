// ============================================================
// 📁 src/components/Seguridad/Direcciones.js
// ============================================================

import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CrudTabla from "./CrudTabla";

export default function Direcciones() {
  const accent = useColorModeValue("teal.600", "teal.300");
  const btnBg = useColorModeValue("teal.100", "teal.600");
  const btnColor = useColorModeValue("teal.800", "white");
  const btnHoverBg = useColorModeValue("teal.200", "teal.500");

  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Cargar direcciones
  // ============================================================
  const cargarDirecciones = async () => {
    try {
      const res = await fetch("http://localhost:4000/seguridad/direcciones");
      if (!res.ok) throw new Error("Error al obtener direcciones desde la API");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Error cargando direcciones:", err);
      toast({
        title: "Error al cargar direcciones",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔹 Cargar personas (para mostrar nombre completo)
  // ============================================================
  const cargarPersonas = async () => {
    try {
      const res = await fetch("http://localhost:4000/seguridad/personas");
      const json = await res.json();
      setPersonas(json);
    } catch (error) {
      console.error("❌ Error cargando personas:", error);
    }
  };

  // ============================================================
  // 🔹 Cargar datos iniciales
  // ============================================================
  useEffect(() => {
    Promise.all([cargarDirecciones(), cargarPersonas()]);
  }, []);

  // ============================================================
  // 🔹 Campos del formulario CRUD
  // ============================================================
  const fields = [
    {
      name: "id_persona",
      label: "Persona",
      type: "select",
      options: personas.map((p) => ({
        label: `${p.nombre} ${p.apellido}`,
        value: p.id_persona,
      })),
      required: true,
    },
    { name: "direccion", label: "Dirección", type: "text", required: true },
    { name: "ciudad", label: "Ciudad", type: "text", required: true },
    { name: "departamento", label: "Departamento", type: "text", required: true },
    { name: "pais", label: "País", type: "text", required: true },
  ];

  // ============================================================
  // 🔹 Loader (spinner)
  // ============================================================
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="teal.400" />
      </Flex>
    );
  }

  // ============================================================
  // 🔹 Render principal
  // ============================================================
  return (
    <>
      <Box p={3}>
        <Tooltip label="Volver al menú Datos Generales" placement="bottom-start">
          <Button
            leftIcon={<Icon as={FaArrowLeft} />}
            bg={btnBg}
            color={btnColor}
            _hover={{ bg: btnHoverBg, transform: "scale(1.05)" }}
            onClick={() => navigate("/app/seguridad/datosgenerales")}
            size="sm"
            mb={3}
            boxShadow="sm"
          >
            Atrás
          </Button>
        </Tooltip>

        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Heading size="md" color={accent}>
            Direcciones
          </Heading>
        </Flex>
        <Divider mb={2} />
      </Box>

      <Box overflowX="auto">
        <CrudTabla
          title="Direcciones"
          columns={[
            "ID Dirección",
            "Persona",
            "Dirección",
            "Ciudad",
            "Departamento",
            "País",
          ]}
          extractors={{
            "ID Dirección": (r) => r.id_direccion,
            "Persona": (r) =>
              r.nombre && r.apellido
                ? `${r.nombre} ${r.apellido}`
                : `ID ${r.id_persona}`,
            "Dirección": (r) => r.direccion,
            "Ciudad": (r) => r.ciudad,
            "Departamento": (r) => r.departamento,
            "País": (r) => r.pais,
          }}
          fields={fields}
          idKey="id_direccion"
          initialData={data}
          onReload={cargarDirecciones}
          apiUrl="http://localhost:4000/seguridad/direcciones"
        />
      </Box>
    </>
  );
}
