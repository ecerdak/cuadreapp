// Contratos de la capa de identidad (DEC-013). El proveedor de
// identidad (Supabase Auth) queda detrás de una interfaz: la API es el
// único interlocutor del cliente y el proveedor se puede cambiar sin
// tocar la PWA.

/** Identidad + alcance + permisos resueltos por el RBAC propio (DEC-004). */
export interface SesionAutenticada {
  usuarioId: string;
  nombre: string;
  rol: string;
  clienteId: string | null; // null: alcance multicliente (comercial_lubryco)
  sedeId: string | null;
  permisos: string[];
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
}

/** Destino de la evidencia fotográfica (bucket privado de Storage). */
export interface AlmacenFotos {
  guardar(ruta: string, bytes: Uint8Array, tipo: string): Promise<void>;
  /** URL temporal de lectura para la consola admin (bucket privado).
   *  null si el proveedor no puede firmarla. */
  urlFirmada(ruta: string, segundos: number): Promise<string | null>;
}
