// Marco de la consola: co-marca con placa ADMIN, pestañas subrayadas
// (mismo lenguaje del contrato visual) y cierre de sesión.

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { TEMA } from "../tema";
import { Logotipo, Placa } from "../marca/Logotipo";
import { useMarca } from "../marca/useMarca";
import { cerrarSesion } from "../datos/sesion";
import logoLubryco from "../marca/assets/lubryco.webp";

const PESTANAS = [
  { ruta: "/resumen", rotulo: "Resumen" },
  { ruta: "/cargas", rotulo: "Cargas" },
  { ruta: "/clientes", rotulo: "Clientes" },
  { ruta: "/equipos", rotulo: "Equipos" },
  { ruta: "/operadores", rotulo: "Operadores" },
  { ruta: "/dispositivos", rotulo: "Dispositivos" },
  { ruta: "/sacyr", rotulo: "Sacyr" },
];

export function Marco() {
  useMarca("CuadreApp · Admin");
  const navegar = useNavigate();
  return (
    <div className="min-h-dvh w-full" style={{ background: TEMA.fondo, color: TEMA.texto }}>
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
                <Placa>ADMIN</Placa>
              </div>
              <div style={{ fontSize: 10.5, color: TEMA.suave, letterSpacing: "0.04em", marginTop: 3 }}>
                Consola administrativa · Lubryco
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void cerrarSesion().then(() => navegar("/entrar"));
            }}
            className="focus-visible:outline"
            style={{ fontSize: 12.5, color: TEMA.azul }}
          >
            Cerrar sesión
          </button>
        </div>
        <nav
          aria-label="Secciones de la consola"
          className="mx-auto flex overflow-x-auto px-5"
          style={{ maxWidth: 1180, gap: 4 }}
        >
          {PESTANAS.map((pestana) => (
            <NavLink
              key={pestana.ruta}
              to={pestana.ruta}
              className="whitespace-nowrap font-semibold focus-visible:outline focus-visible:outline-2"
              style={({ isActive }) => ({
                fontSize: 13,
                padding: "11px 16px",
                color: isActive ? TEMA.texto : TEMA.suave,
                borderBottom: `2px solid ${isActive ? TEMA.amarillo : "transparent"}`,
              })}
            >
              {pestana.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto px-5 py-6" style={{ maxWidth: 1180 }}>
        <Outlet />
      </main>
    </div>
  );
}
