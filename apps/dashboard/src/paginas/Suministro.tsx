// [Pestaña Suministro] Remisiones de Lubryco y balance entregado −
// despachado (spec §8.2). El botón "Pedir a Lubryco" llega con la
// conexión real: es una acción de escritura.

import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import {
  Esqueleto,
  EstadoError,
  EstadoVacio,
  TarjetaMetrica,
  VeredictoBanner,
} from "../componentes/basicos";
import { formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

export function Suministro() {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenSuministro());

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={84} />
        <div className="grid grid-cols-2 gap-4">
          <Esqueleto alto={96} />
          <Esqueleto alto={96} />
        </div>
        <Esqueleto alto={180} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  return (
    <div className="flex flex-col gap-4">
      <VeredictoBanner veredicto={datos.veredicto} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMetrica rotulo="Entregado por Lubryco">
          {formatearGal(datos.entregadoTotalGal)} gal
        </TarjetaMetrica>
        <TarjetaMetrica rotulo="Despachado a equipos">
          {formatearGal(datos.despachadoTotalGal)} gal
        </TarjetaMetrica>
        <TarjetaMetrica
          rotulo="Existencia estimada"
          contexto="Balance: inicial + entregado − despachado"
        >
          {formatearGal(datos.existenciaEstimadaGal)} gal
        </TarjetaMetrica>
      </div>

      <section>
        <h2
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: TEMA.suave }}
        >
          Remisiones de Lubryco
        </h2>
        {datos.entregas.length === 0 ? (
          <EstadoVacio mensaje="Sin entregas registradas" />
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ background: TEMA.panel }}>
            <table className="w-full text-sm">
              <caption className="sr-only">Entregas de combustible de Lubryco</caption>
              <thead>
                <tr className="text-left" style={{ color: TEMA.suave }}>
                  {["Remisión", "Fecha", "Galones", "Carrotanque"].map((titulo) => (
                    <th key={titulo} scope="col" className="px-3 py-2.5 font-semibold">
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.entregas.map((entrega) => (
                  <tr key={entrega.numeroRemision} style={{ borderTop: `1px solid ${TEMA.linea}` }}>
                    <td className="px-3 py-2.5 font-bold">{entrega.numeroRemision}</td>
                    <td className="px-3 py-2.5 tabular-nums">{entrega.fecha}</td>
                    <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                      {formatearGal(entrega.galones)}
                    </td>
                    <td className="px-3 py-2.5">{entrega.placaCarrotanque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-sm" style={{ color: TEMA.suave }}>
        Próxima entrega sugerida:{" "}
        <span className="font-bold" style={{ color: TEMA.texto }}>
          {datos.proximaEntregaSugerida}
        </span>{" "}
        · autonomía de {Math.floor(datos.autonomiaDias)} días menos 2 de lead time y 2 de colchón.
      </p>
    </div>
  );
}
