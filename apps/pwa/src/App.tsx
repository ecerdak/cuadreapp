// Raíz de la PWA: primero el estado de la SESIÓN del dispositivo
// (Etapa S), después la máquina de estados del flujo del conductor
// (spec §8.1, 7 pasos). Ningún componente toca tokens (DEC-014): la
// sesión se maneja vía ServicioSesion y el catálogo llega cacheado en
// Dexie. La única autoridad de negocio invocada es el dominio.

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { validarCarga, type ContextoValidacion, type RegistroCarga } from "@cuadreapp/dominio";
import type { BdLocal, PayloadCarga } from "./offline/bd";
import { contarPendientes, encolarCarga, obtenerContextoValidacion } from "./offline/cola";
import { procesarPendientes, type ClienteApi } from "./offline/sincronizador";
import {
  catalogoLocalDesdeRemoto,
  type CatalogoLocal,
  type ConductorCatalogo,
  type EquipoCatalogo,
} from "./datos/catalogo";
import type { ServicioSesion } from "./seguridad/sesion";
import { almacenamientoEsPersistente } from "./seguridad/persistencia";
import { capturarGps, type PosicionCapturada } from "./captura/gps";
import { aNumero, formatearGal } from "./ui/numeros";
import { fechaLocalDe, fechaLocalHoy } from "./ui/fechas";
import { MENSAJES_BANDERA } from "./ui/mensajes";
import { Aviso, BotonPrincipal, Pantalla } from "./ui/basicos";
import { obtenerDeviceId, VERSION_APP } from "./config";
import { Inicio } from "./pantallas/Inicio";
import { Equipo } from "./pantallas/Equipo";
import { Conductor } from "./pantallas/Conductor";
import { AntesDeCargar } from "./pantallas/AntesDeCargar";
import { Cargando } from "./pantallas/Cargando";
import { DespuesDeCargar } from "./pantallas/DespuesDeCargar";
import { Listo } from "./pantallas/Listo";
import { Enrolar } from "./pantallas/Enrolar";
import { marcasAntesDeCargar } from "./flujo/en-vivo";

type EstadoSesion = "cargando" | "sin_enrolar" | "activa" | "offline" | "vencida";

type Paso = "inicio" | "equipo" | "conductor" | "antes" | "cargando" | "despues" | "listo";

interface Foto {
  bytes: ArrayBuffer;
  tipo: string;
}

interface Borrador {
  equipo: EquipoCatalogo | null;
  conductor: ConductorCatalogo | null;
  tandaInicial: string;
  totInicial: string;
  fotoInicial: Foto | null;
  gps: PosicionCapturada | null;
  iniciadaEn: string | null;
  tandaFinal: string;
  totFinal: string;
  lecturaEquipo: string;
  fotoFinal: Foto | null;
  nota: string;
  finalizadaEn: string | null;
}

const borradorVacio = (): Borrador => ({
  equipo: null,
  conductor: null,
  tandaInicial: "0,0",
  totInicial: "",
  fotoInicial: null,
  gps: null,
  iniciadaEn: null,
  tandaFinal: "",
  totFinal: "",
  lecturaEquipo: "",
  fotoFinal: null,
  nota: "",
  finalizadaEn: null,
});

export function App(props: { bd: BdLocal; api: ClienteApi; sesion: ServicioSesion }) {
  const { bd, api, sesion } = props;

  const [estadoSesion, setEstadoSesion] = useState<EstadoSesion>("cargando");
  const [paso, setPaso] = useState<Paso>("inicio");
  const [borrador, setBorrador] = useState<Borrador>(borradorVacio);
  const [contexto, setContexto] = useState<ContextoValidacion | null>(null);
  const [idReciente, setIdReciente] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [almacenEnRiesgo, setAlmacenEnRiesgo] = useState(false);

  // RC1-A3: si el navegador niega la persistencia, la cola puede
  // purgarse — el conductor debe saberlo.
  useEffect(() => {
    void almacenamientoEsPersistente().then((estado) => setAlmacenEnRiesgo(estado === false));
  }, []);

  // Recuperación de sesión al abrir + escucha de "sesión vencida" que
  // emite el cliente HTTP único cuando el refresh es rechazado.
  useEffect(() => {
    void sesion.recuperar().then((estado) => {
      setEstadoSesion(
        estado === "sin_sesion" ? "sin_enrolar" : estado === "offline" ? "offline" : "activa",
      );
    });
    const alVencer = () => setEstadoSesion("vencida");
    window.addEventListener("cuadreapp:sesion-vencida", alVencer);
    return () => window.removeEventListener("cuadreapp:sesion-vencida", alVencer);
  }, [sesion]);

  const catalogoCacheado = useLiveQuery(() => bd.catalogo.get("catalogo"));
  const catalogo: CatalogoLocal | null = catalogoCacheado
    ? catalogoLocalDesdeRemoto(catalogoCacheado.datos)
    : null;

  // RC1-A2: el "hoy" del negocio es America/Bogota, no UTC (spec §13).
  const hoy = fechaLocalHoy();
  const cargasHoy =
    useLiveQuery(async () => {
      const todas = await bd.cargas.orderBy("creadaEn").reverse().limit(50).toArray();
      return todas.filter((carga) => fechaLocalDe(carga.creadaEn) === hoy);
    }, [hoy]) ?? [];
  const pendientes = useLiveQuery(() => contarPendientes(bd)) ?? 0;
  const erroresDefinitivos =
    useLiveQuery(() => bd.cargas.where("sincronizacion").equals("error_definitivo").count()) ?? 0;
  const cargaReciente = useLiveQuery(
    () => (idReciente ? bd.cargas.get(idReciente) : undefined),
    [idReciente],
  );

  const cambiar = (cambios: Partial<Borrador>) => setBorrador((actual) => ({ ...actual, ...cambios }));

  /* ============ Puertas de sesión (antes del flujo de carga) ============ */

  if (estadoSesion === "cargando") {
    return (
      <Pantalla titulo="CuadreApp">
        <p className="text-[#8AA0B6]">Recuperando sesión…</p>
      </Pantalla>
    );
  }

  if (estadoSesion === "sin_enrolar" || estadoSesion === "vencida") {
    return (
      <>
        {estadoSesion === "vencida" ? (
          <div className="mx-auto max-w-md p-4 pb-0">
            <Aviso tipo="advertencia">
              La sesión de este dispositivo venció o fue revocada. Las cargas guardadas siguen en el
              equipo y se subirán al re-enrolar.
            </Aviso>
          </div>
        ) : null}
        <Enrolar
          onEnrolar={async (codigo, nombre) => {
            const resultado = await sesion.enrolar(codigo, nombre);
            if (resultado.ok) setEstadoSesion("activa");
            return resultado.ok ? { ok: true } : { ok: false, detalle: resultado.detalle };
          }}
        />
      </>
    );
  }

  if (!catalogo) {
    return (
      <Pantalla titulo="Falta el catálogo">
        <p className="text-[#8AA0B6]">
          Este dispositivo aún no tiene el catálogo de la estación (equipos y conductores). Se necesita
          señal una vez para descargarlo.
        </p>
        <BotonPrincipal
          onClick={() =>
            void sesion.refrescarCatalogo().then((ok) => {
              if (!ok) setAviso("No se pudo descargar el catálogo. Revisa la señal.");
            })
          }
        >
          Reintentar
        </BotonPrincipal>
        {aviso ? <Aviso tipo="advertencia">{aviso}</Aviso> : null}
      </Pantalla>
    );
  }

  /* ============ Flujo del conductor (7 pasos) ============ */

  async function seleccionarEquipo(equipo: EquipoCatalogo) {
    const contextoNuevo = await obtenerContextoValidacion(
      bd,
      catalogo!.dispensador,
      equipo,
      catalogo!.sede,
    );
    setContexto(contextoNuevo);
    cambiar({ equipo, totInicial: formatearGal(contextoNuevo.dispensador.totActualGal) });
    setPaso("conductor");
    void capturarGps().then((gps) => cambiar({ gps }));
  }

  const exigeNota = (() => {
    if (!contexto) return false;
    const tanda = aNumero(borrador.tandaInicial);
    const tot = aNumero(borrador.totInicial);
    if (tanda === null || tot === null) return false;
    return marcasAntesDeCargar({ tandaInicialGal: tanda, totInicialGal: tot }, contexto).some(
      (marca) => marca.exigeNota === true,
    );
  })();

  async function guardar() {
    if (!contexto || !borrador.equipo || !borrador.conductor || !borrador.iniciadaEn) return;
    setAviso(null);

    const tandaInicial = aNumero(borrador.tandaInicial);
    const totInicial = aNumero(borrador.totInicial);
    const tandaFinal = aNumero(borrador.tandaFinal);
    const totFinal = aNumero(borrador.totFinal);
    if (tandaInicial === null || totInicial === null || tandaFinal === null || totFinal === null) {
      setAviso("Revisa los números: hay campos vacíos o inválidos.");
      return;
    }
    const lectura = borrador.equipo.tipoMedidor === "ninguno" ? null : aNumero(borrador.lecturaEquipo);
    const finalizadaEn = borrador.finalizadaEn ?? new Date().toISOString();

    const registro: RegistroCarga = {
      tandaInicialGal: tandaInicial,
      totInicialGal: totInicial,
      tandaFinalGal: tandaFinal,
      totFinalGal: totFinal,
      lecturaEquipo: lectura,
      iniciadaEn: borrador.iniciadaEn,
      finalizadaEn,
      lat: borrador.gps?.lat ?? null,
      lng: borrador.gps?.lng ?? null,
      origen: "app",
      fotoInicial: borrador.fotoInicial !== null,
      fotoFinal: borrador.fotoFinal !== null,
    };

    // La única decisión de negocio: el dominio. La UI obedece.
    const veredicto = validarCarga(registro, contexto);
    if (veredicto.bloqueaCierre) {
      setAviso(MENSAJES_BANDERA.FOTO_FALTANTE);
      return;
    }
    if (veredicto.bloqueaAvance) {
      setAviso(
        MENSAJES_BANDERA[
          veredicto.banderas.includes("TOTALIZADOR_RETROCEDE")
            ? "TOTALIZADOR_RETROCEDE"
            : "TOTALIZADOR_SIN_AVANCE"
        ],
      );
      return;
    }
    if (veredicto.exigeNota && borrador.nota.trim() === "") {
      setAviso(MENSAJES_BANDERA.TANDA_NO_RESETEADA);
      return;
    }

    const id = crypto.randomUUID();
    const payload: PayloadCarga = {
      id,
      dispensador_id: catalogo!.dispensador.id,
      equipo_id: borrador.equipo.id,
      conductor_id: borrador.conductor.id,
      tanda_inicial_gal: tandaInicial,
      tot_inicial_gal: totInicial,
      tanda_final_gal: tandaFinal,
      tot_final_gal: totFinal,
      lectura_equipo: lectura,
      iniciada_en: borrador.iniciadaEn,
      finalizada_en: finalizadaEn,
      lat: borrador.gps?.lat ?? null,
      lng: borrador.gps?.lng ?? null,
      precision_gps_m: borrador.gps?.precision ?? null,
      origen: "app",
      // Rutas tentativas: la ruta REAL la decide la API al subir cada
      // foto y el sincronizador la confirma antes de registrar la carga.
      foto_inicial_path: borrador.fotoInicial ? `cargas/${id}/inicial.webp` : null,
      foto_final_path: borrador.fotoFinal ? `cargas/${id}/final.webp` : null,
      notas: borrador.nota.trim() === "" ? null : borrador.nota.trim(),
      device_id: obtenerDeviceId(),
      version_app: VERSION_APP,
    };

    await encolarCarga(bd, {
      payload,
      veredicto,
      resumen: {
        equipoCodigo: borrador.equipo.codigo,
        conductorNombre: borrador.conductor.nombre,
        galones: tandaFinal,
      },
      fotos: { inicial: borrador.fotoInicial, final: borrador.fotoFinal },
    });

    setIdReciente(id);
    setPaso("listo");
    void procesarPendientes(bd, api); // intento inmediato; sin señal, la cola espera al sincronizador
  }

  return (
    <>
      {aviso ? (
        <div className="mx-auto max-w-md p-4 pb-0">
          <Aviso tipo="advertencia">{aviso}</Aviso>
        </div>
      ) : null}

      {paso === "inicio" && (
        <Inicio
          cargasHoy={cargasHoy}
          pendientes={pendientes}
          erroresDefinitivos={erroresDefinitivos}
          almacenEnRiesgo={almacenEnRiesgo}
          onEmpezar={() => {
            setBorrador(borradorVacio());
            setAviso(null);
            setPaso("equipo");
          }}
        />
      )}

      {paso === "equipo" && <Equipo equipos={catalogo.equipos} onSeleccionar={seleccionarEquipo} />}

      {paso === "conductor" && (
        <Conductor
          conductores={catalogo.conductores}
          onIdentificado={(conductor) => {
            cambiar({ conductor });
            setPaso("antes");
          }}
        />
      )}

      {paso === "antes" && contexto && (
        <AntesDeCargar
          contexto={contexto}
          tandaInicial={borrador.tandaInicial}
          totInicial={borrador.totInicial}
          fotoInicial={borrador.fotoInicial !== null}
          onTandaInicial={(valor) => cambiar({ tandaInicial: valor })}
          onTotInicial={(valor) => cambiar({ totInicial: valor })}
          onFoto={(foto) => cambiar({ fotoInicial: foto })}
          onEmpezarACargar={() => {
            cambiar({ iniciadaEn: new Date().toISOString() });
            setPaso("cargando");
          }}
        />
      )}

      {paso === "cargando" && borrador.iniciadaEn && (
        <Cargando
          iniciadaEn={borrador.iniciadaEn}
          onTermine={() => {
            cambiar({ finalizadaEn: new Date().toISOString() });
            setPaso("despues");
          }}
        />
      )}

      {paso === "despues" && contexto && borrador.equipo && borrador.iniciadaEn && (
        <DespuesDeCargar
          contexto={contexto}
          equipo={borrador.equipo}
          tandaInicial={borrador.tandaInicial}
          totInicial={borrador.totInicial}
          iniciadaEn={borrador.iniciadaEn}
          tandaFinal={borrador.tandaFinal}
          totFinal={borrador.totFinal}
          lecturaEquipo={borrador.lecturaEquipo}
          nota={borrador.nota}
          exigeNota={exigeNota}
          fotoFinal={borrador.fotoFinal !== null}
          onTandaFinal={(valor) => cambiar({ tandaFinal: valor })}
          onTotFinal={(valor) => cambiar({ totFinal: valor })}
          onLecturaEquipo={(valor) => cambiar({ lecturaEquipo: valor })}
          onNota={(valor) => cambiar({ nota: valor })}
          onFoto={(foto) => cambiar({ fotoFinal: foto })}
          onGuardar={() => void guardar()}
        />
      )}

      {paso === "listo" && (
        <Listo
          carga={cargaReciente}
          onOtraCarga={() => {
            setBorrador(borradorVacio());
            setIdReciente(null);
            setAviso(null);
            setPaso("inicio");
          }}
        />
      )}
    </>
  );
}
