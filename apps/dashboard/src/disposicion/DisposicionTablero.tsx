// Marco del tablero: co-marca Lubryco + CuadreApp, tarjeta del cliente,
// pestañas y pie. Dos reglas del contrato visual que no se negocian:
//
//   1. El chrome es de CuadreApp (DEC-018): la navegación, la
//      tipografía y la estructura no cambian por cliente. El color
//      corporativo acentúa lo que ES del cliente — su tarjeta —, nunca
//      el subrayado de las pestañas.
//   2. La identidad llega SIEMPRE por datos. Este archivo no sabe qué
//      empresa está pintando, y las pestañas salen de los módulos que
//      declara su Perfil Operativo.

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { ModuloTablero } from "@cuadreapp/dominio";
import { TEMA } from "../tema";
import { Logotipo, Placa } from "../marca/Logotipo";
import { useMarca } from "../marca/useMarca";
import { useTableroOpcional } from "../datos/contexto";
import { cerrarSesion } from "../datos/sesion";
import { variablesTema } from "../tema-cliente";
import logoLubryco from "../marca/assets/lubryco.webp";

/** Ruta y rótulo de cada módulo del vocabulario del dominio. */
const MODULOS: Record<ModuloTablero, { ruta: string; rotulo: string }> = {
  hoy: { ruta: "/hoy", rotulo: "Hoy" },
  cargas: { ruta: "/cargas", rotulo: "Cargas" },
  equipos: { ruta: "/equipos", rotulo: "Equipos" },
  suministro: { ruta: "/suministro", rotulo: "Suministro" },
};

function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter((palabra) => /^[a-záéíóúñ]/i.test(palabra))
    .slice(0, 2)
    .map((palabra) => palabra[0]!.toUpperCase())
    .join("");
}

export function DisposicionTablero() {
  useMarca("CuadreApp · Control de combustible en planta");
  const navegar = useNavigate();
  const estado = useTableroOpcional();
  const contexto = estado?.contexto ?? null;

  const cliente = contexto?.cliente;
  const nombreVisible = cliente ? (cliente.nombreComercial ?? cliente.nombre) : "";
  const sedes = contexto?.sedes ?? [];
  const sedeVisible = (() => {
    if (!estado) return "";
    const elegida = sedes.find((sede) => sede.id === estado.sedeId);
    if (elegida) return [elegida.nombre, elegida.ciudad].filter(Boolean).join(", ");
    return sedes.length === 1
      ? [sedes[0]!.nombre, sedes[0]!.ciudad].filter(Boolean).join(", ")
      : `${sedes.length} sedes`;
  })();
  const modulos = contexto?.perfil.modulos ?? [];
  // Sin sede fija y con más de una, el supervisor puede filtrar.
  const puedeElegirSede = Boolean(estado && contexto?.sedeActual === null && sedes.length > 1);

  return (
    <div
      className="min-h-dvh w-full"
      style={{
        background: TEMA.fondo,
        color: TEMA.texto,
        ...(variablesTema({
          colorPrimario: cliente?.colorPrimario ?? null,
          colorSecundario: cliente?.colorSecundario ?? null,
        }) as React.CSSProperties),
      }}
    >
      <header style={{ borderBottom: `1px solid ${TEMA.linea}`, background: TEMA.panel }}>
        <div
          className="mx-auto flex flex-wrap items-center justify-between px-5 py-4"
          style={{ maxWidth: 1180, gap: 16 }}
        >
          <div className="flex items-center" style={{ gap: 16 }}>
            <img src={logoLubryco} alt="Lubryco" style={{ height: 44, width: "auto" }} />
            <div style={{ width: 1, height: 40, background: TEMA.linea }} />
            <div>
              <div className="flex items-center" style={{ gap: 9 }}>
                <Logotipo tam={34} />
                <Placa />
              </div>
              <div style={{ fontSize: 10.5, color: TEMA.suave, letterSpacing: "0.04em", marginTop: 3 }}>
                Control de combustible en planta
              </div>
            </div>
          </div>

          <div className="flex items-center" style={{ gap: 12 }}>
            {nombreVisible ? (
              <div
                className="flex items-center rounded-md"
                style={{
                  gap: 10,
                  background: "var(--cliente-primario-suave)",
                  border: `1px solid var(--cliente-primario-borde)`,
                  padding: "6px 12px 6px 6px",
                }}
              >
                {cliente?.logoUrl ? (
                  <img
                    src={cliente.logoUrl}
                    alt={nombreVisible}
                    style={{ height: 48, width: 48, borderRadius: 6, objectFit: "contain" }}
                  />
                ) : (
                  <span
                    aria-label={`Iniciales de ${nombreVisible}`}
                    className="flex items-center justify-center rounded-md font-semibold"
                    style={{
                      height: 48,
                      width: 48,
                      fontSize: 18,
                      background: TEMA.panel,
                      border: `1px solid ${TEMA.linea}`,
                      color: TEMA.suave,
                    }}
                  >
                    {inicialesDe(nombreVisible) || "?"}
                  </span>
                )}
                <div>
                  <div className="font-semibold" style={{ fontSize: 13 }}>
                    {nombreVisible}
                  </div>
                  <div style={{ fontSize: 10.5, color: TEMA.suave }}>{sedeVisible}</div>
                </div>
              </div>
            ) : null}

            {puedeElegirSede ? (
              <label className="flex flex-col" style={{ fontSize: 10, color: TEMA.suave, gap: 3 }}>
                <span className="uppercase" style={{ letterSpacing: "0.12em" }}>
                  Sede
                </span>
                <select
                  value={estado!.sedeId ?? ""}
                  onChange={(evento) => estado!.elegirSede(evento.target.value || null)}
                  className="rounded-md focus-visible:outline focus-visible:outline-2"
                  style={{
                    fontSize: 12.5,
                    color: TEMA.texto,
                    background: TEMA.panelAlto,
                    border: `1px solid ${TEMA.linea}`,
                    padding: "6px 8px",
                  }}
                >
                  <option value="">Todas las sedes</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {contexto ? (
              <div className="flex items-center" style={{ gap: 14 }}>
                <Link
                  to="/contrasena"
                  className="focus-visible:outline"
                  style={{ fontSize: 12.5, color: TEMA.suave }}
                >
                  Cambiar contraseña
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void cerrarSesion().then(() => navegar("/entrar", { replace: true }));
                  }}
                  className="focus-visible:outline"
                  style={{ fontSize: 12.5, color: TEMA.azul }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <nav
          aria-label="Secciones del tablero"
          className="mx-auto flex overflow-x-auto px-5"
          style={{ maxWidth: 1180, gap: 4 }}
        >
          {modulos.map((modulo) => (
            <NavLink
              key={modulo}
              to={MODULOS[modulo].ruta}
              className="whitespace-nowrap font-semibold focus-visible:outline focus-visible:outline-2"
              style={({ isActive }) => ({
                fontSize: 13,
                padding: "11px 16px",
                color: isActive ? TEMA.texto : TEMA.suave,
                // El subrayado es identidad de CuadreApp (chrome del
                // producto): el color del cliente acentúa lo que ES del
                // cliente, nunca la navegación (DEC-018, punto 5).
                borderBottom: `2px solid ${isActive ? TEMA.amarillo : "transparent"}`,
                background: "transparent",
              })}
            >
              {MODULOS[modulo].rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto px-5 py-6" style={{ maxWidth: 1180 }}>
        <div className="mb-5 flex flex-wrap items-baseline justify-between" style={{ gap: 8 }}>
          <div style={{ fontSize: 12, color: TEMA.suave }}>
            {contexto ? `${contexto.cliente.nombre} · ${contexto.perfil.nombre}` : ""}
          </div>
          {contexto?.medidor ? (
            <div style={{ fontSize: 11, color: TEMA.suave }}>
              Medidor {contexto.medidor.modelo} · instalado {contexto.medidor.instalado}
            </div>
          ) : null}
        </div>

        <Outlet />

        <footer className="mt-8 pt-5" style={{ borderTop: `1px solid ${TEMA.lineaSuave}` }}>
          <div
            className="flex flex-wrap items-center justify-between"
            style={{ gap: 10, fontSize: 11, color: TEMA.suave }}
          >
            <span>CuadreApp · un servicio de Lubryco para sus clientes industriales · sin costo</span>
            <span>
              Lubryco ve el volumen del tanque. El detalle por equipo y conductor es solo del cliente.
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
