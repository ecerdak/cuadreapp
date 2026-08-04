// Fakes y ayudantes compartidos por las pruebas de la API. Mismos
// contratos que las implementaciones reales; cero red y cero base.

import { SignJWT } from "jose";
import { construirAplicacion, type Dependencias } from "../aplicacion.js";
import type { EventoSolicitud } from "../observabilidad.js";
import type {
  AlmacenFotos,
  ProveedorIdentidad,
  SesionAutenticada,
  TokensEmitidos,
} from "../seguridad/tipos.js";
import type {
  CargaPersistida,
  CatalogoSede,
  ContextoRegistro,
  ContextoRegistroInventario,
  NuevaCarga,
  NuevaFoto,
  RepositorioCargas,
  RepositorioSeguridad,
} from "../repositorio/tipos.js";

export const SECRETO_PRUEBA = "secreto-de-pruebas-cuadreapp-0123456789abcdef";

export const ID_CARGA = "3f8e9a10-1111-4222-8333-444455556666";
export const ID_DISPENSADOR = "aaaa1111-2222-4333-8444-555566667777";
export const ID_EQUIPO = "bbbb1111-2222-4333-8444-555566667777";
export const ID_CONDUCTOR = "cccc1111-2222-4333-8444-555566667777";
export const ID_CLIENTE = "dddd1111-2222-4333-8444-555566667777";
export const ID_SEDE = "eeee1111-2222-4333-8444-555566667777";
export const ID_DISPOSITIVO_USUARIO = "99991111-2222-4333-8444-555566667777";

export async function crearToken(usuarioId: string, secreto = SECRETO_PRUEBA): Promise<string> {
  return new SignJWT({ sub: usuarioId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secreto));
}

export function sesionDispositivo(): SesionAutenticada {
  return {
    usuarioId: ID_DISPOSITIVO_USUARIO,
    nombre: "Tablet almacén",
    rol: "dispositivo",
    clienteId: ID_CLIENTE,
    sedeId: ID_SEDE,
    permisos: ["cargas.registrar", "cargas.subir_foto", "catalogo.leer"],
    perfil: "medidor_doble",
  };
}

/** Dispositivo de un cliente con perfil «Carga sobre Inventario». */
export function sesionDispositivoInventario(): SesionAutenticada {
  return { ...sesionDispositivo(), perfil: "carga_inventario" };
}

export function contextoInventarioBase(): ContextoRegistroInventario {
  return {
    clienteId: ID_CLIENTE,
    sedeId: ID_SEDE,
    validacion: {
      equipo: { capacidadTanqueGal: 1000.0, ultimaCargaFinalizadaEn: null },
      sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150 },
    },
  };
}

export function contextoRegistroBase(): ContextoRegistro {
  return {
    clienteId: ID_CLIENTE,
    sedeId: ID_SEDE,
    validacion: {
      dispensador: { totActualGal: 1847.0, toleranciaTandaGal: 1.0 },
      equipo: {
        tipoMedidor: "horometro",
        ultimaLectura: 1086.5,
        capacidadTanqueGal: 80.0,
        ultimaCargaFinalizadaEn: "2026-07-30T18:00:00-05:00",
      },
      sede: { lat: 3.9, lng: -76.3, radioGeocercaM: 150 },
    },
  };
}

export class RepositorioCargasFalso implements RepositorioCargas {
  cargas = new Map<string, CargaPersistida>();
  inserciones: Array<{ carga: NuevaCarga; fotos: NuevaFoto[] }> = [];
  contexto: ContextoRegistro | null = contextoRegistroBase();
  contextoInventario: ContextoRegistroInventario | null = contextoInventarioBase();

  async buscarCargaPorId(id: string): Promise<CargaPersistida | null> {
    return this.cargas.get(id) ?? null;
  }

  async obtenerContextoRegistro(): Promise<ContextoRegistro | null> {
    return this.contexto;
  }

  async obtenerContextoInventario(): Promise<ContextoRegistroInventario | null> {
    return this.contextoInventario;
  }

  async insertarCarga(carga: NuevaCarga, fotos: NuevaFoto[]): Promise<void> {
    this.inserciones.push({ carga, fotos });
    this.cargas.set(carga.id, {
      id: carga.id,
      estado: carga.estado,
      banderas: carga.banderas,
      galones: carga.galones,
      galNoRegistrados: carga.gal_no_registrados,
      llegadaGal: carga.llegada_gal,
      // Espejo de la columna generada de la base: llegada + despachados.
      inventarioFinalGal:
        carga.llegada_gal === null ? null : Math.round((carga.llegada_gal + carga.galones) * 10) / 10,
    });
  }
}

export class RepositorioSeguridadFalso implements RepositorioSeguridad {
  sesiones = new Map<string, SesionAutenticada>([[ID_DISPOSITIVO_USUARIO, sesionDispositivo()]]);
  codigoValido: { id: string; sedeId: string; clienteId: string } | null = null;
  enrolamientos: Array<{ usuarioId: string; codigoId: string; sedeId: string; clienteId: string }> = [];
  catalogo: CatalogoSede | null = null;

  async obtenerSesion(usuarioId: string): Promise<SesionAutenticada | null> {
    return this.sesiones.get(usuarioId) ?? null;
  }

  async validarCodigoEnrolamiento(
    codigo: string,
  ): Promise<{ id: string; sedeId: string; clienteId: string } | null> {
    return codigo === "CODIGO-VALIDO-123" ? this.codigoValido : null;
  }

  async registrarDispositivoEnrolado(datos: {
    usuarioId: string;
    codigoId: string;
    sedeId: string;
    clienteId: string;
    nombre: string | null;
  }): Promise<void> {
    this.enrolamientos.push(datos);
  }

  async obtenerCatalogo(): Promise<CatalogoSede | null> {
    return this.catalogo;
  }
}

const tokensFalsos = (sufijo: string): TokensEmitidos => ({
  access_token: `access-${sufijo}`,
  refresh_token: `refresh-${sufijo}`,
  expira_en_s: 3600,
});

export class ProveedorIdentidadFalso implements ProveedorIdentidad {
  credencialesValidas = { email: "supervisor@trebol.com", password: "correcta" };
  refreshValido = "refresh-vigente";
  sesionesCerradas: string[] = [];

  async iniciarSesionConPassword(email: string, password: string): Promise<TokensEmitidos | null> {
    return email === this.credencialesValidas.email && password === this.credencialesValidas.password
      ? tokensFalsos("login")
      : null;
  }

  async refrescarSesion(refreshToken: string): Promise<TokensEmitidos | null> {
    return refreshToken === this.refreshValido ? tokensFalsos("renovado") : null;
  }

  async cerrarSesion(accessToken: string): Promise<void> {
    this.sesionesCerradas.push(accessToken);
  }

  async crearIdentidadDispositivo(): Promise<{ usuarioId: string; tokens: TokensEmitidos } | null> {
    return { usuarioId: ID_DISPOSITIVO_USUARIO, tokens: tokensFalsos("dispositivo") };
  }
}

export class AlmacenFotosFalso implements AlmacenFotos {
  guardadas: Array<{ ruta: string; bytes: number; tipo: string }> = [];
  eliminadas: string[] = [];

  async guardar(ruta: string, bytes: Uint8Array, tipo: string): Promise<void> {
    this.guardadas.push({ ruta, bytes: bytes.length, tipo });
  }

  async urlFirmada(ruta: string): Promise<string | null> {
    return `https://firmada.prueba/${ruta}`;
  }

  async eliminar(ruta: string): Promise<void> {
    this.eliminadas.push(ruta);
  }
}

export function armarAplicacion(sobre: Partial<Dependencias> = {}) {
  const repositorio = new RepositorioCargasFalso();
  const repositorioSeguridad = new RepositorioSeguridadFalso();
  const proveedorIdentidad = new ProveedorIdentidadFalso();
  const almacenFotos = new AlmacenFotosFalso();
  const almacenLogos = new AlmacenFotosFalso();
  const eventos: EventoSolicitud[] = [];

  const app = construirAplicacion({
    repositorio,
    repositorioSeguridad,
    proveedorIdentidad,
    almacenFotos,
    almacenLogos,
    secretoJwt: SECRETO_PRUEBA,
    emitirEvento: (evento) => eventos.push(evento),
    ...sobre,
  });

  return {
    app,
    repositorio,
    repositorioSeguridad,
    proveedorIdentidad,
    almacenFotos,
    almacenLogos,
    eventos,
  };
}

export function cuerpoCargaBase(cambios: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: ID_CARGA,
    dispensador_id: ID_DISPENSADOR,
    equipo_id: ID_EQUIPO,
    conductor_id: ID_CONDUCTOR,
    tanda_inicial_gal: 0.0,
    tot_inicial_gal: 1847.0,
    tanda_final_gal: 42.5,
    tot_final_gal: 1889.5,
    lectura_equipo: 1093.0,
    iniciada_en: "2026-07-31T09:00:00-05:00",
    finalizada_en: "2026-07-31T09:05:00-05:00",
    lat: 3.9,
    lng: -76.3,
    origen: "app",
    foto_inicial_path: "fotos/carga-inicial.webp",
    foto_final_path: "fotos/carga-final.webp",
    ...cambios,
  };
}
