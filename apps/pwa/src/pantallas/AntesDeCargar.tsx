// [4] ANTES DE CARGAR (spec §8.1, pantalla 04 del contrato): foto y
// lectura antes de abrir la manguera. R1 y R2 se evalúan en vivo — la
// UI solo muestra lo que el dominio marca, con el microcopy aprobado
// (los mensajes no acusan). El botón queda en gris hasta la foto (R9).

import { useState } from "react";
import type { ContextoValidacion } from "@cuadreapp/dominio";
import { marcasAntesDeCargar } from "../flujo/en-vivo";
import { aNumero } from "../ui/numeros";
import { MENSAJES_BANDERA } from "../ui/mensajes";
import { Aviso, BotonAtras, BotonGrande, CampoNum, Teclado, Titulo, escribirTecla } from "../ui/basicos";
import { CamaraEnVivo } from "../captura/CamaraEnVivo";

const entero = (valor: number) => Math.round(valor).toLocaleString("es-CO");

type Foto = { bytes: ArrayBuffer; tipo: string };

export function AntesDeCargar(props: {
  contexto: ContextoValidacion;
  tandaInicial: string;
  totInicial: string;
  fotoInicial: Foto | null;
  onTandaInicial: (valor: string) => void;
  onTotInicial: (valor: string) => void;
  onFoto: (foto: Foto) => void;
  onEmpezarACargar: () => void;
  onAtras?: () => void;
}) {
  const [campo, setCampo] = useState<"tanda" | "tot">("tot");
  const tanda = aNumero(props.tandaInicial);
  const tot = aNumero(props.totInicial);
  const esperado = props.contexto.dispensador.totActualGal;
  const marcas =
    tanda !== null && tot !== null
      ? marcasAntesDeCargar({ tandaInicialGal: tanda, totInicialGal: tot }, props.contexto)
      : [];
  const tandaMal = marcas.some((m) => m.bandera === "TANDA_NO_RESETEADA");
  const salto = marcas.find((m) => m.bandera === "SALTO_TOTALIZADOR");
  const listo = props.fotoInicial !== null && tanda !== null && tot !== null;

  return (
    <>
      {props.onAtras ? <BotonAtras onClick={props.onAtras} /> : null}
      <Titulo sub="Deja el medidor en 0.0 y toma la foto. Una sola foto muestra los dos números.">
        Antes de cargar
      </Titulo>
      <div className="pt-4">
        <CamaraEnVivo
          etiqueta="Foto del medidor (inicial)"
          instruccion="Encuadra la carátula completa"
          foto={props.fotoInicial}
          onFoto={props.onFoto}
        />
      </div>
      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <CampoNum
          rot="Tanda de arriba"
          valor={props.tandaInicial}
          unidad="gal"
          activo={campo === "tanda"}
          onClick={() => setCampo("tanda")}
          tono={tandaMal ? "alerta" : null}
          ayuda="debe ser 0,0"
        />
        <CampoNum
          rot="Total gallons"
          valor={props.totInicial}
          unidad="gal"
          activo={campo === "tot"}
          onClick={() => setCampo("tot")}
          tono={
            salto || marcas.some((m) => m.bandera === "SALTO_TOTALIZADOR_NEGATIVO") ? "alerta" : null
          }
          ayuda={`esperado ${entero(esperado)}`}
        />
        {tandaMal && (
          <Aviso
            tono="alerta"
            titulo="La tanda no está en cero"
            cuerpo="Gira la perilla hasta 0.0 y vuelve a tomar la foto. Si no puedes, sigue y quedará anotado."
          />
        )}
        {salto && salto.galNoRegistrados !== undefined && (
          <Aviso
            tono="alerta"
            titulo={`El medidor arrancó ${entero(salto.galNoRegistrados)} gal más arriba`}
            cuerpo={`Se esperaba ${entero(esperado)}. Alguien cargó sin registrar. El combustible no se perdió: lo que falta es saber a qué equipo fue. Puedes seguir.`}
          />
        )}
        {marcas
          .filter((m) => m.bandera !== "TANDA_NO_RESETEADA" && m.bandera !== "SALTO_TOTALIZADOR")
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
      </div>
      <div className="pt-4">
        <Teclado
          onTecla={(tecla) =>
            campo === "tanda"
              ? props.onTandaInicial(escribirTecla(props.tandaInicial, tecla))
              : props.onTotInicial(escribirTecla(props.totInicial, tecla))
          }
        />
      </div>
      <div className="px-4 pt-4">
        <BotonGrande
          onClick={() => {
            if (listo) props.onEmpezarACargar();
          }}
          tono={listo ? "primario" : "gris"}
        >
          {props.fotoInicial ? "Empezar a cargar" : "Toma la foto para seguir"}
        </BotonGrande>
      </div>
    </>
  );
}
