import React, { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, Input, Text, useToast,
} from "@chakra-ui/react";

/**
 * Modal para verificar el código 2FA (TOTP)
 * Se conecta al backend /api/mfa/verify
 */
export default function MfaVerifyModal({ isOpen, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // 🔐 Verificar código del usuario logueado
  const handleVerify = async () => {
    const uid = localStorage.getItem("userEmail"); // o el username del usuario
    if (!uid || !code) {
      toast({
        title: "Error",
        description: "Faltan datos: usuario o código.",
        status: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code }),
      });

      const data = await response.json();

      if (data.verified) {
        toast({
          title: "✅ Verificación correcta",
          description: "Acceso permitido.",
          status: "success",
        });
        setCode("");
        onSuccess?.(); // navega al dashboard o módulo principal
      } else {
        toast({
          title: "❌ Código inválido o expirado",
          description: "Verifica el código e inténtalo de nuevo.",
          status: "error",
        });
      }
    } catch (err) {
      console.error("❌ Error verificando 2FA:", err);
      toast({
        title: "Error de conexión",
        description: "No se pudo verificar el código 2FA.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Verificación en dos pasos</ModalHeader>
        <ModalBody textAlign="center">
          <Text mb={2} fontSize="sm">
            Introduce el código de 6 dígitos generado por Google Authenticator
          </Text>
          <Input
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            textAlign="center"
            maxW="200px"
            mx="auto"
            fontSize="lg"
            fontWeight="bold"
            letterSpacing="4px"
          />
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            colorScheme="teal"
            onClick={handleVerify}
            isLoading={loading}
            loadingText="Verificando..."
          >
            Verificar
          </Button>
          <Button variant="ghost" ml={3} onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
