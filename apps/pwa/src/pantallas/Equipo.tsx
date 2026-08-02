// [2] EQUIPO (spec §8.1, pantalla 02 del contrato): identificación y
// confirmación. El escaneo QR llega en una iteración posterior; la vía
// vigente es la búsqueda por código que el propio diseño contempla como
// salida. La tarjeta "Equipo reconocido" (código mono 34 px + última
// lectura) es del contrato y confirma antes de seguir.

import { useState } from "react";
import type { EquipoCatalogo } from "../datos/catalogo";
import { BotonGrande, Eyebrow, Titulo } from "../ui/basicos";
import { APP, C } from "../marca/tokens";

export function Equipo(props: {
  equipos: EquipoCatalogo[];
  onSeleccionar: (equipo: EquipoCatalogo) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [candidato, setCandidato] = useState<EquipoCatalogo | null>(null);

  if (candidato) {
    const lectura = candidato.ultimaLecturaConocida;
    const rotLectura =
      candidato.tipoMedidor === "horometro"
        ? "Horómetro de la última carga"
        : candidato.tipoMedidor === "odometro"
          ? "Odómetro de la última carga"
          : null;
    return (
      <>
        <Titulo sub="Confirma que es la máquina que vas a cargar.">¿Qué equipo vas a cargar?</Titulo>
        <div className="px-4 pt-4">
          <div
            className="rounded-xl px-4 py-5"
            style={{ background: APP.tarjeta, border: `1px solid ${C.verde}66` }}
          >
            <Eyebrow color={C.verde}>Equipo reconocido</Eyebrow>
            <div className="mt-2 font-mono font-bold" style={{ fontSize: 34 }}>
              {candidato.codigo}
            </div>
            <div style={{ fontSize: 13, color: C.suave, marginTop: 3 }}>{candidato.descripcion}</div>
            {rotLectura && lectura !== null ? (
              <div style={{ fontSize: 11.5, color: C.suave, marginTop: 12 }}>
                {rotLectura}:{" "}
                <span className="font-mono">
                  {lectura.toLocaleString("es-CO", { minimumFractionDigits: 1 })}{" "}
                  {candidato.tipoMedidor === "horometro" ? "h" : "km"}
                </span>
              </div>
            ) : null}
          </div>
          <div className="mt-4">
            <BotonGrande onClick={() => props.onSeleccionar(candidato)}>Sí, es este</BotonGrande>
          </div>
          <button
            type="button"
            onClick={() => setCandidato(null)}
            className="mt-3 w-full"
            style={{ fontSize: 12.5, color: C.azul }}
          >
            No, buscar otro
          </button>
        </div>
      </>
    );
  }

  const filtrados = props.equipos.filter(
    (equipo) =>
      equipo.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      equipo.descripcion.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <>
      <Titulo sub="Busca el código que está en el sticker de la máquina.">
        ¿Qué equipo vas a cargar?
      </Titulo>
      <div className="px-4 pt-4">
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por código (T-04…)"
          className="w-full rounded-lg px-3 py-3"
          style={{
            background: APP.tarjeta,
            border: `1px solid ${C.linea}`,
            fontSize: 16,
            color: C.texto,
          }}
        />
        <div className="mt-3 flex flex-col" style={{ gap: 7 }}>
          {filtrados.map((equipo) => (
            <button
              key={equipo.id}
              type="button"
              onClick={() => setCandidato(equipo)}
              className="w-full rounded-lg px-3 py-3 text-left"
              style={{ background: APP.tarjeta, border: `1px solid ${C.lineaSuave}` }}
            >
              <span className="font-mono font-semibold" style={{ fontSize: 16 }}>
                {equipo.codigo}
              </span>
              <span className="block" style={{ fontSize: 12, color: C.suave, marginTop: 2 }}>
                {equipo.descripcion}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
