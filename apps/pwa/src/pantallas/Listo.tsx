// [7] LISTO (spec §8.1): resumen grande y chip de estado de
// sincronización. El estado que se muestra es el del dominio; cuando
// llega el veredicto del servidor (la autoridad), reemplaza al local.

import type { CargaLocal } from "../offline/bd";
import { ETIQUETA_ESTADO, MENSAJES_BANDERA } from "../ui/mensajes";
import { formatearGal } from "../ui/numeros";
import { Aviso, BotonPrincipal, Pantalla } from "../ui/basicos";

export function Listo(props: { carga: CargaLocal | undefined; onOtraCarga: () => void }) {
  if (!props.carga) return null;
  const { carga } = props;
  const estado = carga.veredictoServidor?.estado ?? carga.estadoLocal;
  const banderas = carga.veredictoServidor?.banderas ?? carga.banderasLocales;
  const etiqueta = ETIQUETA_ESTADO[estado];

  return (
    <Pantalla titulo="Registro guardado">
      <div className="rounded-2xl bg-[#121C25] p-6 text-center">
        <div className="text-5xl font-bold tabular-nums">{formatearGal(carga.resumen.galones)} gal</div>
        <div className="mt-2 text-lg text-[#8AA0B6]">
          {carga.resumen.equipoCodigo} · {carga.resumen.conductorNombre}
        </div>
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${etiqueta.clase}`}>
          {etiqueta.texto}
        </span>
      </div>

      {banderas.map((bandera) => (
        <Aviso key={bandera} tipo="info">
          {MENSAJES_BANDERA[bandera]}
        </Aviso>
      ))}

      <div className="text-center text-sm font-semibold text-[#8AA0B6]">
        {carga.sincronizacion === "sincronizada"
          ? `✓ Guardado y sincronizado${carga.veredictoServidor?.request_id ? ` · soporte: ${carga.veredictoServidor.request_id}` : ""}`
          : "Guardado. En cola: se sube cuando haya señal."}
      </div>

      <BotonPrincipal onClick={props.onOtraCarga}>Registrar otra carga</BotonPrincipal>
    </Pantalla>
  );
}
