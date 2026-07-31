// [6] DESPUÉS DE CARGAR (spec §8.1): R3 al instante — "Cuadra: 42,5
// galones" o el aviso del dominio. Luego el horómetro/odómetro (R7,
// R8). La nota aparece cuando el dominio la exige (R1).

import type { ContextoValidacion } from "@cuadreapp/dominio";
import { marcasDespuesDeCargar } from "../flujo/en-vivo";
import { aNumero, formatearGal } from "../ui/numeros";
import { MENSAJES_BANDERA } from "../ui/mensajes";
import { Aviso, BotonPrincipal, CampoNumerico, Pantalla } from "../ui/basicos";
import { CamaraEnVivo } from "../captura/CamaraEnVivo";
import type { EquipoCatalogo } from "../datos/catalogo";

export function DespuesDeCargar(props: {
  contexto: ContextoValidacion;
  equipo: EquipoCatalogo;
  tandaInicial: string;
  totInicial: string;
  iniciadaEn: string;
  tandaFinal: string;
  totFinal: string;
  lecturaEquipo: string;
  nota: string;
  exigeNota: boolean;
  fotoFinal: boolean;
  onTandaFinal: (valor: string) => void;
  onTotFinal: (valor: string) => void;
  onLecturaEquipo: (valor: string) => void;
  onNota: (valor: string) => void;
  onFoto: (foto: { bytes: ArrayBuffer; tipo: string }) => void;
  onGuardar: () => void;
}) {
  const tandaInicial = aNumero(props.tandaInicial);
  const totInicial = aNumero(props.totInicial);
  const tandaFinal = aNumero(props.tandaFinal);
  const totFinal = aNumero(props.totFinal);
  const lectura = props.equipo.tipoMedidor === "ninguno" ? null : aNumero(props.lecturaEquipo);

  const completo = tandaInicial !== null && totInicial !== null && tandaFinal !== null && totFinal !== null;
  const marcas = completo
    ? marcasDespuesDeCargar(
        {
          tandaInicialGal: tandaInicial,
          totInicialGal: totInicial,
          tandaFinalGal: tandaFinal,
          totFinalGal: totFinal,
          lecturaEquipo: lectura,
          iniciadaEn: props.iniciadaEn,
        },
        props.contexto,
      )
    : [];
  const cuadra = completo && !marcas.some((m) => m.clase === "inconsistente");

  return (
    <Pantalla titulo="Después de cargar">
      <CamaraEnVivo etiqueta="Foto del medidor (final)" hayFoto={props.fotoFinal} onFoto={props.onFoto} />

      <CampoNumerico etiqueta="Tanda final" valor={props.tandaFinal} onCambio={props.onTandaFinal} />
      <CampoNumerico etiqueta="Totalizador final" valor={props.totFinal} onCambio={props.onTotFinal} />
      {props.equipo.tipoMedidor !== "ninguno" ? (
        <CampoNumerico
          etiqueta={props.equipo.tipoMedidor === "horometro" ? "Horómetro" : "Odómetro (km)"}
          valor={props.lecturaEquipo}
          onCambio={props.onLecturaEquipo}
        />
      ) : null}

      {cuadra && tandaFinal !== null ? (
        <Aviso tipo="info">✓ Cuadra: {formatearGal(tandaFinal)} galones.</Aviso>
      ) : null}
      {marcas.map((marca) => (
        <Aviso key={marca.bandera} tipo={marca.clase === "info" ? "info" : marca.clase}>
          {MENSAJES_BANDERA[marca.bandera]}
        </Aviso>
      ))}

      {props.exigeNota ? (
        <label className="block">
          <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-amber-300">
            Nota obligatoria (la tanda no arrancó en 0,0)
          </span>
          <textarea
            value={props.nota}
            onChange={(evento) => props.onNota(evento.target.value)}
            className="w-full rounded-xl border border-[#22374A] bg-[#121C25] p-3"
            rows={2}
          />
        </label>
      ) : null}

      <BotonPrincipal onClick={props.onGuardar} deshabilitado={!completo || !props.fotoFinal}>
        Guardar
      </BotonPrincipal>
    </Pantalla>
  );
}
