// Servicio de sesión del dispositivo: enrolamiento, recuperación al
// abrir la app, catálogo y cierre. Completamente desacoplado de React
// — la UI solo consume estados y métodos. Los tokens jamás salen de
// TokenStore/ClienteHttp.

import type { BdLocal } from "../offline/bd";
import { contarPendientes } from "../offline/cola";
import type { TokenStore } from "./token-store";
import { ClienteHttp, ErrorSesionVencida } from "../datos/cliente-http";
import { solicitarAlmacenamientoPersistente } from "./persistencia";
import type { PerfilMe } from "../datos/contratos";

export type EstadoRecuperacion = "activa" | "offline" | "sin_sesion";

export class ServicioSesion {
  constructor(
    private readonly http: ClienteHttp,
    private readonly tokens: TokenStore,
    private readonly bd: BdLocal,
  ) {}

  /** Al abrir la app: refresh → /me → catálogo. Sin señal, opera con lo
   *  cacheado en Dexie ("offline"): la captura nunca depende de la red. */
  async recuperar(): Promise<EstadoRecuperacion> {
    if ((await this.tokens.obtenerRefresh()) === null) return "sin_sesion";

    try {
      const respuesta = await this.http.solicitar("/api/v1/me");
      if (!respuesta.ok) return "sin_sesion";
      const perfil: PerfilMe = await respuesta.json();
      await this.bd.perfil.put({ clave: "perfil", datos: perfil });
      await this.refrescarCatalogo(); // mejor esfuerzo: si falla, queda el cacheado
      return "activa";
    } catch (error) {
      if (error instanceof ErrorSesionVencida) return "sin_sesion";
      return "offline";
    }
  }

  /** Canjea el código de un solo uso por la identidad del dispositivo. */
  async enrolar(
    codigo: string,
    nombreDispositivo: string | null,
  ): Promise<{ ok: true } | { ok: false; detalle: string }> {
    let respuesta: Response;
    try {
      respuesta = await this.http.solicitar(
        "/api/v1/dispositivos/enrolar",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ codigo, nombre_dispositivo: nombreDispositivo }),
        },
        { autenticado: false },
      );
    } catch {
      return { ok: false, detalle: "Sin conexión: el enrolamiento necesita señal." };
    }

    if (respuesta.status !== 201) {
      return { ok: false, detalle: "Código inválido, vencido o ya usado." };
    }

    await this.tokens.guardar(await respuesta.json());
    // RC1-A3: el dispositivo queda oficial — proteger la cola offline.
    await solicitarAlmacenamientoPersistente();
    await this.recuperar();
    return { ok: true };
  }

  async refrescarCatalogo(): Promise<boolean> {
    try {
      const respuesta = await this.http.solicitar("/api/v1/catalogo");
      if (!respuesta.ok) return false;
      await this.bd.catalogo.put({ clave: "catalogo", datos: await respuesta.json() });
      return true;
    } catch {
      return false;
    }
  }

  /** Cierra la sesión. FASE 5 del hardening: con cargas pendientes se
   *  NIEGA salvo forzar explícito — desenrolar con evidencia sin subir
   *  es la forma más fácil de perderla. La cola queda intacta siempre. */
  async cerrar(
    opciones: { forzar?: boolean } = {},
  ): Promise<{ ok: true } | { ok: false; pendientes: number }> {
    const pendientes = await contarPendientes(this.bd);
    if (pendientes > 0 && !opciones.forzar) {
      return { ok: false, pendientes };
    }
    try {
      await this.http.solicitar("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // mejor esfuerzo: la revocación local es lo que importa
    }
    await this.tokens.limpiar();
    return { ok: true };
  }
}
