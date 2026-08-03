// Contrato de datos de la consola: las pantallas solo conocen esta
// interfaz (patrón del Dashboard, DEC-015). La implementación real es
// el cliente HTTP contra /api/v1/admin; las pruebas inyectan un fake.

export interface Cliente {
  id: string;
  nombre: string;
  nit: string | null;
  activo: boolean;
  sedes: number;
}

export interface Sede {
  id: string;
  clienteId: string;
  nombre: string;
  radioGeocercaM: number;
  dispensadores: Array<{ id: string; nombre: string; totActualGal: number }>;
}

export interface Equipo {
  id: string;
  clienteId: string;
  clienteNombre: string;
  codigoInterno: string;
  descripcion: string | null;
  categoria: string | null;
  tipoMedidor: string;
  capacidadTanqueGal: number | null;
  activo: boolean;
}

export interface Operador {
  id: string;
  clienteId: string;
  clienteNombre: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  ultimaCargaEn: string | null;
}

export interface Dispositivo {
  id: string;
  sedeId: string;
  sedeNombre: string;
  clienteNombre: string;
  nombre: string | null;
  enroladoEn: string;
  ultimoVistoEn: string | null;
  activo: boolean;
}

export interface Codigo {
  id: string;
  sedeId: string;
  sedeNombre: string;
  clienteNombre: string;
  codigo: string;
  expiraEn: string;
  usadoEn: string | null;
  estado: "vigente" | "usado" | "expirado";
}

export interface Carga {
  id: string;
  registradaEn: string;
  clienteNombre: string;
  sedeNombre: string;
  equipoCodigo: string;
  operadorNombre: string;
  galones: number;
  duracionS: number;
  estado: "ok" | "advertencia" | "inconsistente";
  banderas: string[];
  notas: string | null;
  fotos: Array<{ momento: string; ruta?: string; url?: string | null }>;
}

export interface Resumen {
  clientesActivos: number;
  equiposActivos: number;
  operadoresActivos: number;
  dispositivosEnrolados: number;
  cargasHoy: number;
  galonesHoy: number;
  alertas: Array<{ tipo: string; mensaje: string }>;
}

export interface Tablero {
  clienteId: string;
  clienteNombre: string;
  hoy: {
    cargas: number;
    galones: number;
    duracionPromedioS: number | null;
    operadores: string[];
    ultimaCargaEn: string | null;
  };
  porEquipo: Array<{
    equipoCodigo: string;
    descripcion: string | null;
    cargas: number;
    galones: number;
    ultimaCargaEn: string | null;
  }>;
  historial: Carga[];
}

export interface FuenteAdmin {
  resumen(): Promise<Resumen>;
  cargas(filtro?: { clienteId?: string; limite?: number }): Promise<Carga[]>;

  clientes(buscar?: string): Promise<Cliente[]>;
  crearCliente(datos: { nombre: string; nit: string | null }): Promise<Cliente>;
  editarCliente(
    id: string,
    cambios: Partial<Pick<Cliente, "nombre" | "nit" | "activo">>,
  ): Promise<Cliente>;

  sedes(clienteId: string): Promise<Sede[]>;
  crearSede(datos: {
    clienteId: string;
    nombre: string;
    dispensadorNombre: string;
    totInstalacionGal: number;
  }): Promise<Sede>;

  equipos(filtro?: { clienteId?: string; buscar?: string }): Promise<Equipo[]>;
  crearEquipo(datos: {
    clienteId: string;
    codigoInterno: string;
    descripcion: string | null;
    categoria: string | null;
  }): Promise<Equipo>;
  editarEquipo(
    id: string,
    cambios: Partial<Pick<Equipo, "codigoInterno" | "descripcion" | "categoria" | "activo">>,
  ): Promise<Equipo>;

  operadores(filtro?: { clienteId?: string; buscar?: string }): Promise<Operador[]>;
  crearOperador(datos: {
    clienteId: string;
    nombre: string;
    codigo: string;
    pin: string;
  }): Promise<Operador>;
  editarOperador(
    id: string,
    cambios: { nombre?: string; codigo?: string; pin?: string; activo?: boolean },
  ): Promise<Operador>;

  codigos(): Promise<Codigo[]>;
  crearCodigo(datos: { sedeId: string; expiraDias?: number }): Promise<Codigo>;

  dispositivos(): Promise<Dispositivo[]>;
  desactivarDispositivo(id: string): Promise<Dispositivo>;
  reenrolarDispositivo(id: string): Promise<{ dispositivo: Dispositivo; codigo: Codigo }>;

  tablero(clienteId: string): Promise<Tablero>;
}
