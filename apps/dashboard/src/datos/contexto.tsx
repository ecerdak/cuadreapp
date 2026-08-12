// El contexto de la empresa: se resuelve UNA vez al entrar y lo
// consume todo el tablero. Aquí vive la respuesta a «¿de quién es este
// tablero?», y la respuesta siempre viene de la API — nunca de la URL,
// de una constante ni de un nombre en el código.
//
// También custodia la sede seleccionada: una sesión sin sede fija ve
// todas las de su cliente y puede filtrar; una con sede fija no tiene
// nada que elegir (la API rechazaría cualquier otra).

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { ContextoTablero } from "./puertos";
import { useFuenteTablero } from "./proveedor";
import { useConsulta } from "./consulta";
import { ErrorApi } from "./fuente-api";
import { cerrarSesion, SesionVencida } from "./sesion";
import { Esqueleto, EstadoError } from "../componentes/basicos";
import { BotonAcceso, TarjetaAcceso } from "../paginas/acceso";
import { TEMA } from "../tema";

export interface EstadoTablero {
  contexto: ContextoTablero;
  /** Sede sobre la que se consulta; null = todas las del alcance. */
  sedeId: string | null;
  elegirSede: (sedeId: string | null) => void;
  /** Recarga el contexto (p. ej. tras cambiar identidad en la consola). */
  recargar: () => void;
}

const ContextoEmpresa = createContext<EstadoTablero | null>(null);

export function useTablero(): EstadoTablero {
  const estado = useContext(ContextoEmpresa);
  if (!estado) throw new Error("Falta ProveedorContextoTablero en la raíz del tablero");
  return estado;
}

/** Variante tolerante para el marco, que se renderiza aislado en las
 *  pruebas de fidelidad del contrato visual. */
export function useTableroOpcional(): EstadoTablero | null {
  return useContext(ContextoEmpresa);
}

export type FallaDeAcceso =
  "sesion_vencida" | "acceso_desactivado" | "sin_empresa" | "sin_permiso" | "password_temporal" | "otra";

/** Qué pantalla merece una falla al resolver el contexto. Separado del
 *  componente para poder probarlo: son las puertas por las que un
 *  usuario puede quedarse sin tablero, y cada una dice algo distinto.
 *  Una sesión que expiró vuelve al login; un acceso revocado también,
 *  pero DICIENDO que fue revocado (P0.4); una contraseña temporal va a
 *  definir la propia (P0.1); un usuario de la consola (sin empresa) o
 *  sin permiso reciben una explicación, no un error de red que no
 *  significa nada para ellos. */
export function clasificarFalla(detalle: string): FallaDeAcceso {
  if (detalle.includes("ACCESO_DESACTIVADO")) return "acceso_desactivado";
  if (detalle.includes("SESION_VENCIDA") || detalle.includes(SesionVencida.name)) {
    return "sesion_vencida";
  }
  if (detalle.includes("PASSWORD_TEMPORAL")) return "password_temporal";
  if (detalle.includes("SIN_CLIENTE_EN_SESION")) return "sin_empresa";
  if (detalle.includes("SIN_PERMISO") || detalle.includes("NO_AUTORIZADO")) return "sin_permiso";
  return "otra";
}

/** Provee un contexto YA resuelto, sin pedir nada a la API. Lo usan
 *  las pruebas para montar pantallas con una empresa concreta. */
export function ProveedorContextoFijo(props: { valor: EstadoTablero; children: ReactNode }) {
  return <ContextoEmpresa.Provider value={props.valor}>{props.children}</ContextoEmpresa.Provider>;
}

export function ProveedorContextoTablero(props: {
  children: ReactNode;
  /** Se invoca cuando la sesión ya no sirve: el marco vuelve al login. */
  alPerderSesion?: () => void;
  /** P0.4: la consola revocó el acceso — se vuelve al login con la
   *  explicación verdadera, no con «tu sesión expiró». */
  alAccesoDesactivado?: () => void;
  /** P0.1: la sesión entró con la contraseña temporal — el marco lleva
   *  a definir la propia antes de pintar el tablero. */
  alPasswordTemporal?: () => void;
}) {
  const fuente = useFuenteTablero();
  const { consulta, recargar } = useConsulta(() => fuente.contexto());
  const [sedeElegida, setSedeElegida] = useState<string | null>(null);
  const elegirSede = useCallback((sedeId: string | null) => setSedeElegida(sedeId), []);

  const contexto = consulta.estado === "listo" ? consulta.datos : null;
  const valor = useMemo<EstadoTablero | null>(
    () =>
      contexto
        ? {
            contexto,
            // Con sede fija manda la de la sesión, pase lo que pase.
            sedeId: contexto.sedeActual ?? sedeElegida,
            elegirSede,
            recargar,
          }
        : null,
    [contexto, sedeElegida, elegirSede, recargar],
  );

  if (consulta.estado === "cargando") {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Esqueleto alto={90} />
        <Esqueleto alto={240} />
      </div>
    );
  }

  if (consulta.estado === "error") {
    switch (clasificarFalla(consulta.detalle)) {
      case "sesion_vencida":
        props.alPerderSesion?.();
        return null;
      case "acceso_desactivado":
        props.alAccesoDesactivado?.();
        return null;
      case "password_temporal":
        props.alPasswordTemporal?.();
        return null;
      case "sin_empresa":
        return <SinEmpresa />;
      case "sin_permiso":
        return <SinPermiso />;
      default: {
        const humano = mensajeDeError(consulta.causa);
        return (
          <div className="p-6">
            <EstadoError detalle={humano.frase} referencia={humano.referencia} onReintentar={recargar} />
          </div>
        );
      }
    }
  }

  return <ContextoEmpresa.Provider value={valor}>{props.children}</ContextoEmpresa.Provider>;
}

/** Aviso de acceso con la identidad del producto y una salida real:
 *  ninguna de estas pantallas puede ser un callejón (P0.4). El botón
 *  cierra la sesión y vuelve al login. */
function AvisoDeAcceso(props: { titulo: string; detalle: string }) {
  const navegar = useNavigate();
  return (
    <TarjetaAcceso
      onSubmit={() => {
        void cerrarSesion().then(() => navegar("/entrar", { replace: true }));
      }}
    >
      <p className="font-semibold" style={{ fontSize: 15, textAlign: "center", margin: 0 }}>
        {props.titulo}
      </p>
      <p style={{ fontSize: 12, color: TEMA.suave, lineHeight: 1.55, margin: 0, textAlign: "center" }}>
        {props.detalle}
      </p>
      <BotonAcceso etiqueta="Cerrar sesión" />
    </TarjetaAcceso>
  );
}

/** Exportadas para las pruebas: el texto que lee la persona es el contrato. */
export function SinEmpresa() {
  return (
    <AvisoDeAcceso
      titulo="Tu usuario no tiene una empresa asignada"
      detalle="Este tablero muestra la operación de un cliente. Si administras CuadreApp, tu vista es la consola administrativa; si eres supervisor de una empresa, pide a Lubryco que asocie tu usuario a ella."
    />
  );
}

export function SinPermiso() {
  return (
    <AvisoDeAcceso
      titulo="Tu usuario no tiene acceso al Dashboard"
      detalle="Tu cuenta existe pero no tiene habilitado el tablero. Pide al administrador de tu empresa (o a Lubryco) que lo habilite y vuelve a entrar."
    />
  );
}

/** Lo que ve la persona cuando algo falla: una frase en su idioma y,
 *  si la API respondió, la referencia (request_id) para soporte. */
export interface ErrorHumano {
  frase: string;
  referencia: string | null;
}

/** Errores traducidos a una frase para el supervisor (P0.5). Jamás se
 *  muestra un código crudo como mensaje principal: HTTP_500, TypeError
 *  y Failed to fetch son diagnóstico, no comunicación. Los códigos de
 *  DOMINIO desconocidos sí se citan entre paréntesis — nombran una
 *  regla del negocio, no una tripa del sistema. */
export function mensajeDeError(error: unknown): ErrorHumano {
  if (error instanceof ErrorApi) {
    const conocidos: Record<string, string> = {
      SEDE_FUERA_DE_ALCANCE: "Esa sede no pertenece a tu alcance.",
      CARGA_NO_ENCONTRADA: "Esa carga ya no está disponible.",
      CLIENTE_NO_DISPONIBLE: "La empresa de tu usuario está desactivada.",
      SESION_VENCIDA: "Tu sesión expiró. Vuelve a entrar.",
    };
    const frase =
      conocidos[error.codigo] ??
      (/^HTTP_5\d\d$/.test(error.codigo)
        ? "El servidor tuvo un problema al responder. Intenta nuevamente."
        : /^HTTP_\d+$/.test(error.codigo)
          ? "No se pudo consultar la información. Intenta nuevamente."
          : `No se pudo consultar la información (${error.codigo}).`);
    return { frase, referencia: error.requestId ?? null };
  }
  if (error instanceof SesionVencida) {
    return { frase: "Tu sesión expiró. Vuelve a entrar.", referencia: null };
  }
  if (error instanceof TypeError) {
    return {
      frase: "No se pudo contactar el servidor. Revisa tu conexión e intenta de nuevo.",
      referencia: null,
    };
  }
  return { frase: "Algo no salió bien al cargar la información. Intenta nuevamente.", referencia: null };
}
