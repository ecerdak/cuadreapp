// Fake en memoria del RepositorioTablero + sesiones de supervisor para
// las pruebas del Dashboard de Cliente. Mismo contrato que Postgres,
// cero base de datos.
//
// El fake guarda datos de DOS clientes a propósito: las pruebas de
// aislamiento necesitan que exista información ajena que filtrar. Un
// fake con un solo cliente no puede demostrar multiempresa.

import type { CodigoPerfil, EstadoCarga } from "@cuadreapp/dominio";
import type { SesionAutenticada } from "../seguridad/tipos.js";
import type {
  AlcanceTablero,
  BalanceTablero,
  CargaTablero,
  ContextoTableroDatos,
  DetalleCargaTablero,
  EquipoTablero,
  EntregaTablero,
  HechosHoy,
  PaginaCargasTablero,
  RepositorioTablero,
  SuministroTablero,
} from "../repositorio/tablero.js";

export const ID_CLIENTE_A = "c1a11111-2222-4333-8444-555566667777";
export const ID_CLIENTE_B = "c1b11111-2222-4333-8444-555566667777";
export const ID_SEDE_A1 = "5ed11111-2222-4333-8444-555566667777";
export const ID_SEDE_A2 = "5ed22222-2222-4333-8444-555566667777";
export const ID_SEDE_B1 = "5edb1111-2222-4333-8444-555566667777";
export const ID_SUPERVISOR = "50a11111-2222-4333-8444-555566667777";
export const ID_CARGA_A = "ca011111-2222-4333-8444-555566667777";
export const ID_CARGA_B = "cb011111-2222-4333-8444-555566667777";

/** Supervisor del cliente A sin sede fija: ve todas las sedes de A. */
export function sesionSupervisor(sobre: Partial<SesionAutenticada> = {}): SesionAutenticada {
  return {
    usuarioId: ID_SUPERVISOR,
    nombre: "Supervisora de planta",
    rol: "supervisor",
    clienteId: ID_CLIENTE_A,
    sedeId: null,
    permisos: ["catalogo.leer", "tablero.leer"],
    perfil: "medidor_doble",
    ...sobre,
  };
}

export function cargaFalsa(sobre: Partial<CargaTablero> = {}): CargaTablero {
  return {
    id: ID_CARGA_A,
    fecha: "2026-08-05",
    hora: "06:12",
    equipoCodigo: "T-04",
    equipoDescripcion: "Tractor Massey Ferguson 4292",
    conductorNombre: "Duván Bonilla",
    galones: 42.5,
    estado: "ok",
    banderas: [],
    perfilCodigo: "medidor_doble",
    llegadaGal: null,
    inventarioFinalGal: null,
    capacidadEquipoGal: 80,
    ...sobre,
  };
}

const BALANCE_VACIO: BalanceTablero = {
  entregadoTotalGal: 0,
  despachadoTotalGal: 0,
  consumoDiarioGal: 0,
  existenciaEstimadaGal: null,
  autonomiaDias: null,
};

interface DatosCliente {
  contexto: ContextoTableroDatos;
  cargas: CargaTablero[];
  detalles: Map<string, DetalleCargaTablero>;
  equipos: EquipoTablero[];
  entregas: EntregaTablero[];
  balance: BalanceTablero;
}

function clienteFalso(
  id: string,
  nombre: string,
  perfil: CodigoPerfil,
  sedes: Array<{ id: string; nombre: string; ciudad: string | null }>,
): DatosCliente {
  return {
    contexto: {
      cliente: {
        id,
        nombre,
        nombreComercial: nombre,
        colorPrimario: "#1E9B4B",
        colorSecundario: "#0E5C2C",
        logoClave: `clientes/${id}/logo.webp`,
      },
      perfil: {
        codigo: perfil,
        nombre: perfil === "medidor_doble" ? "Medidor Doble" : "Carga sobre Inventario",
      },
      sedes,
      medidor:
        perfil === "medidor_doble" ? { modelo: "Fill-Rite Serie 900", instalado: "2026-07-06" } : null,
    },
    cargas: [],
    detalles: new Map(),
    equipos: [],
    entregas: [],
    balance: { ...BALANCE_VACIO },
  };
}

export class RepositorioTableroFalso implements RepositorioTablero {
  /** Datos por cliente. El fake NUNCA cruza claves: si una consulta
   *  devuelve algo de otro cliente, es porque la ruta pasó mal el
   *  alcance — que es justo lo que las pruebas buscan. */
  readonly datos = new Map<string, DatosCliente>([
    [
      ID_CLIENTE_A,
      clienteFalso(ID_CLIENTE_A, "Cliente A", "medidor_doble", [
        { id: ID_SEDE_A1, nombre: "Planta Norte", ciudad: "Buga" },
        { id: ID_SEDE_A2, nombre: "Planta Sur", ciudad: "Palmira" },
      ]),
    ],
    [
      ID_CLIENTE_B,
      clienteFalso(ID_CLIENTE_B, "Cliente B", "carga_inventario", [
        { id: ID_SEDE_B1, nombre: "EDS Buga", ciudad: "Buga" },
      ]),
    ],
  ]);

  /** Clientes desactivados: `contexto` responde null. */
  inactivos = new Set<string>();

  totalizadorGal: number | null = 1889.5;

  /** Alcances con los que la ruta llamó al repositorio. Las pruebas de
   *  aislamiento verifican aquí que el cliente_id salió de la sesión. */
  readonly alcancesRecibidos: AlcanceTablero[] = [];

  private de(alcance: AlcanceTablero): DatosCliente | null {
    this.alcancesRecibidos.push(alcance);
    return this.datos.get(alcance.clienteId) ?? null;
  }

  async contexto(alcance: AlcanceTablero): Promise<ContextoTableroDatos | null> {
    const datos = this.de(alcance);
    if (!datos || this.inactivos.has(alcance.clienteId)) return null;
    return {
      ...datos.contexto,
      sedes: datos.contexto.sedes.filter(
        (sede) => alcance.sedeId === null || sede.id === alcance.sedeId,
      ),
    };
  }

  async hoy(alcance: AlcanceTablero): Promise<HechosHoy> {
    const datos = this.de(alcance);
    const cargas = datos?.cargas ?? [];
    const inventario = cargas.filter((carga) => carga.llegadaGal !== null);
    return {
      cargasDeHoy: cargas,
      consumo14d: cargas.map((carga) => ({ fecha: carga.fecha, galones: carga.galones })),
      totalizadorGal: this.totalizadorGal,
      galSinRegistrarGal: 18,
      balance: datos?.balance ?? { ...BALANCE_VACIO },
      inventarioHoy: {
        recibidoGal: inventario.reduce((suma, carga) => suma + (carga.llegadaGal ?? 0), 0),
        despachadoGal: inventario.reduce((suma, carga) => suma + carga.galones, 0),
        totalSalidaGal: inventario.reduce((suma, carga) => suma + (carga.inventarioFinalGal ?? 0), 0),
        capacidadGal: inventario.length > 0 ? 1000 : null,
      },
    };
  }

  async cargas(alcance: AlcanceTablero, filtro: { estado?: EstadoCarga }): Promise<PaginaCargasTablero> {
    const todas = this.de(alcance)?.cargas ?? [];
    const filtradas = filtro.estado ? todas.filter((carga) => carga.estado === filtro.estado) : todas;
    return {
      cargas: filtradas,
      total: todas.length,
      cuadran: todas.filter((carga) => carga.estado === "ok").length,
      sinFotoFinal: todas.filter((carga) => carga.banderas.includes("FOTO_FALTANTE")).length,
      galSinRegistrarGal: 18,
    };
  }

  async detalleCarga(alcance: AlcanceTablero, id: string): Promise<DetalleCargaTablero | null> {
    return this.de(alcance)?.detalles.get(id) ?? null;
  }

  async equipos(alcance: AlcanceTablero): Promise<EquipoTablero[]> {
    return this.de(alcance)?.equipos ?? [];
  }

  async suministro(alcance: AlcanceTablero): Promise<SuministroTablero> {
    const datos = this.de(alcance);
    return {
      entregas: datos?.entregas ?? [],
      balance: datos?.balance ?? { ...BALANCE_VACIO },
    };
  }

  async sedePerteneceACliente(clienteId: string, sedeId: string): Promise<boolean> {
    return (this.datos.get(clienteId)?.contexto.sedes ?? []).some((sede) => sede.id === sedeId);
  }

  /* ---- ayudantes de siembra para las pruebas ---- */

  sembrarCarga(clienteId: string, carga: CargaTablero, detalle?: Partial<DetalleCargaTablero>): void {
    const datos = this.datos.get(clienteId)!;
    datos.cargas.push(carga);
    datos.detalles.set(carga.id, {
      carga,
      lecturas:
        carga.llegadaGal === null
          ? { tandaInicial: 0, totInicial: 1847, tandaFinal: carga.galones, totFinal: 1889.5 }
          : null,
      inventario:
        carga.llegadaGal === null
          ? null
          : {
              llegadaGal: carga.llegadaGal,
              despachadosGal: carga.galones,
              totalSalidaGal: carga.inventarioFinalGal ?? 0,
            },
      lecturaEquipo: 1093,
      tipoLectura: "horometro",
      duracionSegundos: 312,
      galNoRegistrados: null,
      notas: null,
      fotos: [{ momento: "inicial", ruta: `fotos/${carga.id}-inicial.webp` }],
      ...detalle,
    });
  }
}
