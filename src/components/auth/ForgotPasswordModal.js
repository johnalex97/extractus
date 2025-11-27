// src/components/auth/ForgotPasswordModal.jsx
import React, { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, useToast, Text
} from "@chakra-ui/react";
import { sendPasswordResetEmail } from "firebase/auth";
<<<<<<< HEAD
import { auth } from "../../firebase.client";
=======
import { auth } from "../../firebase";
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async () => {
    try {
      setLoading(true);
      const actionCodeSettings = {
        url: import.meta.env.VITE_RESET_CONTINUE_URL,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      toast({ title: "Revisa tu correo", description: "Te enviamos el enlace de reseteo.", status: "success" });
      setEmail("");
      onClose();
    } catch (e) {
      toast({ title: "No se pudo enviar", description: e.message, status: "error" });
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Recuperar contraseña</ModalHeader>
        <ModalBody>
          <Text mb={3}>Ingresa tu correo y te enviaremos un enlace para restablecerla.</Text>
          <FormControl isRequired>
            <FormLabel>Correo</FormLabel>
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button colorScheme="blue" isLoading={loading} onClick={submit}>Enviar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
