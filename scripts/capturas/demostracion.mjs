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

/* ============ Dashboard del cliente (P.2/P.3) ============ */
/* El Dashboard dejó los datos simulados en P.2: sus pantallas se
 * responden aquí, igual que las del Admin. Mismo mundo neutro:
 * Agroindustrias del Valle (medidor) y Constructora Andina
 * (inventario). Escenarios: md · ci · md0 · ci0 (los «0» son el
 * cliente recién creado, sin ninguna carga en su historia). */

const fechaLocal = (desplazamientoDias) =>
  new Date(Date.now() + desplazamientoDias * 86_400_000).toLocaleDateString("sv-SE", {
    timeZone: "America/Bogota",
  });

const consumo14 = (porDia) =>
  Array.from({ length: 14 }, (_, i) => ({ fecha: fechaLocal(i - 13), galones: porDia(i) }));

const CONTEXTO_TABLERO = {
  md: {
    usuario: { nombre: "Patricia Gómez", rol: "supervisor" },
    permisos: ["tablero.leer"],
    cliente: {
      id: "cli-001",
      nombre: "Agroindustrias del Valle S.A.S.",
      nombreComercial: "Agroindustrias del Valle",
      colorPrimario: "#1E9B4B",
      colorSecundario: null,
      logoUrl: null,
    },
    perfil: {
      codigo: "medidor_doble",
      nombre: "Medidor Doble",
      modulos: ["hoy", "cargas", "equipos", "suministro"],
      panelesHoy: ["totalizador", "consumo", "cargas_del_dia"],
      columnasCargas: ["galones"],
      vistaEvidencia: "medidor",
    },
    sedes: [{ id: "sede-n", nombre: "Planta Norte", ciudad: "Valle del Cauca" }],
    sedeActual: "sede-n",
    medidor: { modelo: "Serie 900", instalado: "2026-06-15" },
  },
  ci: {
    usuario: { nombre: "Jorge Perea", rol: "admin_cliente" },
    permisos: ["tablero.leer"],
    cliente: {
      id: "cli-002",
      nombre: "Constructora Andina de Obras S.A.S.",
      nombreComercial: "Constructora Andina",
      colorPrimario: "#C8102E",
      colorSecundario: null,
      logoUrl: null,
    },
    perfil: {
      codigo: "carga_inventario",
      nombre: "Carga sobre Inventario",
      modulos: ["hoy", "cargas", "equipos"],
      panelesHoy: ["inventario", "consumo", "cargas_del_dia"],
      columnasCargas: ["llegada", "galones", "total_salida", "llenado"],
      vistaEvidencia: "inventario",
    },
    sedes: [{ id: "sede-k18", nombre: "Frente de obra Km 18", ciudad: "Cauca" }],
    sedeActual: "sede-k18",
    medidor: null,
  },
};

const CARGA_TAB_MD = [
  {
    id: "demo-003",
    fecha: fechaLocal(0),
    hora: "07:20",
    equipoCodigo: "P-01",
    equipoDescripcion: "Pickup Toyota Hilux",
    conductorNombre: "María Fernanda Ríos",
    galones: 14.2,
    estado: "ok",
    banderas: [],
    perfilCodigo: "medidor_doble",
    duracionSegundos: 187,
    llegadaGal: null,
    inventarioFinalGal: null,
    capacidadEquipoGal: 20,
    galNoRegistrados: null,
  },
  {
    id: "demo-002",
    fecha: fechaLocal(0),
    hora: "06:41",
    equipoCodigo: "AL-01",
    equipoDescripcion: "Alzadora Bell 1745",
    conductorNombre: "Jhon Cortés",
    galones: 52.0,
    estado: "inconsistente",
    banderas: ["SALTO_TOTALIZADOR"],
    perfilCodigo: "medidor_doble",
    duracionSegundos: 402,
    llegadaGal: null,
    inventarioFinalGal: null,
    capacidadEquipoGal: 90,
    galNoRegistrados: 18,
  },
  {
    id: "demo-001",
    fecha: fechaLocal(0),
    hora: "06:12",
    equipoCodigo: "T-04",
    equipoDescripcion: "Tractor Massey Ferguson 4292",
    conductorNombre: "Duván Bonilla",
    galones: 42.5,
    estado: "ok",
    banderas: [],
    perfilCodigo: "medidor_doble",
    duracionSegundos: 312,
    llegadaGal: null,
    inventarioFinalGal: null,
    capacidadEquipoGal: 80,
    galNoRegistrados: null,
  },
];

const CARGA_TAB_CI = [
  {
    id: "ci-002",
    fecha: fechaLocal(0),
    hora: "07:41",
    equipoCodigo: "CT-11",
    equipoDescripcion: "Carrotanque 1",
    conductorNombre: "Rosa Elvira Díaz",
    galones: 600,
    estado: "ok",
    banderas: [],
    perfilCodigo: "carga_inventario",
    duracionSegundos: 754,
    llegadaGal: 150,
    inventarioFinalGal: 750,
    capacidadEquipoGal: 1000,
    galNoRegistrados: null,
  },
  {
    id: "ci-001",
    fecha: fechaLocal(-1),
    hora: "09:05",
    equipoCodigo: "CT-07",
    equipoDescripcion: "Carrotanque 2",
    conductorNombre: "Rosa Elvira Díaz",
    galones: 480,
    estado: "advertencia",
    banderas: ["FOTO_FALTANTE"],
    perfilCodigo: "carga_inventario",
    duracionSegundos: 611,
    llegadaGal: 60,
    inventarioFinalGal: 540,
    capacidadEquipoGal: 1000,
    galNoRegistrados: null,
  },
];

const BALANCE_TABLERO = {
  entregadoTotalGal: 1550,
  despachadoTotalGal: 902.5,
  consumoDiarioGal: 118,
  existenciaEstimadaGal: 647.5,
  autonomiaDias: 5.4,
};

const BALANCE_VACIO_TAB = {
  entregadoTotalGal: 0,
  despachadoTotalGal: 0,
  consumoDiarioGal: 0,
  existenciaEstimadaGal: null,
  autonomiaDias: null,
};

const HOY_TABLERO = {
  md: {
    tieneCargas: true,
    cargasDeHoy: CARGA_TAB_MD,
    consumo14d: consumo14((i) => (i === 13 ? 108.7 : [96, 120, 84, 132, 0, 0, 110][i % 7])),
    totalizadorGal: 1889.5,
    galSinRegistrarGal: 18,
    balance: BALANCE_TABLERO,
    inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
  },
  ci: {
    tieneCargas: true,
    cargasDeHoy: [CARGA_TAB_CI[0]],
    consumo14d: consumo14((i) => (i === 13 ? 600 : i % 3 === 0 ? 480 : 0)),
    totalizadorGal: null,
    galSinRegistrarGal: 0,
    balance: BALANCE_VACIO_TAB,
    inventarioHoy: { recibidoGal: 150, despachadoGal: 600, totalSalidaGal: 750, capacidadGal: 1000 },
  },
  vacio: {
    tieneCargas: false,
    cargasDeHoy: [],
    consumo14d: consumo14(() => 0),
    totalizadorGal: null,
    galSinRegistrarGal: 0,
    balance: BALANCE_VACIO_TAB,
    inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
  },
};

/* Fotos del detalle: en desarrollo, Vite sirve los assets del propio
 * producto — la evidencia del medidor usa las fotografías reales del
 * Fill-Rite que ya viven en el repo. El carrotanque aún no tiene
 * fotografía real (orden fotográfica, bloques A-C): va sin foto. */
const DETALLES_TABLERO = {
  "demo-002": {
    carga: CARGA_TAB_MD[1],
    lecturas: { tandaInicial: 0, totInicial: 1795, tandaFinal: 52.0, totFinal: 1865 },
    inventario: null,
    lecturaEquipo: 2481,
    tipoLectura: "horometro",
    duracionSegundos: 402,
    galNoRegistrados: 18,
    notas: null,
    fotos: [
      { momento: "inicial", url: "/src/marca/assets/fillrite-antes.webp" },
      { momento: "final", url: "/src/marca/assets/fillrite-despues.webp" },
    ],
  },
  "demo-001": {
    carga: CARGA_TAB_MD[2],
    lecturas: { tandaInicial: 0, totInicial: 1847, tandaFinal: 42.5, totFinal: 1889.5 },
    inventario: null,
    lecturaEquipo: 1093,
    tipoLectura: "horometro",
    duracionSegundos: 312,
    galNoRegistrados: null,
    notas: null,
    fotos: [
      { momento: "inicial", url: "/src/marca/assets/fillrite-antes.webp" },
      { momento: "final", url: "/src/marca/assets/fillrite-despues.webp" },
    ],
  },
  "ci-002": {
    carga: CARGA_TAB_CI[0],
    lecturas: null,
    inventario: { llegadaGal: 150, despachadosGal: 600, totalSalidaGal: 750 },
    lecturaEquipo: null,
    tipoLectura: null,
    duracionSegundos: 754,
    galNoRegistrados: null,
    notas: "Sello del carrotanque verificado a la llegada.",
    fotos: [
      { momento: "inicial", url: null },
      { momento: "final", url: null },
    ],
  },
};

const EQUIPOS_TABLERO = {
  md: [
    {
      codigo: "AL-01",
      descripcion: "Alzadora Bell 1745",
      categoria: "Alzadora",
      tipoMedidor: "horometro",
      capacidadTanqueGal: 90,
      galonesPeriodoGal: 322,
      usoPeriodo: 41.5,
      rendimiento: 7.8,
      medianaHistorica: 6.1,
      ultimoInventarioGal: null,
    },
    {
      codigo: "T-04",
      descripcion: "Tractor Massey Ferguson 4292",
      categoria: "Tractor",
      tipoMedidor: "horometro",
      capacidadTanqueGal: 80,
      galonesPeriodoGal: 264,
      usoPeriodo: 52.0,
      rendimiento: 5.1,
      medianaHistorica: 5.0,
      ultimoInventarioGal: null,
    },
    {
      codigo: "P-01",
      descripcion: "Pickup Toyota Hilux",
      categoria: "Vehículo",
      tipoMedidor: "odometro",
      capacidadTanqueGal: 20,
      galonesPeriodoGal: 96,
      usoPeriodo: 1240,
      rendimiento: 0.08,
      medianaHistorica: 0.08,
      ultimoInventarioGal: null,
    },
  ],
  ci: [
    {
      codigo: "CT-11",
      descripcion: "Carrotanque 1",
      categoria: "Carrotanque",
      tipoMedidor: "ninguno",
      capacidadTanqueGal: 1000,
      galonesPeriodoGal: 1080,
      usoPeriodo: null,
      rendimiento: null,
      medianaHistorica: null,
      ultimoInventarioGal: 750,
    },
    {
      codigo: "CT-07",
      descripcion: "Carrotanque 2",
      categoria: "Carrotanque",
      tipoMedidor: "ninguno",
      capacidadTanqueGal: 1000,
      galonesPeriodoGal: 960,
      usoPeriodo: null,
      rendimiento: null,
      medianaHistorica: null,
      ultimoInventarioGal: 540,
    },
  ],
};

const SUMINISTRO_TABLERO = {
  entregas: [
    {
      numeroRemision: "R-1042",
      fecha: fechaLocal(-2),
      galones: 800,
      placaCarrotanque: "XYZ-123",
      recibidoPor: "Patricia Gómez",
    },
    {
      numeroRemision: "R-1037",
      fecha: fechaLocal(-9),
      galones: 750,
      placaCarrotanque: "XYZ-123",
      recibidoPor: "Patricia Gómez",
    },
  ],
  balance: BALANCE_TABLERO,
};

/** Responde las rutas del Dashboard del cliente según el escenario:
 *  `md` · `ci` · `md0` · `ci0` (cliente sin cargas). */
export function responderTablero(metodo, ruta, escenario = "md") {
  const sinQuery = ruta.split("?")[0];
  const base = escenario.startsWith("ci") ? "ci" : "md";
  const vacio = escenario.endsWith("0");

  if (sinQuery.endsWith("/auth/refresh")) return TOKENS;
  if (sinQuery.endsWith("/auth/logout")) return { ok: true };
  if (sinQuery.endsWith("/tablero/contexto")) return CONTEXTO_TABLERO[base];
  if (sinQuery.endsWith("/tablero/hoy")) return vacio ? HOY_TABLERO.vacio : HOY_TABLERO[base];
  if (sinQuery.endsWith("/tablero/equipos")) return { equipos: vacio ? [] : EQUIPOS_TABLERO[base] };
  if (sinQuery.endsWith("/tablero/suministro")) {
    return vacio ? { entregas: [], balance: BALANCE_VACIO_TAB } : SUMINISTRO_TABLERO;
  }

  const detalleDe = sinQuery.match(/\/tablero\/cargas\/([^/]+)$/);
  if (detalleDe) return DETALLES_TABLERO[detalleDe[1]] ?? DETALLES_TABLERO["demo-001"];

  if (sinQuery.endsWith("/tablero/cargas")) {
    const cargas = vacio ? [] : base === "ci" ? CARGA_TAB_CI : CARGA_TAB_MD;
    return {
      cargas,
      total: cargas.length,
      cuadran: cargas.filter((c) => c.estado === "ok").length,
      sinFotoFinal: cargas.filter((c) => c.banderas.includes("FOTO_FALTANTE")).length,
      galSinRegistrarGal: base === "md" && !vacio ? 18 : 0,
    };
  }

  return {};
}
