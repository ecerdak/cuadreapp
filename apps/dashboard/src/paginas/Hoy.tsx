// [Pestaña Hoy] El veredicto arriba y, debajo, los paneles que DECLARA
// el Perfil Operativo del cliente — esta página no sabe cuáles son ni
// en qué orden van: los pide al registro y los pinta en la rejilla de 3
// columnas del diseño aprobado. Única pestaña con polling (60 s,
// pausado si la pestaña no está visible).

import { useEffect } from "react";
import { useFuenteTablero } from "../datos/proveedor";
import { useTablero } from "../datos/contexto";
import { useConsulta } from "../datos/consulta";
import { mensajeDeError } from "../datos/contexto";
import { EstadoError, ZonaA } from "../componentes/basicos";
import { BienvenidaTablero } from "../componentes/bienvenida";
import { formatearEntero } from "../componentes/numeros";
import { EsqueletoHoy } from "../perfiles/paneles";
import { panelDe } from "../perfiles/registro";
import { TEMA } from "../tema";

export function Hoy() {
  const fuente = useFuenteTablero();
  const { contexto, sedeId } = useTablero();
  const { consulta, recargar } = useConsulta(() => fuente.resumenHoy({ sedeId }), [sedeId]);

  useEffect(() => {
    const temporizador = setInterval(() => {
      if (document.visibilityState === "visible") recargar();
    }, 60_000);
    return () => clearInterval(temporizador);
  }, [recargar]);

  if (consulta.estado === "cargando") return <EsqueletoHoy />;
  if (consulta.estado === "error") {
    const humano = mensajeDeError(consulta.causa);
    return <EstadoError detalle={humano.frase} referencia={humano.referencia} onReintentar={recargar} />;
  }

  const { datos } = consulta;
  const { balance } = datos;

  // P0.6: sin NINGUNA carga en la historia, el tablero se presenta en
  // lugar de mostrarse en cero. El polling de arriba sigue vivo: la
  // primera carga sincronizada reemplaza esta pantalla sola.
  if (!datos.tieneCargas) {
    return <BienvenidaTablero contexto={contexto} alActualizar={recargar} />;
  }

  return (
    <>
      <ZonaA
        veredicto={datos.veredicto}
        titulo="Acción de hoy"
        hechos={[
          {
            valor:
              balance.existenciaEstimadaGal === null
                ? "—"
                : `${formatearEntero(balance.existenciaEstimadaGal)} gal`,
            etiqueta:
              balance.existenciaEstimadaGal === null
                ? "Existencia: se calcula con la primera entrega"
                : "Existencia estimada en tanque",
          },
          {
            valor: `${formatearEntero(balance.consumoDiarioGal)} gal/día`,
            etiqueta: "Consumo promedio, últimos 7 días",
          },
          ...(datos.galSinRegistrarGal > 0
            ? [
                {
                  valor: `${formatearEntero(datos.galSinRegistrarGal)} gal`,
                  etiqueta: "Despachados sin equipo asignado",
                  color: TEMA.rojo,
                },
              ]
            : []),
        ]}
        derecha={
          <div className="flex flex-col items-end" style={{ gap: 8 }}>
            <span style={{ fontSize: 11, color: TEMA.suave }}>
              Actualizado{" "}
              {consulta.actualizadoEn.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              type="button"
              onClick={recargar}
              className="rounded-md font-semibold focus-visible:outline focus-visible:outline-2"
              style={{
                background: TEMA.amarillo,
                color: "#12202C",
                padding: "12px 20px",
                fontSize: 14,
              }}
            >
              Actualizar
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {contexto.perfil.panelesHoy.map((codigo) => {
          const { componente: Panel, ancho } = panelDe(codigo);
          const clase = ancho === 3 ? "lg:col-span-3" : ancho === 2 ? "lg:col-span-2" : "";
          return (
            <div key={codigo} className={clase}>
              <Panel datos={datos} contexto={contexto} />
            </div>
          );
        })}
      </div>
    </>
  );
}
