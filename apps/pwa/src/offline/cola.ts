// Cola offline (spec §10): el registro se arma completo, se valida con
// el dominio y se guarda aquí; un sincronizador lo sube después. Este
// módulo no contiene reglas de negocio — solo colas, contexto local y
// contabilidad de reintentos.

import type { ContextoValidacion, ResultadoValidacion } from "@cuadreapp/dominio";
import type { BdLocal, CargaLocal, PayloadCarga, VeredictoServidor } from "./bd";
import type { DispensadorCatalogo, EquipoCatalogo, SedeCatalogo } from "../datos/catalogo";

const RETRASO_BASE_MS = 1_000;
const RETRASO_TOPE_MS = 5 * 60 * 1_000; // spec §10.5: backoff exponencial, tope 5 minutos

export function retrasoReintento(intentos: number): number {
  return Math.min(RETRASO_BASE_MS * 2 ** intentos, RETRASO_TOPE_MS);
}

export interface EntradaCola {
  payload: PayloadCarga;
  veredicto: ResultadoValidacion;
  resumen: CargaLocal["resumen"];
  fotos: { inicial: { bytes: ArrayBuffer; tipo: string } | null; final: { bytes: ArrayBuffer; tipo: string } | null };
  creadaEn?: string;
}

export async function encolarCarga(bd: BdLocal, entrada: EntradaCola): Promise<void> {
  const { payload, veredicto } = entrada;
  const creadaEn = entrada.creadaEn ?? new Date().toISOString();

  await bd.transaction("rw", [bd.cargas, bd.fotos, bd.contexto], async () => {
    await bd.cargas.put({
      id: payload.id,
      creadaEn,
      payload,
      resumen: entrada.resumen,
      estadoLocal: veredicto.estado,
      banderasLocales: veredicto.banderas,
      sincronizacion: "pendiente",
      intentos: 0,
      proximoIntentoEn: null,
      ultimoError: null,
      veredictoServidor: null,
    });

    for (const momento of ["inicial", "final"] as const) {
      const foto = entrada.fotos[momento];
      if (foto) {
        await bd.fotos.put({ id: `${payload.id}:${momento}`, cargaId: payload.id, momento, ...foto });
      }
    }

    // Avanzar el contexto local — espejo del comportamiento del servidor
    // (el totalizador solo hacia adelante), para que la SIGUIENTE carga
    // valide bien aunque siga sin haber señal.
    const claveDispensador = `dispensador:${payload.dispensador_id}`;
    const dispensador = await bd.contexto.get(claveDispensador);
    if (!dispensador || (dispensador.totActualGal ?? 0) < payload.tot_final_gal) {
      await bd.contexto.put({ clave: claveDispensador, totActualGal: payload.tot_final_gal });
    }

    const claveEquipo = `equipo:${payload.equipo_id}`;
    const equipo = await bd.contexto.get(claveEquipo);
    await bd.contexto.put({
      clave: claveEquipo,
      ultimaLectura: payload.lectura_equipo ?? equipo?.ultimaLectura ?? null,
      ultimaCargaFinalizadaEn: payload.finalizada_en,
    });
  });
}

/** Arma el ContextoValidacion del dominio: contexto local si existe,
 *  valores del catálogo como punto de partida. */
export async function obtenerContextoValidacion(
  bd: BdLocal,
  dispensador: DispensadorCatalogo,
  equipo: EquipoCatalogo,
  sede: SedeCatalogo,
): Promise<ContextoValidacion> {
  const contextoDispensador = await bd.contexto.get(`dispensador:${dispensador.id}`);
  const contextoEquipo = await bd.contexto.get(`equipo:${equipo.id}`);
  return {
    dispensador: {
      totActualGal: contextoDispensador?.totActualGal ?? dispensador.totConocidoGal,
      toleranciaTandaGal: dispensador.toleranciaTandaGal,
    },
    equipo: {
      tipoMedidor: equipo.tipoMedidor,
      ultimaLectura: contextoEquipo?.ultimaLectura ?? equipo.ultimaLecturaConocida,
      capacidadTanqueGal: equipo.capacidadTanqueGal,
      ultimaCargaFinalizadaEn: contextoEquipo?.ultimaCargaFinalizadaEn ?? null,
    },
    sede: { lat: sede.lat, lng: sede.lng, radioGeocercaM: sede.radioGeocercaM },
  };
}

export async function pendientesListas(bd: BdLocal, ahora: Date): Promise<CargaLocal[]> {
  const pendientes = await bd.cargas.where("sincronizacion").equals("pendiente").sortBy("creadaEn");
  const limite = ahora.toISOString();
  return pendientes.filter((carga) => carga.proximoIntentoEn === null || carga.proximoIntentoEn <= limite);
}

export async function contarPendientes(bd: BdLocal): Promise<number> {
  return bd.cargas.where("sincronizacion").equals("pendiente").count();
}

export async function marcarSincronizada(bd: BdLocal, id: string, veredicto: VeredictoServidor): Promise<void> {
  await bd.cargas.update(id, {
    sincronizacion: "sincronizada",
    veredictoServidor: veredicto,
    ultimoError: null,
    proximoIntentoEn: null,
  });
}

export async function marcarErrorDefinitivo(bd: BdLocal, id: string, detalle: string): Promise<void> {
  await bd.cargas.update(id, { sincronizacion: "error_definitivo", ultimoError: detalle });
}

export async function registrarFalloReintentable(bd: BdLocal, id: string, detalle: string, ahora: Date): Promise<void> {
  const carga = await bd.cargas.get(id);
  if (!carga) return;
  const intentos = carga.intentos + 1;
  await bd.cargas.update(id, {
    intentos,
    ultimoError: detalle,
    proximoIntentoEn: new Date(ahora.getTime() + retrasoReintento(intentos)).toISOString(),
  });
}
