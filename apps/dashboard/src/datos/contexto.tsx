// El contexto de la empresa: se resuelve UNA vez al entrar y lo
// consume todo el tablero. Aquí vive la respuesta a «¿de quién es este
// tablero?», y la respuesta siempre viene de la API — nunca de la URL,
// de una constante ni de un nombre en el código.
//
// También custodia la sede seleccionada: una sesión sin sede fija ve
// todas las de su cliente y puede filtrar; una con sede fija no tiene
// nada que elegir (la API rechazaría cualquier otra).

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ContextoTablero } from "./puertos";
import { useFuenteTablero } from "./proveedor";
import { useConsulta } from "./consulta";
import { ErrorApi } from "./fuente-api";
import { SesionVencida } from "./sesion";
import { Esqueleto, EstadoError, Panel } from "../componentes/basicos";
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

export type FallaDeAcceso = "sesion_vencida" | "sin_empresa" | "sin_permiso" | "otra";

/** Qué pantalla merece una falla al resolver el contexto. Separado del
 *  componente para poder probarlo: son las cuatro puertas por las que
 *  un usuario puede quedarse sin tablero, y cada una dice algo
 *  distinto. Una sesión que expiró vuelve al login; un usuario de la
 *  consola (sin empresa) o sin permiso reciben una explicación, no un
 *  error de red que no significa nada para ellos. */
export function clasificarFalla(detalle: string): FallaDeAcceso {
  if (detalle.includes("SESION_VENCIDA") || detalle.includes(SesionVencida.name)) {
    return "sesion_vencida";
  }
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
      case "sin_empresa":
        return <SinEmpresa />;
      case "sin_permiso":
        return <SinPermiso />;
      default:
        return (
          <div className="p-6">
            <EstadoError detalle={mensajeDeError(consulta.detalle)} onReintentar={recargar} />
          </div>
        );
    }
  }

  return <ContextoEmpresa.Provider value={valor}>{props.children}</ContextoEmpresa.Provider>;
}

function Aviso(props: { titulo: string; detalle: string }) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center p-6"
      style={{ background: TEMA.fondo, color: TEMA.texto }}
    >
      <Panel className="p-8 text-center" alto>
        <p className="text-lg font-semibold">{props.titulo}</p>
        <p className="mt-2" style={{ fontSize: 12.5, color: TEMA.suave, maxWidth: 420 }}>
          {props.detalle}
        </p>
      </Panel>
    </div>
  );
}

function SinEmpresa() {
  return (
    <Aviso
      titulo="Tu usuario no tiene una empresa asignada"
      detalle="Este tablero muestra la operación de un cliente. Si administras CuadreApp, tu vista es la consola administrativa; si eres supervisor, pide que asocien tu usuario a la empresa."
    />
  );
}

function SinPermiso() {
  return (
    <Aviso
      titulo="Tu usuario no tiene acceso al tablero"
      detalle="Pide a quien administra CuadreApp que habilite el permiso de tablero para tu cuenta."
    />
  );
}

/** Errores de la API traducidos a una frase para el supervisor. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) {
    const conocidos: Record<string, string> = {
      SEDE_FUERA_DE_ALCANCE: "Esa sede no pertenece a tu alcance.",
      CARGA_NO_ENCONTRADA: "Esa carga ya no está disponible.",
      CLIENTE_NO_DISPONIBLE: "La empresa de tu usuario está desactivada.",
    };
    const frase = conocidos[error.codigo] ?? `No se pudo consultar la información (${error.codigo}).`;
    return error.requestId ? `${frase} Referencia: ${error.requestId}` : frase;
  }
  return String(error);
}
