// Acceso al tablero: email + contraseña contra la API. Un único
// Dashboard para todos los clientes — la empresa NO se elige aquí ni
// viaja en la URL: la resuelve el RBAC del servidor a partir de quién
// inició sesión. Por eso el enlace que se comparte con un cliente es
// el mismo que el de cualquier otro.

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TEMA } from "../tema";
import { useMarca } from "../marca/useMarca";
import { iniciarSesion } from "../datos/sesion";
import { AvisoAcceso, BotonAcceso, CampoAcceso, TarjetaAcceso } from "./acceso";

/** Por qué se volvió al login sin que la persona lo pidiera (P0.4). */
const MOTIVOS_DE_VUELTA: Record<string, string> = {
  sesion: "Tu sesión expiró. Vuelve a entrar.",
  desactivado: "Tu acceso al Dashboard está desactivado. Contacta al administrador de tu empresa.",
};

export function Entrar() {
  useMarca("CuadreApp · Control de combustible en planta");
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const motivoDeVuelta = MOTIVOS_DE_VUELTA[parametros.get("motivo") ?? ""] ?? null;

  const enviar = () => {
    setEnviando(true);
    setError(null);
    void iniciarSesion(email, password)
      .then((resultado) => {
        if (!resultado.ok) {
          setError(
            resultado.motivo === "limite"
              ? "Demasiados intentos. Espera un minuto e inténtalo de nuevo."
              : resultado.motivo === "desactivado"
                ? "Tu acceso al Dashboard está desactivado. Contacta al administrador de tu empresa."
                : "Correo o contraseña incorrectos.",
          );
          return;
        }
        // Primer ingreso con la temporal: primero se define la propia.
        if (resultado.debeCambiarPassword) navegar("/contrasena-nueva", { replace: true });
        else navegar("/hoy", { replace: true });
      })
      .catch(() => setError("No se pudo contactar el servidor. Revisa la conexión."))
      .finally(() => setEnviando(false));
  };

  return (
    <TarjetaAcceso onSubmit={enviar}>
      {motivoDeVuelta && !error ? <AvisoAcceso tono="info">{motivoDeVuelta}</AvisoAcceso> : null}
      <CampoAcceso
        rotulo="Correo"
        tipo="email"
        valor={email}
        onCambio={setEmail}
        autoComplete="username"
      />
      <CampoAcceso
        rotulo="Contraseña"
        tipo="password"
        valor={password}
        onCambio={setPassword}
        autoComplete="current-password"
      />
      {error ? <AvisoAcceso>{error}</AvisoAcceso> : null}
      <BotonAcceso etiqueta="Entrar" ocupado={enviando} etiquetaOcupado="Entrando…" />
      <Link
        to="/recuperar"
        className="focus-visible:outline"
        style={{ fontSize: 11.5, color: TEMA.azul, textAlign: "center" }}
      >
        ¿Olvidaste tu contraseña?
      </Link>
      <p style={{ fontSize: 10.5, color: TEMA.tenue, lineHeight: 1.5, textAlign: "center" }}>
        Tu tablero se carga solo: la empresa, sus sedes y sus indicadores salen de tu usuario.
      </p>
    </TarjetaAcceso>
  );
}
