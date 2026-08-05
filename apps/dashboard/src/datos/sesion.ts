// Sesión del tablero: login email+contraseña contra /api/v1/auth (la
// empresa la decide el RBAC del servidor, nunca la URL ni el cliente).
// Access token en memoria, refresh con rotación en localStorage —
// patrón TokenStore de la PWA (DEC-014). Ningún componente toca
// tokens: todo pasa por este módulo y por el cliente HTTP único.
//
// Un único Dashboard para todos los clientes: no hay subdominio, ni
// ruta, ni parámetro por cliente. Quien inicia sesión determina qué
// empresa se carga.

export const URL_API = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

const CLAVE_REFRESH = "cuadreapp-tablero:refresh";

let accessToken: string | null = null;

interface Tokens {
  access_token: string;
  refresh_token: string;
}

function guardarTokens(tokens: Tokens): void {
  accessToken = tokens.access_token;
  localStorage.setItem(CLAVE_REFRESH, tokens.refresh_token);
}

export function haySesion(): boolean {
  return accessToken !== null || localStorage.getItem(CLAVE_REFRESH) !== null;
}

export async function iniciarSesion(email: string, password: string): Promise<boolean> {
  const respuesta = await fetch(`${URL_API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!respuesta.ok) return false;
  guardarTokens((await respuesta.json()) as Tokens);
  return true;
}

async function refrescar(): Promise<boolean> {
  const refresh = localStorage.getItem(CLAVE_REFRESH);
  if (!refresh) return false;
  const respuesta = await fetch(`${URL_API}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!respuesta.ok) {
    cerrarSesionLocal();
    return false;
  }
  guardarTokens((await respuesta.json()) as Tokens);
  return true;
}

export function cerrarSesionLocal(): void {
  accessToken = null;
  localStorage.removeItem(CLAVE_REFRESH);
}

export async function cerrarSesion(): Promise<void> {
  if (accessToken) {
    await fetch(`${URL_API}/api/v1/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
  }
  cerrarSesionLocal();
}

export class SesionVencida extends Error {
  constructor() {
    super("SESION_VENCIDA");
  }
}

/** Único camino a la API: adjunta el token y renueva una vez ante 401.
 *  Si la renovación también falla, la sesión local se borra — el
 *  tablero vuelve al login en lugar de quedarse en un error opaco. */
export async function solicitar(ruta: string, opciones: RequestInit = {}): Promise<Response> {
  const ejecutar = () =>
    fetch(`${URL_API}${ruta}`, {
      ...opciones,
      headers: {
        ...(opciones.body ? { "content-type": "application/json" } : {}),
        ...(opciones.headers ?? {}),
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  if (!accessToken && !(await refrescar())) throw new SesionVencida();
  let respuesta = await ejecutar();
  if (respuesta.status === 401) {
    if (!(await refrescar())) throw new SesionVencida();
    respuesta = await ejecutar();
    if (respuesta.status === 401) {
      cerrarSesionLocal();
      throw new SesionVencida();
    }
  }
  return respuesta;
}
