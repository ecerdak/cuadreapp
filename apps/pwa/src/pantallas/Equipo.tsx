// [2] EQUIPO (spec §8.1): identificación del equipo. El escaneo QR del
// sticker llega en una iteración posterior (html5-qrcode/BarcodeDetector);
// por ahora, la salida que el propio spec define: lista con búsqueda por
// código. Cero impacto en datos: el resultado es el mismo equipo_id.

import { useState } from "react";
import type { EquipoCatalogo } from "../datos/catalogo";
import { Pantalla } from "../ui/basicos";

export function Equipo(props: {
  equipos: EquipoCatalogo[];
  onSeleccionar: (equipo: EquipoCatalogo) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const filtrados = props.equipos.filter(
    (equipo) =>
      equipo.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      equipo.descripcion.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <Pantalla titulo="¿Qué equipo vas a tanquear?">
      <input
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        placeholder="Buscar por código (T-04…)"
        className="w-full rounded-xl border border-[#22374A] bg-[#121C25] p-4 text-lg"
      />
      <ul className="flex flex-col gap-2">
        {filtrados.map((equipo) => (
          <li key={equipo.id}>
            <button
              type="button"
              onClick={() => props.onSeleccionar(equipo)}
              className="w-full rounded-xl bg-[#121C25] p-4 text-left"
            >
              <span className="text-xl font-bold">{equipo.codigo}</span>
              <span className="block text-sm text-[#8AA0B6]">{equipo.descripcion}</span>
            </button>
          </li>
        ))}
      </ul>
    </Pantalla>
  );
}
