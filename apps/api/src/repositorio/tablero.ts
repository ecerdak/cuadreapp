// Contrato de persistencia del Dashboard de Cliente (Etapa P.2).
// Lecturas puras: agregados de reporte, cero reglas de negocio
// (DEC-011). El estado y las banderas de una carga NO se recalculan
// aquí — se leen tal como el dominio los decidió al registrarla.
//
// Todo método recibe el ALCANCE de la sesión (cliente + sede), jamás
// un identificador que venga del navegador. Ese es el aislamiento
// multiempresa: la consulta no puede nombrar otro cliente porque no
// hay parámetro por donde pedirlo.

import type { Bandera, CodigoPerfil, EstadoCarga } from "@cuadreapp/dominio";

/** Alcance efectivo de una sesión del tablero. `sedeId: null` = todas
 *  las sedes del cliente (usuario sin sede fija). */
export interface AlcanceTablero {
  clienteId: string;
  sedeId: string | null;
}

/** Ventana de tiempo de una consulta, en instantes ISO. */
export interface VentanaTablero {
  /** Medianoche de hoy en America/Bogota. */
  inicioHoy: string;
  /** Medianoche de hace 13 días (la ventana de 14 días con hoy). */
  desde14d: string;
  /** Medianoche de hace 6 días (la ventana de 7 días con hoy). */
  desde7d: string;
}

export interface SedeTablero {
  id: string;
  nombre: string;
  ciudad: string | null;
}

/** Identidad + perfil + alcance con que el tablero se compone al
 *  entrar. Es lo que responde el login: quién es la empresa. */
export interface ContextoTableroDatos {
  cliente: {
    id: string;
    /** Razón social. */
    nombre: string;
    nombreComercial: string | null;
    colorPrimario: string | null;
    colorSecundario: string | null;
    /** Clave del objeto en el bucket privado (DEC-017); la ruta HTTP
     *  la convierte en URL firmada — jamás sale tal cual. */
    logoClave: string | null;
  };
  perfil: { codigo: CodigoPerfil; nombre: string };
  /** Sedes que la sesión puede ver, ya filtradas por su alcance. */
  sedes: SedeTablero[];
  /** Medidor de la sede, para perfiles que lo tienen. null sin él. */
  medidor: { modelo: string; instalado: string } | null;
}

export interface CargaTablero {
  id: string;
  /** Fecha y hora LOCALES de la operación (no de llegada al servidor). */
  fecha: string;
  hora: string;
  equipoCodigo: string;
  equipoDescripcion: string | null;
  conductorNombre: string;
  /** Galones despachados por Lubryco — misma semántica en todo perfil. */
  galones: number;
  estado: EstadoCarga;
  banderas: Bandera[];
  /** Snapshot del perfil con el que nació la carga (DEC-016). */
  perfilCodigo: CodigoPerfil;
  /** Solo carga_inventario; null en medidor_doble. */
  llegadaGal: number | null;
  inventarioFinalGal: number | null;
  /** Capacidad del equipo al momento de leer — para el % de llenado. */
  capacidadEquipoGal: number | null;
  /** Tamaño del salto del totalizador, si lo hubo. El tablero lo usa
   *  para nombrar el problema sin pedir el detalle de la carga. */
  galNoRegistrados: number | null;
}

/** Balance del combustible del cliente. `existenciaEstimadaGal` y
 *  `autonomiaDias` van en null mientras no haya entregas registradas:
 *  sin línea base no se inventa una cifra que el supervisor no pueda
 *  auditar (la spec §: existencia = entregado − despachado +
 *  existencia_inicial, y esa inicial todavía no se administra). */
export interface BalanceTablero {
  entregadoTotalGal: number;
  despachadoTotalGal: number;
  consumoDiarioGal: number;
  existenciaEstimadaGal: number | null;
  autonomiaDias: number | null;
}

export interface HechosHoy {
  cargasDeHoy: CargaTablero[];
  consumo14d: Array<{ fecha: string; galones: number }>;
  /** Totalizador del medidor de la sede. null si la sede no tiene uno
   *  (perfiles sin medidor) o si el alcance abarca varias sedes. */
  totalizadorGal: number | null;
  /** Galones despachados sin equipo asignado en la ventana de 14 días. */
  galSinRegistrarGal: number;
  balance: BalanceTablero;
  /** Inventario del día para perfiles de carga sobre inventario. Se
   *  calcula siempre; el perfil decide si el tablero lo muestra. */
  inventarioHoy: {
    recibidoGal: number;
    despachadoGal: number;
    totalSalidaGal: number;
    capacidadGal: number | null;
  };
}

export interface PaginaCargasTablero {
  cargas: CargaTablero[];
  total: number;
  cuadran: number;
  sinFotoFinal: number;
  galSinRegistrarGal: number;
}

export interface DetalleCargaTablero {
  carga: CargaTablero;
  lecturas: {
    tandaInicial: number;
    totInicial: number;
    tandaFinal: number;
    totFinal: number;
  } | null;
  inventario: {
    llegadaGal: number;
    despachadosGal: number;
    totalSalidaGal: number;
  } | null;
  lecturaEquipo: number | null;
  tipoLectura: string | null;
  duracionSegundos: number;
  galNoRegistrados: number | null;
  notas: string | null;
  fotos: Array<{ momento: string; ruta: string }>;
}

export interface EquipoTablero {
  codigo: string;
  descripcion: string | null;
  categoria: string | null;
  tipoMedidor: string;
  capacidadTanqueGal: number | null;
  /** Galones del período (7 días). */
  galonesPeriodoGal: number;
  /** Avance del horómetro/odómetro en el período; null sin contador. */
  usoPeriodo: number | null;
  /** Galones por unidad de uso en el período; null sin contador. */
  rendimiento: number | null;
  /** Mediana histórica del mismo rendimiento; base del desvío. */
  medianaHistorica: number | null;
  /** Último inventario final registrado del equipo (carga_inventario). */
  ultimoInventarioGal: number | null;
}

export interface EntregaTablero {
  numeroRemision: string;
  fecha: string;
  galones: number;
  placaCarrotanque: string | null;
  recibidoPor: string | null;
}

export interface SuministroTablero {
  entregas: EntregaTablero[];
  balance: BalanceTablero;
}

export interface RepositorioTablero {
  /** null si el usuario tiene cliente pero el cliente no existe o está
   *  inactivo (cuenta desactivada mientras la sesión seguía viva). */
  contexto(alcance: AlcanceTablero): Promise<ContextoTableroDatos | null>;
  hoy(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<HechosHoy>;
  cargas(
    alcance: AlcanceTablero,
    filtro: { estado?: EstadoCarga; desde: string },
  ): Promise<PaginaCargasTablero>;
  /** null si la carga no existe O no es del cliente del alcance —
   *  indistinguibles a propósito: sin oráculo de existencia. */
  detalleCarga(alcance: AlcanceTablero, id: string): Promise<DetalleCargaTablero | null>;
  equipos(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<EquipoTablero[]>;
  suministro(alcance: AlcanceTablero, ventana: VentanaTablero): Promise<SuministroTablero>;
  /** Sedes activas del cliente, para validar una sede pedida por el
   *  cliente HTTP antes de usarla en una consulta. */
  sedePerteneceACliente(clienteId: string, sedeId: string): Promise<boolean>;
}
