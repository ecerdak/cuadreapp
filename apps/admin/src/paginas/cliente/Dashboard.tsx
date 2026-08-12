// [Cliente → Dashboard] VISTA PREVIA administrativa (Etapa P.2).
//
// Esto NO es el Dashboard del cliente: es lo que Lubryco ve desde la
// consola para verificar que un cliente recién configurado ya tiene
// operación. El Dashboard del cliente es un producto aparte, con una
// URL única para todas las empresas, y ahí entra el supervisor con su
// propio usuario — nunca a través del Admin.
//
// Por eso esta pantalla ofrece dos acciones y ninguna más: abrir el
// Dashboard oficial y copiar su enlace para compartirlo.

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFuenteAdmin } from "../../datos/proveedor";
import { useConsulta } from "../../datos/consulta";
import { ChipEstado, Esqueleto, EstadoError, Eyebrow, Panel, Th, celda, gal, horaCorta } from "../../ui";
import { TEMA } from "../../tema";
import type { ContextoFicha } from "./FichaCliente";
import { AccesosDashboard } from "./AccesosDashboard";

export { URL_DASHBOARD } from "./url-dashboard";
import { URL_DASHBOARD } from "./url-dashboard";

const duracion = (segundos: number | null): string => {
  if (segundos === null) return "—";
  const minutos = Math.floor(segundos / 60);
  return `${minutos} min ${String(Math.round(segundos % 60)).padStart(2, "0")} s`;
};

export function DashboardCliente() {
  const { cliente } = useOutletContext<ContextoFicha>();
  return (
    <div className="flex flex-col gap-4">
      <AvisoPreview />
      <AccesosDashboard key={`accesos-${cliente.id}`} clienteId={cliente.id} />
      <TableroDeCliente key={cliente.id} clienteId={cliente.id} />
    </div>
  );
}

/** El encabezado que evita la confusión más cara de esta pantalla:
 *  creer que lo que ve el admin ES lo que ve el cliente. */
export function AvisoPreview() {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    void navigator.clipboard
      ?.writeText(URL_DASHBOARD)
      .then(() => setCopiado(true))
      .catch(() => setCopiado(false));
  };

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between" style={{ gap: 12 }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow color="var(--cliente-primario)">Vista previa administrativa</Eyebrow>
          <p style={{ fontSize: 12.5, color: TEMA.suave, marginTop: 6, lineHeight: 1.6 }}>
            Así se ve la operación de este cliente desde la consola. El Dashboard del cliente vive
            aparte, en un enlace único para todas las empresas: el supervisor entra con su usuario y su
            empresa se carga sola.
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <a
            href={URL_DASHBOARD}
            target="_blank"
            rel="noreferrer"
            className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
            style={{
              background: "var(--cliente-primario)",
              color: "var(--cliente-primario-texto)",
              padding: "9px 14px",
              fontSize: 12.5,
            }}
          >
            Abrir Dashboard
          </a>
          <button
            type="button"
            onClick={copiar}
            className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
            style={{
              background: TEMA.panelAlto,
              border: `1px solid ${TEMA.linea}`,
              color: TEMA.texto,
              padding: "9px 14px",
              fontSize: 12.5,
            }}
          >
            {copiado ? "Enlace copiado" : "Copiar enlace"}
          </button>
        </div>
      </div>
      <div
        className="mt-3 truncate font-mono"
        style={{ fontSize: 11, color: TEMA.tenue }}
        title={URL_DASHBOARD}
      >
        {URL_DASHBOARD}
      </div>
    </Panel>
  );
}

function TableroDeCliente(props: { clienteId: string }) {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(() => fuente.tablero(props.clienteId), [props.clienteId]);
  const [fotosDe, setFotosDe] = useState<string | null>(null);

  if (consulta.estado === "cargando") return <Esqueleto alto={380} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const tablero = consulta.datos;
  const cargaConFotos = tablero.historial.find((carga) => carga.id === fotosDe) ?? null;
  // Columnas del perfil Carga sobre Inventario, mostradas cuando la
  // historia las trae — cada carga según SU perfil (snapshot), nunca
  // según el cliente.
  const hayInventario = tablero.historial.some((carga) => carga.inventarioFinalGal !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between" style={{ gap: 12 }}>
        <h2 className="font-semibold" style={{ fontSize: 17, letterSpacing: "-0.01em" }}>
          Operación de hoy
        </h2>
        <button
          type="button"
          onClick={recargar}
          className="focus-visible:outline"
          style={{ fontSize: 12.5, color: "var(--cliente-primario)" }}
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {(
          [
            ["Cargas del día", String(tablero.hoy.cargas)],
            ["Galones", gal(tablero.hoy.galones)],
            ["Duración promedio", duracion(tablero.hoy.duracionPromedioS)],
            ["Operadores", tablero.hoy.operadores.join(", ") || "—"],
            ["Última carga", horaCorta(tablero.hoy.ultimaCargaEn)],
          ] as const
        ).map(([rotulo, valor]) => (
          <Panel key={rotulo} className="p-4">
            <Eyebrow>{rotulo}</Eyebrow>
            <div className="mt-1 font-mono font-semibold" style={{ fontSize: 18 }}>
              {valor}
            </div>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Galones por equipo · hoy</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                <Th>Equipo</Th>
                <Th>Descripción</Th>
                <Th derecha>Cargas</Th>
                <Th derecha>Galones</Th>
                <Th>Última carga</Th>
              </tr>
            </thead>
            <tbody>
              {tablero.porEquipo.map((equipo) => (
                <tr key={equipo.equipoCodigo}>
                  <td className="font-mono font-semibold" style={celda}>
                    {equipo.equipoCodigo}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>{equipo.descripcion ?? "—"}</td>
                  <td className="font-mono" style={{ ...celda, textAlign: "right" }}>
                    {equipo.cargas}
                  </td>
                  <td className="font-mono font-semibold" style={{ ...celda, textAlign: "right" }}>
                    {gal(equipo.galones)}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {horaCorta(equipo.ultimaCargaEn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <div className="px-5 pt-5">
          <Eyebrow>Historial · últimos 14 días</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr>
                <Th>Hora</Th>
                <Th>Equipo</Th>
                {hayInventario ? <Th derecha>Llegó con</Th> : null}
                <Th derecha>{hayInventario ? "Despachado" : "Galones"}</Th>
                {hayInventario ? <Th derecha>Total al salir</Th> : null}
                <Th>Operador</Th>
                <Th>Estado</Th>
                <Th>Evidencia</Th>
              </tr>
            </thead>
            <tbody>
              {tablero.historial.map((carga) => (
                <tr key={carga.id}>
                  <td className="font-mono" style={celda}>
                    {horaCorta(carga.registradaEn)}
                  </td>
                  <td className="font-mono font-semibold" style={celda}>
                    {carga.equipoCodigo}
                  </td>
                  {hayInventario ? (
                    <td className="font-mono" style={{ ...celda, textAlign: "right" }}>
                      {carga.llegadaGal === null ? "—" : gal(carga.llegadaGal)}
                    </td>
                  ) : null}
                  <td className="font-mono font-semibold" style={{ ...celda, textAlign: "right" }}>
                    {gal(carga.galones)}
                  </td>
                  {hayInventario ? (
                    <td className="font-mono font-semibold" style={{ ...celda, textAlign: "right" }}>
                      {carga.inventarioFinalGal === null ? "—" : gal(carga.inventarioFinalGal)}
                    </td>
                  ) : null}
                  <td style={{ ...celda, color: TEMA.suave }}>{carga.operadorNombre}</td>
                  <td style={celda}>
                    <ChipEstado estado={carga.estado} />
                  </td>
                  <td style={celda}>
                    {carga.fotos.length > 0 ? (
                      <button
                        type="button"
                        className="focus-visible:outline"
                        style={{ fontSize: 12, color: TEMA.azul }}
                        onClick={() => setFotosDe(carga.id)}
                      >
                        Ver fotos ({carga.fotos.length})
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: TEMA.ambar }}>sin fotos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tablero.historial.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Aún no hay cargas registradas para {tablero.clienteNombre}.
            </p>
          ) : null}
        </div>
      </Panel>

      {cargaConFotos ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Evidencia fotográfica"
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(4,8,12,.62)" }}
          onClick={() => setFotosDe(null)}
        >
          <div
            className="w-full max-w-2xl rounded-lg p-5"
            style={{ background: TEMA.panel, border: `1px solid ${TEMA.linea}` }}
          >
            <div className="flex items-baseline justify-between">
              <div className="font-semibold" style={{ fontSize: 15 }}>
                {cargaConFotos.equipoCodigo} ·{" "}
                {cargaConFotos.inventarioFinalGal !== null
                  ? `llegó con ${gal(cargaConFotos.llegadaGal ?? 0)} gal · despachado ${gal(cargaConFotos.galones)} gal · total al salir ${gal(cargaConFotos.inventarioFinalGal)} gal`
                  : `${gal(cargaConFotos.galones)} gal`}{" "}
                · {horaCorta(cargaConFotos.registradaEn)}
              </div>
              <button type="button" style={{ fontSize: 12.5, color: TEMA.azul }}>
                Cerrar
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2" style={{ gap: 10 }}>
              {cargaConFotos.fotos.map((foto) => (
                <figure key={foto.momento}>
                  <div
                    className="flex items-center justify-center overflow-hidden rounded-md"
                    style={{ height: 220, background: "#0A1017", border: `1px solid ${TEMA.linea}` }}
                  >
                    {foto.url ? (
                      <img
                        src={foto.url}
                        alt={`Evidencia ${foto.momento}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 11, color: TEMA.suave }}>Foto no disponible</span>
                    )}
                  </div>
                  <figcaption className="mt-1 text-center" style={{ fontSize: 11, color: TEMA.suave }}>
                    {foto.momento === "inicial" ? "Antes de cargar" : "Después de cargar"}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
