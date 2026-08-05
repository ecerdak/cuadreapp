// Acceso al tablero: email + contraseña contra la API. Un único
// Dashboard para todos los clientes — la empresa NO se elige aquí ni
// viaja en la URL: la resuelve el RBAC del servidor a partir de quién
// inició sesión. Por eso el enlace que se comparte con un cliente es
// el mismo que el de cualquier otro.

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TEMA } from "../tema";
import { Logotipo, Placa } from "../marca/Logotipo";
import { useMarca } from "../marca/useMarca";
import { iniciarSesion } from "../datos/sesion";
import logoLubryco from "../marca/assets/lubryco.webp";

function Campo(props: {
  rotulo: string;
  tipo: string;
  valor: string;
  onCambio: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col" style={{ gap: 5 }}>
      <span style={{ fontSize: 11, color: TEMA.suave }}>{props.rotulo}</span>
      <input
        type={props.tipo}
        required
        value={props.valor}
        onChange={(evento) => props.onCambio(evento.target.value)}
        className="rounded-md focus-visible:outline focus-visible:outline-2"
        style={{
          background: TEMA.panelAlto,
          border: `1px solid ${TEMA.linea}`,
          color: TEMA.texto,
          fontSize: 14,
          padding: "11px 12px",
        }}
      />
    </label>
  );
}

export function Entrar() {
  useMarca("CuadreApp · Control de combustible en planta");
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
        if (ok) navegar("/hoy", { replace: true });
        else setError("Correo o contraseña incorrectos.");
      })
      .catch(() => setError("No se pudo contactar el servidor. Revisa la conexión."))
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
            <Placa />
          </div>
          <div style={{ fontSize: 11, color: TEMA.suave, textAlign: "center" }}>
            Control de combustible en planta
          </div>
        </div>
        <Campo rotulo="Correo" tipo="email" valor={email} onCambio={setEmail} />
        <Campo rotulo="Contraseña" tipo="password" valor={password} onCambio={setPassword} />
        {error ? (
          <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
          style={{
            background: TEMA.amarillo,
            color: "#12202C",
            padding: "12px 20px",
            fontSize: 14,
            opacity: enviando ? 0.6 : 1,
          }}
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p style={{ fontSize: 10.5, color: TEMA.tenue, lineHeight: 1.5, textAlign: "center" }}>
          Tu tablero se carga solo: la empresa, sus sedes y sus indicadores salen de tu usuario.
        </p>
      </form>
    </div>
  );
}
