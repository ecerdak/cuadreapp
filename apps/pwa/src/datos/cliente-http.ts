// El ÚNICO cliente HTTP de la PWA (DEC-014): todo acceso a la API pasa
// por aquí. Responsabilidades: adjuntar tokens (vía TokenStore, nunca
// directo), renovar la sesión (single-flight, con margen antes de la
// expiración), un solo reintento ante 401, clasificación de errores y
// observabilidad del lado del cliente (request_id del servidor en los
// fallos). Ningún otro módulo llama fetch contra la API.

import type { TokenStore } from "../seguridad/token-store";

export class ErrorRed extends Error {}
export class ErrorSesionVencida extends Error {}

const MARGEN_EXPIRACION_MS = 60_000;

export interface OpcionesClienteHttp {
  fetchFn?: typeof fetch;
  /** La sesión murió (refresh inválido/revocado): la UI debe ofrecer re-enrolar. */
  alSesionVencida?: () => void;
}

export class ClienteHttp {
  private renovacion: Promise<"renovada" | "invalida"> | null = null;
  private readonly fetchFn: typeof fetch;

  constructor(
    private readonly urlBase: string,
    private readonly tokens: TokenStore,
    private readonly opciones: OpcionesClienteHttp = {},
  ) {
    this.fetchFn = opciones.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  async solicitar(
    ruta: string,
    init: RequestInit = {},
    config: { autenticado?: boolean } = {},
  ): Promise<Response> {
    if (config.autenticado === false) {
      return this.ejecutar(ruta, init, null);
    }

    let token = this.tokenVigente();
    if (!token) {
      if ((await this.renovar()) === "invalida") throw new ErrorSesionVencida("sin sesión");
      token = this.tokenVigente();
      if (!token) throw new ErrorSesionVencida("sin sesión tras renovar");
    }

    let respuesta = await this.ejecutar(ruta, init, token);
    if (respuesta.status === 401) {
      // Un solo reintento tras renovar; nunca bucles.
      if ((await this.renovar()) === "invalida") throw new ErrorSesionVencida("refresh rechazado");
      const nuevo = this.tokens.obtenerAccess()?.token;
      if (!nuevo) throw new ErrorSesionVencida("sin access tras renovar");
      respuesta = await this.ejecutar(ruta, init, nuevo);
    }
    return respuesta;
  }

  private tokenVigente(): string | null {
    const acceso = this.tokens.obtenerAccess();
    if (!acceso) return null;
    return acceso.expiraEnMs - Date.now() > MARGEN_EXPIRACION_MS ? acceso.token : null;
  }

  private async ejecutar(ruta: string, init: RequestInit, token: string | null): Promise<Response> {
    try {
      return await this.fetchFn(`${this.urlBase}${ruta}`, {
        ...init,
        headers: {
          ...(init.headers as Record<string, string> | undefined),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (error) {
      throw new ErrorRed(String(error));
    }
  }

  /** Renovación single-flight: N peticiones concurrentes comparten UNA renovación. */
  private renovar(): Promise<"renovada" | "invalida"> {
    if (!this.renovacion) {
      this.renovacion = this.renovarInterno().finally(() => {
        this.renovacion = null;
      });
    }
    return this.renovacion;
  }

  private async renovarInterno(): Promise<"renovada" | "invalida"> {
    const refresh = await this.tokens.obtenerRefresh();
    if (!refresh) {
      this.opciones.alSesionVencida?.();
      return "invalida";
    }

    let respuesta: Response;
    try {
      respuesta = await this.fetchFn(`${this.urlBase}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch (error) {
      throw new ErrorRed(String(error));
    }

    if (respuesta.ok) {
      await this.tokens.guardar(await respuesta.json());
      return "renovada";
    }
    if (respuesta.status === 400 || respuesta.status === 401) {
      await this.tokens.limpiar();
      this.opciones.alSesionVencida?.();
      return "invalida";
    }
    throw new ErrorRed(`refresh HTTP ${respuesta.status}`);
  }
}
