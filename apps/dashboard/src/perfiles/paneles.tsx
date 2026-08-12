// Paneles de la pestaña «Hoy». Cada uno es una pieza independiente que
// no sabe qué perfil la invocó ni qué otras piezas hay en pantalla: el
// perfil declara cuáles se pintan y en qué orden (DEC-016).

import { Link } from "react-router-dom";
import { Chip, Esqueleto, EstadoVacio, Eyebrow, Panel } from "../componentes/basicos";
import { GraficoConsumo, Rodillo } from "../componentes/medidor";
import { formatearEntero, formatearGal } from "../componentes/numeros";
import type { ContextoTablero, ResumenHoy } from "../datos/puertos";
import { COLOR_ESTADO, TEMA } from "../tema";

export interface PropsPanel {
  datos: ResumenHoy;
  contexto: ContextoTablero;
}

/** Ancho del panel en la rejilla de 3 columnas del diseño aprobado. */
export type AnchoPanel = 1 | 2 | 3;

const Dato = (props: { valor: string; etiqueta: string; color?: string }) => (
  <div>
    <div className="font-mono font-semibold" style={{ fontSize: 15, color: props.color }}>
      {props.valor}
    </div>
    <div style={{ fontSize: 11, color: TEMA.suave }}>{props.etiqueta}</div>
  </div>
);

/* ============ Totalizador (perfiles con medidor) ============ */

export function PanelTotalizador({ datos, contexto }: PropsPanel) {
  return (
    <Panel className="p-5">
      <Eyebrow>Totalizador del medidor</Eyebrow>
      {datos.totalizadorGal === null ? (
        <div className="mt-4" style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.6 }}>
          {contexto.sedes.length > 1
            ? "Elige una sede para ver su totalizador: sumar los de varias sedes no significaría nada."
            : "Esta sede aún no tiene un medidor configurado."}
        </div>
      ) : (
        <>
          <div className="mt-3">
            <Rodillo valor={datos.totalizadorGal} enteros={6} alto={40} />
          </div>
          <div className="mt-3" style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.6 }}>
            Galones acumulados desde que se instaló el dispensador
            {contexto.medidor ? ` el ${contexto.medidor.instalado}` : ""}. Este número no se puede
            resetear: es la única cifra que no depende de nadie.
          </div>
        </>
      )}
      <div
        className="mt-4 flex justify-between pt-4"
        style={{ borderTop: `1px solid ${TEMA.lineaSuave}` }}
      >
        <Dato
          valor={`${formatearEntero(datos.balance.entregadoTotalGal)} gal`}
          etiqueta="Entregado por Lubryco"
        />
        <Dato
          valor={`${formatearEntero(datos.balance.despachadoTotalGal)} gal`}
          etiqueta="Despachado a equipos"
        />
      </div>
    </Panel>
  );
}

/* ============ Inventario del día (perfiles sin medidor) ============ */

export function PanelInventario({ datos }: PropsPanel) {
  const { inventarioHoy } = datos;
  const hayMovimiento = inventarioHoy.despachadoGal > 0 || inventarioHoy.recibidoGal > 0;

  return (
    <Panel className="p-5">
      <Eyebrow>Inventario del día</Eyebrow>
      {!hayMovimiento ? (
        <div className="mt-4" style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.6 }}>
          Aún no hay cargas hoy. El inventario aparece con la primera del día.
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-col" style={{ gap: 10 }}>
            <Dato
              valor={`${formatearGal(inventarioHoy.recibidoGal)} gal`}
              etiqueta="Inventario inicial · con lo que llegaron"
            />
            <Dato
              valor={`${formatearGal(inventarioHoy.despachadoGal)} gal`}
              etiqueta="Galones recibidos de Lubryco"
            />
            <div
              className="pt-3"
              style={{ borderTop: `1px solid ${TEMA.lineaSuave}` }}
              aria-label="Inventario final"
            >
              <div className="font-mono font-bold" style={{ fontSize: 20, color: TEMA.amarillo }}>
                {formatearGal(inventarioHoy.totalSalidaGal)} gal
              </div>
              <div style={{ fontSize: 11, color: TEMA.suave }}>
                Inventario final · lo calcula el sistema
              </div>
            </div>
          </div>
          <div
            className="mt-4 flex justify-between pt-4"
            style={{ borderTop: `1px solid ${TEMA.lineaSuave}` }}
          >
            <Dato
              valor={
                inventarioHoy.capacidadGal === null
                  ? "—"
                  : `${formatearEntero(inventarioHoy.capacidadGal)} gal`
              }
              etiqueta="Capacidad"
            />
            <Dato
              valor={
                inventarioHoy.llenadoPct === null
                  ? "—"
                  : `${inventarioHoy.llenadoPct.toLocaleString("es-CO")} %`
              }
              etiqueta="Llenado"
              color={
                inventarioHoy.llenadoPct !== null && inventarioHoy.llenadoPct > 100
                  ? TEMA.rojo
                  : undefined
              }
            />
          </div>
        </>
      )}
    </Panel>
  );
}

/* ============ Consumo de 14 días ============ */

export function PanelConsumo({ datos }: PropsPanel) {
  // 14 barras de altura cero no son un gráfico: son un vacío que no se
  // presenta como tal (P0.6). Quincena quieta → se dice con palabras.
  const sinConsumo = datos.consumo14d.every((dia) => dia.galones === 0);
  return (
    <Panel className="p-5">
      <Eyebrow>Consumo diario · últimos 14 días</Eyebrow>
      {sinConsumo ? (
        <div className="mt-4" style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.6 }}>
          Sin consumo registrado en los últimos 14 días. El gráfico aparece con la primera carga de la
          quincena.
        </div>
      ) : (
        <>
          <div className="mt-5">
            <GraficoConsumo dias={datos.consumo14d} />
          </div>
          <div className="mt-3" style={{ fontSize: 11, color: TEMA.suave }}>
            El día de hoy va parcial.
          </div>
        </>
      )}
    </Panel>
  );
}

/* ============ Cargas del día ============ */

export function PanelCargasDelDia({ datos }: PropsPanel) {
  return (
    <Panel className="p-5">
      <Eyebrow>
        Cargas de hoy · {datos.cargasDeHoy.length} registrada
        {datos.cargasDeHoy.length === 1 ? "" : "s"}
      </Eyebrow>
      {datos.cargasDeHoy.length === 0 ? (
        <div className="mt-4">
          <EstadoVacio
            mensaje="Aún no hay cargas hoy"
            detalle="Las cargas del conductor aparecen aquí apenas sincronizan."
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col" style={{ gap: 8 }}>
          {datos.cargasDeHoy.map((carga) => (
            <Link
              key={carga.id}
              to={`/cargas/${carga.id}`}
              className="flex flex-wrap items-center rounded-md px-3 py-3 focus-visible:outline focus-visible:outline-2"
              style={{
                background: TEMA.panelAlto,
                gap: 14,
                borderLeft: `2px solid ${COLOR_ESTADO[carga.estado]}`,
              }}
            >
              <span className="font-mono" style={{ fontSize: 12, color: TEMA.suave, width: 42 }}>
                {carga.hora}
              </span>
              <span className="font-mono font-semibold" style={{ fontSize: 13, width: 54 }}>
                {carga.equipoCodigo}
              </span>
              <span style={{ fontSize: 12, color: TEMA.suave, flex: 1, minWidth: 150 }}>
                {carga.equipoDescripcion} · {carga.conductorNombre}
              </span>
              <span
                className="font-mono font-semibold"
                style={{ fontSize: 14, width: 74, textAlign: "right" }}
              >
                {formatearGal(carga.galones)} gal
              </span>
              <Chip estado={carga.estado} />
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

/** Esqueleto de la pestaña mientras llega el primer dato. */
export function EsqueletoHoy() {
  return (
    <div className="flex flex-col gap-4">
      <Esqueleto alto={120} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Esqueleto alto={220} />
        <div className="lg:col-span-2">
          <Esqueleto alto={220} />
        </div>
      </div>
      <Esqueleto alto={180} />
    </div>
  );
}
