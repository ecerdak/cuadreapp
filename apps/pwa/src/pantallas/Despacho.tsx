// [6-INV] DESPACHO (perfil «Carga sobre Inventario», DEC-016): foto
// final y los galones despachados por Lubryco. El TOTAL AL SALIR se
// calcula solo (llegada + despachados, cálculo del dominio) — el
// operador jamás lo escribe. El botón queda en gris hasta la foto.

import { calcularInventarioFinal } from "@cuadreapp/dominio";
import { aNumero, formatearGal } from "../ui/numeros";
import {
  Aviso,
  BotonAtras,
  BotonGrande,
  CampoNum,
  FilaResumen,
  Tarjeta,
  Teclado,
  Titulo,
  escribirTecla,
} from "../ui/basicos";
import { CamaraEnVivo } from "../captura/CamaraEnVivo";
import { C } from "../marca/tokens";

type Foto = { bytes: ArrayBuffer; tipo: string };

export function Despacho(props: {
  llegada: string;
  despachados: string;
  fotoFinal: Foto | null;
  nota: string;
  onDespachados: (valor: string) => void;
  onNota: (valor: string) => void;
  onFoto: (foto: Foto) => void;
  onGuardar: () => void;
  onAtras?: () => void;
  guardando?: boolean;
}) {
  const llegada = aNumero(props.llegada);
  const despachados = aNumero(props.despachados);
  const total =
    llegada !== null && despachados !== null ? calcularInventarioFinal(llegada, despachados) : null;
  const listo = props.fotoFinal !== null && despachados !== null && !props.guardando;

  return (
    <>
      {props.onAtras ? <BotonAtras onClick={props.onAtras} /> : null}
      <Titulo sub="Toma la foto final y registra cuántos galones despachó Lubryco. El total al salir se calcula solo.">
        Después de cargar
      </Titulo>
      <div className="pt-4">
        <CamaraEnVivo
          etiqueta="Foto final del carrotanque"
          instruccion="Encuadra el carrotanque completo"
          guia={null}
          foto={props.fotoFinal}
          onFoto={props.onFoto}
        />
      </div>
      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <CampoNum
          rot="Galones despachados por Lubryco"
          valor={props.despachados}
          unidad="gal"
          activo
          onClick={() => {}}
          tono={despachados !== null && despachados <= 0 ? "alerta" : null}
          ayuda={llegada !== null ? `llegó con ${formatearGal(llegada)}` : undefined}
        />
        {despachados !== null && despachados <= 0 ? (
          <Aviso
            tono="alerta"
            titulo="No se registró despacho"
            cuerpo="Con 0,0 galones despachados la carga quedará marcada para revisión. Puedes seguir."
          />
        ) : null}
        <Tarjeta>
          <FilaResumen
            rotulo="Llegó con"
            valor={llegada !== null ? `${formatearGal(llegada)} gal` : "—"}
          />
          <FilaResumen
            rotulo="Despachado por Lubryco"
            valor={despachados !== null ? `${formatearGal(despachados)} gal` : "—"}
          />
          <FilaResumen
            rotulo="Total al salir"
            valor={total !== null ? `${formatearGal(total)} gal` : "—"}
            destacado
          />
        </Tarjeta>
        <div style={{ fontSize: 10.5, color: C.suave, textAlign: "center" }}>
          El total lo calcula la aplicación — nunca se escribe a mano.
        </div>
        <label className="block">
          <span style={{ fontSize: 11, color: C.suave }}>Observaciones (opcional)</span>
          <textarea
            value={props.nota}
            onChange={(evento) => props.onNota(evento.target.value)}
            className="mt-2 w-full bg-transparent"
            style={{
              fontSize: 13,
              color: C.texto,
              border: `1px solid ${C.linea}`,
              borderRadius: 8,
              padding: 8,
              outline: "none",
            }}
            rows={2}
          />
        </label>
      </div>
      <div className="pt-4">
        <Teclado onTecla={(tecla) => props.onDespachados(escribirTecla(props.despachados, tecla))} />
      </div>
      <div className="px-4 pt-4">
        <BotonGrande
          onClick={() => {
            if (listo) props.onGuardar();
          }}
          tono={listo ? "primario" : "gris"}
        >
          {props.guardando
            ? "Guardando…"
            : props.fotoFinal
              ? "Guardar la carga"
              : "Toma la foto para seguir"}
        </BotonGrande>
      </div>
    </>
  );
}
