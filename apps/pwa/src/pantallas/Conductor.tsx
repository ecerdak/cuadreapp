// [3] CONDUCTOR (spec §8.1, pantalla 03 del contrato): el PIN
// identifica, no protege. Tarjeta del conductor recordado, cuatro
// puntos que se llenan en amarillo y el teclado numérico propio —
// ninguna pantalla del conductor pide escribir letras. La verificación
// es OFFLINE contra el pin_hash del catálogo (seguridad/pin.ts).
//
// El código se compara SIEMPRE como texto exacto: '01' no es '1'. Los
// códigos del catálogo se muestran en pantalla y son tocables, para
// que teclear un código inexistente nunca deje la pantalla sin salida;
// cuando lo tecleado alcanza la longitud de los códigos del catálogo
// sin coincidir, se dice explícitamente que no existe.

import { useState } from "react";
import type { ConductorCatalogo } from "../datos/catalogo";
import { verificarPin } from "../seguridad/pin";
import { Aviso, BotonAtras, BotonGrande, CampoNum, Eyebrow, Teclado, Titulo } from "../ui/basicos";
import { APP, C } from "../marca/tokens";

const CLAVE_ULTIMO = "cuadreapp:ultimo_conductor";

/** Longitud a partir de la cual un código sin coincidencia ya es un
 *  error y no un prefijo incompleto. Sale del propio catálogo, así que
 *  ninguna convención de códigos queda cableada en el código. */
export function longitudCodigoEsperada(conductores: ConductorCatalogo[]): number {
  return conductores.reduce((maxima, c) => Math.max(maxima, c.codigo.length), 0);
}

/** Veredicto de lo tecleado. `encontrado` solo con coincidencia EXACTA
 *  de texto ('01' nunca es '1'); `noExiste` solo cuando ya no puede ser
 *  el prefijo de un código del catálogo — antes de eso no se avisa. */
export function evaluarCodigo(
  conductores: ConductorCatalogo[],
  codigo: string,
): { encontrado: ConductorCatalogo | null; noExiste: boolean } {
  const encontrado = conductores.find((c) => c.codigo === codigo) ?? null;
  if (encontrado) return { encontrado, noExiste: false };
  const esperada = longitudCodigoEsperada(conductores);
  return { encontrado: null, noExiste: codigo.length > 0 && codigo.length >= esperada };
}

export function Conductor(props: {
  conductores: ConductorCatalogo[];
  equipoRotulo?: string;
  onIdentificado: (conductor: ConductorCatalogo) => void;
  onAtras?: () => void;
}) {
  const recordado = props.conductores.find((c) => c.codigo === localStorage.getItem(CLAVE_ULTIMO));
  const [conductor, setConductor] = useState<ConductorCatalogo | null>(recordado ?? null);
  const [codigo, setCodigo] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [codigoNoExiste, setCodigoNoExiste] = useState(false);

  const sub = props.equipoRotulo ? `Cargando ${props.equipoRotulo}` : undefined;

  function identificar(elegido: ConductorCatalogo) {
    setConductor(elegido);
    setCodigo("");
    setPin("");
    setCodigoNoExiste(false);
    setError(false);
  }

  function teclaCodigo(tecla: string) {
    setError(false);
    const nuevo =
      tecla === "⌫" ? codigo.slice(0, -1) : tecla === "," ? codigo : (codigo + tecla).slice(0, 4);
    setCodigo(nuevo);
    const { encontrado, noExiste } = evaluarCodigo(props.conductores, nuevo);
    if (encontrado) {
      identificar(encontrado);
      return;
    }
    setCodigoNoExiste(noExiste);
  }

  function teclaPin(tecla: string) {
    setError(false);
    setPin(tecla === "⌫" ? pin.slice(0, -1) : tecla === "," ? pin : (pin + tecla).slice(0, 4));
  }

  function confirmar() {
    if (!conductor || pin.length !== 4) return;
    if (!verificarPin(pin, conductor.pinHash)) {
      setError(true);
      return;
    }
    localStorage.setItem(CLAVE_ULTIMO, conductor.codigo);
    props.onIdentificado(conductor);
  }

  /* Sin conductor identificado aún: teclear el código o tocarlo en la
     lista. La lista es la salida garantizada: la pantalla nunca queda
     sin acción posible aunque el código tecleado no exista. */
  if (!conductor) {
    return (
      <>
        {props.onAtras ? <BotonAtras onClick={props.onAtras} /> : null}
        <Titulo sub={sub}>Confirma tu clave</Titulo>
        <div className="px-4 pt-5">
          <CampoNum
            rot="Código de conductor"
            valor={codigo}
            activo
            tono={codigoNoExiste ? "malo" : null}
          />
        </div>
        {codigoNoExiste ? (
          <div className="px-4 pt-3">
            <Aviso tono="malo" titulo="Código de operador no encontrado." />
          </div>
        ) : null}
        <div className="pt-5">
          <Teclado onTecla={teclaCodigo} />
        </div>
        <div className="px-4 pt-5">
          <Eyebrow>Operadores de esta sede</Eyebrow>
          <div className="mt-2 flex flex-col" style={{ gap: 7 }}>
            {props.conductores.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => identificar(c)}
                className="w-full rounded-lg px-3 py-3 text-left"
                style={{ background: APP.tarjeta, border: `1px solid ${C.lineaSuave}` }}
              >
                <div className="font-semibold" style={{ fontSize: 15 }}>
                  {c.nombre}
                </div>
                <div style={{ fontSize: 11, color: C.suave }}>
                  Código <span className="font-mono">{c.codigo}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {props.onAtras ? <BotonAtras onClick={props.onAtras} /> : null}
      <Titulo sub={sub}>Confirma tu clave</Titulo>
      <div className="px-4 pt-5">
        <div
          className="rounded-lg px-3 py-3"
          style={{ background: APP.tarjeta, border: `1px solid ${C.lineaSuave}` }}
        >
          <Eyebrow>Conductor</Eyebrow>
          <div className="font-semibold" style={{ fontSize: 16, marginTop: 3 }}>
            {conductor.nombre}
          </div>
          <div style={{ fontSize: 11, color: C.suave }}>Código {conductor.codigo}</div>
        </div>
        <div className="mt-6 flex justify-center" style={{ gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                width: 15,
                height: 15,
                borderRadius: 8,
                background: pin.length > i ? C.amarillo : "transparent",
                border: `1.5px solid ${pin.length > i ? C.amarillo : C.linea}`,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.suave, textAlign: "center", marginTop: 10 }}>
          Cuatro dígitos
        </div>
      </div>
      <div className="pt-5">
        <Teclado onTecla={teclaPin} />
      </div>
      {error ? (
        <div className="px-4 pt-4">
          <Aviso tono="malo" titulo="Código o PIN incorrecto." />
        </div>
      ) : null}
      <div className="px-4 pt-4">
        <BotonGrande onClick={confirmar} tono={pin.length === 4 ? "primario" : "gris"}>
          Continuar
        </BotonGrande>
      </div>
      <button
        type="button"
        onClick={() => {
          setConductor(null);
          setPin("");
          setError(false);
          setCodigoNoExiste(false);
        }}
        className="mt-3 w-full"
        style={{ fontSize: 12.5, color: C.azul }}
      >
        No soy {conductor.nombre.split(" ")[0]} — cambiar
      </button>
    </>
  );
}
