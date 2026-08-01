// Catálogo de la sede: llega del GET /api/v1/catalogo (con el alcance
// de la sesión del dispositivo) y se cachea en Dexie para operar
// offline. Este módulo solo define formas y la conversión del contrato
// remoto a las formas locales que usa el flujo — cero lógica de negocio.

import type { TipoMedidor } from "@cuadreapp/dominio";
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
  lat: number | null;
  lng: number | null;
  radioGeocercaM: number;
}

export interface CatalogoLocal {
  sede: SedeCatalogo;
  /** El piloto tiene un solo dispensador por sede; si llegan más, la UI elegirá. */
  dispensador: DispensadorCatalogo;
  equipos: EquipoCatalogo[];
  conductores: ConductorCatalogo[];
}

export function catalogoLocalDesdeRemoto(remoto: CatalogoRemoto): CatalogoLocal | null {
  const dispensador = remoto.dispensadores[0];
  if (!dispensador) return null;

  return {
    sede: {
      nombre: remoto.sede.nombre,
      lat: remoto.sede.lat,
      lng: remoto.sede.lng,
      radioGeocercaM: remoto.sede.radio_geocerca_m,
    },
    dispensador: {
      id: dispensador.id,
      nombre: dispensador.nombre,
      totConocidoGal: dispensador.tot_actual_gal,
      toleranciaTandaGal: dispensador.tolerancia_tanda_gal,
    },
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
