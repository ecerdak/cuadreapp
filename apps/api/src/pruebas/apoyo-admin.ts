// Fake en memoria del RepositorioAdmin + sesión de administrador para
// las pruebas de la consola. Mismo contrato que Postgres, cero base.

import type { SesionAutenticada } from "../seguridad/tipos.js";
import type {
  CargaAdmin,
  ClienteAdmin,
  CodigoAdmin,
  DispositivoAdmin,
  EquipoAdmin,
  OperadorAdmin,
  RepositorioAdmin,
  ResumenAdmin,
  SedeAdmin,
  TableroCliente,
} from "../repositorio/admin.js";
import { ConflictoUnicidad } from "../repositorio/admin.js";

export const ID_ADMIN = "ad111111-2222-4333-8444-555566667777";

export function sesionAdmin(): SesionAutenticada {
  return {
    usuarioId: ID_ADMIN,
    nombre: "Admin Lubryco",
    rol: "admin_lubryco",
    clienteId: null,
    sedeId: null,
    permisos: ["admin.leer", "admin.gestionar"],
  };
}

let secuencia = 0;
const uuid = () => {
  secuencia += 1;
  return `00000000-0000-4000-8000-${String(secuencia).padStart(12, "0")}`;
};

export class RepositorioAdminFalso implements RepositorioAdmin {
  clientes: ClienteAdmin[] = [];
  sedes: SedeAdmin[] = [];
  equipos: EquipoAdmin[] = [];
  operadores: Array<OperadorAdmin & { pinHash: string }> = [];
  codigos: CodigoAdmin[] = [];
  dispositivos: DispositivoAdmin[] = [];
  usuariosDesactivados: string[] = [];
  cargas: CargaAdmin[] = [];

  async resumen(): Promise<ResumenAdmin> {
    return {
      clientesActivos: this.clientes.filter((c) => c.activo).length,
      equiposActivos: this.equipos.filter((e) => e.activo).length,
      operadoresActivos: this.operadores.filter((o) => o.activo).length,
      dispositivosEnrolados: this.dispositivos.filter((d) => d.activo).length,
      cargasHoy: this.cargas.length,
      galonesHoy: this.cargas.reduce((suma, c) => suma + c.galones, 0),
      alertas: this.cargas
        .filter((c) => c.estado !== "ok")
        .map((c) => ({
          tipo: "carga_no_cuadra" as const,
          mensaje: `Carga de ${c.equipoCodigo} hoy quedó en estado "${c.estado}".`,
        })),
    };
  }

  async listarCargas(filtro: { clienteId?: string; limite: number }): Promise<CargaAdmin[]> {
    return this.cargas.slice(0, filtro.limite);
  }

  async listarClientes(buscar?: string): Promise<ClienteAdmin[]> {
    return buscar
      ? this.clientes.filter((c) => c.nombre.toLowerCase().includes(buscar.toLowerCase()))
      : this.clientes;
  }

  async crearCliente(datos: { nombre: string; nit: string | null }): Promise<ClienteAdmin> {
    if (this.clientes.some((c) => c.nombre === datos.nombre)) throw new ConflictoUnicidad();
    const cliente = { id: uuid(), nombre: datos.nombre, nit: datos.nit, activo: true, sedes: 0 };
    this.clientes.push(cliente);
    return cliente;
  }

  async editarCliente(
    id: string,
    cambios: { nombre?: string; nit?: string | null; activo?: boolean },
  ): Promise<ClienteAdmin | null> {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return null;
    Object.assign(cliente, {
      nombre: cambios.nombre ?? cliente.nombre,
      nit: "nit" in cambios ? (cambios.nit ?? null) : cliente.nit,
      activo: cambios.activo ?? cliente.activo,
    });
    return cliente;
  }

  async listarSedes(clienteId: string): Promise<SedeAdmin[]> {
    return this.sedes.filter((s) => s.clienteId === clienteId);
  }

  async crearSede(datos: {
    clienteId: string;
    nombre: string;
    lat: number | null;
    lng: number | null;
    radioGeocercaM: number;
    dispensador: { nombre: string; totInstalacionGal: number };
  }): Promise<SedeAdmin> {
    const sede: SedeAdmin = {
      id: uuid(),
      clienteId: datos.clienteId,
      nombre: datos.nombre,
      lat: datos.lat,
      lng: datos.lng,
      radioGeocercaM: datos.radioGeocercaM,
      dispensadores: [
        {
          id: uuid(),
          nombre: datos.dispensador.nombre,
          totActualGal: datos.dispensador.totInstalacionGal,
        },
      ],
    };
    this.sedes.push(sede);
    const cliente = this.clientes.find((c) => c.id === datos.clienteId);
    if (cliente) cliente.sedes += 1;
    return sede;
  }

  async listarEquipos(filtro: { clienteId?: string; buscar?: string }): Promise<EquipoAdmin[]> {
    return this.equipos.filter(
      (e) =>
        (!filtro.clienteId || e.clienteId === filtro.clienteId) &&
        (!filtro.buscar || e.codigoInterno.toLowerCase().includes(filtro.buscar.toLowerCase())),
    );
  }

  async crearEquipo(datos: {
    clienteId: string;
    codigoInterno: string;
    qrToken: string;
    descripcion: string | null;
    categoria: string | null;
    tipoMedidor: string;
    capacidadTanqueGal: number | null;
  }): Promise<EquipoAdmin> {
    if (
      this.equipos.some(
        (e) => e.clienteId === datos.clienteId && e.codigoInterno === datos.codigoInterno,
      )
    ) {
      throw new ConflictoUnicidad();
    }
    const equipo: EquipoAdmin = {
      id: uuid(),
      clienteId: datos.clienteId,
      clienteNombre: this.clientes.find((c) => c.id === datos.clienteId)?.nombre ?? "?",
      codigoInterno: datos.codigoInterno,
      descripcion: datos.descripcion,
      categoria: datos.categoria,
      tipoMedidor: datos.tipoMedidor,
      capacidadTanqueGal: datos.capacidadTanqueGal,
      activo: true,
    };
    this.equipos.push(equipo);
    return equipo;
  }

  async editarEquipo(
    id: string,
    cambios: Partial<
      Pick<
        EquipoAdmin,
        "codigoInterno" | "descripcion" | "categoria" | "tipoMedidor" | "capacidadTanqueGal" | "activo"
      >
    >,
  ): Promise<EquipoAdmin | null> {
    const equipo = this.equipos.find((e) => e.id === id);
    if (!equipo) return null;
    Object.assign(
      equipo,
      Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined)),
    );
    return equipo;
  }

  async listarOperadores(filtro: { clienteId?: string; buscar?: string }): Promise<OperadorAdmin[]> {
    return this.operadores
      .filter(
        (o) =>
          (!filtro.clienteId || o.clienteId === filtro.clienteId) &&
          (!filtro.buscar || o.nombre.toLowerCase().includes(filtro.buscar.toLowerCase())),
      )
      .map(({ pinHash: _pinHash, ...operador }) => operador);
  }

  async crearOperador(datos: {
    clienteId: string;
    nombre: string;
    codigo: string;
    pinHash: string;
  }): Promise<OperadorAdmin> {
    if (this.operadores.some((o) => o.clienteId === datos.clienteId && o.codigo === datos.codigo)) {
      throw new ConflictoUnicidad();
    }
    const operador = {
      id: uuid(),
      clienteId: datos.clienteId,
      clienteNombre: this.clientes.find((c) => c.id === datos.clienteId)?.nombre ?? "?",
      nombre: datos.nombre,
      codigo: datos.codigo,
      activo: true,
      ultimaCargaEn: null,
      pinHash: datos.pinHash,
    };
    this.operadores.push(operador);
    const { pinHash: _pinHash, ...sinPin } = operador;
    return sinPin;
  }

  async editarOperador(
    id: string,
    cambios: { nombre?: string; codigo?: string; pinHash?: string; activo?: boolean },
  ): Promise<OperadorAdmin | null> {
    const operador = this.operadores.find((o) => o.id === id);
    if (!operador) return null;
    Object.assign(
      operador,
      Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined)),
    );
    const { pinHash: _pinHash, ...sinPin } = operador;
    return sinPin;
  }

  async listarCodigos(filtro: { sedeId?: string }): Promise<CodigoAdmin[]> {
    return this.codigos.filter((c) => !filtro.sedeId || c.sedeId === filtro.sedeId);
  }

  async crearCodigo(datos: { sedeId: string; codigo: string; expiraEn: string }): Promise<CodigoAdmin> {
    const codigo: CodigoAdmin = {
      id: uuid(),
      sedeId: datos.sedeId,
      sedeNombre: this.sedes.find((s) => s.id === datos.sedeId)?.nombre ?? "?",
      clienteNombre: "Sacyr",
      codigo: datos.codigo,
      expiraEn: datos.expiraEn,
      usadoEn: null,
    };
    this.codigos.push(codigo);
    return codigo;
  }

  async listarDispositivos(): Promise<DispositivoAdmin[]> {
    return this.dispositivos;
  }

  async desactivarDispositivo(id: string): Promise<DispositivoAdmin | null> {
    const dispositivo = this.dispositivos.find((d) => d.id === id);
    if (!dispositivo) return null;
    dispositivo.activo = false;
    this.usuariosDesactivados.push(dispositivo.usuarioId);
    return dispositivo;
  }

  async tableroCliente(clienteId: string): Promise<TableroCliente | null> {
    const cliente = this.clientes.find((c) => c.id === clienteId);
    if (!cliente) return null;
    const cargas = this.cargas;
    return {
      clienteId,
      clienteNombre: cliente.nombre,
      hoy: {
        cargas: cargas.length,
        galones: cargas.reduce((suma, c) => suma + c.galones, 0),
        duracionPromedioS: cargas.length
          ? Math.round(cargas.reduce((suma, c) => suma + c.duracionS, 0) / cargas.length)
          : null,
        operadores: [...new Set(cargas.map((c) => c.operadorNombre))],
        ultimaCargaEn: cargas[0]?.registradaEn ?? null,
      },
      porEquipo: this.equipos
        .filter((e) => e.clienteId === clienteId && e.activo)
        .map((e) => ({
          equipoCodigo: e.codigoInterno,
          descripcion: e.descripcion,
          cargas: cargas.filter((c) => c.equipoCodigo === e.codigoInterno).length,
          galones: cargas
            .filter((c) => c.equipoCodigo === e.codigoInterno)
            .reduce((suma, c) => suma + c.galones, 0),
          ultimaCargaEn: cargas.find((c) => c.equipoCodigo === e.codigoInterno)?.registradaEn ?? null,
        })),
      historial: cargas,
    };
  }
}
