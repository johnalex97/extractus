// ============================================================
// 📁 src/components/Seguridad/Correos.js
// ============================================================
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Divider,
  useColorModeValue,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import CrudTabla from "./CrudTabla";

export default function Correos() {
  // 🎨 Estilos
  const accent = useColorModeValue("teal.600", "teal.300");
  const toast = useToast();

  // 📦 Estados
  const [data, setData] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Cargar lista de correos
  // ============================================================
  const cargarCorreos = async () => {
    try {
      const res = await fetch("http://localhost:4000/seguridad/correos");
      if (!res.ok) throw new Error("Error al obtener correos");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Error cargando correos:", err);
      toast({
        title: "Error al cargar correos",
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
  // 🔹 Cargar personas (para mostrar nombres en el selector)
  // ============================================================
  const cargarPersonas = async () => {
    try {
      const res = await fetch("http://localhost:4000/seguridad/personas");
      if (!res.ok) throw new Error("Error al obtener personas");
      const json = await res.json();
      setPersonas(json);
    } catch (error) {
      console.error("❌ Error cargando personas:", error);
    }
  };

  // ============================================================
  // 🔹 useEffect → carga inicial
  // ============================================================
  useEffect(() => {
    Promise.all([cargarCorreos(), cargarPersonas()]);
  }, []);

  // ============================================================
  // 🔹 Campos del formulario
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
    {
      name: "correo",
      label: "Correo Electrónico",
      type: "text",
      required: true,
    },
  ];

  // ============================================================
  // 🔹 Estado de carga
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
      <Box p={2}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Heading size="md" color={accent} mb={2}>
            Correos
          </Heading>
        </Flex>
        <Divider mb={2} />
      </Box>

      <Box overflowX="auto">
        <CrudTabla
          title="Correos"
          columns={[
            "ID Correo",
            "Persona",
            "Correo",
          ]}
          extractors={{
            "ID Correo": (r) => r.id_correo,
            "Persona": (r) => `${r.nombre} ${r.apellido}`,
            "Correo": (r) => r.correo,
          }}
          fields={fields}
          idKey="id_correo"
          initialData={data}
          onReload={cargarCorreos}
          apiUrl="http://localhost:4000/seguridad/correos"  // ✅ Corregido
        />
      </Box>
    </>
  );
}
