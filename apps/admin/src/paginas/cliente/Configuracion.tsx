// [Cliente → Configuración] Reglas funcionales del cliente (DEC-018).
// Hoy: el Perfil Operativo, que decide el flujo de captura de la PWA y
// la vista de evidencia del Dashboard. Esta sección es la base de las
// configuraciones futuras (tolerancias, OCR, módulos habilitados): se
// agregan aquí, no en Identidad.

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PERFILES, esCodigoPerfil } from "@cuadreapp/dominio";
import { useFuenteAdmin } from "../../datos/proveedor";
import { useConsulta } from "../../datos/consulta";
import { Boton, Esqueleto, Eyebrow, Panel, Selector } from "../../ui";
import { TEMA } from "../../tema";
import type { ContextoFicha } from "./FichaCliente";

const AVISO_CAMBIO_PERFIL =
  "La historia conserva el perfil con el que fue registrada. " +
  "Los dispositivos utilizarán el nuevo perfil después de sincronizar nuevamente.";

export function ConfiguracionCliente() {
  const { cliente, recargar } = useOutletContext<ContextoFicha>();
  const fuente = useFuenteAdmin();
  const perfiles = useConsulta(() => fuente.perfiles(), []);

  const [perfil, setPerfil] = useState(cliente.perfilCodigo);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const cambia = perfil !== cliente.perfilCodigo;
  const conHistoria = cambia && cliente.cargas > 0;

  const guardar = () => {
    setGuardando(true);
    setError(null);
    void fuente
      .editarCliente(cliente.id, { perfilCodigo: perfil })
      .then(() => {
        setGuardado(true);
        recargar();
        setTimeout(() => setGuardado(false), 2500);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setGuardando(false));
  };

  const descripcionPerfil = (codigo: string): string => {
    if (perfiles.consulta.estado === "listo") {
      const fila = perfiles.consulta.datos.find((p) => p.codigo === codigo);
      if (fila?.descripcion) return fila.descripcion;
    }
    return esCodigoPerfil(codigo) ? PERFILES[codigo].nombre : codigo;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="flex flex-col gap-3 p-5">
        <Eyebrow>Perfil Operativo</Eyebrow>
        <p style={{ fontSize: 11.5, color: TEMA.suave, lineHeight: 1.5 }}>
          Define cómo el operador captura una carga y cómo se muestra la evidencia. Es lo único que
          decide el flujo — nunca el nombre del cliente.
        </p>
        {perfiles.consulta.estado === "cargando" ? (
          <Esqueleto alto={60} />
        ) : (
          <Selector
            rotulo="Perfil"
            valor={perfil}
            onCambio={setPerfil}
            opciones={
              perfiles.consulta.estado === "listo"
                ? perfiles.consulta.datos
                    .filter((p) => p.activo)
                    .map((p) => ({ valor: p.codigo, rotulo: p.nombre }))
                : [{ valor: perfil, rotulo: perfil }]
            }
          />
        )}
        <p style={{ fontSize: 11, color: TEMA.suave }}>{descripcionPerfil(perfil)}</p>

        {conHistoria ? (
          <div
            role="alert"
            className="rounded-md px-3 py-2"
            style={{
              fontSize: 12,
              color: TEMA.ambar,
              border: `1px solid ${TEMA.ambar}55`,
              background: `${TEMA.ambar}11`,
            }}
          >
            {AVISO_CAMBIO_PERFIL}
          </div>
        ) : null}
        {error ? (
          <div role="alert" style={{ fontSize: 12, color: TEMA.rojo }}>
            {error}
          </div>
        ) : null}
        <div className="flex items-center" style={{ gap: 10 }}>
          <Boton onClick={guardar} deshabilitado={guardando || !cambia}>
            {guardando ? "Guardando…" : "Guardar configuración"}
          </Boton>
          {guardado ? (
            <span role="status" style={{ fontSize: 12, color: TEMA.verde }}>
              ✓ Configuración actualizada
            </span>
          ) : null}
        </div>
      </Panel>

      <Panel className="p-5">
        <Eyebrow>Próximas configuraciones</Eyebrow>
        <p style={{ fontSize: 11.5, color: TEMA.suave, marginTop: 6, lineHeight: 1.6 }}>
          Esta sección crecerá con las reglas funcionales del cliente: tolerancias del medidor, OCR
          sugerido, tipos de carga y módulos habilitados. Todas vivirán aquí, como configuración en base
          de datos — nunca como código por cliente.
        </p>
      </Panel>
    </div>
  );
}
