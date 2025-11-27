// ============================================================
// 📁 src/components/Seguridad/Telefonos.js
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
} from "@chakra-ui/react";
import CrudTabla from "./CrudTabla";

export default function Telefonos() {
  const accent = useColorModeValue("teal.600", "teal.300");
  const toast = useToast();

  const [data, setData] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [tiposTelefono, setTiposTelefono] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Cargar teléfonos
  // ============================================================
  const cargarTelefonos = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/seguridad/telefonos");
      if (!res.ok) throw new Error("Error al obtener teléfonos");
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast({
        title: "Error al cargar teléfonos",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ============================================================
  // 🔹 Cargar personas
  // ============================================================
  const cargarPersonas = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/seguridad/personas");
      const json = await res.json();
      setPersonas(json);
    } catch (error) {
      console.error("❌ Error cargando personas:", error);
    }
  }, []);

  // ============================================================
  // 🔹 Cargar tipos de teléfono
  // ============================================================
  const cargarTiposTelefono = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/mantenimiento/tipo-telefono");
      const json = await res.json();
      setTiposTelefono(json);
    } catch (error) {
      console.error("❌ Error cargando tipos de teléfono:", error);
    }
  }, []);

  // ============================================================
  // 🔹 Cargar datos iniciales
  // ============================================================
  useEffect(() => {
    Promise.all([cargarTelefonos(), cargarPersonas(), cargarTiposTelefono()]);
  }, [cargarTelefonos, cargarPersonas, cargarTiposTelefono]);

  // ============================================================
  // 🔹 Mapas para mostrar nombres legibles
  // ============================================================
  const personaMap = useMemo(
    () =>
      Object.fromEntries(
        personas.map((p) => [p.id_persona, `${p.nombre} ${p.apellido}`])
      ),
    [personas]
  );

  const tipoMap = useMemo(
    () =>
      Object.fromEntries(
        tiposTelefono.map((t) => [t.id_tipo_telefono, t.nombre_tipo])
      ),
    [tiposTelefono]
  );

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
    { name: "numero", label: "Número", type: "text", required: true },
    {
      name: "id_tipo_telefono",
      label: "Tipo de Teléfono",
      type: "select",
      options: tiposTelefono.map((t) => ({
        label: t.nombre_tipo,
        value: t.id_tipo_telefono,
      })),
      required: true,
    },
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
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Heading size="md" color={accent}>
            Teléfonos
          </Heading>
        </Flex>
        <Divider mb={2} />
      </Box>

      <Box overflowX="auto">
        <CrudTabla
          title="Teléfonos"
          columns={[
            "ID Teléfono",
            "Persona",
            "Número",
            "Tipo de Teléfono",
          ]}
          extractors={{
            "ID Teléfono": (r) => r.id_telefono,
            "Persona": (r) =>
              personaMap[r.id_persona] || `ID ${r.id_persona}`,
            "Número": (r) => r.numero,
            "Tipo de Teléfono": (r) =>
              tipoMap[r.id_tipo_telefono] || "—",
          }}
          fields={fields}
          idKey="id_telefono"
          initialData={data}
          onReload={cargarTelefonos}
          apiUrl="http://localhost:4000/seguridad/telefonos"
        />
      </Box>
    </>
  );
}
