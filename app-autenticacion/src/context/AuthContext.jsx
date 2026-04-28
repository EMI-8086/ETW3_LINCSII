import { createContext, useContext, useState, useEffect } from "react";
import {
  authService,
  getToken,
  saveToken,
  removeToken,
  isTokenExpired,
  decodeToken,
} from "../services/Api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al iniciar
  useEffect(() => {
    const stored = getToken();
    if (stored && !isTokenExpired(stored)) {
      const storedUser = localStorage.getItem("auth_user");
      setToken(stored);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } else if (stored) {
      removeToken(); // token expirado, limpiar
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Por favor ingresa tu correo y contraseña");
    }

    const res = await authService.login(email, password);

    /*
      Estructura real de la API:
      {
        "responseCodeTxt": "200 OK",
        "message": { "login": { "token": "..." } },
        "status": 200,
        "flag": "success",
        "type": "estudiante"
      }
    */
    const jwt = res?.message?.login?.token;

    if (!jwt) {
      throw new Error("No se recibió un token en la respuesta del servidor");
    }

    // Guardamos email y tipo de usuario; el perfil completo se carga en /perfil
    const userInfo = {
      email,
      type: res.type || "estudiante",
    };

    saveToken(jwt);
    localStorage.setItem("auth_user", JSON.stringify(userInfo));
    setToken(jwt);
    setUser(userInfo);

    return userInfo;
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
  };

  // Verificar expiración cada 60 s
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
        window.location.href = "/login";
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [token]);

  const isAuthenticated = !!token && !isTokenExpired(token);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}