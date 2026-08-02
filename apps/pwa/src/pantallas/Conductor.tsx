// [3] CONDUCTOR (spec §8.1, pantalla 03 del contrato): el PIN
// identifica, no protege. Tarjeta del conductor recordado, cuatro
// puntos que se llenan en amarillo y el teclado numérico propio —
// ninguna pantalla del conductor pide escribir letras. La verificación
// es OFFLINE contra el pin_hash del catálogo (seguridad/pin.ts).

import { useState } from "react";
import type { ConductorCatalogo } from "../datos/catalogo";
import { verificarPin } from "../seguridad/pin";
import { Aviso, BotonAtras, BotonGrande, CampoNum, Eyebrow, Teclado, Titulo } from "../ui/basicos";
import { APP, C } from "../marca/tokens";

const CLAVE_ULTIMO = "cuadreapp:ultimo_conductor";

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

  const sub = props.equipoRotulo ? `Cargando ${props.equipoRotulo}` : undefined;

  function teclaCodigo(tecla: string) {
    setError(false);
    const nuevo =
      tecla === "⌫" ? codigo.slice(0, -1) : tecla === "," ? codigo : (codigo + tecla).slice(0, 4);
    setCodigo(nuevo);
    const encontrado = props.conductores.find((c) => c.codigo === nuevo);
    if (encontrado) {
      setConductor(encontrado);
      setCodigo("");
      setPin("");
    }
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

  /* Sin conductor identificado aún: teclear el código. */
  if (!conductor) {
    return (
      <>
        {props.onAtras ? <BotonAtras onClick={props.onAtras} /> : null}
        <Titulo sub={sub}>Confirma tu clave</Titulo>
        <div className="px-4 pt-5">
          <CampoNum rot="Código de conductor" valor={codigo} activo />
        </div>
        <div className="pt-5">
          <Teclado onTecla={teclaCodigo} />
        </div>
        {error ? (
          <div className="px-4 pt-4">
            <Aviso tono="malo" titulo="Código o PIN incorrecto." />
          </div>
        ) : null}
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
        }}
        className="mt-3 w-full"
        style={{ fontSize: 12.5, color: C.azul }}
      >
        No soy {conductor.nombre.split(" ")[0]} — cambiar
      </button>
    </>
  );
}
