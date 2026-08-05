// Datos de demostración para las capturas de la consola Admin.
//
// La consola habla con /api/v1/admin. Para capturarla haría falta una
// base sembrada, un API corriendo y credenciales — y ninguna de las
// tres cosas debe ser un requisito para producir documentación.
//
// En vez de eso, el arnés intercepta la red DESDE EL NAVEGADOR y
// responde con estos datos. La consola que sale en la captura es la
// real, sin una línea modificada: lo único simulado es la respuesta
// HTTP, exactamente igual que el Dashboard usa su fuente simulada.
//
// REGLA: los nombres de aquí son inventados y neutros a propósito.
// `pnpm sin-clientes` prohíbe nombres de cliente reales en el código, y
// una captura que va a un manual público no debe filtrar quién opera.

const HOY = "2026-08-04";
const ts = (hora) => `${HOY}T${hora}:00-05:00`;

export const CLIENTES = [
  {
    id: "cli-001",
    nombre: "Agroindustrias del Valle S.A.S.",
    nombreComercial: "Agroindustrias del Valle",
    colorPrimario: "#2E9E63",
    colorSecundario: "#F2B705",
    nit: "900.123.456-7",
    activo: true,
    sedes: 2,
    cargas: 1284,
    perfilCodigo: "medidor_doble",
    logoUrl: null,
  },
  {
    id: "cli-002",
    nombre: "Constructora Andina de Obras S.A.S.",
    nombreComercial: "Constructora Andina",
    colorPrimario: "#12395C",
    colorSecundario: "#E4572E",
    nit: "901.884.221-3",
    activo: true,
    sedes: 1,
    cargas: 96,
    perfilCodigo: "carga_inventario",
    logoUrl: null,
  },
  {
    id: "cli-003",
    nombre: "Molinos del Pacífico Ltda.",
    nombreComercial: "Molinos del Pacífico",
    colorPrimario: "#5B3E96",
    colorSecundario: "#00A5A8",
    nit: "830.556.019-1",
    activo: false,
    sedes: 1,
    cargas: 0,
    perfilCodigo: "medidor_doble",
    logoUrl: null,
  },
];

export const PERFILES = [
  {
    codigo: "medidor_doble",
    nombre: "Medidor Doble",
    descripcion: "Planta con medidor en el surtidor: tanda y totalizador, antes y después.",
    activo: true,
  },
  {
    codigo: "carga_inventario",
    nombre: "Carga sobre Inventario",
    descripcion: "Despacho a carrotanques: galones de llegada y galones despachados.",
    activo: true,
  },
];

export const SEDES = {
  "cli-001": [
    {
      id: "sed-001",
      clienteId: "cli-001",
      nombre: "Planta Norte",
      ciudad: "Buga, Valle del Cauca",
      direccion: "Km 4 vía Buga – Tuluá",
      referencia: "Entrada por la portería de vehículos pesados",
      activo: true,
      radioGeocercaM: 150,
      dispensadores: [{ id: "dis-001", nombre: "Surtidor principal", totActualGal: 22551 }],
    },
    {
      id: "sed-002",
      clienteId: "cli-001",
      nombre: "Planta Sur",
      ciudad: "Palmira, Valle del Cauca",
      direccion: "Zona franca, bodega 12",
      referencia: null,
      activo: true,
      radioGeocercaM: 120,
      dispensadores: [{ id: "dis-002", nombre: "Surtidor bodega", totActualGal: 4180 }],
    },
  ],
  "cli-002": [
    {
      id: "sed-010",
      clienteId: "cli-002",
      nombre: "Frente de obra Km 18",
      ciudad: "Villavicencio, Meta",
      direccion: "Km 18 vía al Llano",
      referencia: "Campamento principal",
      activo: true,
      radioGeocercaM: 200,
      dispensadores: [],
    },
  ],
  "cli-003": [],
};

const equipo = (id, clienteId, clienteNombre, sedeId, sedeNombre, codigo, desc, categoria, cap) => ({
  id,
  clienteId,
  clienteNombre,
  sedeId,
  sedeNombre,
  codigoInterno: codigo,
  descripcion: desc,
  categoria,
  tipoMedidor: "horometro",
  capacidadTanqueGal: cap,
  activo: true,
});

export const EQUIPOS = [
  equipo(
    "eq-01",
    "cli-001",
    "Agroindustrias del Valle",
    "sed-001",
    "Planta Norte",
    "T-04",
    "Tractor Massey Ferguson 4292",
    "Tractor",
    60,
  ),
  equipo(
    "eq-02",
    "cli-001",
    "Agroindustrias del Valle",
    "sed-001",
    "Planta Norte",
    "AL-01",
    "Alzadora Bell 1745",
    "Alzadora",
    85,
  ),
  equipo(
    "eq-03",
    "cli-001",
    "Agroindustrias del Valle",
    null,
    null,
    "P-01",
    "Pickup Toyota Hilux",
    "Vehículo liviano",
    20,
  ),
  equipo(
    "eq-04",
    "cli-001",
    "Agroindustrias del Valle",
    "sed-002",
    "Planta Sur",
    "T-11",
    "Tractor John Deere 6110",
    "Tractor",
    55,
  ),
  equipo(
    "eq-05",
    "cli-002",
    "Constructora Andina",
    "sed-010",
    "Frente de obra Km 18",
    "CT-02",
    "Carrotanque Kenworth T800",
    "Carrotanque",
    2000,
  ),
  equipo(
    "eq-06",
    "cli-002",
    "Constructora Andina",
    null,
    null,
    "CT-05",
    "Carrotanque International 7600",
    "Carrotanque",
    1800,
  ),
];

const operador = (id, clienteId, clienteNombre, sedeId, sedeNombre, nombre, codigo, ultima) => ({
  id,
  clienteId,
  clienteNombre,
  sedeId,
  sedeNombre,
  nombre,
  codigo,
  activo: true,
  ultimaCargaEn: ultima,
});

export const OPERADORES = [
  operador(
    "op-01",
    "cli-001",
    "Agroindustrias del Valle",
    "sed-001",
    "Planta Norte",
    "Duván Bonilla",
    "OP-01",
    ts("06:12"),
  ),
  operador(
    "op-02",
    "cli-001",
    "Agroindustrias del Valle",
    "sed-001",
    "Planta Norte",
    "Jhon Cortés",
    "OP-02",
    ts("06:41"),
  ),
  operador(
    "op-03",
    "cli-001",
    "Agroindustrias del Valle",
    null,
    null,
    "María Fernanda Ríos",
    "OP-03",
    ts("07:20"),
  ),
  operador(
    "op-04",
    "cli-002",
    "Constructora Andina",
    "sed-010",
    "Frente de obra Km 18",
    "Édinson Parra",
    "OP-10",
    ts("09:05"),
  ),
];

export const DISPOSITIVOS = [
  {
    id: "dev-01",
    sedeId: "sed-001",
    sedeNombre: "Planta Norte",
    clienteNombre: "Agroindustrias del Valle",
    nombre: "Motorola G54 · portería",
    enroladoEn: "2026-07-06T08:12:00-05:00",
    ultimoVistoEn: ts("07:22"),
    activo: true,
  },
  {
    id: "dev-02",
    sedeId: "sed-002",
    sedeNombre: "Planta Sur",
    clienteNombre: "Agroindustrias del Valle",
    nombre: "Samsung A15 · bodega",
    enroladoEn: "2026-07-14T10:40:00-05:00",
    ultimoVistoEn: "2026-07-29T16:02:00-05:00",
    activo: true,
  },
  {
    id: "dev-03",
    sedeId: "sed-010",
    sedeNombre: "Frente de obra Km 18",
    clienteNombre: "Constructora Andina",
    nombre: "iPhone 12 · despacho",
    enroladoEn: "2026-08-01T07:55:00-05:00",
    ultimoVistoEn: ts("09:06"),
    activo: true,
  },
  {
    id: "dev-04",
    sedeId: "sed-001",
    sedeNombre: "Planta Norte",
    clienteNombre: "Agroindustrias del Valle",
    nombre: "Motorola G32 · extraviado",
    enroladoEn: "2026-06-02T09:10:00-05:00",
    ultimoVistoEn: "2026-07-18T11:44:00-05:00",
    activo: false,
  },
];

export const CODIGOS = [
  {
    id: "cod-01",
    sedeId: "sed-001",
    sedeNombre: "Planta Norte",
    clienteNombre: "Agroindustrias del Valle",
    codigo: "K7M-4QX",
    expiraEn: "2026-08-11T23:59:00-05:00",
    usadoEn: null,
    estado: "vigente",
  },
  {
    id: "cod-02",
    sedeId: "sed-010",
    sedeNombre: "Frente de obra Km 18",
    clienteNombre: "Constructora Andina",
    codigo: "R2P-88T",
    expiraEn: "2026-08-08T23:59:00-05:00",
    usadoEn: "2026-08-01T07:55:00-05:00",
    estado: "usado",
  },
];

const cargaMedidor = (id, hora, equipoCodigo, operadorNombre, galones, estado, banderas, notas) => ({
  id,
  registradaEn: ts(hora),
  clienteNombre: "Agroindustrias del Valle",
  sedeNombre: "Planta Norte",
  equipoCodigo,
  operadorNombre,
  galones,
  perfilCodigo: "medidor_doble",
  llegadaGal: null,
  inventarioFinalGal: null,
  duracionS: 214,
  estado,
  banderas,
  notas,
  fotos: [
    { momento: "inicial", url: null },
    { momento: "final", url: null },
  ],
});

export const CARGAS = [
  cargaMedidor("car-001", "07:20", "P-01", "María Fernanda Ríos", 14.2, "ok", [], null),
  {
    ...cargaMedidor(
      "car-002",
      "06:41",
      "AL-01",
      "Jhon Cortés",
      52.0,
      "inconsistente",
      ["SALTO_TOTALIZADOR"],
      null,
    ),
  },
  cargaMedidor("car-003", "06:12", "T-04", "Duván Bonilla", 42.5, "ok", [], null),
  {
    id: "car-010",
    registradaEn: ts("09:05"),
    clienteNombre: "Constructora Andina",
    sedeNombre: "Frente de obra Km 18",
    equipoCodigo: "CT-02",
    operadorNombre: "Édinson Parra",
    galones: 600.0,
    perfilCodigo: "carga_inventario",
    llegadaGal: 150.0,
    inventarioFinalGal: 750.0,
    duracionS: 1320,
    estado: "ok",
    banderas: [],
    notas: null,
    fotos: [
      { momento: "inicial", url: null },
      { momento: "final", url: null },
    ],
  },
];

export const RESUMEN = {
  clientesActivos: 2,
  equiposActivos: 6,
  operadoresActivos: 4,
  dispositivosEnrolados: 3,
  cargasHoy: 4,
  galonesHoy: 708.7,
  alertas: [
    { tipo: "carga_inconsistente", mensaje: "1 carga de hoy no cuadra (AL-01, 06:41)." },
    { tipo: "dispositivo_inactivo", mensaje: "Samsung A15 · bodega no sincroniza hace 6 días." },
    { tipo: "codigo_vigente", mensaje: "1 código de enrolamiento vigente sin usar." },
  ],
};

export const TABLERO = {
  clienteId: "cli-001",
  clienteNombre: "Agroindustrias del Valle",
  hoy: {
    cargas: 3,
    galones: 108.7,
    duracionPromedioS: 214,
    operadores: ["Duván Bonilla", "Jhon Cortés", "María Fernanda Ríos"],
    ultimaCargaEn: ts("07:20"),
  },
  porEquipo: [
    {
      equipoCodigo: "AL-01",
      descripcion: "Alzadora Bell 1745",
      cargas: 1,
      galones: 52.0,
      ultimaCargaEn: ts("06:41"),
    },
    {
      equipoCodigo: "T-04",
      descripcion: "Tractor Massey Ferguson 4292",
      cargas: 1,
      galones: 42.5,
      ultimaCargaEn: ts("06:12"),
    },
    {
      equipoCodigo: "P-01",
      descripcion: "Pickup Toyota Hilux",
      cargas: 1,
      galones: 14.2,
      ultimaCargaEn: ts("07:20"),
    },
  ],
  historial: CARGAS.filter((c) => c.clienteNombre === "Agroindustrias del Valle"),
};

export const TOKENS = {
  access_token: "demo.access.token",
  refresh_token: "demo.refresh.token",
};

/** Resuelve una petición interceptada a su cuerpo de demostración. */
export function responder(metodo, ruta) {
  const sinQuery = ruta.split("?")[0];
  const params = new URLSearchParams(ruta.includes("?") ? ruta.slice(ruta.indexOf("?") + 1) : "");

  if (sinQuery.endsWith("/auth/login") || sinQuery.endsWith("/auth/refresh")) return TOKENS;
  if (sinQuery.endsWith("/admin/resumen")) return RESUMEN;
  if (sinQuery.endsWith("/admin/perfiles")) return { perfiles: PERFILES };
  if (sinQuery.endsWith("/admin/codigos")) return { codigos: CODIGOS };
  if (sinQuery.endsWith("/admin/dispositivos")) return { dispositivos: DISPOSITIVOS };

  if (sinQuery.endsWith("/admin/cargas")) {
    const cliente = params.get("cliente_id");
    return { cargas: cliente ? CARGAS.filter((c) => c.clienteNombre === nombreDe(cliente)) : CARGAS };
  }
  if (sinQuery.endsWith("/admin/clientes")) {
    const buscar = (params.get("buscar") ?? "").toLowerCase();
    return {
      clientes: buscar
        ? CLIENTES.filter((c) => `${c.nombre} ${c.nombreComercial}`.toLowerCase().includes(buscar))
        : CLIENTES,
    };
  }
  if (sinQuery.endsWith("/admin/equipos")) {
    const cliente = params.get("cliente_id");
    return { equipos: cliente ? EQUIPOS.filter((e) => e.clienteId === cliente) : EQUIPOS };
  }
  if (sinQuery.endsWith("/admin/operadores")) {
    const cliente = params.get("cliente_id");
    return { operadores: cliente ? OPERADORES.filter((o) => o.clienteId === cliente) : OPERADORES };
  }

  const sedesDe = sinQuery.match(/\/admin\/clientes\/([^/]+)\/sedes$/);
  if (sedesDe) return { sedes: SEDES[sedesDe[1]] ?? [] };

  const tableroDe = sinQuery.match(/\/admin\/tablero\/([^/]+)$/);
  if (tableroDe) return TABLERO;

  const clienteDe = sinQuery.match(/\/admin\/clientes\/([^/]+)$/);
  if (clienteDe) return CLIENTES.find((c) => c.id === clienteDe[1]) ?? CLIENTES[0];

  return {};
}

function nombreDe(clienteId) {
  return CLIENTES.find((c) => c.id === clienteId)?.nombreComercial ?? "";
}
