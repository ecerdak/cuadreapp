// Tipos del dominio de validación de cargas.
// Referencia: docs/ESPEC_App_Cuadre_Lubryco.md §6 (esquema) y §7 (reglas).

export type Bandera =
  | "TANDA_NO_RESETEADA" // R1
  | "SALTO_TOTALIZADOR" // R2: el totalizador arrancó por encima del último conocido
  | "SALTO_TOTALIZADOR_NEGATIVO" // R2: arrancó por debajo — mensaje distinto en la UI
  | "TANDA_NO_CUADRA" // R3
  | "TOTALIZADOR_RETROCEDE" // R4: retrocedió de verdad
  | "TOTALIZADOR_SIN_AVANCE" // R4: no se movió — mensaje distinto en la UI
  | "SIN_DESPACHO" // R5
  | "EXCEDE_CAPACIDAD" // R6
  | "CONTADOR_RETROCEDE" // R7
  | "SALTO_CONTADOR" // R8
  | "FOTO_FALTANTE" // R9
  | "FUERA_DE_SEDE" // R10
  | "SIN_GPS" // R10: no fue posible validar la geocerca — informativa
  | "POSIBLE_DUPLICADO" // R11
  | "TIEMPO_ATIPICO"; // R12

export type EstadoCarga = "ok" | "advertencia" | "inconsistente";

/** 'info' no afecta el estado de la carga: solo deja constancia. */
export type ClaseMarca = "info" | "advertencia" | "inconsistente";

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

/* ============================================================
   Perfiles Operativos (DEC-016)
   ============================================================ */

/** Códigos congelados de los perfiles. El nombre visible vive en el
 *  catálogo (`perfiles_operativos`) y en PERFILES; el código, aquí. */
export const CODIGOS_PERFIL = ["medidor_doble", "carga_inventario"] as const;
export type CodigoPerfil = (typeof CODIGOS_PERFIL)[number];

/* ------------------------------------------------------------
   Vocabulario del tablero del cliente (DEC-016, cuarto punto de
   despacho). El perfil DECLARA qué se muestra; el Dashboard solo
   sabe dibujar cada pieza de este vocabulario. Un perfil nuevo se
   compone con estas piezas sin tocar el Dashboard; una pieza nueva
   es una entrada aquí más su componente — jamás un condicional.
   ------------------------------------------------------------ */

/** Secciones de primer nivel (pestañas) del tablero. */
export const MODULOS_TABLERO = ["hoy", "cargas", "equipos", "suministro"] as const;
export type ModuloTablero = (typeof MODULOS_TABLERO)[number];

/** Paneles de la pestaña «Hoy», en el orden en que se pintan. */
export const PANELES_HOY = ["totalizador", "inventario", "consumo", "cargas_del_dia"] as const;
export type PanelHoy = (typeof PANELES_HOY)[number];

/** Columnas de cifras de la tabla de cargas propias del perfil. */
export const COLUMNAS_CARGA = ["galones", "llegada", "total_salida", "llenado"] as const;
export type ColumnaCarga = (typeof COLUMNAS_CARGA)[number];

/** Vista de evidencia de UNA carga. Se elige por el perfil con el que
 *  nació la carga (snapshot), nunca por el perfil actual del cliente. */
export const VISTAS_EVIDENCIA = ["medidor", "inventario"] as const;
export type VistaEvidencia = (typeof VISTAS_EVIDENCIA)[number];

/** Lo que el tablero necesita saber de un perfil para componerse. */
export interface ComposicionTablero {
  modulos: readonly ModuloTablero[];
  panelesHoy: readonly PanelHoy[];
  columnasCargas: readonly ColumnaCarga[];
  vistaEvidencia: VistaEvidencia;
}

/** Lo que el operador capturó en el perfil «Carga sobre Inventario»:
 *  con cuántos galones llegó el carrotanque y cuántos despachó
 *  Lubryco. El inventario final NUNCA se captura — se calcula. */
export interface RegistroCargaInventario {
  llegadaGal: number;
  despachadosGal: number;
  iniciadaEn: string | Date;
  finalizadaEn: string | Date;
  lat: number | null;
  lng: number | null;
  origen: OrigenCarga;
  /** La foto existe y fue tomada con cámara en vivo (nunca galería). */
  fotoInicial: boolean;
  fotoFinal: boolean;
}

/** Estado del mundo del perfil «Carga sobre Inventario»: no hay
 *  dispensador ni contador del equipo — solo capacidad y geocerca. */
export interface ContextoInventario {
  equipo: {
    capacidadTanqueGal: number | null;
    ultimaCargaFinalizadaEn: string | Date | null;
  };
  sede: {
    lat: number | null;
    lng: number | null;
    radioGeocercaM: number;
  };
}

/** Mismo sobre común de veredicto que ResultadoValidacion, más el
 *  cálculo propio del perfil. La API y la PWA tratan ambos igual. */
export interface ResultadoInventario extends ResultadoValidacion {
  /** llegada + despachados, con una decimal. La base lo garantiza con
   *  una columna generada; este valor es para feedback y respuesta. */
  inventarioFinalGal: number;
}
