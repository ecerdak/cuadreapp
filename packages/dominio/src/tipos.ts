// Tipos del dominio de validación de cargas.
// Referencia: docs/ESPEC_App_Cuadre_Lubryco.md §6 (esquema) y §7 (reglas).

export type Bandera =
  | "TANDA_NO_RESETEADA" // R1
  | "SALTO_TOTALIZADOR" // R2
  | "TANDA_NO_CUADRA" // R3
  | "TOTALIZADOR_RETROCEDE" // R4
  | "SIN_DESPACHO" // R5
  | "EXCEDE_CAPACIDAD" // R6
  | "CONTADOR_RETROCEDE" // R7
  | "SALTO_CONTADOR" // R8
  | "FOTO_FALTANTE" // R9
  | "FUERA_DE_SEDE" // R10
  | "POSIBLE_DUPLICADO" // R11
  | "TIEMPO_ATIPICO"; // R12

export type EstadoCarga = "ok" | "advertencia" | "inconsistente";

export type ClaseMarca = "advertencia" | "inconsistente";

export type OrigenCarga = "app" | "papel_retro" | "correccion";

export type TipoMedidor = "horometro" | "odometro" | "ninguno";

/** Lo que el conductor capturó en el dispositivo. Galones con una decimal. */
export interface RegistroCarga {
  tandaInicialGal: number;
  totInicialGal: number;
  tandaFinalGal: number;
  totFinalGal: number;
  /** Horómetro u odómetro del equipo; null si no aplica o no se capturó. */
  lecturaEquipo: number | null;
  iniciadaEn: string | Date;
  finalizadaEn: string | Date;
  lat: number | null;
  lng: number | null;
  origen: OrigenCarga;
  /** La foto existe y fue tomada con cámara en vivo (nunca galería). */
  fotoInicial: boolean;
  fotoFinal: boolean;
}

/** El estado del mundo contra el que se valida, según quien evalúa
 *  (el dispositivo usa su último dato conocido; la API usa la base real). */
export interface ContextoValidacion {
  dispensador: {
    totActualGal: number;
    toleranciaTandaGal: number;
  };
  equipo: {
    tipoMedidor: TipoMedidor;
    ultimaLectura: number | null;
    capacidadTanqueGal: number | null;
    ultimaCargaFinalizadaEn: string | Date | null;
  };
  sede: {
    lat: number | null;
    lng: number | null;
    radioGeocercaM: number;
  };
}

/** Resultado de evaluar una regla individual. null = la regla pasó o no aplica. */
export interface MarcaRegla {
  bandera: Bandera;
  clase: ClaseMarca;
  /** R1: el conductor debe dejar una nota explicando. */
  exigeNota?: boolean;
  /** R4: la UI no deja avanzar hasta corregir. */
  bloqueaAvance?: boolean;
  /** R9: la UI no deja cerrar el registro. */
  bloqueaCierre?: boolean;
  /** R2: tamaño del salto (tot_inicial − tot_actual). Puede ser negativo. */
  galNoRegistrados?: number;
}

export interface ResultadoValidacion {
  estado: EstadoCarga;
  banderas: Bandera[];
  marcas: MarcaRegla[];
  galNoRegistrados: number | null;
  exigeNota: boolean;
  bloqueaAvance: boolean;
  bloqueaCierre: boolean;
}
