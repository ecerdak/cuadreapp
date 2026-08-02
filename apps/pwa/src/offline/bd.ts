// Base local (IndexedDB vía Dexie): la cola offline es el camino
// normal, no la excepción (spec §8.1). Toda carga nace aquí y un
// sincronizador la sube cuando hay señal.

import Dexie, { type EntityTable } from "dexie";
import type { Bandera, EstadoCarga } from "@cuadreapp/dominio";
import type { CatalogoRemoto, PerfilMe } from "../datos/contratos";

/** Cuerpo exacto del POST /api/v1/cargas (contrato snake_case de la API). */
export interface PayloadCarga {
  id: string;
  dispensador_id: string;
  equipo_id: string;
  conductor_id: string;
  tanda_inicial_gal: number;
  tot_inicial_gal: number;
  tanda_final_gal: number;
  tot_final_gal: number;
  lectura_equipo: number | null;
  iniciada_en: string;
  finalizada_en: string;
  lat: number | null;
  lng: number | null;
  precision_gps_m: number | null;
  origen: "app";
  foto_inicial_path: string | null;
  foto_final_path: string | null;
  notas: string | null;
  device_id: string | null;
  version_app: string | null;
}

export interface VeredictoServidor {
  estado: EstadoCarga;
  banderas: Bandera[];
  gal_no_registrados: number | null;
  request_id?: string;
}

export interface CargaLocal {
  id: string; // el mismo uuid del payload: reintento = mismo id (idempotencia, spec §10.4)
  creadaEn: string;
  payload: PayloadCarga;
  resumen: { equipoCodigo: string; conductorNombre: string; galones: number };
  /** Veredicto local del dominio, para mostrar de inmediato. El servidor es la autoridad. */
  estadoLocal: EstadoCarga;
  banderasLocales: Bandera[];
  sincronizacion: "pendiente" | "sincronizada" | "error_definitivo";
  intentos: number;
  proximoIntentoEn: string | null;
  ultimoError: string | null;
  veredictoServidor: VeredictoServidor | null;
}

/** La evidencia fotográfica queda local hasta que exista el canal de
 *  subida de archivos (fase de autenticación + storage). Se guardan
 *  bytes en vez de Blob para portabilidad del almacenamiento. */
export interface FotoLocal {
  id: string; // `${cargaId}:${momento}`
  cargaId: string;
  momento: "inicial" | "final";
  bytes: ArrayBuffer;
  tipo: string;
}

/** Contexto local de validación: espejo del estado del servidor que la
 *  app mantiene para validar offline (el totalizador solo avanza, igual
 *  que el trigger de la base). El servidor revalida y es la autoridad. */
export interface ContextoLocal {
  clave: string; // `dispensador:{id}` | `equipo:{id}` | `meta:*`
  totActualGal?: number;
  ultimaLectura?: number | null;
  ultimaCargaFinalizadaEn?: string | null;
  /** Metadatos simples (p. ej. meta:ultima-sync). */
  valor?: string;
}

/** Identidad y catálogo cacheados para operar 100% offline (Etapa S).
 *  Aquí NUNCA hay tokens: esos viven solo en TokenStore (DEC-014). */
export interface PerfilCacheado {
  clave: string; // "perfil"
  datos: PerfilMe;
}

export interface CatalogoCacheado {
  clave: string; // "catalogo"
  datos: CatalogoRemoto;
}

export type BdLocal = Dexie & {
  cargas: EntityTable<CargaLocal, "id">;
  fotos: EntityTable<FotoLocal, "id">;
  contexto: EntityTable<ContextoLocal, "clave">;
  perfil: EntityTable<PerfilCacheado, "clave">;
  catalogo: EntityTable<CatalogoCacheado, "clave">;
};

export function crearBd(nombre = "cuadreapp"): BdLocal {
  const bd = new Dexie(nombre) as BdLocal;
  bd.version(1).stores({
    cargas: "id, sincronizacion, creadaEn",
    fotos: "id, cargaId",
    contexto: "clave",
  });
  bd.version(2).stores({
    perfil: "clave",
    catalogo: "clave",
  });
  return bd;
}
