// [Clientes] Lista maestra: buscar, crear y entrar a la ficha del
// cliente. Todo el detalle (Identidad, Configuración, Operación y
// Dashboard) vive en la ficha — esta pantalla es el índice del ERP,
// no un CRUD con diálogos anidados (DEC-018).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFuenteAdmin } from "../datos/proveedor";
import { useConsulta } from "../datos/consulta";
import type { Cliente } from "../datos/puertos";
import {
  BarraBusqueda,
  Boton,
  Campo,
  ChipActivo,
  Dialogo,
  Esqueleto,
  EstadoError,
  Panel,
  Selector,
  Th,
  celda,
  useFormulario,
} from "../ui";
import { TEMA } from "../tema";
import { LogoCliente } from "./cliente/LogoCliente";

export function Clientes() {
  const fuente = useFuenteAdmin();
  const navegar = useNavigate();
  const [buscar, setBuscar] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const { consulta, recargar } = useConsulta(() => fuente.clientes(buscar || undefined), [buscar]);
  const perfiles = useConsulta(() => fuente.perfiles(), []);

  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { valores, cambiar, reiniciar } = useFormulario({
    nombre: "",
    nombreComercial: "",
    nit: "",
    perfil: "medidor_doble",
  });

  const nombrePerfil = (codigo: string): string =>
    (perfiles.consulta.estado === "listo"
      ? perfiles.consulta.datos.find((p) => p.codigo === codigo)?.nombre
      : undefined) ?? codigo;

  const crear = () => {
    setEnviando(true);
    void fuente
      .crearCliente({
        nombre: valores.nombre,
        nombreComercial: valores.nombreComercial.trim() || null,
        colorPrimario: null, // se define en la ficha → Identidad
        colorSecundario: null,
        nit: valores.nit.trim() || null,
        perfilCodigo: valores.perfil,
      })
      .then((cliente) => {
        setCreando(false);
        recargar();
        // Directo a la ficha: el siguiente paso natural es su identidad.
        navegar(`/clientes/${cliente.id}/identidad`);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setEnviando(false));
  };

  if (consulta.estado === "cargando") return <Esqueleto alto={300} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const clientes = consulta.datos.filter((c) => !soloActivos || c.activo);

  return (
    <div className="flex flex-col gap-4">
      <BarraBusqueda
        buscar={buscar}
        onBuscar={setBuscar}
        soloActivos={soloActivos}
        onSoloActivos={setSoloActivos}
        accion={
          <Boton
            onClick={() => {
              reiniciar();
              setError(null);
              setCreando(true);
            }}
          >
            Nuevo cliente
          </Boton>
        }
      />
      <Panel>
        <div className="overflow-x-auto px-2 pb-2 pt-2">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>NIT</Th>
                <Th>Perfil</Th>
                <Th derecha>Sedes</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente: Cliente) => (
                <tr
                  key={cliente.id}
                  onClick={() => navegar(`/clientes/${cliente.id}/identidad`)}
                  className="cursor-pointer"
                >
                  <td className="font-semibold" style={celda}>
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <LogoCliente
                        nombre={cliente.nombreComercial ?? cliente.nombre}
                        logoUrl={cliente.logoUrl}
                        tamano={28}
                      />
                      <div>
                        {cliente.nombreComercial ?? cliente.nombre}
                        {cliente.nombreComercial ? (
                          <div style={{ fontSize: 11, color: TEMA.suave, fontWeight: 400 }}>
                            {cliente.nombre}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {cliente.nit ?? "—"}
                  </td>
                  <td style={{ ...celda, fontSize: 12 }}>{nombrePerfil(cliente.perfilCodigo)}</td>
                  <td className="font-mono" style={{ ...celda, textAlign: "right" }}>
                    {cliente.sedes}
                  </td>
                  <td style={celda}>
                    <ChipActivo activo={cliente.activo} />
                  </td>
                  <td style={celda}>
                    <span style={{ fontSize: 12, color: TEMA.azul }}>Abrir ficha →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientes.length === 0 ? (
            <p className="px-3 py-4" style={{ fontSize: 12.5, color: TEMA.suave }}>
              Sin clientes para este filtro.
            </p>
          ) : null}
        </div>
      </Panel>

      {creando ? (
        <Dialogo
          titulo="Nuevo cliente"
          error={error}
          enviando={enviando}
          onCerrar={() => setCreando(false)}
          onEnviar={crear}
        >
          <Campo rotulo="Razón social" valor={valores.nombre} onCambio={cambiar("nombre")} requerido />
          <Campo
            rotulo="Nombre comercial (opcional)"
            valor={valores.nombreComercial}
            onCambio={cambiar("nombreComercial")}
          />
          <Campo rotulo="NIT (opcional)" valor={valores.nit} onCambio={cambiar("nit")} />
          <Selector
            rotulo="Perfil Operativo"
            valor={valores.perfil}
            onCambio={cambiar("perfil")}
            opciones={
              perfiles.consulta.estado === "listo"
                ? perfiles.consulta.datos
                    .filter((p) => p.activo)
                    .map((p) => ({ valor: p.codigo, rotulo: p.nombre }))
                : [{ valor: valores.perfil, rotulo: nombrePerfil(valores.perfil) }]
            }
          />
          <p style={{ fontSize: 11, color: TEMA.suave }}>
            El logo y los colores corporativos se configuran en la ficha del cliente, en Identidad.
          </p>
        </Dialogo>
      ) : null}
    </div>
  );
}
