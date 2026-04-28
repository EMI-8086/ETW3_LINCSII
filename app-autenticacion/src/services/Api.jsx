// En desarrollo Vite hace de proxy → evita CORS
// En producción cambia esto a la URL real del servidor
const BASE_URL = "/api";

// ── JWT helpers ──────────────────────────────────────────────
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp está en segundos
  return Date.now() >= decoded.exp * 1000;
}

export function getToken() {
  return localStorage.getItem("jwt_token");
}

export function saveToken(token) {
  localStorage.setItem("jwt_token", token);
}

export function removeToken() {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("auth_user");
}

// ── Fetcher base ─────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
  }

  // Token expirado o no autorizado
  if (response.status === 401) {
    removeToken();
    window.location.href = "/login";
    throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const msg =
      (typeof data === "object" && (data.message || data.error || data.msg)) ||
      `Error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ── Estudiante ───────────────────────────────────────────────
export const studentService = {
  getProfile: () => request("/movil/estudiante"),
  getGrades: () => request("/movil/estudiante/calificaciones"),
  getKardex: () => request("/movil/estudiante/kardex"),
  getSchedule: () => request("/movil/estudiante/horarios"),
};