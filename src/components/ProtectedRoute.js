// ============================================================
// 📁 src/components/ProtectedRoute.js
// ============================================================
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase.client";

export default function ProtectedRoute({ children }) {
  const user = auth.currentUser;

  if (user) {
    // ✅ Sincroniza el UID con localStorage (para backend)
    localStorage.setItem("uid", user.uid);
    console.log("✅ UID sincronizado:", user.uid);
  } else {
    console.warn("⚠️ Usuario no autenticado, redirigiendo al login...");
  }

  // 🔒 Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
