// Catálogo de la sede: llega del GET /api/v1/catalogo (con el alcance
// de la sesión del dispositivo) y se cachea en Dexie para operar
// offline. Este módulo solo define formas y la conversión del contrato
// remoto a las formas locales que usa el flujo — cero lógica de negocio.

import { esCodigoPerfil, PERFILES, type CodigoPerfil, type TipoMedidor } from "@cuadreapp/dominio";
import type { CatalogoRemoto } from "./contratos";

export interface DispensadorCatalogo {
  id: string;
  nombre: string;
  /** Último totalizador conocido por el servidor; el contexto local lo avanza. */
  totConocidoGal: number;
  toleranciaTandaGal: number;
}

export interface EquipoCatalogo {
  id: string;
  codigo: string;
  descripcion: string;
  tipoMedidor: TipoMedidor;
  ultimaLecturaConocida: number | null;
  capacidadTanqueGal: number | null;
}

export interface ConductorCatalogo {
  id: string;
  nombre: string;
  codigo: string;
  /** bcrypt; la verificación offline vive en seguridad/pin.ts */
  pinHash: string;
}

export interface SedeCatalogo {
  nombre: string;
  /** Identidad visible: «Planta Buga, Valle del Cauca» = nombre + ciudad. */
  ciudad: string | null;
  lat: number | null;
  lng: number | null;
  radioGeocercaM: number;
}

export interface ClienteCatalogo {
  /** Nombre visible: comercial si existe, si no la razón social. */
  nombre: string;
  /** URL firmada temporal del logo (DEC-017); los bytes se cachean aparte. */
  logoUrl: string | null;
  /** Identidad corporativa (DEC-018): acento de la app; null = CuadreApp. */
  colorPrimario: string | null;
}

export interface CatalogoLocal {
  /** Perfil Operativo del cliente (DEC-016): decide el flujo del wizard. */
  perfil: CodigoPerfil;
  cliente: ClienteCatalogo | null;
  sede: SedeCatalogo;
  /** Solo perfiles con medidor. El piloto tiene un dispensador por sede. */
  dispensador: DispensadorCatalogo | null;
  equipos: EquipoCatalogo[];
  conductores: ConductorCatalogo[];
}

export function catalogoLocalDesdeRemoto(remoto: CatalogoRemoto): CatalogoLocal | null {
  // Catálogos cacheados antes de la Etapa P no traen perfil: son de
  // El Trébol → medidor_doble (compatibilidad hacia atrás).
  const codigo = remoto.perfil?.codigo;
  const perfil: CodigoPerfil = codigo && esCodigoPerfil(codigo) ? codigo : "medidor_doble";

  const dispensador = remoto.dispensadores[0] ?? null;
  // Un perfil con medidor no puede operar sin dispensador (igual que
  // siempre); uno sin medidor no lo necesita.
  if (PERFILES[perfil].requiereMedidor && !dispensador) return null;

  return {
    perfil,
    cliente: remoto.cliente
      ? {
          nombre: remoto.cliente.nombre_comercial ?? remoto.cliente.nombre,
          logoUrl: remoto.cliente.logo_url,
          colorPrimario: remoto.cliente.color_primario ?? null,
        }
      : null,
    sede: {
      nombre: remoto.sede.nombre,
      ciudad: remoto.sede.ciudad ?? null,
      lat: remoto.sede.lat,
      lng: remoto.sede.lng,
      radioGeocercaM: remoto.sede.radio_geocerca_m,
    },
    dispensador: dispensador
      ? {
          id: dispensador.id,
          nombre: dispensador.nombre,
          totConocidoGal: dispensador.tot_actual_gal,
          toleranciaTandaGal: dispensador.tolerancia_tanda_gal,
        }
      : null,
    equipos: remoto.equipos.map((equipo) => ({
      id: equipo.id,
      codigo: equipo.codigo_interno,
      descripcion: equipo.descripcion ?? "",
      tipoMedidor: equipo.tipo_medidor as TipoMedidor,
      ultimaLecturaConocida: equipo.ultima_lectura,
      capacidadTanqueGal: equipo.capacidad_tanque_gal,
    })),
    conductores: remoto.conductores.map((conductor) => ({
      id: conductor.id,
      nombre: conductor.nombre,
      codigo: conductor.codigo,
      pinHash: conductor.pin_hash,
    })),
  };
}
