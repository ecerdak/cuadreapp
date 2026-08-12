// Ciclo de contraseña del Dashboard (P0.1).
//
// · Primer ingreso: la contraseña temporal de la consola sirve para
//   ENTRAR una vez; aquí se define la propia antes de ver el tablero
//   (la autoridad es la API: 403 PASSWORD_TEMPORAL mientras tanto).
// · Cambio voluntario: desde el marco, con la contraseña actual.
// · Recuperación: dispara el correo; la respuesta nunca revela si la
//   cuenta existe.
// · Restablecimiento: consume la sesión que trae el enlace del correo.

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TEMA } from "../tema";
import { useMarca } from "../marca/useMarca";
import {
  cambiarPassword,
  cerrarSesion,
  restablecerPassword,
  solicitarRecuperacion,
  tokensDelFragmento,
  tomarPasswordTemporal,
} from "../datos/sesion";
import { AvisoAcceso, BotonAcceso, CampoAcceso, TarjetaAcceso } from "./acceso";

const MINIMO = 10;

/** Validación local con frases humanas; la API vuelve a validar. */
function problemaDeContrasena(nueva: string, confirmacion: string): string | null {
  if (nueva.length < MINIMO) {
    return `La contraseña nueva debe tener al menos ${MINIMO} caracteres.`;
  }
  if (nueva !== confirmacion) return "Las contraseñas no coinciden.";
  return null;
}

function FormularioContrasena(props: {
  titulo: string;
  descripcion: string;
  /** null = la contraseña actual se pide en el formulario. */
  passwordActualConocida: string | null;
  etiquetaEnviar: string;
  alCambiar: () => void;
  /** Salida bajo el botón: ninguna pantalla de acceso es un callejón. */
  pie?: React.ReactNode;
}) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = () => {
    const problema = problemaDeContrasena(nueva, confirmacion);
    if (problema) {
      setError(problema);
      return;
    }
    setEnviando(true);
    setError(null);
    void cambiarPassword(props.passwordActualConocida ?? actual, nueva)
      .then((resultado) => {
        if (resultado === "ok") {
          props.alCambiar();
          return;
        }
        setError(
          resultado === "actual_incorrecta"
            ? "La contraseña actual no es correcta."
            : "No se pudo cambiar la contraseña. Intenta de nuevo.",
        );
      })
      .finally(() => setEnviando(false));
  };

  return (
    <TarjetaAcceso onSubmit={enviar} bajada={props.titulo}>
      <p style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.55, margin: 0 }}>{props.descripcion}</p>
      {props.passwordActualConocida === null ? (
        <CampoAcceso
          rotulo="Contraseña actual"
          tipo="password"
          valor={actual}
          onCambio={setActual}
          autoComplete="current-password"
        />
      ) : null}
      <CampoAcceso
        rotulo={`Contraseña nueva (mínimo ${MINIMO} caracteres)`}
        tipo="password"
        valor={nueva}
        onCambio={setNueva}
        autoComplete="new-password"
      />
      <CampoAcceso
        rotulo="Repite la contraseña nueva"
        tipo="password"
        valor={confirmacion}
        onCambio={setConfirmacion}
        autoComplete="new-password"
      />
      {error ? <AvisoAcceso>{error}</AvisoAcceso> : null}
      <BotonAcceso etiqueta={props.etiquetaEnviar} ocupado={enviando} />
      {props.pie ?? null}
    </TarjetaAcceso>
  );
}

/** Salida de las pantallas con sesión pero sin marco: cierra la sesión
 *  y vuelve al login. La usa el primer ingreso forzado — la persona
 *  puede estar en la cuenta equivocada o no tener la temporal a mano. */
function SalidaCerrarSesion() {
  const navegar = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        void cerrarSesion().then(() => navegar("/entrar", { replace: true }));
      }}
      className="focus-visible:outline"
      style={{ fontSize: 11.5, color: TEMA.azul, textAlign: "center" }}
    >
      Cerrar sesión
    </button>
  );
}

/** Primer ingreso: obligatorio antes de ver el tablero. */
export function ContrasenaNueva() {
  useMarca("CuadreApp · Crea tu contraseña");
  const navegar = useNavigate();
  // La temporal recién usada en el login viaja en memoria; si no está
  // (recarga de página), se pide en el formulario.
  const temporal = useMemo(() => tomarPasswordTemporal(), []);

  return (
    <FormularioContrasena
      titulo="Crea tu contraseña"
      descripcion="Estás entrando con la contraseña temporal que te entregaron. Define una propia para continuar: la temporal deja de funcionar."
      passwordActualConocida={temporal}
      etiquetaEnviar="Guardar y entrar"
      alCambiar={() => navegar("/hoy", { replace: true })}
      pie={<SalidaCerrarSesion />}
    />
  );
}

/** Confirmación del cambio voluntario. El botón ES la navegación: la
 *  vuelta al tablero la decide el clic, no un temporizador. Exportada
 *  para que la prueba asegure que la salida existe de verdad. */
export function ContrasenaActualizada(props: { alVolver: () => void }) {
  return (
    <TarjetaAcceso onSubmit={props.alVolver} bajada="Cambiar contraseña">
      <AvisoAcceso tono="ok">✓ Contraseña actualizada.</AvisoAcceso>
      <BotonAcceso etiqueta="Volver al tablero" />
      <span className="sr-only">La contraseña quedó actualizada</span>
    </TarjetaAcceso>
  );
}

/** Cambio voluntario, con sesión y desde el marco del tablero. */
export function CambiarContrasena() {
  useMarca("CuadreApp · Cambiar contraseña");
  const navegar = useNavigate();
  const [listo, setListo] = useState(false);

  if (listo) {
    return <ContrasenaActualizada alVolver={() => navegar("/hoy", { replace: true })} />;
  }

  return (
    <FormularioContrasena
      titulo="Cambiar contraseña"
      descripcion="Escribe tu contraseña actual y define la nueva."
      passwordActualConocida={null}
      etiquetaEnviar="Cambiar contraseña"
      alCambiar={() => setListo(true)}
      pie={
        <Link
          to="/hoy"
          className="focus-visible:outline"
          style={{ fontSize: 11.5, color: TEMA.azul, textAlign: "center" }}
        >
          Volver al tablero sin cambiarla
        </Link>
      }
    />
  );
}

/** «Olvidé mi contraseña»: pide el correo y dispara la recuperación. */
export function Recuperar() {
  useMarca("CuadreApp · Recuperar acceso");
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"editando" | "enviando" | "enviado" | "sin_red">("editando");

  const enviar = () => {
    setEstado("enviando");
    void solicitarRecuperacion(email).then((contactado) =>
      setEstado(contactado ? "enviado" : "sin_red"),
    );
  };

  if (estado === "enviado") {
    return (
      <TarjetaAcceso bajada="Recuperar acceso">
        <AvisoAcceso tono="ok">
          Si {email} tiene una cuenta en CuadreApp, te enviamos un correo con el enlace para restablecer
          la contraseña. Revisa tu bandeja (y el correo no deseado).
        </AvisoAcceso>
        <Link
          to="/entrar"
          className="focus-visible:outline"
          style={{ fontSize: 12, color: TEMA.azul, textAlign: "center" }}
        >
          Volver a entrar
        </Link>
      </TarjetaAcceso>
    );
  }

  return (
    <TarjetaAcceso onSubmit={enviar} bajada="Recuperar acceso">
      <p style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.55, margin: 0 }}>
        Escribe el correo con el que entras al Dashboard y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>
      <CampoAcceso
        rotulo="Correo"
        tipo="email"
        valor={email}
        onCambio={setEmail}
        autoComplete="username"
      />
      {estado === "sin_red" ? (
        <AvisoAcceso>No se pudo contactar el servidor. Revisa la conexión.</AvisoAcceso>
      ) : null}
      <BotonAcceso
        etiqueta="Enviar enlace"
        ocupado={estado === "enviando"}
        etiquetaOcupado="Enviando…"
      />
      <Link
        to="/entrar"
        className="focus-visible:outline"
        style={{ fontSize: 11.5, color: TEMA.azul, textAlign: "center" }}
      >
        Volver a entrar
      </Link>
    </TarjetaAcceso>
  );
}

/** Destino del enlace del correo: adopta la sesión del fragmento y
 *  define la contraseña nueva. */
export function Restablecer() {
  useMarca("CuadreApp · Restablecer contraseña");
  const navegar = useNavigate();
  // El fragmento se lee UNA vez al montar; el enlace del correo trae
  // los tokens de la sesión de recuperación.
  const tokens = useMemo(() => tokensDelFragmento(window.location.hash), []);
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!tokens) {
    return (
      <TarjetaAcceso bajada="Restablecer contraseña">
        <AvisoAcceso>
          El enlace no es válido o ya expiró. Pide uno nuevo desde «¿Olvidaste tu contraseña?».
        </AvisoAcceso>
        <Link
          to="/recuperar"
          className="focus-visible:outline"
          style={{ fontSize: 12, color: TEMA.azul, textAlign: "center" }}
        >
          Pedir un enlace nuevo
        </Link>
      </TarjetaAcceso>
    );
  }

  const enviar = () => {
    const problema = problemaDeContrasena(nueva, confirmacion);
    if (problema) {
      setError(problema);
      return;
    }
    setEnviando(true);
    setError(null);
    void restablecerPassword(tokens, nueva)
      .then((ok) => {
        if (ok) navegar("/hoy", { replace: true });
        else {
          setError("No se pudo restablecer la contraseña. El enlace pudo expirar: pide uno nuevo.");
        }
      })
      .finally(() => setEnviando(false));
  };

  return (
    <TarjetaAcceso onSubmit={enviar} bajada="Restablecer contraseña">
      <p style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.55, margin: 0 }}>
        Define tu contraseña nueva. Al guardarla entras directo a tu tablero.
      </p>
      <CampoAcceso
        rotulo={`Contraseña nueva (mínimo ${MINIMO} caracteres)`}
        tipo="password"
        valor={nueva}
        onCambio={setNueva}
        autoComplete="new-password"
      />
      <CampoAcceso
        rotulo="Repite la contraseña nueva"
        tipo="password"
        valor={confirmacion}
        onCambio={setConfirmacion}
        autoComplete="new-password"
      />
      {error ? <AvisoAcceso>{error}</AvisoAcceso> : null}
      <BotonAcceso etiqueta="Guardar y entrar" ocupado={enviando} />
    </TarjetaAcceso>
  );
}
