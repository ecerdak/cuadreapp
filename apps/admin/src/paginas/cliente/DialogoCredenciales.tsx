// Entrega de credenciales del Dashboard (P0.2). La contraseña temporal
// se muestra UNA sola vez, así que este diálogo tiene un solo trabajo:
// que salga de aquí copiada, no transcrita a mano ni perdida.
//
// · «Copiar credenciales» arma el texto completo listo para pegar en
//   WhatsApp o correo (URL + usuario + contraseña + la instrucción del
//   primer ingreso).
// · Si el portapapeles falla, el diálogo NO se cierra: avisa y el
//   texto queda seleccionable para copiarlo a mano.
// · Cerrar sin haber copiado pide una segunda intención: la contraseña
//   no se vuelve a mostrar.
//
// La contraseña vive solo en el estado de React: ni se persiste ni se
// loguea (DEC-012).

import { useState } from "react";
import { Boton, Dialogo } from "../../ui";
import { TEMA } from "../../tema";

export interface CredencialTemporal {
  nombre: string;
  email: string;
  password: string;
}

/** El texto que el admin pega en WhatsApp o correo, completo. */
export function textoCredenciales(credencial: CredencialTemporal, urlDashboard: string): string {
  return [
    "Acceso a CuadreApp",
    "",
    "Dashboard:",
    urlDashboard,
    "",
    "Usuario:",
    credencial.email,
    "",
    "Contraseña temporal:",
    credencial.password,
    "",
    "En tu primer ingreso deberás crear una contraseña nueva.",
  ].join("\n");
}

/** Escritor real: el del navegador. Rechaza si no hay portapapeles
 *  (contexto no seguro) para que el flujo de fallo sea uno solo. */
function escribirEnNavegador(texto: string): Promise<void> {
  if (!navigator.clipboard) return Promise.reject(new Error("SIN_PORTAPAPELES"));
  return navigator.clipboard.writeText(texto);
}

type Aviso = { tono: "ok" | "error"; texto: string } | null;

export interface EstadoEntrega {
  aviso: Aviso;
  /** Ya salió del diálogo copiada (completa o solo la contraseña). */
  copiado: boolean;
  /** Se pidió cerrar sin copiar: la advertencia está en pantalla. */
  confirmandoCierre: boolean;
}

export const ENTREGA_INICIAL: EstadoEntrega = {
  aviso: null,
  copiado: false,
  confirmandoCierre: false,
};

export type EventoEntrega =
  { tipo: "copia_ok"; exito: string } | { tipo: "copia_fallo" } | { tipo: "cerrar" };

/** La política de entrega, pura y probada: el portapapeles puede
 *  fallar y la contraseña no se vuelve a mostrar, así que ni un fallo
 *  ni un clic de cierre pueden perderla en silencio. */
export function transicionEntrega(
  estado: EstadoEntrega,
  evento: EventoEntrega,
): { estado: EstadoEntrega; cerrar: boolean } {
  switch (evento.tipo) {
    case "copia_ok":
      return {
        estado: {
          aviso: { tono: "ok", texto: evento.exito },
          copiado: true,
          confirmandoCierre: false,
        },
        cerrar: false,
      };
    case "copia_fallo":
      // El diálogo NO se cierra: el texto queda a la vista para
      // copiarlo a mano.
      return {
        estado: {
          ...estado,
          aviso: {
            tono: "error",
            texto: "No se pudo copiar. Selecciona el texto de abajo y cópialo a mano.",
          },
        },
        cerrar: false,
      };
    case "cerrar":
      if (!estado.copiado && !estado.confirmandoCierre) {
        return { estado: { ...estado, confirmandoCierre: true }, cerrar: false };
      }
      return { estado, cerrar: true };
  }
}

export function DialogoCredenciales(props: {
  credencial: CredencialTemporal;
  urlDashboard: string;
  alCerrar: () => void;
  /** Inyectable en pruebas; por defecto, el portapapeles del navegador. */
  escribir?: (texto: string) => Promise<void>;
}) {
  const escribir = props.escribir ?? escribirEnNavegador;
  const [estado, setEstado] = useState<EstadoEntrega>(ENTREGA_INICIAL);
  const { aviso, copiado, confirmandoCierre } = estado;

  const aplicar = (evento: EventoEntrega) => {
    const resultado = transicionEntrega(estado, evento);
    if (resultado.cerrar) {
      props.alCerrar();
      return;
    }
    setEstado(resultado.estado);
  };

  const copiar = (texto: string, exito: string) => {
    escribir(texto)
      .then(() => aplicar({ tipo: "copia_ok", exito }))
      .catch(() => aplicar({ tipo: "copia_fallo" }));
  };

  const cerrar = () => aplicar({ tipo: "cerrar" });

  const campo = (rotulo: string, valor: string) => (
    <div>
      <div style={{ fontSize: 10.5, color: TEMA.tenue, letterSpacing: "0.08em" }} className="uppercase">
        {rotulo}
      </div>
      <div
        className="font-mono"
        style={{
          background: TEMA.panelAlto,
          border: `1px solid ${TEMA.linea}`,
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 13.5,
          marginTop: 4,
          userSelect: "all",
          wordBreak: "break-all",
        }}
      >
        {valor}
      </div>
    </div>
  );

  return (
    <Dialogo titulo="Credenciales de acceso" onCerrar={cerrar} sinPie>
      <div className="flex flex-col" style={{ gap: 12 }}>
        <div style={{ fontSize: 12.5, color: TEMA.suave }}>
          Para <strong style={{ color: TEMA.texto }}>{props.credencial.nombre}</strong>. La contraseña
          temporal se muestra una sola vez y sirve para UN ingreso: al entrar, la persona define la suya.
        </div>

        {campo("Dashboard", props.urlDashboard)}
        {campo("Usuario", props.credencial.email)}
        {campo("Contraseña temporal", props.credencial.password)}

        {aviso ? (
          <div
            role={aviso.tono === "error" ? "alert" : "status"}
            style={{ fontSize: 12, color: aviso.tono === "ok" ? TEMA.verde : TEMA.rojo }}
          >
            {aviso.texto}
          </div>
        ) : null}

        {confirmandoCierre && !copiado ? (
          <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
            No has copiado la contraseña y no se volverá a mostrar. ¿Cerrar de todos modos?
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end" style={{ gap: 8 }}>
          <Boton
            tipo="button"
            onClick={() =>
              copiar(textoCredenciales(props.credencial, props.urlDashboard), "Credenciales copiadas ✓")
            }
          >
            Copiar credenciales
          </Boton>
          <Boton
            tipo="button"
            secundario
            onClick={() => copiar(props.credencial.password, "Contraseña copiada ✓")}
          >
            Copiar contraseña
          </Boton>
          <Boton tipo="button" secundario onClick={cerrar}>
            {confirmandoCierre && !copiado ? "Cerrar sin copiar" : "Cerrar"}
          </Boton>
        </div>
      </div>
    </Dialogo>
  );
}
