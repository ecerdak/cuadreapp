// [Sacyr] El primer tablero operativo por cliente: resumen del día,
// galones por carrotanque, operadora, duración promedio, historial y
// evidencia fotográfica. Plantilla sólida, sin widgets configurables —
// sirve para cualquier cliente (el siguiente será El Trébol) porque se
// resuelve por nombre contra el catálogo.

import { useState } from "react";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import { ChipEstado, Esqueleto, EstadoError, Eyebrow, Panel, Th, celda, gal, horaCorta } from "../ui";
import { TEMA } from "../tema";

const CLIENTE_PILOTO = "Sacyr";

const duracion = (segundos: number | null): string => {
  if (segundos === null) return "—";
  const minutos = Math.floor(segundos / 60);
  return `${minutos} min ${String(Math.round(segundos % 60)).padStart(2, "0")} s`;
};

export function Sacyr() {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(async () => {
    const clientes = await fuente.clientes(CLIENTE_PILOTO);
    const cliente = clientes.find((c) => c.nombre.toLowerCase() === CLIENTE_PILOTO.toLowerCase());
    if (!cliente) return null;
    return fuente.tablero(cliente.id);
  });
  const [fotosDe, setFotosDe] = useState<string | null>(null);

  if (consulta.estado === "cargando") return <Esqueleto alto={380} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const tablero = consulta.datos;
  if (!tablero) {
    return (
      <Panel className="p-6 text-center">
        <p className="font-semibold">El cliente {CLIENTE_PILOTO} aún no existe.</p>
        <p className="mt-1" style={{ fontSize: 12.5, color: TEMA.suave }}>
          Créalo en la pestaña Clientes (con su sede y su dispensador) para activar este tablero.
        </p>
      </Panel>
    );
  }

  const cargaConFotos = tablero.historial.find((carga) => carga.id === fotosDe) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-semibold" style={{ fontSize: 21, letterSpacing: "-0.01em" }}>
          {tablero.clienteNombre} · operación de hoy
        </h1>
        <button
          type="button"
          onClick={recargar}
          className="focus-visible:outline"
          style={{ fontSize: 12.5, color: TEMA.azul }}
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
            ["Operadora", tablero.hoy.operadores.join(", ") || "—"],
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
          <Eyebrow>Galones por carrotanque · hoy</Eyebrow>
        </div>
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                <Th>Carrotanque</Th>
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
                <Th>Carrotanque</Th>
                <Th derecha>Galones</Th>
                <Th>Operadora</Th>
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
                  <td className="font-mono font-semibold" style={{ ...celda, textAlign: "right" }}>
                    {gal(carga.galones)}
                  </td>
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
                {cargaConFotos.equipoCodigo} · {gal(cargaConFotos.galones)} gal ·{" "}
                {horaCorta(cargaConFotos.registradaEn)}
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
