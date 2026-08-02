// [Detalle de carga] Las dos fotos, las cuatro lecturas, los tres
// candados y las banderas — la evidencia completa de una carga
// (spec §8.2). Los mensajes por bandera tienen tono de supervisor.

import { Link, useParams } from "react-router-dom";
import type { Bandera } from "@cuadreapp/dominio";
import { useFuenteTablero } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import { ChipEstado, Esqueleto, EstadoError, VeredictoBanner } from "../componentes/basicos";
import { Candados, ParFotos } from "../componentes/medidor";
import { formatearGal } from "../componentes/numeros";
import { TEMA } from "../tema";

const MENSAJE_SUPERVISOR: Partial<Record<Bandera, string>> = {
  TANDA_NO_RESETEADA: "La tanda no arrancó en 0,0: el conductor dejó nota.",
  SALTO_TOTALIZADOR:
    "El totalizador arrancó más arriba de lo esperado. No significa que falte combustible: esos galones ya los contó el medidor — falta saber a qué equipo fueron.",
  SALTO_TOTALIZADOR_NEGATIVO:
    "El totalizador arrancó por debajo del último valor registrado: revisar lecturas.",
  TANDA_NO_CUADRA: "La tanda no coincide con lo que subió el totalizador.",
  SIN_GPS: "No fue posible verificar la ubicación (sin GPS). Solo informativo.",
  FUERA_DE_SEDE: "El GPS marcó fuera de la estación.",
  POSIBLE_DUPLICADO: "Hay otra carga del mismo equipo pocos minutos antes.",
  TIEMPO_ATIPICO: "La duración de la carga fue atípica.",
  CONTADOR_RETROCEDE: "El horómetro/odómetro quedó por debajo de la lectura anterior.",
  SALTO_CONTADOR: "El salto del horómetro/odómetro no es posible en el tiempo transcurrido.",
  EXCEDE_CAPACIDAD: "Los galones superan la capacidad del tanque del equipo.",
  FOTO_FALTANTE: "Falta evidencia fotográfica.",
  TOTALIZADOR_RETROCEDE: "El totalizador retrocedió: lectura imposible.",
  TOTALIZADOR_SIN_AVANCE: "El totalizador no se movió.",
};

export function DetalleCarga() {
  const { id } = useParams<{ id: string }>();
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.detalleCarga(id!), [id]);

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4">
        <Esqueleto alto={64} />
        <Esqueleto alto={220} />
        <Esqueleto alto={160} />
      </div>
    );
  }
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { datos } = consulta;
  const { resumen } = datos;

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/cargas"
        className="text-sm font-semibold focus-visible:outline"
        style={{ color: TEMA.azul }}
      >
        ← Volver a cargas
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">
          {resumen.equipoCodigo} · {formatearGal(resumen.galones)} gal
        </h1>
        <ChipEstado estado={resumen.estado} />
        <span className="text-sm" style={{ color: TEMA.suave }}>
          {resumen.fecha} {resumen.hora} · {resumen.conductorNombre} ·{" "}
          {Math.round(datos.duracionSegundos / 60)} min
        </span>
      </header>

      {resumen.banderas.length > 0 ? (
        <VeredictoBanner
          veredicto={{
            tono: resumen.estado === "inconsistente" ? "problema" : "atencion",
            titulo:
              resumen.banderas
                .map((bandera) => MENSAJE_SUPERVISOR[bandera])
                .filter(Boolean)
                .join(" ") || "Revisar las banderas de esta carga.",
            detalle: datos.galNoRegistrados
              ? `Tamaño del salto: ${formatearGal(datos.galNoRegistrados)} gal sin registrar.`
              : undefined,
          }}
        />
      ) : null}

      <ParFotos inicial={datos.fotos.inicial} final={datos.fotos.final} />

      <section className="rounded-xl p-4" style={{ background: TEMA.panel }}>
        <h2
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: TEMA.suave }}
        >
          Las cuatro lecturas
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {(
            [
              ["Tanda inicial", datos.lecturas.tandaInicial],
              ["Totalizador inicial", datos.lecturas.totInicial],
              ["Tanda final", datos.lecturas.tandaFinal],
              ["Totalizador final", datos.lecturas.totFinal],
            ] as const
          ).map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt style={{ color: TEMA.suave }}>{rotulo}</dt>
              <dd className="text-lg font-bold tabular-nums">{formatearGal(valor)}</dd>
            </div>
          ))}
        </dl>
        {datos.lecturaEquipo !== null ? (
          <p className="mt-3 text-sm" style={{ color: TEMA.suave }}>
            Contador del equipo ({datos.tipoLectura}):{" "}
            <span className="font-bold tabular-nums" style={{ color: TEMA.texto }}>
              {formatearGal(datos.lecturaEquipo)}
            </span>
          </p>
        ) : null}
      </section>

      <section>
        <h2
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: TEMA.suave }}
        >
          Los tres candados aritméticos
        </h2>
        <Candados candados={datos.candados} />
      </section>

      {datos.notas ? (
        <section className="rounded-xl p-4" style={{ background: TEMA.panel }}>
          <h2
            className="mb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: TEMA.suave }}
          >
            Nota del conductor
          </h2>
          <p className="text-sm">{datos.notas}</p>
        </section>
      ) : null}
    </div>
  );
}
