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
import { DialogoCredenciales } from "./DialogoCredenciales";
import { URL_DASHBOARD } from "./url-dashboard";
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

/** Acciones que piden confirmación (P0.9). Activar no está aquí a
 *  propósito: es inocua y se puede repetir sin costo. */
export interface AccionConfirmable {
  tipo: "desactivar" | "reiniciar";
  acceso: AccesoDashboard;
}

/** La consecuencia, dicha antes de ejecutar. Exportada para que la
 *  prueba fije las frases: son el contrato de la confirmación. */
export function textoConfirmacion(tipo: AccionConfirmable["tipo"], nombre: string): string {
  return tipo === "desactivar"
    ? `${nombre} perderá el acceso al Dashboard de inmediato. Podrás activarlo de nuevo cuando lo necesites.`
    : `La contraseña actual de ${nombre} dejará de funcionar. La nueva es temporal y sirve para UN ingreso.`;
}

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
  const [enviando, setEnviando] = useState(false);
  const [credencial, setCredencial] = useState<{
    nombre: string;
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formulario = useFormulario({ nombre: "", email: "", rol: "supervisor", sedeId: "" });

  const crear = async () => {
    setError(null);
    setEnviando(true);
    try {
      const acceso = await fuente.crearAccesoDashboard(props.clienteId, {
        nombre: formulario.valores.nombre,
        email: formulario.valores.email,
        rol: formulario.valores.rol,
        sedeId: formulario.valores.sedeId === "" ? null : formulario.valores.sedeId,
      });
      setCreando(false);
      formulario.reiniciar();
      setCredencial({
        nombre: acceso.nombre,
        email: acceso.email ?? formulario.valores.email,
        password: acceso.password_temporal,
      });
      recargar();
    } catch (fallo) {
      setError(
        fallo instanceof Error && fallo.message.toLowerCase().includes("correo")
          ? "Ese correo ya tiene una cuenta en CuadreApp."
          : "No se pudo crear el acceso. Intenta de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  };

  // P0.9: desactivar y regenerar contraseña CONFIRMAN (dejan a alguien
  // afuera o invalidan la contraseña vigente); activar no — es inocua
  // y re-ejecutable. Y ninguna de las tres falla en silencio.
  const [confirmando, setConfirmando] = useState<AccionConfirmable | null>(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [avisoFallo, setAvisoFallo] = useState<string | null>(null);

  const activar = async (acceso: AccesoDashboard) => {
    setAvisoFallo(null);
    try {
      await fuente.editarAccesoDashboard(props.clienteId, acceso.usuarioId, { activo: true });
      recargar();
    } catch {
      setAvisoFallo(`No se pudo activar el acceso de ${acceso.nombre}. Intenta de nuevo.`);
    }
  };

  const confirmarAccion = async () => {
    if (!confirmando) return;
    setEjecutando(true);
    setErrorAccion(null);
    try {
      if (confirmando.tipo === "desactivar") {
        await fuente.editarAccesoDashboard(props.clienteId, confirmando.acceso.usuarioId, {
          activo: false,
        });
      } else {
        const nuevo = await fuente.reiniciarPasswordAcceso(
          props.clienteId,
          confirmando.acceso.usuarioId,
        );
        setCredencial({
          nombre: nuevo.nombre,
          email: nuevo.email ?? confirmando.acceso.email ?? "",
          password: nuevo.password_temporal,
        });
      }
      setConfirmando(null);
      recargar();
    } catch {
      setErrorAccion("No se pudo completar la acción. Intenta de nuevo.");
    } finally {
      setEjecutando(false);
    }
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

      {avisoFallo ? (
        <div className="px-5 pt-3" role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
          {avisoFallo}
        </div>
      ) : null}

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
                      onClick={() => setConfirmando({ tipo: "reiniciar", acceso })}
                      style={{ fontSize: 12, color: "var(--cliente-primario)", marginRight: 12 }}
                    >
                      Nueva contraseña
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        acceso.activo
                          ? setConfirmando({ tipo: "desactivar", acceso })
                          : void activar(acceso)
                      }
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
          enviando={enviando}
          etiquetaEnviar="Crear acceso"
          etiquetaEnviando="Creando…"
          deshabilitado={
            formulario.valores.nombre.trim().length < 2 || !formulario.valores.email.includes("@")
          }
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
              La contraseña temporal se genera sola, se muestra una sola vez y sirve para UN ingreso: en
              el primer acceso la persona define su contraseña propia.
            </div>
          </div>
        </Dialogo>
      ) : null}

      {confirmando ? (
        <Dialogo
          titulo={confirmando.tipo === "desactivar" ? "Desactivar acceso" : "Nueva contraseña temporal"}
          error={errorAccion}
          onCerrar={() => {
            setConfirmando(null);
            setErrorAccion(null);
          }}
          onEnviar={() => void confirmarAccion()}
          enviando={ejecutando}
          etiquetaEnviar={
            confirmando.tipo === "desactivar" ? "Desactivar acceso" : "Generar nueva contraseña"
          }
          etiquetaEnviando={confirmando.tipo === "desactivar" ? "Desactivando…" : "Generando…"}
        >
          <p style={{ fontSize: 12.5, color: TEMA.suave, margin: 0, lineHeight: 1.6 }}>
            {textoConfirmacion(confirmando.tipo, confirmando.acceso.nombre)}
          </p>
        </Dialogo>
      ) : null}

      {credencial ? (
        <DialogoCredenciales
          credencial={credencial}
          urlDashboard={URL_DASHBOARD}
          alCerrar={() => setCredencial(null)}
        />
      ) : null}
    </Panel>
  );
}
