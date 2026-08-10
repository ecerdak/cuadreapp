// [4-INV] LLEGADA (perfil «Carga sobre Inventario», DEC-016): foto
// inicial del carrotanque y los galones con los que llegó. No existe
// tanda ni totalizador en este perfil. Llegar con 0,0 es válido
// (carrotanque vacío).
//
// El rótulo del botón nombra SIEMPRE lo que falta: antes decía
// «Empezar a cargar» con la foto tomada aunque faltaran los galones, y
// al tocarlo no pasaba nada. El rótulo y la acción salen ahora de la
// misma condición, así que el botón nunca aparenta poder avanzar.

import type { ReactNode } from "react";
import { aNumero } from "../ui/numeros";
import { BotonAtras, BotonGrande, CampoNum, Teclado, Titulo, escribirTecla } from "../ui/basicos";
import { CamaraEnVivo } from "../captura/CamaraEnVivo";

type Foto = { bytes: ArrayBuffer; tipo: string };

/** Rótulo del botón según lo que falta. Exportado para probarlo sin
 *  montar la pantalla: es la regla que elimina el estado muerto. */
export function rotuloLlegada(hayFoto: boolean, hayLectura: boolean): string {
  if (!hayFoto) return "Toma la foto para continuar";
  if (!hayLectura) return "Escribe los galones para seguir";
  return "Empezar a cargar";
}

export function Llegada(props: {
  llegada: string;
  fotoInicial: Foto | null;
  onLlegada: (valor: string) => void;
  onFoto: (foto: Foto) => void;
  onEmpezarACargar: () => void;
  onAtras?: () => void;
  aviso?: ReactNode;
}) {
  const llegada = aNumero(props.llegada);
  const listo = props.fotoInicial !== null && llegada !== null;
  const rotuloCta = rotuloLlegada(props.fotoInicial !== null, llegada !== null);

  return (
    <>
      {props.onAtras ? <BotonAtras onClick={props.onAtras} /> : null}
      <Titulo sub="Toma la foto del carrotanque y registra con cuántos galones llegó. Si llegó vacío, escribe 0,0.">
        Llegada del carrotanque
      </Titulo>
      <div className="pt-4">
        <CamaraEnVivo
          etiqueta="Foto inicial del carrotanque"
          instruccion="Encuadra el carrotanque completo"
          guia={null}
          foto={props.fotoInicial}
          onFoto={props.onFoto}
        />
      </div>
      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <CampoNum
          rot="Galones con los que llegó"
          valor={props.llegada}
          unidad="gal"
          activo
          onClick={() => {}}
          tono={null}
          ayuda="0,0 si llegó vacío"
        />
        {props.aviso}
      </div>
      <div className="pt-4">
        <Teclado onTecla={(tecla) => props.onLlegada(escribirTecla(props.llegada, tecla))} />
      </div>
      <div className="px-4 pt-4">
        <BotonGrande
          onClick={() => {
            if (listo) props.onEmpezarACargar();
          }}
          tono={listo ? "primario" : "gris"}
        >
          {rotuloCta}
        </BotonGrande>
      </div>
    </>
  );
}
