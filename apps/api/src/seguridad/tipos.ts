// Contratos de la capa de identidad (DEC-013). El proveedor de
// identidad (Supabase Auth) queda detrás de una interfaz: la API es el
// único interlocutor del cliente y el proveedor se puede cambiar sin
// tocar la PWA.

import type { CodigoPerfil } from "@cuadreapp/dominio";

/** Identidad + alcance + permisos resueltos por el RBAC propio (DEC-004). */
export interface SesionAutenticada {
  usuarioId: string;
  nombre: string;
  rol: string;
  clienteId: string | null; // null: alcance multicliente (comercial_lubryco)
  sedeId: string | null;
  permisos: string[];
  /** Perfil Operativo del cliente de la sesión (DEC-016); null cuando
   *  la sesión no tiene cliente (alcance multicliente/admin). */
  perfil: CodigoPerfil | null;
}

export interface TokensEmitidos {
  access_token: string;
  refresh_token: string;
  /** Segundos de vida del access token. */
  expira_en_s: number;
}

export interface ProveedorIdentidad {
  /** Grant password de GoTrue, del lado del servidor. null = credenciales inválidas. */
  iniciarSesionConPassword(email: string, password: string): Promise<TokensEmitidos | null>;
  /** Grant refresh_token (con rotación). null = refresh inválido/revocado. */
  refrescarSesion(refreshToken: string): Promise<TokensEmitidos | null>;
  /** Revoca los refresh tokens de la sesión. */
  cerrarSesion(accessToken: string): Promise<void>;
  /** Crea la identidad de un dispositivo: usuario de Auth con secreto
   *  efímero que se usa una vez para acuñar la sesión y se descarta —
   *  nadie lo almacena jamás. null = fallo del proveedor. */
  crearIdentidadDispositivo(): Promise<{ usuarioId: string; tokens: TokensEmitidos } | null>;

  /** Crea la identidad de una PERSONA con correo y contraseña (los
   *  usuarios del Dashboard de un cliente). A diferencia del
   *  dispositivo, aquí no se acuña sesión: la persona entra ella misma
   *  por /api/v1/auth/login. `correo_en_uso` distingue el choque de
   *  correo del fallo genérico, para que la consola diga cuál es. */
  crearIdentidadPersona(
    email: string,
    password: string,
  ): Promise<{ usuarioId: string } | "correo_en_uso" | null>;

  /** Fija una contraseña nueva para una identidad existente. Es el
   *  reset del administrador: no envía correo, devuelve la contraseña
   *  temporal a quien la pidió para que la entregue por su canal. */
  cambiarPassword(usuarioId: string, password: string): Promise<boolean>;
}

/** Destino de archivos en un bucket privado de Storage (evidencia
 *  fotográfica, logos de clientes — DEC-017). Nadie lee sin URL
 *  firmada; solo la API escribe. */
export interface AlmacenFotos {
  guardar(ruta: string, bytes: Uint8Array, tipo: string): Promise<void>;
  /** URL temporal de lectura (bucket privado). null si el proveedor
   *  no puede firmarla. */
  urlFirmada(ruta: string, segundos: number): Promise<string | null>;
  /** Borra el objeto. No falla si ya no existe (idempotente). */
  eliminar(ruta: string): Promise<void>;
}
