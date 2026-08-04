// Ficha del cliente (DEC-018): la consola deja de ser un CRUD aislado
// y se comporta como un ERP — un cliente, cuatro secciones:
//
//   Identidad      logo, colores, nombre comercial, razón social, NIT
//   Configuración  Perfil Operativo (y futuras reglas funcionales)
//   Operación      Sedes → Equipos → Operadores → Dispositivos
//   Dashboard      la operación de ESE cliente
//
// La identidad corporativa se aplica como variables CSS derivadas
// (tema-cliente.ts): la ficha se viste con la marca del cliente sin
// que ningún componente conozca su nombre.

import { NavLink, Outlet, useParams } from "react-router-dom";
import { useFuenteAdmin } from "../../datos/proveedor";
import { useConsulta } from "../../datos/consulta";
import type { Cliente } from "../../datos/puertos";
import { Esqueleto, EstadoError, Panel } from "../../ui";
import { TEMA } from "../../tema";
import { variablesTema } from "../../tema-cliente";
import { LogoCliente } from "./LogoCliente";

const SECCIONES = [
  { ruta: "identidad", rotulo: "Identidad" },
  { ruta: "configuracion", rotulo: "Configuración" },
  { ruta: "operacion", rotulo: "Operación" },
  { ruta: "dashboard", rotulo: "Dashboard" },
];

/** Contexto que las secciones reciben vía Outlet. */
export interface ContextoFicha {
  cliente: Cliente;
  recargar: () => void;
}

export function FichaCliente() {
  const { clienteId = "" } = useParams();
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(async () => {
    const clientes = await fuente.clientes();
    return clientes.find((c) => c.id === clienteId) ?? null;
  }, [clienteId]);

  if (consulta.estado === "cargando") return <Esqueleto alto={420} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const cliente = consulta.datos;
  if (!cliente) {
    return (
      <Panel className="p-6 text-center">
        <p className="font-semibold">Este cliente no existe o fue eliminado.</p>
        <NavLink to="/clientes" style={{ fontSize: 12.5, color: TEMA.azul }}>
          Volver a Clientes
        </NavLink>
      </Panel>
    );
  }

  const contexto: ContextoFicha = { cliente, recargar };

  return (
    <div className="flex flex-col gap-4" style={variablesTema(cliente) as React.CSSProperties}>
      <NavLink to="/clientes" style={{ fontSize: 12, color: TEMA.suave }}>
        ← Clientes
      </NavLink>

      {/* Encabezado con la identidad del cliente (gradiente derivado) */}
      <Panel className="p-5">
        <div
          className="flex items-center rounded-lg"
          style={{ gap: 16, background: "var(--cliente-gradiente)", padding: 12, margin: -4 }}
        >
          <LogoCliente
            nombre={cliente.nombreComercial ?? cliente.nombre}
            logoUrl={cliente.logoUrl}
            tamano={54}
          />
          <div>
            <h1 className="font-semibold" style={{ fontSize: 20, letterSpacing: "-0.01em" }}>
              {cliente.nombreComercial ?? cliente.nombre}
            </h1>
            <div style={{ fontSize: 12, color: TEMA.suave, marginTop: 2 }}>
              {cliente.nombre}
              {cliente.nit ? ` · NIT ${cliente.nit}` : ""}
              {` · ${cliente.sedes} ${cliente.sedes === 1 ? "sede" : "sedes"}`}
            </div>
          </div>
        </div>
      </Panel>

      <nav
        aria-label="Secciones del cliente"
        className="flex overflow-x-auto"
        style={{ gap: 4, borderBottom: `1px solid ${TEMA.linea}` }}
      >
        {SECCIONES.map((seccion) => (
          <NavLink
            key={seccion.ruta}
            to={seccion.ruta}
            className="whitespace-nowrap font-semibold focus-visible:outline focus-visible:outline-2"
            style={({ isActive }) => ({
              fontSize: 13,
              padding: "10px 15px",
              color: isActive ? TEMA.texto : TEMA.suave,
              borderBottom: `2px solid ${isActive ? "var(--cliente-primario)" : "transparent"}`,
            })}
          >
            {seccion.rotulo}
          </NavLink>
        ))}
      </nav>

      <Outlet context={contexto} />
    </div>
  );
}
