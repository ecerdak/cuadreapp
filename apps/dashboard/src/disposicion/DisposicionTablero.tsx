// Marco del tablero: marca, banner de demostración, pestañas y
// contenido. Pestañas abajo en móvil (pulgar) y arriba en escritorio.

import { NavLink, Outlet } from "react-router-dom";
import { TEMA } from "../tema";

const PESTANAS = [
  { ruta: "/hoy", rotulo: "Hoy" },
  { ruta: "/cargas", rotulo: "Cargas" },
  { ruta: "/equipos", rotulo: "Equipos" },
  { ruta: "/suministro", rotulo: "Suministro" },
];

function Pestanas() {
  return (
    <nav aria-label="Secciones del tablero" className="flex gap-1">
      {PESTANAS.map((pestana) => (
        <NavLink
          key={pestana.ruta}
          to={pestana.ruta}
          className="flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-bold focus-visible:outline focus-visible:outline-2 md:flex-none md:px-5"
          style={({ isActive }) => ({
            background: isActive ? TEMA.amarillo : "transparent",
            color: isActive ? "#000" : TEMA.suave,
          })}
        >
          {pestana.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}

export function DisposicionTablero() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
      <header
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${TEMA.linea}` }}
      >
        <div>
          <span className="text-xl font-black italic" style={{ color: TEMA.amarillo }}>
            Cuadre
          </span>
          <span
            className="ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-black"
            style={{ background: TEMA.amarillo }}
          >
            APP
          </span>
          <span className="ml-3 hidden text-xs sm:inline" style={{ color: TEMA.suave }}>
            Control de combustible en planta · El Trébol — Planta Buga
          </span>
        </div>
        <div className="hidden md:block">
          <Pestanas />
        </div>
      </header>

      <div
        className="px-4 py-2 text-center text-xs font-semibold"
        style={{ background: "#3a2f07", color: TEMA.amarillo }}
      >
        Modo demostración — datos simulados. Ninguna cifra proviene de la operación real.
      </div>

      <main className="flex-1 px-4 py-4 pb-24 md:pb-6">
        <Outlet />
      </main>

      <div
        className="fixed inset-x-0 bottom-0 px-3 py-2 md:hidden"
        style={{ background: TEMA.panel, borderTop: `1px solid ${TEMA.linea}` }}
      >
        <Pestanas />
      </div>
    </div>
  );
}
