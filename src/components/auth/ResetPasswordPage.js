import React, { useEffect, useState } from "react";
import {
  Box, Flex, Heading, FormControl, FormLabel, Input, Button,
  Text, useToast, Image, Stack, FormHelperText, useColorModeValue
} from "@chakra-ui/react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../firebase.client";
import { traducirErrorFirebase } from "../../utils/firebaseErrors"; // ✅ Importar traducciones
import signInLogo from "../login/log.png";

export default function ResetPasswordPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Colores iguales a tu login
  const titleColor = useColorModeValue("teal.500", "teal.300");
  const textColor  = useColorModeValue("gray.600", "gray.300");
  const bgForm     = useColorModeValue("gray.100", "gray.700");
  const shadowForm = useColorModeValue("md", "dark-lg");
  const pageBg     = useColorModeValue("gray.50", "gray.900");

  <img src="https://ibb.co/MDD7LdpR"
     alt="Extractus"
     width="120"
     style="margin-bottom: 20px; border-radius: 8px;">

     </img>
  // 1️⃣ Obtener el código del enlace de restablecimiento
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oob = params.get("oobCode");
    setCode(oob || "");
    if (oob) {
      verifyPasswordResetCode(auth, oob)
        .then((em) => { setEmail(em); setReady(true); })
        .catch(() => toast({ title: "Enlace inválido o expirado", status: "error" }));
    }
  }, [toast]);

  // 2️⃣ Enviar nueva contraseña
  const submit = async () => {
    if (!pwd1 || !pwd2) {
      toast({
        title: "Campos vacíos",
        description: "Escribe y confirma tu nueva contraseña.",
        status: "warning",
      });
      return;
    }
    if (pwd1 !== pwd2) {
      toast({
        title: "No coinciden",
        description: "Las contraseñas deben ser iguales.",
        status: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, code, pwd1);
      toast({ title: "Contraseña actualizada correctamente", status: "success" });
      window.location.href = "/";
    } catch (e) {
      // ✅ Aquí usamos la función de traducción
      const mensajeTraducido = traducirErrorFirebase(e.code, e.message);
      toast({
        title: "Error al restablecer",
        description: mensajeTraducido,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;
  const canSubmit = !!pwd1 && !!pwd2 && pwd1 === pwd2;

  return (
    <Flex minH="100vh" align="center" justify="center" bg={pageBg} px={4}>
      <Box
        w="full" maxW="360px" p={6}
        bg={bgForm} boxShadow={shadowForm} borderRadius="12px"
      >
        <Stack spacing={5}>
          <Image src={signInLogo} alt="Extractus" w="90px" mx="auto" />
          <Heading color={titleColor} fontSize="lg" textAlign="center">
            Restablecer contraseña
          </Heading>
          <Text fontSize="sm" color={textColor} textAlign="center">
            Cuenta: {email}
          </Text>

          <FormControl>
            <FormLabel fontSize="sm">Nueva contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Escribe la nueva contraseña"
              fontSize="xs" h="34px"
              borderRadius="8px"
              borderWidth="2px"
              borderColor="green.400"
              _hover={{ borderColor: "green.500" }}
              _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px green.500" }}
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Confirmar contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Repite la nueva contraseña"
              fontSize="xs" h="34px"
              borderRadius="8px"
              borderWidth="2px"
              borderColor="green.400"
              _hover={{ borderColor: "green.500" }}
              _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px green.500" }}
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
            />
            <FormHelperText fontSize="xs" color={pwd2 && pwd1 !== pwd2 ? "red.400" : "gray.500"}>
              {pwd2 && pwd1 !== pwd2 ? "Las contraseñas no coinciden." : "Repite la nueva contraseña."}
            </FormHelperText>
          </FormControl>

          <Button
            bg="teal.400" color="white"
            _hover={{ bg: "teal.300" }} _active={{ bg: "teal.500" }}
            isLoading={loading}
            isDisabled={!canSubmit}
            h="34px" fontSize="sm"
            onClick={submit}
          >
            Actualizar contraseña
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
