// Contrato de datos de la consola: las pantallas solo conocen esta
// interfaz (patrón del Dashboard, DEC-015). La implementación real es
// el cliente HTTP contra /api/v1/admin; las pruebas inyectan un fake.

/** Fila del catálogo perfiles_operativos (DEC-016). */
export interface PerfilOperativo {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Cliente {
  id: string;
  /** Razón social. */
  nombre: string;
  /** Identidad corporativa (DEC-018). */
  nombreComercial: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  nit: string | null;
  activo: boolean;
  sedes: number;
  /** Para advertir al cambiar el perfil de un cliente con historia. */
  cargas: number;
  perfilCodigo: string;
  /** URL firmada temporal del logo (DEC-017); null = fallback iniciales. */
  logoUrl: string | null;
}

export interface Sede {
  id: string;
  clienteId: string;
  nombre: string;
  ciudad: string | null;
  direccion: string | null;
  referencia: string | null;
  activo: boolean;
  radioGeocercaM: number;
  dispensadores: Array<{ id: string; nombre: string; totActualGal: number }>;
}

export interface Equipo {
  id: string;
  clienteId: string;
  clienteNombre: string;
  /** DEC-018: null = disponible en todas las sedes del cliente. */
  sedeId: string | null;
  sedeNombre: string | null;
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
  /** DEC-018: null = opera en todas las sedes del cliente. */
  sedeId: string | null;
  sedeNombre: string | null;
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
  /** Galones despachados por Lubryco — todo perfil (DEC-016). */
  galones: number;
  /** Snapshot del perfil con el que nació la carga. */
  perfilCodigo: string;
  /** Solo Carga sobre Inventario; null en Medidor Doble. */
  llegadaGal: number | null;
  inventarioFinalGal: number | null;
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

  perfiles(): Promise<PerfilOperativo[]>;

  clientes(buscar?: string): Promise<Cliente[]>;
  crearCliente(datos: {
    nombre: string;
    nombreComercial: string | null;
    colorPrimario: string | null;
    colorSecundario: string | null;
    nit: string | null;
    perfilCodigo: string;
  }): Promise<Cliente>;
  editarCliente(
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
  ): Promise<Cliente>;
  /** Sube (o reemplaza) el logo — binario real, jamás base64 (DEC-017). */
  subirLogo(id: string, archivo: Blob): Promise<Cliente>;
  eliminarLogo(id: string): Promise<Cliente>;

  sedes(clienteId: string): Promise<Sede[]>;
  /** dispensador null: el perfil del cliente no requiere medidor. */
  crearSede(datos: {
    clienteId: string;
    nombre: string;
    ciudad: string | null;
    direccion: string | null;
    referencia: string | null;
    dispensador: { nombre: string; totInstalacionGal: number } | null;
  }): Promise<Sede>;
  editarSede(
    id: string,
    cambios: Partial<Pick<Sede, "nombre" | "ciudad" | "direccion" | "referencia" | "activo">>,
  ): Promise<Sede>;

  equipos(filtro?: { clienteId?: string; buscar?: string }): Promise<Equipo[]>;
  crearEquipo(datos: {
    clienteId: string;
    sedeId: string | null;
    codigoInterno: string;
    descripcion: string | null;
    categoria: string | null;
  }): Promise<Equipo>;
  editarEquipo(
    id: string,
    cambios: Partial<Pick<Equipo, "sedeId" | "codigoInterno" | "descripcion" | "categoria" | "activo">>,
  ): Promise<Equipo>;

  operadores(filtro?: { clienteId?: string; buscar?: string }): Promise<Operador[]>;
  crearOperador(datos: {
    clienteId: string;
    sedeId: string | null;
    nombre: string;
    codigo: string;
    pin: string;
  }): Promise<Operador>;
  editarOperador(
    id: string,
    cambios: {
      sedeId?: string | null;
      nombre?: string;
      codigo?: string;
      pin?: string;
      activo?: boolean;
    },
  ): Promise<Operador>;

  codigos(): Promise<Codigo[]>;
  crearCodigo(datos: { sedeId: string; expiraDias?: number }): Promise<Codigo>;

  dispositivos(): Promise<Dispositivo[]>;
  desactivarDispositivo(id: string): Promise<Dispositivo>;
  reenrolarDispositivo(id: string): Promise<{ dispositivo: Dispositivo; codigo: Codigo }>;

  tablero(clienteId: string): Promise<Tablero>;
}
