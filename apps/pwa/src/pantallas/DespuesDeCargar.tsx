// [6] DESPUÉS DE CARGAR (spec §8.1, pantalla 06 del contrato): el
// cuadre se resuelve ahí parado. R3 al instante con el microcopy
// aprobado; luego el contador del equipo (R7/R8). La nota aparece
// cuando el dominio la exige (R1).

import { useState } from "react";
import type { ContextoValidacion } from "@cuadreapp/dominio";
import { marcasDespuesDeCargar } from "../flujo/en-vivo";
import { aNumero, formatearGal } from "../ui/numeros";
import { MENSAJES_BANDERA } from "../ui/mensajes";
import { Aviso, BotonGrande, CampoNum, Eyebrow, Teclado, Titulo, escribirTecla } from "../ui/basicos";
import { CamaraEnVivo } from "../captura/CamaraEnVivo";
import { APP, C } from "../marca/tokens";
import type { EquipoCatalogo } from "../datos/catalogo";

type Foto = { bytes: ArrayBuffer; tipo: string };
type Campo = "tandaFin" | "totFin" | "lectura" | null;

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
  fotoFinal: Foto | null;
  onTandaFinal: (valor: string) => void;
  onTotFinal: (valor: string) => void;
  onLecturaEquipo: (valor: string) => void;
  onNota: (valor: string) => void;
  onFoto: (foto: Foto) => void;
  onGuardar: () => void;
}) {
  const [campo, setCampo] = useState<Campo>("tandaFin");

  const tandaInicial = aNumero(props.tandaInicial);
  const totInicial = aNumero(props.totInicial);
  const tandaFinal = aNumero(props.tandaFinal);
  const totFinal = aNumero(props.totFinal);
  const conMedidor = props.equipo.tipoMedidor !== "ninguno";
  const lectura = conMedidor ? aNumero(props.lecturaEquipo) : null;

  const completo =
    tandaInicial !== null && totInicial !== null && tandaFinal !== null && totFinal !== null;
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
  const noCuadra = marcas.some((m) => m.bandera === "TANDA_NO_CUADRA");
  const contadorMal = marcas.some(
    (m) => m.bandera === "CONTADOR_RETROCEDE" || m.bandera === "SALTO_CONTADOR",
  );
  const cuadra = completo && !marcas.some((m) => m.clase === "inconsistente");
  const subio = completo ? Math.round(totFinal - totInicial) : null;
  const anterior = props.contexto.equipo.ultimaLectura;

  const escribir = (tecla: string) => {
    if (campo === "tandaFin") props.onTandaFinal(escribirTecla(props.tandaFinal, tecla));
    else if (campo === "totFin") props.onTotFinal(escribirTecla(props.totFinal, tecla));
    else if (campo === "lectura") props.onLecturaEquipo(escribirTecla(props.lecturaEquipo, tecla));
  };

  const listo = completo && props.fotoFinal !== null;

  return (
    <>
      <Titulo sub="Toma la foto del cierre y copia los dos números.">Después de cargar</Titulo>
      <div className="pt-4">
        <CamaraEnVivo
          etiqueta="Foto del medidor (final)"
          instruccion="Encuadra la carátula completa"
          foto={props.fotoFinal}
          onFoto={props.onFoto}
        />
      </div>
      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <CampoNum
          rot="Tanda de arriba"
          valor={props.tandaFinal}
          unidad="gal"
          activo={campo === "tandaFin"}
          onClick={() => setCampo("tandaFin")}
          tono={noCuadra ? "malo" : null}
        />
        <CampoNum
          rot="Total gallons"
          valor={props.totFinal}
          unidad="gal"
          activo={campo === "totFin"}
          onClick={() => setCampo("totFin")}
          tono={noCuadra ? "malo" : null}
          ayuda={subio !== null ? `subió ${subio}` : undefined}
        />
        {cuadra && tandaFinal !== null && (
          <Aviso
            tono="ok"
            titulo={`Cuadra: ${formatearGal(tandaFinal)} galones`}
            cuerpo={`La tanda coincide con lo que subió el totalizador (${subio} gal). Diferencia dentro del galón de tolerancia.`}
          />
        )}
        {noCuadra && subio !== null && (
          <Aviso
            tono="malo"
            titulo={`La tanda dice ${props.tandaFinal} pero el totalizador subió ${subio}`}
            cuerpo="Revisa los números en la carátula. Si están bien copiados, sigue: el supervisor lo verá marcado."
          />
        )}
        {conMedidor ? (
          <CampoNum
            rot={
              props.equipo.tipoMedidor === "horometro" ? "Horómetro del equipo" : "Odómetro del equipo"
            }
            valor={props.lecturaEquipo}
            unidad={props.equipo.tipoMedidor === "horometro" ? "h" : "km"}
            activo={campo === "lectura"}
            onClick={() => setCampo("lectura")}
            tono={contadorMal ? "malo" : null}
            ayuda={
              anterior !== null
                ? `anterior ${anterior.toLocaleString("es-CO", { minimumFractionDigits: 1 })}`
                : undefined
            }
          />
        ) : null}
        {marcas
          .filter((m) => m.bandera !== "TANDA_NO_CUADRA")
          .map((marca) => (
            <Aviso
              key={marca.bandera}
              tono={
                marca.clase === "inconsistente"
                  ? "malo"
                  : marca.clase === "advertencia"
                    ? "alerta"
                    : "info"
              }
              titulo={MENSAJES_BANDERA[marca.bandera]}
            />
          ))}
        {props.exigeNota ? (
          <label
            className="block rounded-lg px-3 py-3"
            style={{ background: APP.tarjeta, border: `1px solid ${C.ambar}` }}
          >
            <Eyebrow color={C.ambar}>Nota obligatoria — la tanda no arrancó en 0,0</Eyebrow>
            <textarea
              value={props.nota}
              onChange={(evento) => props.onNota(evento.target.value)}
              onFocus={() => setCampo(null)}
              className="mt-2 w-full bg-transparent"
              style={{ fontSize: 13, color: C.texto, border: "none", outline: "none" }}
              rows={2}
            />
          </label>
        ) : null}
      </div>
      <div className="pt-4">
        <Teclado onTecla={escribir} />
      </div>
      <div className="px-4 pt-4">
        <BotonGrande
          onClick={() => {
            if (listo) props.onGuardar();
          }}
          tono={listo ? "primario" : "gris"}
        >
          Guardar la carga
        </BotonGrande>
      </div>
    </>
  );
}
