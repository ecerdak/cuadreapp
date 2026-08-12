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

export interface ResultadoLogin {
  ok: boolean;
  /** P0.1: la contraseña vigente es la TEMPORAL de la consola — el
   *  tablero está cerrado (403) hasta definir una propia. */
  debeCambiarPassword: boolean;
  /** Por qué falló, para que el login hable claro (P0.4):
   *  `limite` = demasiados intentos (429); `desactivado` = la consola
   *  revocó este acceso; `credenciales` = lo demás. */
  motivo?: "credenciales" | "limite" | "desactivado";
}

/** La contraseña temporal recién usada, SOLO en memoria y solo para el
 *  primer ingreso forzado: la pantalla de contraseña nueva la consume
 *  como «contraseña actual» sin pedirla otra vez. Jamás se almacena. */
let passwordTemporalEnMemoria: string | null = null;

export function tomarPasswordTemporal(): string | null {
  const password = passwordTemporalEnMemoria;
  passwordTemporalEnMemoria = null;
  return password;
}

export async function iniciarSesion(email: string, password: string): Promise<ResultadoLogin> {
  const respuesta = await fetch(`${URL_API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
    return {
      ok: false,
      debeCambiarPassword: false,
      motivo:
        respuesta.status === 429
          ? "limite"
          : cuerpo.error === "ACCESO_DESACTIVADO"
            ? "desactivado"
            : "credenciales",
    };
  }
  const cuerpo = (await respuesta.json()) as Tokens & { debe_cambiar_password?: boolean };
  guardarTokens(cuerpo);
  const debeCambiarPassword = cuerpo.debe_cambiar_password === true;
  passwordTemporalEnMemoria = debeCambiarPassword ? password : null;
  return { ok: true, debeCambiarPassword };
}

/* ============ Ciclo de contraseña (P0.1) ============ */

export type ResultadoCambioPassword = "ok" | "actual_incorrecta" | "error";

export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
): Promise<ResultadoCambioPassword> {
  try {
    const respuesta = await solicitar("/api/v1/auth/password", {
      method: "POST",
      body: JSON.stringify({ password_actual: passwordActual, password_nueva: passwordNueva }),
    });
    if (respuesta.ok) return "ok";
    const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
    return cuerpo.error === "PASSWORD_ACTUAL_INCORRECTA" ? "actual_incorrecta" : "error";
  } catch {
    return "error";
  }
}

/** «Olvidé mi contraseña»: la respuesta del servidor es idéntica exista
 *  o no la cuenta; false solo significa que no se pudo contactar. */
export async function solicitarRecuperacion(email: string): Promise<boolean> {
  try {
    const respuesta = await fetch(`${URL_API}/api/v1/auth/recuperar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return respuesta.ok;
  } catch {
    return false;
  }
}

/** Tokens que trae el enlace del correo de recuperación (fragmento
 *  #access_token=…&refresh_token=…). null = enlace inválido/expirado. */
export function tokensDelFragmento(fragmento: string): Tokens | null {
  const parametros = new URLSearchParams(fragmento.startsWith("#") ? fragmento.slice(1) : fragmento);
  const access = parametros.get("access_token");
  const refresh = parametros.get("refresh_token");
  return access && refresh ? { access_token: access, refresh_token: refresh } : null;
}

/** Adopta la sesión del enlace del correo y define la contraseña. La
 *  posesión del enlace es la prueba — no hay contraseña actual. */
export async function restablecerPassword(tokens: Tokens, passwordNueva: string): Promise<boolean> {
  guardarTokens(tokens);
  try {
    const respuesta = await solicitar("/api/v1/auth/password-restablecer", {
      method: "POST",
      body: JSON.stringify({ password_nueva: passwordNueva }),
    });
    return respuesta.ok;
  } catch {
    return false;
  }
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
  passwordTemporalEnMemoria = null;
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

/** P0.4: la consola revocó este acceso. NO es una sesión expirada —
 *  renovar tokens no lo arregla y el mensaje debe decir la verdad. */
export class AccesoDesactivado extends Error {
  constructor() {
    super("ACCESO_DESACTIVADO");
  }
}

export type MotivoPerdidaDeSesion = "sesion" | "desactivado";

/** El marco registra aquí su reacción (volver al login con el motivo).
 *  Así una sesión que muere en una pestaña YA montada redirige de
 *  inmediato, en vez de dejar un «Reintentar» imposible (P0.4). */
let avisarPerdidaDeSesion: ((motivo: MotivoPerdidaDeSesion) => void) | null = null;

export function alPerderLaSesion(avisar: ((motivo: MotivoPerdidaDeSesion) => void) | null): void {
  avisarPerdidaDeSesion = avisar;
}

function perder(motivo: MotivoPerdidaDeSesion): never {
  cerrarSesionLocal();
  avisarPerdidaDeSesion?.(motivo);
  throw motivo === "desactivado" ? new AccesoDesactivado() : new SesionVencida();
}

/** Un 401 con SESION_INACTIVA no es un token vencido: es la consola
 *  revocando el acceso. Renovar no ayuda — se lee el cuerpo (clonado,
 *  la respuesta sigue intacta) para no confundir los dos mundos. */
async function esAccesoRevocado(respuesta: Response): Promise<boolean> {
  try {
    const cuerpo = (await respuesta.clone().json()) as { error?: string };
    return cuerpo.error === "SESION_INACTIVA";
  } catch {
    return false;
  }
}

/** Único camino a la API: adjunta el token y renueva una vez ante 401.
 *  Si la renovación también falla, la sesión local se borra y el marco
 *  vuelve al login — nunca un error opaco ni un reintento imposible. */
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

  if (!accessToken && !(await refrescar())) perder("sesion");
  let respuesta = await ejecutar();
  if (respuesta.status === 401) {
    if (await esAccesoRevocado(respuesta)) perder("desactivado");
    if (!(await refrescar())) perder("sesion");
    respuesta = await ejecutar();
    if (respuesta.status === 401) {
      perder((await esAccesoRevocado(respuesta)) ? "desactivado" : "sesion");
    }
  }
  return respuesta;
}
