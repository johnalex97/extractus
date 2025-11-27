// ============================================================
// 📁 src/context/AuthContext.jsx
// ============================================================
import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
<<<<<<< HEAD
import { auth } from "../firebase.client";
=======
import { auth } from "../firebase";
>>>>>>> c26ca57c4eb2baed6a2b44a735d3d122b6f44480

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);

      // 🔥 SI HAY USUARIO → sincroniza UID para el backend
      if (firebaseUser) {
        localStorage.setItem("uid", firebaseUser.uid);
      }

      setLoadingAuth(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
