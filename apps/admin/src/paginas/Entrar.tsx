// Acceso a la consola: email + contraseña contra la API. El rol lo
// decide el RBAC del servidor — sin permiso admin.*, la consola no
// muestra nada aunque el login sea válido.

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TEMA } from "../tema";
import { Logotipo, Placa } from "../marca/Logotipo";
import { useMarca } from "../marca/useMarca";
import { iniciarSesion } from "../datos/sesion";
import { Boton, Campo } from "../ui";
import logoLubryco from "../marca/assets/lubryco.webp";

export function Entrar() {
  useMarca("CuadreApp · Admin");
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    void iniciarSesion(email, password)
      .then((ok) => {
        if (ok) navegar("/resumen");
        else setError("Correo o contraseña incorrectos.");
      })
      .catch(() => setError("No se pudo contactar la API. Revisa la conexión."))
      .finally(() => setEnviando(false));
  };

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6"
      style={{ background: TEMA.fondo, color: TEMA.texto }}
    >
      <form
        onSubmit={enviar}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg p-6"
        style={{ background: TEMA.panel, border: `1px solid ${TEMA.lineaSuave}` }}
      >
        <div className="flex flex-col items-center" style={{ gap: 10, marginBottom: 6 }}>
          <img src={logoLubryco} alt="Lubryco" style={{ height: 44, width: "auto" }} />
          <div className="flex items-center" style={{ gap: 9 }}>
            <Logotipo tam={34} />
            <Placa>ADMIN</Placa>
          </div>
          <div style={{ fontSize: 11, color: TEMA.suave }}>Consola administrativa de Lubryco</div>
        </div>
        <Campo rotulo="Correo" tipo="email" valor={email} onCambio={setEmail} requerido />
        <Campo rotulo="Contraseña" tipo="password" valor={password} onCambio={setPassword} requerido />
        {error ? (
          <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
            {error}
          </div>
        ) : null}
        <Boton tipo="submit" deshabilitado={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </Boton>
      </form>
    </div>
  );
}
