// Raíz de la PWA: primero el estado de la SESIÓN del dispositivo
// (Etapa S), después la máquina de estados del flujo del conductor
// (spec §8.1, 7 pasos). Ningún componente toca tokens (DEC-014): la
// sesión se maneja vía ServicioSesion y el catálogo llega cacheado en
// Dexie. La única autoridad de negocio invocada es el dominio.

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { validarCarga, type ContextoValidacion, type RegistroCarga } from "@cuadreapp/dominio";
import type { BdLocal, PayloadCarga } from "./offline/bd";
import { contarPendientes, encolarCarga, obtenerContextoValidacion } from "./offline/cola";
import { cargarBorrador, guardarBorrador, limpiarBorrador } from "./offline/borrador";
import type { ClienteApi } from "./offline/sincronizador";
import { obtenerEstadoSync, sincronizarConEstado, suscribirEstadoSync } from "./offline/estado-sync";
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
import { Aviso, BotonGrande, Confirmacion, Titulo } from "./ui/basicos";
import { CabezaApp } from "./ui/CabezaApp";
import { obtenerDeviceId, VERSION_APP } from "./config";
import { Splash } from "./pantallas/Splash";
import { Inicio } from "./pantallas/Inicio";
import { Equipo } from "./pantallas/Equipo";
import { Conductor } from "./pantallas/Conductor";
import { AntesDeCargar } from "./pantallas/AntesDeCargar";
import { Cargando } from "./pantallas/Cargando";
import { DespuesDeCargar } from "./pantallas/DespuesDeCargar";
import { Listo } from "./pantallas/Listo";
import { Enrolar } from "./pantallas/Enrolar";
import { Diagnostico } from "./pantallas/Diagnostico";
import { marcasAntesDeCargar } from "./flujo/en-vivo";
import {
  CONFIRMACIONES,
  decidirAtras,
  hayDatosDependientesDeEquipo,
  invalidacionPorCambioDeEquipo,
  type Confirmacion as ConfirmacionPendiente,
} from "./flujo/navegacion";

type EstadoSesion = "cargando" | "sin_enrolar" | "activa" | "offline" | "vencida";

type Paso =
  "inicio" | "equipo" | "conductor" | "antes" | "cargando" | "despues" | "listo" | "diagnostico";

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
  // Navegación hacia atrás: confirmación pendiente y bloqueo de guardado.
  const [confirmacion, setConfirmacion] = useState<
    (ConfirmacionPendiente & { alConfirmar: () => void }) | null
  >(null);
  const [guardando, setGuardando] = useState(false);
  const estadoSync = useSyncExternalStore(suscribirEstadoSync, obtenerEstadoSync, obtenerEstadoSync);
  const [restauracionLista, setRestauracionLista] = useState(false);

  // [00] Bienvenida: la marca aparece una vez y se quita del camino.
  // Dura 2 s o lo que tarde el conductor en tocar la pantalla (y cubre
  // la recuperación de sesión si tarda más).
  const [splashVista, setSplashVista] = useState(false);
  useEffect(() => {
    const temporizador = setTimeout(() => setSplashVista(true), 2_000);
    return () => clearTimeout(temporizador);
  }, []);

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

  /* ============ Navegación hacia atrás (flujo/navegacion.ts) ============ */

  const datosDependientes = {
    conductor: borrador.conductor !== null,
    fotoInicial: borrador.fotoInicial !== null,
    fotoFinal: borrador.fotoFinal !== null,
    lecturas: borrador.tandaFinal !== "" || borrador.totFinal !== "" || borrador.lecturaEquipo !== "",
    iniciada: borrador.iniciadaEn !== null,
  };

  /** Retroceso de UN paso, con la confirmación que dicte el modelo. */
  function atras() {
    const decision = decidirAtras(paso, datosDependientes, { guardando });
    if (decision.tipo === "bloqueado") return;
    const ejecutar = () => {
      if (decision.limpiar) cambiar(decision.limpiar);
      setConfirmacion(null);
      setPaso(decision.destino);
    };
    if (decision.confirmar) {
      setConfirmacion({ ...decision.confirmar, alConfirmar: ejecutar });
    } else {
      ejecutar();
    }
  }

  /** Confirmación de equipo: cambiar de equipo invalida lo dependiente. */
  function alConfirmarEquipo(equipo: EquipoCatalogo) {
    const cambia = borrador.equipo !== null && borrador.equipo.id !== equipo.id;
    if (!cambia && borrador.equipo) {
      // Mismo equipo re-confirmado: se conserva todo (incluido el
      // totalizador que el conductor ya hubiera corregido).
      setPaso("conductor");
      return;
    }
    const aplicar = () => {
      if (cambia) cambiar(invalidacionPorCambioDeEquipo());
      setConfirmacion(null);
      void seleccionarEquipo(equipo);
    };
    if (cambia && hayDatosDependientesDeEquipo(datosDependientes)) {
      setConfirmacion({ ...CONFIRMACIONES.cambiarEquipo, alConfirmar: aplicar });
    } else {
      aplicar();
    }
  }

  // FASE 5: el borrador sobrevive a que maten la app a mitad de captura.
  // Restaurar una sola vez cuando hay sesión y catálogo.
  useEffect(() => {
    if (restauracionLista || estadoSesion === "cargando" || estadoSesion === "sin_enrolar") return;
    if (!catalogo) return;
    void cargarBorrador(bd).then(async (guardado) => {
      if (guardado && guardado.paso !== "inicio" && guardado.paso !== "listo") {
        const datos = guardado.datos as Borrador;
        setBorrador(datos);
        if (datos.equipo) {
          setContexto(
            await obtenerContextoValidacion(bd, catalogo.dispensador, datos.equipo, catalogo.sede),
          );
        }
        setPaso(guardado.paso as Paso);
      }
      setRestauracionLista(true);
    });
  }, [restauracionLista, estadoSesion, catalogo === null]);

  // Persistir el borrador en cada cambio durante la captura; limpiarlo al
  // volver al inicio (la carga guardada ya lo limpió en guardar()).
  useEffect(() => {
    if (!restauracionLista) return;
    if (paso === "inicio") {
      void limpiarBorrador(bd);
    } else if (paso !== "listo") {
      void guardarBorrador(bd, paso, borrador);
    }
  }, [restauracionLista, paso, borrador]);

  /* ============ Bienvenida y puertas de sesión ============ */

  // La Splash cubre el arranque: 2 s de marca (o un toque) y, si la
  // recuperación de sesión aún no resuelve, sigue en pantalla.
  if (!splashVista || estadoSesion === "cargando") {
    return <Splash onSeguir={() => estadoSesion !== "cargando" && setSplashVista(true)} />;
  }

  const shell = (paso: string | undefined, contenido: ReactNode) => (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <CabezaApp paso={paso} sede={catalogo?.sede.nombre} />
      <div className="flex-1" style={{ paddingBottom: 22 }}>
        {contenido}
      </div>
    </div>
  );

  if (estadoSesion === "sin_enrolar" || estadoSesion === "vencida") {
    return shell(
      undefined,
      <>
        {estadoSesion === "vencida" ? (
          <div className="px-4 pt-4">
            <Aviso
              tono="alerta"
              titulo="La sesión de este dispositivo venció o fue revocada"
              cuerpo="Las cargas guardadas siguen en el equipo y se subirán al re-enrolar."
            />
          </div>
        ) : null}
        <Enrolar
          onEnrolar={async (codigo, nombre) => {
            const resultado = await sesion.enrolar(codigo, nombre);
            if (resultado.ok) setEstadoSesion("activa");
            return resultado.ok ? { ok: true } : { ok: false, detalle: resultado.detalle };
          }}
        />
      </>,
    );
  }

  if (!catalogo) {
    return shell(
      undefined,
      <>
        <Titulo sub="Este dispositivo aún no tiene el catálogo de la estación (equipos y conductores). Se necesita señal una vez para descargarlo.">
          Falta el catálogo
        </Titulo>
        <div className="px-4 pt-4">
          <BotonGrande
            onClick={() =>
              void sesion.refrescarCatalogo().then((ok) => {
                if (!ok) setAviso("No se pudo descargar el catálogo. Revisa la señal.");
              })
            }
          >
            Reintentar
          </BotonGrande>
        </div>
        {aviso ? (
          <div className="px-4 pt-4">
            <Aviso tono="alerta" titulo={aviso} />
          </div>
        ) : null}
      </>,
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
    if (guardando) return; // un toque = una carga (cero duplicados)
    setGuardando(true);
    setAviso(null);

    const tandaInicial = aNumero(borrador.tandaInicial);
    const totInicial = aNumero(borrador.totInicial);
    const tandaFinal = aNumero(borrador.tandaFinal);
    const totFinal = aNumero(borrador.totFinal);
    if (tandaInicial === null || totInicial === null || tandaFinal === null || totFinal === null) {
      setAviso("Revisa los números: hay campos vacíos o inválidos.");
      setGuardando(false);
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
      setGuardando(false);
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
      setGuardando(false);
      return;
    }
    if (veredicto.exigeNota && borrador.nota.trim() === "") {
      setAviso(MENSAJES_BANDERA.TANDA_NO_RESETEADA);
      setGuardando(false);
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

    try {
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
    } catch {
      // FASE 5: un fallo de almacenamiento (cuota) jamás pierde la captura:
      // el borrador sigue persistido y en pantalla.
      setAviso(
        "No se pudo guardar en el teléfono (¿almacenamiento lleno?). Libera espacio e intenta de nuevo — tu registro sigue en pantalla.",
      );
      setGuardando(false);
      return;
    }
    await limpiarBorrador(bd);

    setIdReciente(id);
    setGuardando(false);
    setPaso("listo");
    void sincronizarConEstado(bd, api); // intento inmediato; sin señal, la cola espera al sincronizador
  }

  // Saludo de Inicio: el último conductor que usó este dispositivo.
  const nombreConductor =
    catalogo.conductores.find((c) => c.codigo === localStorage.getItem("cuadreapp:ultimo_conductor"))
      ?.nombre ?? null;

  return shell(
    paso,
    <>
      {confirmacion ? (
        <Confirmacion
          titulo={confirmacion.titulo}
          cuerpo={confirmacion.cuerpo}
          accion={confirmacion.accion}
          onCancelar={() => setConfirmacion(null)}
          onConfirmar={confirmacion.alConfirmar}
        />
      ) : null}
      {estadoSync.actualizacionLista ? (
        <div className="px-4 pt-4">
          <Aviso
            tono="info"
            titulo="Actualización lista"
            cuerpo="Cierra y vuelve a abrir la app para aplicarla — tus datos no se tocan."
          />
        </div>
      ) : null}
      {aviso ? (
        <div className="px-4 pt-4">
          <Aviso tono="alerta" titulo={aviso} />
        </div>
      ) : null}

      {paso === "inicio" && (
        <Inicio
          cargasHoy={cargasHoy}
          pendientes={pendientes}
          erroresDefinitivos={erroresDefinitivos}
          nombreConductor={nombreConductor}
          almacenEnRiesgo={almacenEnRiesgo}
          onDiagnostico={() => setPaso("diagnostico")}
          onEmpezar={() => {
            setBorrador(borradorVacio());
            setAviso(null);
            setPaso("equipo");
          }}
        />
      )}

      {paso === "equipo" && (
        <Equipo equipos={catalogo.equipos} onSeleccionar={alConfirmarEquipo} onAtras={atras} />
      )}

      {paso === "conductor" && (
        <Conductor
          conductores={catalogo.conductores}
          equipoRotulo={
            borrador.equipo ? `${borrador.equipo.codigo} · ${borrador.equipo.descripcion}` : undefined
          }
          onIdentificado={(conductor) => {
            cambiar({ conductor });
            setPaso("antes");
          }}
          onAtras={atras}
        />
      )}

      {paso === "antes" && contexto && (
        <AntesDeCargar
          contexto={contexto}
          tandaInicial={borrador.tandaInicial}
          totInicial={borrador.totInicial}
          fotoInicial={borrador.fotoInicial}
          onTandaInicial={(valor) => cambiar({ tandaInicial: valor })}
          onTotInicial={(valor) => cambiar({ totInicial: valor })}
          onFoto={(foto) => cambiar({ fotoInicial: foto })}
          onEmpezarACargar={() => {
            // Si la carga ya había comenzado (volvió desde Cargando a
            // corregir), el cronómetro NO se reinicia: R12 mide la
            // duración real.
            cambiar({ iniciadaEn: borrador.iniciadaEn ?? new Date().toISOString() });
            setPaso("cargando");
          }}
          onAtras={atras}
        />
      )}

      {paso === "cargando" && borrador.iniciadaEn && borrador.equipo && borrador.conductor && (
        <Cargando
          iniciadaEn={borrador.iniciadaEn}
          equipoCodigo={borrador.equipo.codigo}
          equipoDescripcion={borrador.equipo.descripcion}
          conductorNombre={borrador.conductor.nombre}
          totInicialGal={aNumero(borrador.totInicial)}
          onTermine={() => {
            cambiar({ finalizadaEn: new Date().toISOString() });
            setPaso("despues");
          }}
          onAtras={atras}
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
          fotoFinal={borrador.fotoFinal}
          onTandaFinal={(valor) => cambiar({ tandaFinal: valor })}
          onTotFinal={(valor) => cambiar({ totFinal: valor })}
          onLecturaEquipo={(valor) => cambiar({ lecturaEquipo: valor })}
          onNota={(valor) => cambiar({ nota: valor })}
          onFoto={(foto) => cambiar({ fotoFinal: foto })}
          onGuardar={() => void guardar()}
          onAtras={atras}
          guardando={guardando}
        />
      )}

      {paso === "diagnostico" && <Diagnostico bd={bd} onVolver={() => setPaso("inicio")} />}

      {paso === "listo" && (
        <Listo
          carga={cargaReciente}
          equipoDescripcion={borrador.equipo?.descripcion}
          onOtraCarga={() => {
            setBorrador(borradorVacio());
            setIdReciente(null);
            setAviso(null);
            setPaso("inicio");
          }}
        />
      )}
    </>,
  );
}
