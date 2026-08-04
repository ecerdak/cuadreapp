// Implementación HTTP de FuenteAdmin contra /api/v1/admin. Toda
// petición pasa por sesion.solicitar (token + renovación). Los errores
// de la API llegan con su código propio (CONFLICTO, NO_EXISTE…).

import type {
  Carga,
  Cliente,
  Codigo,
  Dispositivo,
  Equipo,
  FuenteAdmin,
  Operador,
  PerfilOperativo,
  Resumen,
  Sede,
  Tablero,
} from "./puertos";
import { solicitar } from "./sesion";

export class ErrorApi extends Error {
  constructor(
    public readonly codigo: string,
    public readonly detalle?: string,
  ) {
    super(detalle ?? codigo);
  }
}

async function json<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string; detalle?: string };
    throw new ErrorApi(cuerpo.error ?? `HTTP_${respuesta.status}`, cuerpo.detalle);
  }
  return (await respuesta.json()) as T;
}

const query = (parametros: Record<string, string | number | undefined>) => {
  const definidos = Object.entries(parametros).filter(([, v]) => v !== undefined && v !== "");
  return definidos.length
    ? `?${definidos.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")}`
    : "";
};

export class FuenteAdminHttp implements FuenteAdmin {
  async resumen(): Promise<Resumen> {
    return json(await solicitar("/api/v1/admin/resumen"));
  }

  async cargas(filtro?: { clienteId?: string; limite?: number }): Promise<Carga[]> {
    const cuerpo = await json<{ cargas: Carga[] }>(
      await solicitar(
        `/api/v1/admin/cargas${query({ cliente_id: filtro?.clienteId, limite: filtro?.limite })}`,
      ),
    );
    return cuerpo.cargas;
  }

  async perfiles(): Promise<PerfilOperativo[]> {
    const cuerpo = await json<{ perfiles: PerfilOperativo[] }>(
      await solicitar("/api/v1/admin/perfiles"),
    );
    return cuerpo.perfiles;
  }

  async clientes(buscar?: string): Promise<Cliente[]> {
    const cuerpo = await json<{ clientes: Cliente[] }>(
      await solicitar(`/api/v1/admin/clientes${query({ buscar })}`),
    );
    return cuerpo.clientes;
  }

  async crearCliente(datos: {
    nombre: string;
    nombreComercial: string | null;
    colorPrimario: string | null;
    colorSecundario: string | null;
    nit: string | null;
    perfilCodigo: string;
  }): Promise<Cliente> {
    return json(
      await solicitar("/api/v1/admin/clientes", {
        method: "POST",
        body: JSON.stringify({
          nombre: datos.nombre,
          nombre_comercial: datos.nombreComercial,
          color_primario: datos.colorPrimario,
          color_secundario: datos.colorSecundario,
          nit: datos.nit,
          perfil_codigo: datos.perfilCodigo,
        }),
      }),
    );
  }

  async editarCliente(
    id: string,
    cambios: Partial<
      Pick<
        Cliente,
        | "nombre"
        | "nombreComercial"
        | "colorPrimario"
        | "colorSecundario"
        | "nit"
        | "activo"
        | "perfilCodigo"
      >
    >,
  ): Promise<Cliente> {
    return json(
      await solicitar(`/api/v1/admin/clientes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nombre: cambios.nombre,
          ...("nombreComercial" in cambios ? { nombre_comercial: cambios.nombreComercial } : {}),
          ...("colorPrimario" in cambios ? { color_primario: cambios.colorPrimario } : {}),
          ...("colorSecundario" in cambios ? { color_secundario: cambios.colorSecundario } : {}),
          ...("nit" in cambios ? { nit: cambios.nit } : {}),
          activo: cambios.activo,
          ...(cambios.perfilCodigo ? { perfil_codigo: cambios.perfilCodigo } : {}),
        }),
      }),
    );
  }

  async subirLogo(id: string, archivo: Blob): Promise<Cliente> {
    return json(
      await solicitar(`/api/v1/admin/clientes/${id}/logo`, {
        method: "PUT",
        body: archivo,
        headers: { "content-type": archivo.type },
      }),
    );
  }

  async eliminarLogo(id: string): Promise<Cliente> {
    return json(await solicitar(`/api/v1/admin/clientes/${id}/logo`, { method: "DELETE" }));
  }

  async sedes(clienteId: string): Promise<Sede[]> {
    const cuerpo = await json<{ sedes: Sede[] }>(
      await solicitar(`/api/v1/admin/clientes/${clienteId}/sedes`),
    );
    return cuerpo.sedes;
  }

  async crearSede(datos: {
    clienteId: string;
    nombre: string;
    ciudad: string | null;
    direccion: string | null;
    referencia: string | null;
    dispensador: { nombre: string; totInstalacionGal: number } | null;
  }): Promise<Sede> {
    return json(
      await solicitar("/api/v1/admin/sedes", {
        method: "POST",
        body: JSON.stringify({
          cliente_id: datos.clienteId,
          nombre: datos.nombre,
          ciudad: datos.ciudad,
          direccion: datos.direccion,
          referencia: datos.referencia,
          dispensador: datos.dispensador
            ? {
                nombre: datos.dispensador.nombre,
                tot_instalacion_gal: datos.dispensador.totInstalacionGal,
              }
            : null,
        }),
      }),
    );
  }

  async editarSede(
    id: string,
    cambios: Partial<Pick<Sede, "nombre" | "ciudad" | "direccion" | "referencia" | "activo">>,
  ): Promise<Sede> {
    return json(
      await solicitar(`/api/v1/admin/sedes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nombre: cambios.nombre,
          ...("ciudad" in cambios ? { ciudad: cambios.ciudad } : {}),
          ...("direccion" in cambios ? { direccion: cambios.direccion } : {}),
          ...("referencia" in cambios ? { referencia: cambios.referencia } : {}),
          activo: cambios.activo,
        }),
      }),
    );
  }

  async equipos(filtro?: { clienteId?: string; buscar?: string }): Promise<Equipo[]> {
    const cuerpo = await json<{ equipos: Equipo[] }>(
      await solicitar(
        `/api/v1/admin/equipos${query({ cliente_id: filtro?.clienteId, buscar: filtro?.buscar })}`,
      ),
    );
    return cuerpo.equipos;
  }

  async crearEquipo(datos: {
    clienteId: string;
    sedeId: string | null;
    codigoInterno: string;
    descripcion: string | null;
    categoria: string | null;
  }): Promise<Equipo> {
    return json(
      await solicitar("/api/v1/admin/equipos", {
        method: "POST",
        body: JSON.stringify({
          cliente_id: datos.clienteId,
          sede_id: datos.sedeId,
          codigo_interno: datos.codigoInterno,
          descripcion: datos.descripcion,
          categoria: datos.categoria,
        }),
      }),
    );
  }

  async editarEquipo(
    id: string,
    cambios: Partial<Pick<Equipo, "sedeId" | "codigoInterno" | "descripcion" | "categoria" | "activo">>,
  ): Promise<Equipo> {
    return json(
      await solicitar(`/api/v1/admin/equipos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...("sedeId" in cambios ? { sede_id: cambios.sedeId } : {}),
          codigo_interno: cambios.codigoInterno,
          ...("descripcion" in cambios ? { descripcion: cambios.descripcion } : {}),
          categoria: cambios.categoria,
          activo: cambios.activo,
        }),
      }),
    );
  }

  async operadores(filtro?: { clienteId?: string; buscar?: string }): Promise<Operador[]> {
    const cuerpo = await json<{ operadores: Operador[] }>(
      await solicitar(
        `/api/v1/admin/operadores${query({ cliente_id: filtro?.clienteId, buscar: filtro?.buscar })}`,
      ),
    );
    return cuerpo.operadores;
  }

  async crearOperador(datos: {
    clienteId: string;
    sedeId: string | null;
    nombre: string;
    codigo: string;
    pin: string;
  }): Promise<Operador> {
    return json(
      await solicitar("/api/v1/admin/operadores", {
        method: "POST",
        body: JSON.stringify({
          cliente_id: datos.clienteId,
          sede_id: datos.sedeId,
          nombre: datos.nombre,
          codigo: datos.codigo,
          pin: datos.pin,
        }),
      }),
    );
  }

  async editarOperador(
    id: string,
    cambios: {
      sedeId?: string | null;
      nombre?: string;
      codigo?: string;
      pin?: string;
      activo?: boolean;
    },
  ): Promise<Operador> {
    return json(
      await solicitar(`/api/v1/admin/operadores/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...("sedeId" in cambios ? { sede_id: cambios.sedeId } : {}),
          nombre: cambios.nombre,
          codigo: cambios.codigo,
          pin: cambios.pin,
          activo: cambios.activo,
        }),
      }),
    );
  }

  async codigos(): Promise<Codigo[]> {
    const cuerpo = await json<{ codigos: Codigo[] }>(await solicitar("/api/v1/admin/codigos"));
    return cuerpo.codigos;
  }

  async crearCodigo(datos: { sedeId: string; expiraDias?: number }): Promise<Codigo> {
    const codigo = await json<Omit<Codigo, "estado">>(
      await solicitar("/api/v1/admin/codigos", {
        method: "POST",
        body: JSON.stringify({ sede_id: datos.sedeId, expira_dias: datos.expiraDias ?? 7 }),
      }),
    );
    return { ...codigo, estado: "vigente" };
  }

  async dispositivos(): Promise<Dispositivo[]> {
    const cuerpo = await json<{ dispositivos: Dispositivo[] }>(
      await solicitar("/api/v1/admin/dispositivos"),
    );
    return cuerpo.dispositivos;
  }

  async desactivarDispositivo(id: string): Promise<Dispositivo> {
    return json(
      await solicitar(`/api/v1/admin/dispositivos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ activo: false }),
      }),
    );
  }

  async reenrolarDispositivo(id: string): Promise<{ dispositivo: Dispositivo; codigo: Codigo }> {
    const cuerpo = await json<{ dispositivo: Dispositivo; codigo: Omit<Codigo, "estado"> }>(
      await solicitar(`/api/v1/admin/dispositivos/${id}/reenrolar`, { method: "POST" }),
    );
    return { dispositivo: cuerpo.dispositivo, codigo: { ...cuerpo.codigo, estado: "vigente" } };
  }

  async tablero(clienteId: string): Promise<Tablero> {
    return json(await solicitar(`/api/v1/admin/tablero/${clienteId}`));
  }
}
