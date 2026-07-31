// CATÁLOGO DE DEMOSTRACIÓN — TEMPORAL.
//
// El catálogo real (equipos, conductores, dispensador de la sede) debe
// llegar por el enrolamiento del dispositivo y un endpoint de lectura
// de la API, que se implementan en la fase de autenticación. Hasta
// entonces la PWA opera con estos datos, que reflejan la forma del
// seed de demostración (supabase/seed.sql). Los uuid deben existir en
// la base contra la que apunte la API para que el POST no responda 404.

import type { TipoMedidor } from "@cuadreapp/dominio";

export interface DispensadorCatalogo {
  id: string;
  nombre: string;
  /** Último totalizador conocido al enrolar; el contexto local lo va avanzando. */
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
  /** Demo: PIN plano. Con el catálogo real llega el hash y la verificación via API. */
  pin: string;
}

export interface SedeCatalogo {
  nombre: string;
  lat: number | null;
  lng: number | null;
  radioGeocercaM: number;
}

export const CATALOGO_DEMO = {
  sede: { nombre: "Planta Buga", lat: null, lng: null, radioGeocercaM: 150 } as SedeCatalogo,
  dispensador: {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Isla 1",
    totConocidoGal: 1200.0,
    toleranciaTandaGal: 1.0,
  } as DispensadorCatalogo,
  equipos: [
    { id: "21111111-1111-4111-8111-111111111111", codigo: "T-01", descripcion: "Tractor Massey Ferguson 4275", tipoMedidor: "horometro", ultimaLecturaConocida: null, capacidadTanqueGal: 80.0 },
    { id: "22111111-1111-4111-8111-111111111111", codigo: "T-04", descripcion: "Tractor Massey Ferguson 4292", tipoMedidor: "horometro", ultimaLecturaConocida: null, capacidadTanqueGal: 80.0 },
    { id: "23111111-1111-4111-8111-111111111111", codigo: "AL-01", descripcion: "Alzadora de caña", tipoMedidor: "horometro", ultimaLecturaConocida: null, capacidadTanqueGal: 100.0 },
    { id: "24111111-1111-4111-8111-111111111111", codigo: "C-01", descripcion: "Camión Kenworth", tipoMedidor: "odometro", ultimaLecturaConocida: null, capacidadTanqueGal: 150.0 },
    { id: "25111111-1111-4111-8111-111111111111", codigo: "P-01", descripcion: "Pickup Toyota Hilux", tipoMedidor: "odometro", ultimaLecturaConocida: null, capacidadTanqueGal: 60.0 },
  ] as EquipoCatalogo[],
  conductores: [
    { id: "31111111-1111-4111-8111-111111111111", nombre: "Duván Bonilla", codigo: "07", pin: "0000" },
    { id: "32111111-1111-4111-8111-111111111111", nombre: "Jhon Cortés", codigo: "03", pin: "0000" },
    { id: "33111111-1111-4111-8111-111111111111", nombre: "María Fernanda Ríos", codigo: "11", pin: "0000" },
  ] as ConductorCatalogo[],
};
