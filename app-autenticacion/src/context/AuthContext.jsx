import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find(
      (u) => u.email === userData.email && u.password === userData.password
    );
    if (!found) throw new Error("Credenciales incorrectas");
    const { password, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem("auth_user", JSON.stringify(safeUser));
    return safeUser;
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists = users.find((u) => u.email === userData.email);
    if (exists) throw new Error("El correo ya está registrado");
    const newUser = { ...userData, id: Date.now() };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    const { password, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem("auth_user", JSON.stringify(safeUser));
    return safeUser;
  };

  const updateProfile = (updatedData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const index = users.findIndex((u) => u.id === user.id);
    if (index === -1) throw new Error("Usuario no encontrado");
    users[index] = { ...users[index], ...updatedData };
    localStorage.setItem("users", JSON.stringify(users));
    const { password, ...safeUser } = users[index];
    setUser(safeUser);
    localStorage.setItem("auth_user", JSON.stringify(safeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}