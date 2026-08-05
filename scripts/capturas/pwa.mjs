// Recorrido de la PWA del operador para el arnés de captura.
//
// La PWA no se puede capturar pantalla por pantalla: es una máquina de
// estados. Para llegar a «Confirma tu clave» hay que haber enrolado el
// teléfono, elegido un equipo y tecleado un código — igual que en la
// planta. Así que el arnés recorre el flujo REAL, tocando los mismos
// botones que toca un operador, y dispara la captura en cada parada.
//
// Lo único falso es la respuesta HTTP. La app no se entera.
//
// DÓNDE SE DETIENE Y POR QUÉ: en la primera pantalla de cámara. Un
// navegador puede simular una cámara, pero lo que saldría en la imagen
// no sería un medidor Fill-Rite: sería un patrón de prueba. Poner eso
// en el manual que enseña a fotografiar un medidor sería peor que
// dejar el hueco. Esas capturas se toman en planta, con el teléfono.

/** PIN 1234 — el mismo que documenta el recorrido de demostración. */
const PIN_HASH = "$2a$10$6kJnvQ.QRi944AU3N0rcZe4Ad0YXXyOa./pq8A/rC5shVXqrSqxd.";

const SEDE = {
  id: "sed-001",
  nombre: "Planta Norte",
  ciudad: "Buga, Valle del Cauca",
  direccion: "Km 4 vía Buga – Tuluá",
  lat: 3.9006,
  lng: -76.2978,
  radio_geocerca_m: 150,
};

const CONDUCTORES = [
  { id: "op-01", nombre: "Duván Bonilla", codigo: "01", pin_hash: PIN_HASH },
  { id: "op-02", nombre: "Jhon Cortés", codigo: "02", pin_hash: PIN_HASH },
];

const EQUIPOS_MEDIDOR = [
  {
    id: "eq-01",
    codigo_interno: "T-04",
    descripcion: "Tractor Massey Ferguson 4292",
    tipo_medidor: "horometro",
    ultima_lectura: 4182,
    capacidad_tanque_gal: 60,
  },
  {
    id: "eq-02",
    codigo_interno: "AL-01",
    descripcion: "Alzadora Bell 1745",
    tipo_medidor: "horometro",
    ultima_lectura: 9714,
    capacidad_tanque_gal: 85,
  },
  {
    id: "eq-03",
    codigo_interno: "P-01",
    descripcion: "Pickup Toyota Hilux",
    tipo_medidor: "odometro",
    ultima_lectura: 118432,
    capacidad_tanque_gal: 20,
  },
  {
    id: "eq-04",
    codigo_interno: "T-11",
    descripcion: "Tractor John Deere 6110",
    tipo_medidor: "horometro",
    ultima_lectura: 2290,
    capacidad_tanque_gal: 55,
  },
];

const EQUIPOS_INVENTARIO = [
  {
    id: "eq-05",
    codigo_interno: "CT-02",
    descripcion: "Carrotanque Kenworth T800",
    tipo_medidor: "odometro",
    ultima_lectura: 284110,
    capacidad_tanque_gal: 2000,
  },
  {
    id: "eq-06",
    codigo_interno: "CT-05",
    descripcion: "Carrotanque International 7600",
    tipo_medidor: "odometro",
    ultima_lectura: 191002,
    capacidad_tanque_gal: 1800,
  },
];

const CLIENTE = {
  id: "cli-001",
  nombre: "Agroindustrias del Valle S.A.S.",
  nombre_comercial: "Agroindustrias del Valle",
  color_primario: "#2E9E63",
  color_secundario: "#F2B705",
  logo_url: null,
};

export function catalogo(perfil) {
  const inventario = perfil === "carga_inventario";
  return {
    cliente: CLIENTE,
    perfil: inventario
      ? { codigo: "carga_inventario", nombre: "Carga sobre Inventario" }
      : { codigo: "medidor_doble", nombre: "Medidor Doble" },
    sede: SEDE,
    dispensadores: inventario
      ? []
      : [
          {
            id: "dis-001",
            nombre: "Surtidor principal",
            tot_actual_gal: 22551,
            tolerancia_tanda_gal: 1.0,
          },
        ],
    equipos: inventario ? EQUIPOS_INVENTARIO : EQUIPOS_MEDIDOR,
    conductores: CONDUCTORES,
  };
}

export const PERFIL_ME = {
  usuario_id: "dev-01",
  nombre: "Motorola G54 · portería",
  rol: "dispositivo",
  cliente_id: "cli-001",
  sede_id: "sed-001",
  permisos: ["cargas.crear", "catalogo.leer"],
};

export const TOKENS = {
  access_token: "demo.access.token",
  refresh_token: "demo.refresh.token",
  expira_en_s: 3600,
};

/** Responde las rutas que la PWA consume. */
export function responder(ruta, perfil) {
  if (ruta.includes("/dispositivos/enrolar")) return { cuerpo: TOKENS, estado: 201 };
  if (ruta.includes("/auth/refresh")) return { cuerpo: TOKENS, estado: 200 };
  if (ruta.endsWith("/me")) return { cuerpo: PERFIL_ME, estado: 200 };
  if (ruta.includes("/catalogo")) return { cuerpo: catalogo(perfil), estado: 200 };
  return { cuerpo: {}, estado: 200 };
}

const teclear = async (pagina, digitos) => {
  for (const digito of digitos) {
    await pagina.getByRole("button", { name: digito, exact: true }).click();
    await pagina.waitForTimeout(80);
  }
};

/**
 * El recorrido, en el orden en que ocurre en la planta. Cada parada
 * dice qué captura produce y qué hay que hacer para llegar a la
 * siguiente.
 */
export function recorrido(prefijo) {
  return [
    {
      archivo: `${prefijo}-02_enrolar.png`,
      esperar: (pagina) => pagina.getByText("Enrolar este dispositivo").waitFor(),
    },
    {
      archivo: `${prefijo}-03_inicio.png`,
      antes: async (pagina) => {
        await pagina.locator("input").first().fill("K7M-4QX");
        await pagina.getByRole("button", { name: "Enrolar" }).click();
      },
      esperar: (pagina) => pagina.getByRole("button", { name: /Cargar combustible/i }).waitFor(),
    },
    {
      archivo: `${prefijo}-14_diagnostico.png`,
      // Se visita ANTES de empezar una carga: si se recargara la app a
      // mitad del flujo, la PWA restauraría el borrador en curso y el
      // inicio ya no estaría ahí. Es el mismo motivo por el que un
      // operador nunca pierde una captura a medias.
      antes: async (pagina) => {
        await pagina.getByRole("button", { name: "Diagnóstico del dispositivo" }).click();
      },
      esperar: (pagina) => pagina.getByRole("button", { name: "Volver" }).waitFor(),
    },
    {
      archivo: `${prefijo}-04_equipo-lista.png`,
      antes: async (pagina) => {
        await pagina.getByRole("button", { name: "Volver" }).click();
        await pagina.getByRole("button", { name: /Cargar combustible/i }).click();
      },
      esperar: (pagina) => pagina.getByPlaceholder(/Buscar por código/).waitFor(),
    },
    {
      archivo: `${prefijo}-05_equipo-confirma.png`,
      antes: async (pagina, { equipo }) => {
        await pagina.getByPlaceholder(/Buscar por código/).fill(equipo);
        await pagina.waitForTimeout(200);
        await pagina.getByText(equipo, { exact: true }).first().click();
      },
      esperar: (pagina) => pagina.getByRole("button", { name: "Sí, es este" }).waitFor(),
    },
    {
      archivo: `${prefijo}-06_operador-codigo.png`,
      antes: async (pagina) => {
        await pagina.getByRole("button", { name: "Sí, es este" }).click();
      },
      esperar: (pagina) => pagina.getByText("Confirma tu clave").waitFor(),
    },
    {
      archivo: `${prefijo}-07_operador-pin.png`,
      antes: async (pagina) => {
        await teclear(pagina, ["0", "1"]);
        await pagina
          .getByRole("button", { name: /Continuar|Confirmar|Seguir/i })
          .first()
          .click();
        await pagina.waitForTimeout(300);
        await teclear(pagina, ["1", "2"]);
      },
      esperar: (pagina) => pagina.getByText("Duván Bonilla").waitFor(),
    },
  ];
}

/** Equipo que se elige en cada perfil, para que la lista tenga sentido. */
export const EQUIPO_DEMO = { medidor_doble: "T-04", carga_inventario: "CT-02" };
