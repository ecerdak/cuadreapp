// [Cliente → Dashboard] ACCESOS: las personas que entran al Dashboard
// de ESTA empresa (Etapa P.2).
//
// No confundir con los operadores de campo (pestaña Operación): esos
// se identifican con código+PIN dentro de la PWA y no tienen sesión.
// Estos son cuentas con correo y contraseña que abren el Dashboard.
// Una persona puede ser ambas cosas; aquí no se mezclan.
//
// Cuentas INDIVIDUALES a propósito, aunque todas compartan rol: una
// credencial compartida entre tres gerentes destruye el último acceso
// por persona, la revocación individual y la trazabilidad.

import { useState } from "react";
import { useFuenteAdmin } from "../../datos/proveedor";
import { useConsulta } from "../../datos/consulta";
import type { AccesoDashboard } from "../../datos/puertos";
import {
  Boton,
  Campo,
  ChipActivo,
  Dialogo,
  Esqueleto,
  EstadoError,
  Eyebrow,
  Panel,
  Selector,
  Th,
  celda,
  useFormulario,
} from "../../ui";
import { TEMA } from "../../tema";

const ROLES = [
  { valor: "supervisor", rotulo: "Supervisor" },
  { valor: "admin_cliente", rotulo: "Administrador del cliente" },
];

const fechaCorta = (iso: string | null): string =>
  iso === null
    ? "Nunca"
    : new Date(iso).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

export function AccesosDashboard(props: { clienteId: string }) {
  const fuente = useFuenteAdmin();
  const { consulta, recargar } = useConsulta(
    async () => ({
      accesos: await fuente.accesosDashboard(props.clienteId),
      sedes: await fuente.sedes(props.clienteId),
    }),
    [props.clienteId],
  );
  const [creando, setCreando] = useState(false);
  const [credencial, setCredencial] = useState<{ nombre: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formulario = useFormulario({ nombre: "", email: "", rol: "supervisor", sedeId: "" });

  const crear = async () => {
    setError(null);
    try {
      const acceso = await fuente.crearAccesoDashboard(props.clienteId, {
        nombre: formulario.valores.nombre,
        email: formulario.valores.email,
        rol: formulario.valores.rol,
        sedeId: formulario.valores.sedeId === "" ? null : formulario.valores.sedeId,
      });
      setCreando(false);
      formulario.reiniciar();
      setCredencial({ nombre: acceso.nombre, password: acceso.password_temporal });
      recargar();
    } catch (fallo) {
      setError(
        fallo instanceof Error && fallo.message.includes("CORREO")
          ? "Ese correo ya tiene una cuenta en CuadreApp."
          : "No se pudo crear el acceso.",
      );
    }
  };

  const alternar = async (acceso: AccesoDashboard) => {
    await fuente.editarAccesoDashboard(props.clienteId, acceso.usuarioId, {
      activo: !acceso.activo,
    });
    recargar();
  };

  const reiniciar = async (acceso: AccesoDashboard) => {
    const nuevo = await fuente.reiniciarPasswordAcceso(props.clienteId, acceso.usuarioId);
    setCredencial({ nombre: nuevo.nombre, password: nuevo.password_temporal });
  };

  if (consulta.estado === "cargando") return <Esqueleto alto={220} />;
  if (consulta.estado === "error")
    return <EstadoError detalle={consulta.detalle} onReintentar={recargar} />;

  const { accesos, sedes } = consulta.datos;
  const activos = accesos.filter((a) => a.activo).length;

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between px-5 pt-5" style={{ gap: 12 }}>
        <div>
          <Eyebrow>Accesos al Dashboard</Eyebrow>
          <div style={{ fontSize: 12.5, color: TEMA.suave, marginTop: 4 }}>
            {accesos.length === 0
              ? "Todavía nadie de esta empresa puede entrar al Dashboard."
              : `${activos} ${activos === 1 ? "usuario activo" : "usuarios activos"} de ${accesos.length}.`}
          </div>
        </div>
        <Boton onClick={() => setCreando(true)}>+ Crear acceso</Boton>
      </div>

      {accesos.length === 0 ? (
        <div className="px-5 pb-5 pt-4" style={{ fontSize: 12.5, color: TEMA.tenue }}>
          Crea una cuenta por persona: cada gerente entra con la suya y se puede revocar sin tocar a los
          demás.
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto px-2 pb-3">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Correo</Th>
                <Th>Rol</Th>
                <Th>Sede</Th>
                <Th>Último acceso</Th>
                <Th>Estado</Th>
                <Th derecha>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {accesos.map((acceso) => (
                <tr key={acceso.usuarioId}>
                  <td className="font-semibold" style={celda}>
                    {acceso.nombre}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {acceso.email ?? "—"}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>
                    {ROLES.find((r) => r.valor === acceso.rol)?.rotulo ?? acceso.rol}
                  </td>
                  <td style={{ ...celda, color: TEMA.suave }}>
                    {acceso.sedeNombre ?? "Todas las sedes"}
                  </td>
                  <td className="font-mono" style={{ ...celda, color: TEMA.suave }}>
                    {fechaCorta(acceso.ultimoAccesoEn)}
                  </td>
                  <td style={celda}>
                    <ChipActivo activo={acceso.activo} />
                  </td>
                  <td style={{ ...celda, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      onClick={() => void reiniciar(acceso)}
                      style={{ fontSize: 12, color: "var(--cliente-primario)", marginRight: 12 }}
                    >
                      Nueva contraseña
                    </button>
                    <button
                      type="button"
                      onClick={() => void alternar(acceso)}
                      style={{ fontSize: 12, color: acceso.activo ? TEMA.rojo : TEMA.suave }}
                    >
                      {acceso.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creando ? (
        <Dialogo
          titulo="Crear acceso al Dashboard"
          error={error}
          onCerrar={() => setCreando(false)}
          onEnviar={() => void crear()}
        >
          <div className="flex flex-col" style={{ gap: 12 }}>
            <Campo
              rotulo="Nombre"
              valor={formulario.valores.nombre}
              onCambio={formulario.cambiar("nombre")}
            />
            <Campo
              rotulo="Correo"
              tipo="email"
              valor={formulario.valores.email}
              onCambio={formulario.cambiar("email")}
            />
            <Selector
              rotulo="Rol"
              valor={formulario.valores.rol}
              onCambio={formulario.cambiar("rol")}
              opciones={ROLES}
            />
            <Selector
              rotulo="Sede"
              valor={formulario.valores.sedeId}
              onCambio={formulario.cambiar("sedeId")}
              opciones={[
                { valor: "", rotulo: "Todas las sedes" },
                ...sedes.map((s) => ({ valor: s.id, rotulo: s.nombre })),
              ]}
            />
            <div style={{ fontSize: 11.5, color: TEMA.tenue }}>
              La contraseña temporal se genera sola y se muestra una sola vez. Entrégala por tu canal y
              pide que la cambie.
            </div>
            <Boton
              tipo="submit"
              deshabilitado={
                formulario.valores.nombre.trim().length < 2 || !formulario.valores.email.includes("@")
              }
            >
              Crear acceso
            </Boton>
          </div>
        </Dialogo>
      ) : null}

      {credencial ? (
        <Dialogo
          titulo="Contraseña temporal"
          onCerrar={() => setCredencial(null)}
          onEnviar={() => {
            void navigator.clipboard?.writeText(credencial.password);
            setCredencial(null);
          }}
        >
          <div className="flex flex-col" style={{ gap: 12 }}>
            <div style={{ fontSize: 12.5, color: TEMA.suave }}>
              Para <strong style={{ color: TEMA.texto }}>{credencial.nombre}</strong>. No se vuelve a
              mostrar: cópiala ahora.
            </div>
            <div
              className="font-mono"
              style={{
                background: TEMA.panelAlto,
                border: `1px solid ${TEMA.linea}`,
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 15,
                userSelect: "all",
              }}
            >
              {credencial.password}
            </div>
            <Boton tipo="submit">Copiar y cerrar</Boton>
          </div>
        </Dialogo>
      ) : null}
    </Panel>
  );
}
