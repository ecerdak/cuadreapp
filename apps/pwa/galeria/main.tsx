// Galería visual de las pantallas del conductor — SOLO DESARROLLO.
// No forma parte del build de producción (vite solo construye
// index.html). Sirve para las capturas de fidelidad y la comparación
// lado a lado contra los mockups aprobados. Datos de demostración del
// paquete de diseño (TURNO del mockup).

import "../src/estilos.css";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { ContextoValidacion } from "@cuadreapp/dominio";
import { crearBd, type CargaLocal } from "../src/offline/bd";
import type { ConductorCatalogo, EquipoCatalogo } from "../src/datos/catalogo";
import { Splash } from "../src/pantallas/Splash";
import { Inicio } from "../src/pantallas/Inicio";
import { Equipo } from "../src/pantallas/Equipo";
import { Conductor } from "../src/pantallas/Conductor";
import { AntesDeCargar } from "../src/pantallas/AntesDeCargar";
import { Cargando } from "../src/pantallas/Cargando";
import { DespuesDeCargar } from "../src/pantallas/DespuesDeCargar";
import { Listo } from "../src/pantallas/Listo";
import { Diagnostico } from "../src/pantallas/Diagnostico";
import { Enrolar } from "../src/pantallas/Enrolar";
import { CabezaApp } from "../src/ui/CabezaApp";
import { Confirmacion } from "../src/ui/basicos";
import { CONFIRMACIONES } from "../src/flujo/navegacion";
import { APP, C } from "../src/marca/tokens";

/* Datos de demostración: el TURNO del mockup aprobado. */
const EQUIPOS: EquipoCatalogo[] = [
  {
    id: "e1",
    codigo: "T-04",
    descripcion: "Tractor Massey 4292",
    tipoMedidor: "horometro",
    ultimaLecturaConocida: 1086.5,
    capacidadTanqueGal: 80,
  },
  {
    id: "e2",
    codigo: "T-01",
    descripcion: "Tractor John Deere 5075E",
    tipoMedidor: "horometro",
    ultimaLecturaConocida: 3412.5,
    capacidadTanqueGal: 80,
  },
  {
    id: "e3",
    codigo: "AL-01",
    descripcion: "Alzadora Bell 1745",
    tipoMedidor: "horometro",
    ultimaLecturaConocida: 1208.0,
    capacidadTanqueGal: 100,
  },
];

const CONDUCTORES: ConductorCatalogo[] = [
  // PIN 0000 — hash bcrypt de demostración solo para la galería.
  { id: "c1", nombre: "Duván Bonilla", codigo: "07", pinHash: "$2a$10$demodemodemodemodemode" },
];

const CONTEXTO: ContextoValidacion = {
  dispensador: { totActualGal: 1847, toleranciaTandaGal: 1 },
  equipo: {
    tipoMedidor: "horometro",
    ultimaLectura: 1086.5,
    capacidadTanqueGal: 80,
    ultimaCargaFinalizadaEn: null,
  },
  sede: { lat: null, lng: null, radioGeocercaM: 150 },
};

const CARGA_LISTA = {
  id: "galeria",
  creadaEn: "2026-08-02T09:52:00-05:00",
  payload: {
    tot_inicial_gal: 1847,
    tot_final_gal: 1890,
    lectura_equipo: 1093,
    finalizada_en: "2026-08-02T09:52:00-05:00",
  },
  resumen: { equipoCodigo: "T-04", conductorNombre: "Duván Bonilla", galones: 42.5 },
  estadoLocal: "ok",
  banderasLocales: [],
  sincronizacion: "pendiente",
  veredictoServidor: null,
} as unknown as CargaLocal;

const CARGAS_HOY = [
  {
    id: "h1",
    creadaEn: "2026-08-02T06:12:00-05:00",
    resumen: { equipoCodigo: "T-01", conductorNombre: "Jhon", galones: 38.5 },
    estadoLocal: "ok",
    banderasLocales: [],
    sincronizacion: "sincronizada",
    veredictoServidor: null,
  },
  {
    id: "h2",
    creadaEn: "2026-08-02T06:41:00-05:00",
    resumen: { equipoCodigo: "AL-01", conductorNombre: "Aníbal", galones: 52.0 },
    estadoLocal: "ok",
    banderasLocales: [],
    sincronizacion: "sincronizada",
    veredictoServidor: null,
  },
  {
    id: "h3",
    creadaEn: "2026-08-02T07:20:00-05:00",
    resumen: { equipoCodigo: "P-01", conductorNombre: "Yeison", galones: 14.2 },
    estadoLocal: "ok",
    banderasLocales: [],
    sincronizacion: "sincronizada",
    veredictoServidor: null,
  },
] as unknown as CargaLocal[];

const bd = crearBd("galeria-visual");
const nada = () => {};

function Marco(props: { id: string; rotulo: string; conCabeza?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div className="mb-3 flex items-baseline" style={{ gap: 8 }}>
        <span className="font-mono font-bold" style={{ fontSize: 13, color: C.amarillo }}>
          {props.id.replace("s", "")}
        </span>
        <span className="font-semibold" style={{ fontSize: 13.5 }}>
          {props.rotulo}
        </span>
      </div>
      <div
        id={props.id}
        className="overflow-hidden"
        style={{
          width: 372,
          borderRadius: 12,
          background: APP.fondo,
          border: `1px solid ${C.linea}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {props.conCabeza !== undefined ? <CabezaApp paso={props.conCabeza} sede="Planta Buga" /> : null}
        <div style={{ paddingBottom: 22 }}>{props.children}</div>
      </div>
    </div>
  );
}

function Galeria() {
  return (
    <div className="min-h-dvh p-6" style={{ background: C.fondo }}>
      <p style={{ fontSize: 13, color: C.suave, maxWidth: 720, lineHeight: 1.6, marginBottom: 28 }}>
        Galería visual de desarrollo: el flujo completo del conductor con datos de demostración, para
        capturas de fidelidad contra los mockups aprobados.
      </p>
      <div className="flex flex-wrap" style={{ gap: 24 }}>
        <Marco id="s00" rotulo="Bienvenida">
          <div style={{ height: 700, display: "flex" }}>
            <Splash onSeguir={nada} />
          </div>
        </Marco>

        <Marco id="s01" rotulo="Inicio" conCabeza="inicio">
          <Inicio
            cargasHoy={CARGAS_HOY}
            pendientes={0}
            erroresDefinitivos={0}
            nombreConductor="Duván Bonilla"
            onEmpezar={nada}
            onDiagnostico={nada}
          />
        </Marco>

        <Marco id="s02" rotulo="Equipo" conCabeza="equipo">
          <Equipo equipos={EQUIPOS} onSeleccionar={nada} onAtras={nada} />
        </Marco>

        <Marco id="s03" rotulo="Conductor" conCabeza="conductor">
          <Conductor
            conductores={CONDUCTORES}
            equipoRotulo="T-04 · Tractor Massey 4292"
            onIdentificado={nada}
            onAtras={nada}
          />
        </Marco>

        <Marco id="s04" rotulo="Antes de cargar" conCabeza="antes">
          <AntesDeCargar
            contexto={CONTEXTO}
            tandaInicial="0,0"
            totInicial="1847"
            fotoInicial={null}
            onTandaInicial={nada}
            onTotInicial={nada}
            onFoto={nada}
            onEmpezarACargar={nada}
            onAtras={nada}
          />
        </Marco>

        <Marco id="s05" rotulo="Cargando" conCabeza="cargando">
          <Cargando
            iniciadaEn={new Date(Date.now() - 184_000).toISOString()}
            equipoCodigo="T-04"
            equipoDescripcion="Tractor Massey 4292"
            conductorNombre="Duván Bonilla"
            totInicialGal={1847}
            onTermine={nada}
            onAtras={nada}
          />
        </Marco>

        <Marco id="s06" rotulo="Después de cargar" conCabeza="despues">
          <DespuesDeCargar
            contexto={CONTEXTO}
            equipo={EQUIPOS[0]!}
            tandaInicial="0,0"
            totInicial="1847"
            iniciadaEn={new Date(Date.now() - 300_000).toISOString()}
            tandaFinal="42,5"
            totFinal="1889,5"
            lecturaEquipo="1093,0"
            nota=""
            exigeNota={false}
            fotoFinal={null}
            onTandaFinal={nada}
            onTotFinal={nada}
            onLecturaEquipo={nada}
            onNota={nada}
            onFoto={nada}
            onGuardar={nada}
            onAtras={nada}
          />
        </Marco>

        <Marco id="s07" rotulo="Listo" conCabeza="listo">
          <Listo carga={CARGA_LISTA} equipoDescripcion="Tractor Massey 4292" onOtraCarga={nada} />
        </Marco>

        <Marco id="s08" rotulo="Diagnóstico" conCabeza="diagnostico">
          <Diagnostico bd={bd} onVolver={nada} />
        </Marco>

        <Marco id="s09" rotulo="Enrolamiento" conCabeza={undefined}>
          <Enrolar onEnrolar={() => Promise.resolve({ ok: true })} />
        </Marco>

        <Marco id="s10" rotulo="Confirmación al volver (foto inicial)" conCabeza="antes">
          {/* transform crea el bloque contenedor: el diálogo fixed queda dentro del marco */}
          <div style={{ transform: "translate(0)", minHeight: 420 }}>
            <AntesDeCargar
              contexto={CONTEXTO}
              tandaInicial="0,0"
              totInicial="1847"
              fotoInicial={{ bytes: new Uint8Array([1]).buffer, tipo: "image/webp" }}
              onTandaInicial={nada}
              onTotInicial={nada}
              onFoto={nada}
              onEmpezarACargar={nada}
              onAtras={nada}
            />
            <Confirmacion
              titulo={CONFIRMACIONES.descartarFotoInicial.titulo}
              cuerpo={CONFIRMACIONES.descartarFotoInicial.cuerpo}
              accion={CONFIRMACIONES.descartarFotoInicial.accion}
              onCancelar={nada}
              onConfirmar={nada}
            />
          </div>
        </Marco>

        <Marco id="s11" rotulo="Guardando (retroceso bloqueado)" conCabeza="despues">
          <DespuesDeCargar
            contexto={CONTEXTO}
            equipo={EQUIPOS[0]!}
            tandaInicial="0,0"
            totInicial="1847"
            iniciadaEn={new Date(Date.now() - 300_000).toISOString()}
            tandaFinal="42,5"
            totFinal="1889,5"
            lecturaEquipo="1093,0"
            nota=""
            exigeNota={false}
            fotoFinal={{ bytes: new Uint8Array([1]).buffer, tipo: "image/webp" }}
            onTandaFinal={nada}
            onTotFinal={nada}
            onLecturaEquipo={nada}
            onNota={nada}
            onFoto={nada}
            onGuardar={nada}
            onAtras={nada}
            guardando
          />
        </Marco>
      </div>
    </div>
  );
}

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <Galeria />
  </StrictMode>,
);
