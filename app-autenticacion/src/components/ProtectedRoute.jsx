import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#080c14", color: "#00f5c4",
        fontFamily: "Syne, sans-serif", fontSize: "1.1rem", gap: "0.75rem"
      }}>
        <span style={{ fontSize: "1.5rem", animation: "spin 0.8s linear infinite", display: "inline-block" }}>⬡</span>
        Verificando sesión...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}