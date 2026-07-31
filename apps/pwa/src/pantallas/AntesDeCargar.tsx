// [4] ANTES DE CARGAR (spec §8.1): foto + lecturas antes de abrir la
// manguera. R1 y R2 se evalúan en vivo — la UI solo muestra lo que el
// dominio marca. El totalizador viene pre-llenado con el último valor
// conocido; si el conductor lo cambia, R2 avisa y deja seguir.

import type { ContextoValidacion } from "@cuadreapp/dominio";
import { marcasAntesDeCargar } from "../flujo/en-vivo";
import { aNumero, formatearGal } from "../ui/numeros";
import { MENSAJES_BANDERA } from "../ui/mensajes";
import { Aviso, BotonPrincipal, CampoNumerico, Pantalla } from "../ui/basicos";
import { CamaraEnVivo } from "../captura/CamaraEnVivo";

export function AntesDeCargar(props: {
  contexto: ContextoValidacion;
  tandaInicial: string;
  totInicial: string;
  fotoInicial: boolean;
  onTandaInicial: (valor: string) => void;
  onTotInicial: (valor: string) => void;
  onFoto: (foto: { bytes: ArrayBuffer; tipo: string }) => void;
  onEmpezarACargar: () => void;
}) {
  const tanda = aNumero(props.tandaInicial);
  const tot = aNumero(props.totInicial);
  const marcas =
    tanda !== null && tot !== null
      ? marcasAntesDeCargar({ tandaInicialGal: tanda, totInicialGal: tot }, props.contexto)
      : [];

  return (
    <Pantalla titulo="Antes de cargar">
      <p className="text-lg">Deja la tanda en 0,0 y toma la foto del medidor.</p>

      <CamaraEnVivo etiqueta="Foto del medidor (inicial)" hayFoto={props.fotoInicial} onFoto={props.onFoto} />

      <CampoNumerico etiqueta="Tanda (debe ser 0,0)" valor={props.tandaInicial} onCambio={props.onTandaInicial} />
      <CampoNumerico
        etiqueta="Totalizador"
        valor={props.totInicial}
        onCambio={props.onTotInicial}
        ayuda={`Último conocido: ${formatearGal(props.contexto.dispensador.totActualGal)}`}
      />

      {marcas.map((marca) => (
        <Aviso key={marca.bandera} tipo={marca.clase === "info" ? "info" : marca.clase}>
          {MENSAJES_BANDERA[marca.bandera]}
          {marca.galNoRegistrados !== undefined
            ? ` (diferencia: ${formatearGal(marca.galNoRegistrados)} gal)`
            : null}
        </Aviso>
      ))}

      <BotonPrincipal
        onClick={props.onEmpezarACargar}
        deshabilitado={!props.fotoInicial || tanda === null || tot === null}
      >
        Empezar a cargar
      </BotonPrincipal>
    </Pantalla>
  );
}
