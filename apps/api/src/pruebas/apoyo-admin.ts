// Fake en memoria del RepositorioAdmin + sesión de administrador para
// las pruebas de la consola. Mismo contrato que Postgres, cero base.

import type { CodigoPerfil } from "@cuadreapp/dominio";
import type { SesionAutenticada } from "../seguridad/tipos.js";
import type {
  AccesoDashboardAdmin,
  RolDashboard,
  CargaAdmin,
  ClienteAdmin,
  CodigoAdmin,
  DispositivoAdmin,
  EquipoAdmin,
  OperadorAdmin,
  PerfilOperativoAdmin,
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
    perfil: null,
  };
}

let secuencia = 0;
const uuid = () => {
  secuencia += 1;
  return `00000000-0000-4000-8000-${String(secuencia).padStart(12, "0")}`;
};

export class RepositorioAdminFalso implements RepositorioAdmin {
  perfiles: PerfilOperativoAdmin[] = [
    { codigo: "carga_inventario", nombre: "Carga sobre Inventario", descripcion: null, activo: true },
    { codigo: "medidor_doble", nombre: "Medidor Doble", descripcion: null, activo: true },
  ];
  clientes: ClienteAdmin[] = [];
  sedes: SedeAdmin[] = [];
  equipos: EquipoAdmin[] = [];
  operadores: Array<OperadorAdmin & { pinHash: string }> = [];
  codigos: CodigoAdmin[] = [];
  dispositivos: DispositivoAdmin[] = [];
  usuariosDesactivados: string[] = [];
  cargas: CargaAdmin[] = [];
  /** Accesos al Dashboard. Espejo en memoria de `usuarios` filtrado a
   *  los roles con tablero.leer — nunca mezcla con `operadores`. */
  accesos: AccesoDashboardAdmin[] = [];

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

  async listarPerfiles(): Promise<PerfilOperativoAdmin[]> {
    return this.perfiles;
  }

  async listarClientes(buscar?: string): Promise<ClienteAdmin[]> {
    return buscar
      ? this.clientes.filter((c) => c.nombre.toLowerCase().includes(buscar.toLowerCase()))
      : this.clientes;
  }

  async crearCliente(datos: {
    nombre: string;
    nombreComercial: string | null;
    colorPrimario: string | null;
    colorSecundario: string | null;
    nit: string | null;
    perfilCodigo: CodigoPerfil;
  }): Promise<ClienteAdmin> {
    if (this.clientes.some((c) => c.nombre === datos.nombre)) throw new ConflictoUnicidad();
    const cliente: ClienteAdmin = {
      id: uuid(),
      nombre: datos.nombre,
      nombreComercial: datos.nombreComercial,
      colorPrimario: datos.colorPrimario,
      colorSecundario: datos.colorSecundario,
      nit: datos.nit,
      activo: true,
      sedes: 0,
      cargas: 0,
      perfilCodigo: datos.perfilCodigo,
      logoClave: null,
    };
    this.clientes.push(cliente);
    return cliente;
  }

  async editarCliente(
    id: string,
    cambios: {
      nombre?: string;
      nombreComercial?: string | null;
      colorPrimario?: string | null;
      colorSecundario?: string | null;
      nit?: string | null;
      activo?: boolean;
      perfilCodigo?: CodigoPerfil;
    },
  ): Promise<ClienteAdmin | null> {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return null;
    Object.assign(cliente, {
      nombre: cambios.nombre ?? cliente.nombre,
      nombreComercial:
        "nombreComercial" in cambios ? (cambios.nombreComercial ?? null) : cliente.nombreComercial,
      colorPrimario:
        "colorPrimario" in cambios ? (cambios.colorPrimario ?? null) : cliente.colorPrimario,
      colorSecundario:
        "colorSecundario" in cambios ? (cambios.colorSecundario ?? null) : cliente.colorSecundario,
      nit: "nit" in cambios ? (cambios.nit ?? null) : cliente.nit,
      activo: cambios.activo ?? cliente.activo,
      perfilCodigo: cambios.perfilCodigo ?? cliente.perfilCodigo,
    });
    return cliente;
  }

  async guardarLogoCliente(
    id: string,
    clave: string,
  ): Promise<{ cliente: ClienteAdmin; claveAnterior: string | null } | null> {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return null;
    const claveAnterior = cliente.logoClave;
    cliente.logoClave = clave;
    return { cliente, claveAnterior };
  }

  async quitarLogoCliente(
    id: string,
  ): Promise<{ cliente: ClienteAdmin; claveAnterior: string | null } | null> {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return null;
    const claveAnterior = cliente.logoClave;
    cliente.logoClave = null;
    return { cliente, claveAnterior };
  }

  async listarSedes(clienteId: string): Promise<SedeAdmin[]> {
    return this.sedes.filter((s) => s.clienteId === clienteId);
  }

  async crearSede(datos: {
    clienteId: string;
    nombre: string;
    ciudad: string | null;
    direccion: string | null;
    referencia: string | null;
    lat: number | null;
    lng: number | null;
    radioGeocercaM: number;
    dispensador: { nombre: string; totInstalacionGal: number } | null;
  }): Promise<SedeAdmin> {
    const sede: SedeAdmin = {
      id: uuid(),
      clienteId: datos.clienteId,
      nombre: datos.nombre,
      ciudad: datos.ciudad,
      direccion: datos.direccion,
      referencia: datos.referencia,
      activo: true,
      lat: datos.lat,
      lng: datos.lng,
      radioGeocercaM: datos.radioGeocercaM,
      dispensadores: datos.dispensador
        ? [
            {
              id: uuid(),
              nombre: datos.dispensador.nombre,
              totActualGal: datos.dispensador.totInstalacionGal,
            },
          ]
        : [],
    };
    this.sedes.push(sede);
    const cliente = this.clientes.find((c) => c.id === datos.clienteId);
    if (cliente) cliente.sedes += 1;
    return sede;
  }

  async editarSede(
    id: string,
    cambios: {
      nombre?: string;
      ciudad?: string | null;
      direccion?: string | null;
      referencia?: string | null;
      lat?: number | null;
      lng?: number | null;
      radioGeocercaM?: number;
      activo?: boolean;
    },
  ): Promise<SedeAdmin | null> {
    const sede = this.sedes.find((s) => s.id === id);
    if (!sede) return null;
    Object.assign(sede, {
      nombre: cambios.nombre ?? sede.nombre,
      ciudad: "ciudad" in cambios ? (cambios.ciudad ?? null) : sede.ciudad,
      direccion: "direccion" in cambios ? (cambios.direccion ?? null) : sede.direccion,
      referencia: "referencia" in cambios ? (cambios.referencia ?? null) : sede.referencia,
      lat: "lat" in cambios ? (cambios.lat ?? null) : sede.lat,
      lng: "lng" in cambios ? (cambios.lng ?? null) : sede.lng,
      radioGeocercaM: cambios.radioGeocercaM ?? sede.radioGeocercaM,
      activo: cambios.activo ?? sede.activo,
    });
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
    sedeId: string | null;
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
      sedeId: datos.sedeId,
      sedeNombre: this.sedes.find((s) => s.id === datos.sedeId)?.nombre ?? null,
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
        | "sedeId"
        | "codigoInterno"
        | "descripcion"
        | "categoria"
        | "tipoMedidor"
        | "capacidadTanqueGal"
        | "activo"
      >
    >,
  ): Promise<EquipoAdmin | null> {
    const equipo = this.equipos.find((e) => e.id === id);
    if (!equipo) return null;
    Object.assign(
      equipo,
      Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined)),
    );
    if ("sedeId" in cambios) {
      equipo.sedeId = cambios.sedeId ?? null;
      equipo.sedeNombre = this.sedes.find((s) => s.id === cambios.sedeId)?.nombre ?? null;
    }
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
    sedeId: string | null;
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
      sedeId: datos.sedeId,
      sedeNombre: this.sedes.find((s) => s.id === datos.sedeId)?.nombre ?? null,
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
    cambios: {
      sedeId?: string | null;
      nombre?: string;
      codigo?: string;
      pinHash?: string;
      activo?: boolean;
    },
  ): Promise<OperadorAdmin | null> {
    const operador = this.operadores.find((o) => o.id === id);
    if (!operador) return null;
    Object.assign(
      operador,
      Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined)),
    );
    if ("sedeId" in cambios) {
      operador.sedeId = cambios.sedeId ?? null;
      operador.sedeNombre = this.sedes.find((s) => s.id === cambios.sedeId)?.nombre ?? null;
    }
    const { pinHash: _pinHash, ...sinPin } = operador;
    return sinPin;
  }

  async listarCodigos(filtro: { sedeId?: string }): Promise<CodigoAdmin[]> {
    return this.codigos.filter((c) => !filtro.sedeId || c.sedeId === filtro.sedeId);
  }

  async crearCodigo(datos: { sedeId: string; codigo: string; expiraEn: string }): Promise<CodigoAdmin> {
    const sede = this.sedes.find((s) => s.id === datos.sedeId);
    const codigo: CodigoAdmin = {
      id: uuid(),
      sedeId: datos.sedeId,
      sedeNombre: sede?.nombre ?? "?",
      clienteNombre: this.clientes.find((c) => c.id === sede?.clienteId)?.nombre ?? "?",
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

  /* ============ Accesos al Dashboard (Etapa P.2) ============ */

  async listarAccesosDashboard(clienteId: string): Promise<AccesoDashboardAdmin[]> {
    return this.accesos.filter((a) => this.clienteDe.get(a.usuarioId) === clienteId);
  }

  async accesoDashboardDeCliente(
    clienteId: string,
    usuarioId: string,
  ): Promise<AccesoDashboardAdmin | null> {
    const acceso = this.accesos.find((a) => a.usuarioId === usuarioId);
    if (!acceso || this.clienteDe.get(usuarioId) !== clienteId) return null;
    return acceso;
  }

  /** cliente de cada acceso: en la base es `usuarios.cliente_id`. */
  clienteDe = new Map<string, string>();

  async crearAccesoDashboard(datos: {
    usuarioId: string;
    clienteId: string;
    sedeId: string | null;
    rol: RolDashboard;
    nombre: string;
    email: string;
  }): Promise<AccesoDashboardAdmin> {
    if (this.accesos.some((a) => a.email?.toLowerCase() === datos.email.toLowerCase())) {
      throw new ConflictoUnicidad();
    }
    const acceso: AccesoDashboardAdmin = {
      usuarioId: datos.usuarioId,
      nombre: datos.nombre,
      email: datos.email,
      rol: datos.rol,
      sedeId: datos.sedeId,
      sedeNombre: this.sedes.find((s) => s.id === datos.sedeId)?.nombre ?? null,
      activo: true,
      creadoEn: new Date(0).toISOString(),
      ultimoAccesoEn: null,
    };
    this.accesos.push(acceso);
    this.clienteDe.set(datos.usuarioId, datos.clienteId);
    this.passwordsTemporales.add(datos.usuarioId);
    return acceso;
  }

  /** P0.1: espejo del flag `debe_cambiar_password`. */
  passwordsTemporales = new Set<string>();
  async marcarPasswordTemporal(clienteId: string, usuarioId: string): Promise<void> {
    if (this.clienteDe.get(usuarioId) === clienteId) {
      this.passwordsTemporales.add(usuarioId);
    }
  }

  async editarAccesoDashboard(
    clienteId: string,
    usuarioId: string,
    cambios: { nombre?: string; sedeId?: string | null; rol?: RolDashboard; activo?: boolean },
  ): Promise<AccesoDashboardAdmin | null> {
    const acceso = this.accesos.find((a) => a.usuarioId === usuarioId);
    if (!acceso || this.clienteDe.get(usuarioId) !== clienteId) return null;
    if (cambios.nombre !== undefined) acceso.nombre = cambios.nombre;
    if ("sedeId" in cambios) {
      acceso.sedeId = cambios.sedeId ?? null;
      acceso.sedeNombre = this.sedes.find((s) => s.id === acceso.sedeId)?.nombre ?? null;
    }
    if (cambios.rol !== undefined) acceso.rol = cambios.rol;
    if (cambios.activo !== undefined) acceso.activo = cambios.activo;
    return acceso;
  }
}
