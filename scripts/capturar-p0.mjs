// Arnés de evidencia del P.3 UX Hardening P0.
//
// Produce las 15 capturas REALES del cierre — las apps locales de
// verdad, con la API interceptada desde el navegador (misma técnica de
// capturar-pantallas.mjs). No modifica una línea del producto y no
// toca producción: todo es localhost + respuestas simuladas.
//
// Uso:  node scripts/capturar-p0.mjs
// Deja las imágenes en docs/capturas/p0-ux-hardening/.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { APPS, DISPOSITIVOS } from "./capturas/manifiesto.mjs";
import { responder, TOKENS } from "./capturas/demostracion.mjs";

const RAIZ = new URL("..", import.meta.url).pathname;
const DESTINO = join(RAIZ, "docs/capturas/p0-ux-hardening");
const VERSION_PLAYWRIGHT = "1.49.1";

/* ============ Playwright del caché de npx (igual que el arnés base) ============ */

function cargarPlaywright() {
  const candidatos = [join(RAIZ, "node_modules"), ...cacheNpx()];
  for (const base of candidatos) {
    try {
      return createRequire(`${base}/`)("playwright");
    } catch {
      /* siguiente candidato */
    }
  }
  console.error(
    `No se encontró Playwright. Instálalo en el caché de npx:\n\n` +
      `  npx --yes -p playwright@${VERSION_PLAYWRIGHT} -c "true"\n`,
  );
  process.exit(1);
}

function cacheNpx() {
  const raiz = join(homedir(), ".npm/_npx");
  if (!existsSync(raiz)) return [];
  return readdirSync(raiz)
    .map((entrada) => join(raiz, entrada, "node_modules"))
    .filter((ruta) => existsSync(join(ruta, "playwright")));
}

function levantar(app) {
  const { puerto, filtro } = APPS[app];
  const proceso = spawn("pnpm", ["--filter", filtro, "dev"], {
    cwd: RAIZ,
    stdio: "ignore",
    detached: true,
  });
  return {
    url: `http://localhost:${puerto}`,
    detener: () => {
      try {
        process.kill(-proceso.pid);
      } catch {
        /* ya murió */
      }
    },
  };
}

async function esperar(url, intentos = 60) {
  for (let i = 0; i < intentos; i += 1) {
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) return true;
    } catch {
      /* todavía no levanta */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

/* ============ Fixtures del Dashboard (formas del cable de fuente-api) ============ */

const CLIENTE_ID = "cli-001";

const CONTEXTO_MD = {
  usuario: { nombre: "Patricia Gómez", rol: "supervisor" },
  permisos: ["tablero.leer"],
  cliente: {
    id: CLIENTE_ID,
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
  sedes: [{ id: "sede-1", nombre: "Planta Buga", ciudad: "Valle del Cauca" }],
  sedeActual: "sede-1",
  medidor: { modelo: "Fill-Rite 901", instalado: "2026-06-15" },
};

const CONTEXTO_CI = {
  ...CONTEXTO_MD,
  cliente: {
    ...CONTEXTO_MD.cliente,
    id: "cli-002",
    nombre: "Estación de Servicio del Centro S.A.S.",
    nombreComercial: "EDS del Centro",
    colorPrimario: "#C8102E",
  },
  perfil: {
    codigo: "carga_inventario",
    nombre: "Carga sobre Inventario",
    modulos: ["hoy", "cargas", "equipos"],
    panelesHoy: ["inventario", "consumo", "cargas_del_dia"],
    columnasCargas: ["llegada", "galones", "total_salida", "llenado"],
    vistaEvidencia: "inventario",
  },
  medidor: null,
};

const fechaLocal = (desplazamientoDias) => {
  const fecha = new Date(Date.now() + desplazamientoDias * 86_400_000);
  return fecha.toLocaleDateString("sv-SE", { timeZone: "America/Bogota" });
};

const consumo14 = (galonesPorDia) =>
  Array.from({ length: 14 }, (_, indice) => ({
    fecha: fechaLocal(indice - 13),
    galones: galonesPorDia(indice),
  }));

const BALANCE_CERO = {
  entregadoTotalGal: 0,
  despachadoTotalGal: 0,
  consumoDiarioGal: 0,
  existenciaEstimadaGal: null,
  autonomiaDias: null,
};

const HOY_SIN_CARGAS = {
  tieneCargas: false,
  cargasDeHoy: [],
  consumo14d: consumo14(() => 0),
  totalizadorGal: null,
  galSinRegistrarGal: 0,
  balance: BALANCE_CERO,
  inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
};

const CARGA_MD = {
  id: "carga-01",
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
};

const CARGA_CI = {
  ...CARGA_MD,
  id: "carga-02",
  hora: "07:41",
  equipoCodigo: "SMW-477",
  equipoDescripcion: "Carrotanque 1",
  conductorNombre: "Operadora EDS",
  galones: 600,
  perfilCodigo: "carga_inventario",
  duracionSegundos: 754,
  llegadaGal: 150,
  inventarioFinalGal: 750,
  capacidadEquipoGal: 1000,
};

const HOY_MD_DATOS = {
  tieneCargas: true,
  cargasDeHoy: [CARGA_MD],
  consumo14d: consumo14((i) => (i === 13 ? 42.5 : [96, 120, 84, 132, 0, 0, 110][i % 7])),
  totalizadorGal: 1889.5,
  galSinRegistrarGal: 0,
  balance: {
    entregadoTotalGal: 1550,
    despachadoTotalGal: 902.5,
    consumoDiarioGal: 118,
    existenciaEstimadaGal: 647.5,
    autonomiaDias: 5.4,
  },
  inventarioHoy: { recibidoGal: 0, despachadoGal: 0, totalSalidaGal: 0, capacidadGal: null },
};

const HOY_CI_DATOS = {
  tieneCargas: true,
  cargasDeHoy: [CARGA_CI],
  consumo14d: consumo14((i) => (i === 13 ? 600 : 0)),
  totalizadorGal: null,
  galSinRegistrarGal: 0,
  balance: BALANCE_CERO,
  inventarioHoy: { recibidoGal: 150, despachadoGal: 600, totalSalidaGal: 750, capacidadGal: 1000 },
};

/* ============ Fixtures de Accesos (formas del cable del admin) ============ */

const ACCESOS = [
  {
    usuarioId: "usr-001",
    nombre: "Marta Ruiz",
    email: "marta.ruiz@agrovalle.com",
    rol: "supervisor",
    sedeId: null,
    sedeNombre: null,
    activo: true,
    creadoEn: "2026-08-10T09:00:00-05:00",
    ultimoAccesoEn: "2026-08-11T18:22:00-05:00",
  },
  {
    usuarioId: "usr-002",
    nombre: "Jorge Perea",
    email: "jorge.perea@agrovalle.com",
    rol: "admin_cliente",
    sedeId: null,
    sedeNombre: null,
    activo: true,
    creadoEn: "2026-08-10T09:05:00-05:00",
    ultimoAccesoEn: null,
  },
];

const CREDENCIAL_NUEVA = {
  ...ACCESOS[0],
  usuarioId: "usr-003",
  nombre: "Laura Mejía",
  email: "laura.mejia@agrovalle.com",
  ultimoAccesoEn: null,
  password_temporal: "Cuadre-7fk2mq9x",
};

function responderAdmin(metodo, ruta) {
  const sinQuery = ruta.split("?")[0];
  if (sinQuery.endsWith("/accesos") && metodo === "GET") return { accesos: ACCESOS };
  if (sinQuery.endsWith("/accesos") && metodo === "POST") return CREDENCIAL_NUEVA;
  if (/\/accesos\/[^/]+\/password$/.test(sinQuery)) {
    return { ...ACCESOS[0], password_temporal: "Cuadre-9h4tw2sk" };
  }
  if (/\/accesos\/[^/]+$/.test(sinQuery)) return ACCESOS[0];
  return responder(metodo, ruta);
}

/* ============ Motor de escenarios ============ */

let numeradas = 0;

async function escenario(navegador, servidor, opciones, pasos) {
  const dispositivo = DISPOSITIVOS.escritorio;
  const contexto = await navegador.newContext({
    viewport: dispositivo.viewport,
    deviceScaleFactor: dispositivo.escala,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    colorScheme: "dark",
    reducedMotion: "reduce",
    permissions: opciones.portapapeles === "ok" ? ["clipboard-read", "clipboard-write"] : [],
  });

  if (opciones.portapapeles === "roto") {
    await contexto.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () => Promise.reject(new DOMException("denegado", "NotAllowedError")),
        },
      });
    });
  }

  if (opciones.sesion) {
    await contexto.addInitScript(
      ([clave, valor]) => window.localStorage.setItem(clave, valor),
      [opciones.sesion, TOKENS.refresh_token],
    );
  }

  await contexto.route("**/api/v1/**", async (ruta, peticion) => {
    const url = new URL(peticion.url());
    const camino = url.pathname + url.search;
    const respuesta = opciones.responder(peticion.method(), camino);
    await ruta.fulfill({
      status: respuesta.estado ?? 200,
      contentType: "application/json",
      body: JSON.stringify(respuesta.cuerpo ?? respuesta),
    });
  });

  const pagina = await contexto.newPage();
  await pagina.goto(`${servidor.url}${opciones.ruta}`, { waitUntil: "networkidle" });
  await pagina.evaluate(() => document.fonts.ready);

  await pasos(pagina, async (archivo) => {
    await pagina.waitForTimeout(350);
    await pagina.screenshot({ path: join(DESTINO, archivo), fullPage: true });
    numeradas += 1;
    console.log(`  ✓ ${archivo}`);
  });

  await contexto.close();
}

/* ============ Recorridos ============ */

async function capturarAdmin(chromium) {
  const servidor = levantar("admin");
  if (!(await esperar(servidor.url))) {
    servidor.detener();
    throw new Error("El servidor del admin no levantó.");
  }
  const navegador = await chromium.launch();

  const base = {
    ruta: `/clientes/${CLIENTE_ID}/dashboard`,
    sesion: "cuadreapp-admin:refresh",
    responder: responderAdmin,
  };

  // 14 y 15 — confirmaciones; 1, 2 y 3 — alta, credenciales y copia OK.
  await escenario(navegador, servidor, { ...base, portapapeles: "ok" }, async (pagina, capturar) => {
    await pagina.getByText("Accesos al Dashboard").first().waitFor();

    await pagina.getByRole("button", { name: "Desactivar" }).first().click();
    await pagina.getByText("perderá el acceso al Dashboard").waitFor();
    await capturar("14_confirmar-desactivar.png");
    await pagina.getByRole("button", { name: "Cancelar" }).click();

    await pagina.getByRole("button", { name: "Nueva contraseña" }).first().click();
    await pagina.getByText("dejará de funcionar").waitFor();
    await capturar("15_confirmar-nueva-contrasena.png");
    await pagina.getByRole("button", { name: "Cancelar" }).click();

    await pagina.getByRole("button", { name: "+ Crear acceso" }).click();
    await pagina.getByLabel("Nombre").fill("Laura Mejía");
    await pagina.getByLabel("Correo").fill("laura.mejia@agrovalle.com");
    await capturar("01_crear-acceso.png");

    await pagina.getByRole("button", { name: "Crear acceso", exact: true }).click();
    await pagina.getByText("Credenciales de acceso").waitFor();
    await capturar("02_credenciales-temporales.png");

    await pagina.getByRole("button", { name: "Copiar credenciales" }).click();
    await pagina.getByText("Credenciales copiadas ✓").waitFor();
    await capturar("03_copiar-exitoso.png");
  });

  // 4 — el portapapeles falla: el diálogo avisa y NO se cierra.
  await escenario(navegador, servidor, { ...base, portapapeles: "roto" }, async (pagina, capturar) => {
    await pagina.getByText("Accesos al Dashboard").first().waitFor();
    await pagina.getByRole("button", { name: "Nueva contraseña" }).first().click();
    await pagina.getByRole("button", { name: "Generar nueva contraseña" }).click();
    await pagina.getByText("Credenciales de acceso").waitFor();
    await pagina.getByRole("button", { name: "Copiar contraseña" }).click();
    await pagina.getByText("No se pudo copiar").waitFor();
    await capturar("04_error-clipboard.png");
  });

  await navegador.close();
  servidor.detener();
}

async function capturarDashboard(chromium) {
  const servidor = levantar("dashboard");
  if (!(await esperar(servidor.url))) {
    servidor.detener();
    throw new Error("El servidor del dashboard no levantó.");
  }
  const navegador = await chromium.launch();
  const SESION = "cuadreapp-tablero:refresh";

  const conTablero = (contexto, hoy) => (metodo, ruta) => {
    if (ruta.includes("/auth/refresh")) return TOKENS;
    if (ruta.includes("/auth/logout")) return { ok: true };
    if (ruta.includes("/tablero/contexto")) return contexto;
    if (ruta.includes("/tablero/hoy")) return hoy;
    if (ruta.includes("/tablero/cargas")) {
      return {
        cargas: hoy.cargasDeHoy,
        total: hoy.cargasDeHoy.length,
        cuadran: hoy.cargasDeHoy.length,
        sinFotoFinal: 0,
        galSinRegistrarGal: 0,
      };
    }
    return {};
  };

  // 5 y 6 — primer login con la temporal y cambio obligatorio.
  await escenario(
    navegador,
    servidor,
    {
      ruta: "/entrar",
      responder: (metodo, ruta) =>
        ruta.includes("/auth/login")
          ? { ...TOKENS, debe_cambiar_password: true }
          : conTablero(CONTEXTO_MD, HOY_MD_DATOS)(metodo, ruta),
    },
    async (pagina, capturar) => {
      await pagina.getByLabel("Correo").fill("laura.mejia@agrovalle.com");
      await pagina.getByLabel("Contraseña").fill("Cuadre-7fk2mq9x");
      await capturar("05_login-con-temporal.png");

      await pagina.getByRole("button", { name: "Entrar" }).click();
      await pagina.getByText("Crea tu contraseña").waitFor();
      await capturar("06_cambio-obligatorio.png");
    },
  );

  // 7 — el tablero normal después del cambio (medidor con datos).
  await escenario(
    navegador,
    servidor,
    { ruta: "/hoy", sesion: SESION, responder: conTablero(CONTEXTO_MD, HOY_MD_DATOS) },
    async (pagina, capturar) => {
      await pagina.getByText("Totalizador del medidor").waitFor();
      await capturar("07_dashboard-tras-cambio.png");
    },
  );

  // 8 — acceso revocado en el login.
  await escenario(
    navegador,
    servidor,
    {
      ruta: "/entrar",
      responder: (metodo, ruta) =>
        ruta.includes("/auth/login") ? { estado: 403, cuerpo: { error: "ACCESO_DESACTIVADO" } } : {},
    },
    async (pagina, capturar) => {
      await pagina.getByLabel("Correo").fill("marta.ruiz@agrovalle.com");
      await pagina.getByLabel("Contraseña").fill("MiClaveDeSiempre1");
      await pagina.getByRole("button", { name: "Entrar" }).click();
      await pagina.getByText("Tu acceso al Dashboard está desactivado").waitFor();
      await capturar("08_acceso-revocado.png");
    },
  );

  // 9 — usuario sin permiso del tablero.
  await escenario(
    navegador,
    servidor,
    {
      ruta: "/hoy",
      sesion: SESION,
      responder: (metodo, ruta) => {
        if (ruta.includes("/auth/refresh")) return TOKENS;
        if (ruta.includes("/tablero/contexto")) {
          return { estado: 403, cuerpo: { error: "SIN_PERMISO" } };
        }
        return {};
      },
    },
    async (pagina, capturar) => {
      await pagina.getByText("Tu usuario no tiene acceso al Dashboard").waitFor();
      await capturar("09_sin-permiso.png");
    },
  );

  // 10 — vuelta al login por sesión expirada.
  await escenario(
    navegador,
    servidor,
    { ruta: "/entrar?motivo=sesion", responder: () => ({}) },
    async (pagina, capturar) => {
      await pagina.getByText("Tu sesión expiró").waitFor();
      await capturar("10_sesion-expirada.png");
    },
  );

  // 11 y 12 — bienvenida del cliente nuevo, por perfil.
  await escenario(
    navegador,
    servidor,
    { ruta: "/hoy", sesion: SESION, responder: conTablero(CONTEXTO_MD, HOY_SIN_CARGAS) },
    async (pagina, capturar) => {
      await pagina.getByText("Bienvenido a CuadreApp").waitFor();
      await pagina.getByText("tanda y totalizador").waitFor();
      await capturar("11_empty-medidor-doble.png");
    },
  );

  await escenario(
    navegador,
    servidor,
    { ruta: "/hoy", sesion: SESION, responder: conTablero(CONTEXTO_CI, HOY_SIN_CARGAS) },
    async (pagina, capturar) => {
      await pagina.getByText("Bienvenido a CuadreApp").waitFor();
      await pagina.getByText("total al salir").waitFor();
      await capturar("12_empty-carga-inventario.png");
    },
  );

  // 13 — la primera carga reemplaza la bienvenida por el tablero.
  await escenario(
    navegador,
    servidor,
    { ruta: "/hoy", sesion: SESION, responder: conTablero(CONTEXTO_CI, HOY_CI_DATOS) },
    async (pagina, capturar) => {
      await pagina.getByText("Inventario del día").waitFor();
      await capturar("13_dashboard-primera-carga.png");
    },
  );

  await navegador.close();
  servidor.detener();
}

/* ============ Entrada ============ */

const { chromium } = cargarPlaywright();
mkdirSync(DESTINO, { recursive: true });

console.log("Admin — alta, credenciales, portapapeles y confirmaciones");
await capturarAdmin(chromium);
console.log("Dashboard — ciclo de contraseña, estados de acceso y bienvenida");
await capturarDashboard(chromium);

console.log(`\n${numeradas} capturas en docs/capturas/p0-ux-hardening/.`);
