// Implementaciones reales contra Supabase (GoTrue + Storage), del lado
// del servidor. Únicos lugares del sistema que hablan con Supabase
// Auth/Storage; detrás de las interfaces de seguridad/tipos.ts para
// que las pruebas usen fakes y el proveedor sea reemplazable.

import { randomBytes, randomUUID } from "node:crypto";
import type { AlmacenFotos, ProveedorIdentidad, TokensEmitidos } from "./tipos.js";

interface ConfiguracionSupabase {
  url: string; // https://<proyecto>.supabase.co
  claveAnon: string;
  claveServiceRole: string;
}

function aTokens(cuerpo: { access_token: string; refresh_token: string; expires_in: number }): TokensEmitidos {
  return {
    access_token: cuerpo.access_token,
    refresh_token: cuerpo.refresh_token,
    expira_en_s: cuerpo.expires_in,
  };
}

export class ProveedorIdentidadSupabase implements ProveedorIdentidad {
  constructor(private readonly config: ConfiguracionSupabase) {}

  private async grant(cuerpo: Record<string, string>, tipo: string): Promise<TokensEmitidos | null> {
    const respuesta = await fetch(`${this.config.url}/auth/v1/token?grant_type=${tipo}`, {
      method: "POST",
      headers: { apikey: this.config.claveAnon, "content-type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    if (!respuesta.ok) return null;
    return aTokens(await respuesta.json());
  }

  iniciarSesionConPassword(email: string, password: string): Promise<TokensEmitidos | null> {
    return this.grant({ email, password }, "password");
  }

  refrescarSesion(refreshToken: string): Promise<TokensEmitidos | null> {
    return this.grant({ refresh_token: refreshToken }, "refresh_token");
  }

  async cerrarSesion(accessToken: string): Promise<void> {
    await fetch(`${this.config.url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: this.config.claveAnon, authorization: `Bearer ${accessToken}` },
    });
  }

  async crearIdentidadDispositivo(): Promise<{ usuarioId: string; tokens: TokensEmitidos } | null> {
    // Secreto efímero: se usa una única vez para acuñar la sesión del
    // dispositivo y se descarta. Nadie lo conoce ni lo almacena; la
    // sesión vive por rotación de refresh tokens de ahí en adelante.
    const email = `dispositivo+${randomUUID()}@cuadreapp.interno`;
    const secretoEfimero = randomBytes(48).toString("base64url");

    const creacion = await fetch(`${this.config.url}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: this.config.claveServiceRole,
        authorization: `Bearer ${this.config.claveServiceRole}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password: secretoEfimero, email_confirm: true }),
    });
    if (!creacion.ok) return null;
    const usuario = await creacion.json();

    const tokens = await this.grant({ email, password: secretoEfimero }, "password");
    if (!tokens) return null;

    return { usuarioId: usuario.id, tokens };
  }
}

export class AlmacenFotosSupabase implements AlmacenFotos {
  constructor(
    private readonly config: ConfiguracionSupabase,
    private readonly bucket: string,
  ) {}

  async guardar(ruta: string, bytes: Uint8Array, tipo: string): Promise<void> {
    const respuesta = await fetch(`${this.config.url}/storage/v1/object/${this.bucket}/${ruta}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.claveServiceRole}`,
        "content-type": tipo,
        "x-upsert": "true", // reintento de la cola = misma ruta, sin duplicados
      },
      body: bytes as unknown as BodyInit,
    });
    if (!respuesta.ok) {
      throw new Error(`Storage respondió ${respuesta.status}`);
    }
  }
}
