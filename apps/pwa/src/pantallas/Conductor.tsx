// [3] CONDUCTOR (spec §8.1): código + PIN, verificado OFFLINE contra
// el pin_hash del catálogo del dispositivo enrolado. El PIN identifica,
// no protege (§5) — la defensa son los candados aritméticos y las
// fotos. Recuerda el último conductor del dispositivo.

import { useState } from "react";
import type { ConductorCatalogo } from "../datos/catalogo";
import { verificarPin } from "../seguridad/pin";
import { Aviso, BotonPrincipal, CampoNumerico, Pantalla } from "../ui/basicos";

const CLAVE_ULTIMO = "cuadreapp:ultimo_conductor";

export function Conductor(props: {
  conductores: ConductorCatalogo[];
  onIdentificado: (conductor: ConductorCatalogo) => void;
}) {
  const [codigo, setCodigo] = useState(localStorage.getItem(CLAVE_ULTIMO) ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function confirmar() {
    const conductor = props.conductores.find((c) => c.codigo === codigo.trim());
    if (!conductor || !verificarPin(pin.trim(), conductor.pinHash)) {
      setError(true);
      return;
    }
    localStorage.setItem(CLAVE_ULTIMO, conductor.codigo);
    props.onIdentificado(conductor);
  }

  return (
    <Pantalla titulo="¿Quién eres?">
      <CampoNumerico etiqueta="Código" valor={codigo} onCambio={setCodigo} />
      <CampoNumerico etiqueta="PIN" valor={pin} onCambio={setPin} />
      {error ? <Aviso tipo="inconsistente">Código o PIN incorrecto.</Aviso> : null}
      <BotonPrincipal onClick={confirmar} deshabilitado={codigo.trim() === "" || pin.trim() === ""}>
        Continuar
      </BotonPrincipal>
    </Pantalla>
  );
}
