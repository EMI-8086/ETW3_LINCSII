import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage    from "../pages/LoginPage";
import HomePage    from "../pages/Homepage";
import GradesPage  from "../pages/GradesPage";
import KardexPage  from "../pages/KardexPage";
import ProfilePage from "../pages/ProfilePage";
import PlannerPage from "../pages/PlannerPage"; // Nueva página

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"        element={<Navigate to="/login" replace />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
          <Route path="/home"    element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/grades"  element={<ProtectedRoute><GradesPage /></ProtectedRoute>} />
          <Route path="/kardex"  element={<ProtectedRoute><KardexPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="*"        element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}