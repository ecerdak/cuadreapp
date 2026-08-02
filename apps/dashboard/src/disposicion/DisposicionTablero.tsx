// Marco del tablero, transcrito del contrato visual: co-marca Lubryco +
// CuadreApp, chip DEMO, tarjeta del cliente, pestañas subrayadas bajo el
// header (móvil resuelve con scroll horizontal), línea de contexto y el
// pie de dos frases.

import { NavLink, Outlet } from "react-router-dom";
import { TEMA } from "../tema";
import { Logotipo, Placa } from "../marca/Logotipo";
import { useMarca } from "../marca/useMarca";
import { CLIENTE, MEDIDOR } from "../datos/contexto-cliente";
import logoLubryco from "../marca/assets/lubryco.webp";
import logoTrebol from "../marca/assets/trebol.webp";

const PESTANAS = [
  { ruta: "/hoy", rotulo: "Hoy" },
  { ruta: "/cargas", rotulo: "Cargas" },
  { ruta: "/equipos", rotulo: "Equipos" },
  { ruta: "/suministro", rotulo: "Suministro" },
];

export function DisposicionTablero() {
  useMarca("CuadreApp · Control de combustible en planta");
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
                <Placa />
              </div>
              <div style={{ fontSize: 10.5, color: TEMA.suave, letterSpacing: "0.04em", marginTop: 3 }}>
                Control de combustible en planta
              </div>
            </div>
          </div>

          <div className="flex items-center" style={{ gap: 12 }}>
            <span
              className="uppercase font-semibold"
              title="Datos simulados: ninguna cifra proviene de la operación real"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.12em",
                color: TEMA.amarillo,
                border: `1px solid ${TEMA.amarillo}66`,
                borderRadius: 4,
                padding: "3px 7px",
              }}
            >
              Demo
            </span>
            <div
              className="flex items-center rounded-md"
              style={{
                gap: 10,
                background: TEMA.panelAlto,
                border: `1px solid ${TEMA.linea}`,
                padding: "6px 12px 6px 6px",
              }}
            >
              <img
                src={logoTrebol}
                alt={CLIENTE.corto}
                style={{ height: 48, width: 48, borderRadius: 6 }}
              />
              <div>
                <div className="font-semibold" style={{ fontSize: 13 }}>
                  {CLIENTE.corto}
                </div>
                <div style={{ fontSize: 10.5, color: TEMA.suave }}>{CLIENTE.sede}</div>
              </div>
            </div>
          </div>
        </div>

        {/* pestañas */}
        <nav
          aria-label="Secciones del tablero"
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
                background: "transparent",
              })}
            >
              {pestana.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto px-5 py-6" style={{ maxWidth: 1180 }}>
        <div className="mb-5 flex flex-wrap items-baseline justify-between" style={{ gap: 8 }}>
          <div style={{ fontSize: 12, color: TEMA.suave }}>
            {CLIENTE.nombre} · datos simulados de demostración
          </div>
          <div style={{ fontSize: 11, color: TEMA.suave }}>
            Medidor {MEDIDOR.modelo} · instalado {MEDIDOR.instalado}
          </div>
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
