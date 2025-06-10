import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { appfirebase } from "./firebaseconfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rol, setRol] = useState(null); // Estado para el rol

  useEffect(() => {
    const auth = getAuth(appfirebase);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoggedIn(!!user);
      
      // Comprobar el rol basado en el correo del usuario
      if (user) {
        asignarRol(user.email);
      } else {
        setRol(null); // Si el usuario se desloguea, restablecer el rol
      }
    });

    return () => unsubscribe();
  }, []);

  // Asignar rol basado en el correo
  const asignarRol = (email) => {
    // Aquí asignamos el rol según el correo. Por ejemplo, si el correo es del administrador.
    if (email === "desarrolladoressa2000@gmail.com") {  // Cambia esto con el correo del admin
      setRol("admin");
    } else {
      setRol("usuario");
    }
  };

  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setIsLoggedIn(false);
    setRol(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, rol, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
