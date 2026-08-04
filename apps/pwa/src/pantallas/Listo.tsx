// [7] LISTO (spec §8.1, pantalla 07 del contrato): círculo verde,
// cifra grande en mono y la tarjeta de resumen de cinco filas. Sin
// señal, el aviso ámbar aprobado: la carga ya quedó registrada. El
// veredicto del servidor (la autoridad) reemplaza al local al llegar.

import type { CargaLocal } from "../offline/bd";
import { COLOR_ESTADO, MENSAJES_BANDERA, TEXTO_ESTADO } from "../ui/mensajes";
import { formatearGal } from "../ui/numeros";
import { Aviso, BotonGrande, FilaResumen, Tarjeta } from "../ui/basicos";
import { C } from "../marca/tokens";

const entero = (valor: number) => Math.round(valor).toLocaleString("es-CO");

export function Listo(props: {
  carga: CargaLocal | undefined;
  equipoDescripcion?: string;
  onOtraCarga: () => void;
}) {
  if (!props.carga) return null;
  const { carga } = props;
  const estado = carga.veredictoServidor?.estado ?? carga.estadoLocal;
  const banderas = carga.veredictoServidor?.banderas ?? carga.banderasLocales;
  const { payload } = carga;
  const hora = new Date(payload.finalizada_en).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <>
      <div className="flex flex-col items-center px-4" style={{ paddingTop: 40 }}>
        <span
          className="flex items-center justify-center font-bold"
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            background: `${C.verde}22`,
            color: C.verde,
            fontSize: 30,
            border: `1px solid ${C.verde}66`,
          }}
        >
          ✓
        </span>
        <div
          className="font-mono font-bold"
          style={{ fontSize: 52, marginTop: 18, letterSpacing: "-0.02em" }}
        >
          {formatearGal(carga.resumen.galones)}
        </div>
        <div style={{ fontSize: 12, color: C.suave }}>galones cargados</div>

        <Tarjeta className="mt-7 w-full">
          <FilaResumen
            rotulo="Equipo"
            valor={
              props.equipoDescripcion
                ? `${carga.resumen.equipoCodigo} · ${props.equipoDescripcion}`
                : carga.resumen.equipoCodigo
            }
          />
          <FilaResumen rotulo="Conductor" valor={carga.resumen.conductorNombre} />
          <FilaResumen rotulo="Hora" valor={hora} />
          {"tot_inicial_gal" in payload ? (
            <FilaResumen
              rotulo="Medidor"
              valor={`${entero(payload.tot_inicial_gal)} → ${entero(payload.tot_final_gal)}`}
            />
          ) : (
            <>
              <FilaResumen rotulo="Llegó con" valor={`${formatearGal(payload.llegada_gal)} gal`} />
              <FilaResumen
                rotulo="Despachado por Lubryco"
                valor={`${formatearGal(payload.despachados_gal)} gal`}
              />
              {carga.resumen.inventarioFinalGal !== undefined ? (
                <FilaResumen
                  rotulo="Total al salir"
                  valor={`${formatearGal(carga.resumen.inventarioFinalGal)} gal`}
                  destacado
                />
              ) : null}
            </>
          )}
          {"lectura_equipo" in payload && payload.lectura_equipo !== null ? (
            <FilaResumen
              rotulo="Contador del equipo"
              valor={payload.lectura_equipo.toLocaleString("es-CO", { minimumFractionDigits: 1 })}
            />
          ) : null}
        </Tarjeta>

        <div className="mt-3 flex w-full items-center justify-center" style={{ gap: 8 }}>
          <span
            className="rounded-full px-2 py-1 font-semibold uppercase"
            style={{
              fontSize: 9.5,
              letterSpacing: "0.08em",
              color: COLOR_ESTADO[estado],
              background: `${COLOR_ESTADO[estado]}1F`,
              border: `1px solid ${COLOR_ESTADO[estado]}55`,
            }}
          >
            {TEXTO_ESTADO[estado]}
          </span>
        </div>

        {banderas.length > 0 ? (
          <div className="mt-3 flex w-full flex-col" style={{ gap: 8 }}>
            {banderas.map((bandera) => (
              <Aviso key={bandera} tono="info" titulo={MENSAJES_BANDERA[bandera]} />
            ))}
          </div>
        ) : null}

        {carga.sincronizacion !== "sincronizada" ? (
          <div className="mt-4 w-full">
            <Aviso
              tono="alerta"
              titulo="Guardado en el celular"
              cuerpo="No hay señal en este momento. La carga se sube sola cuando vuelva la red. Ya quedó registrada."
            />
          </div>
        ) : (
          <div className="mt-4 text-center" style={{ fontSize: 11, color: C.suave }}>
            ✓ Guardado y sincronizado
            {carga.veredictoServidor?.request_id
              ? ` · soporte: ${carga.veredictoServidor.request_id}`
              : ""}
          </div>
        )}
      </div>
      <div className="px-4" style={{ paddingTop: 22 }}>
        <BotonGrande onClick={props.onOtraCarga}>Registrar otra carga</BotonGrande>
      </div>
    </>
  );
}
