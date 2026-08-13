// Arnés de captura del Production Kit.
//
// Produce las capturas REALES del producto — no mockups, no dibujos —
// de forma determinista y repetible. Cada vez que una pantalla cambie,
// una corrida deja el manual al día sin que nadie tenga que acordarse
// de rehacer una imagen a mano.
//
// Qué NO hace, a propósito:
//   · No modifica una línea del producto. La consola Admin que sale en
//     la captura es la real; lo único simulado es la respuesta HTTP,
//     interceptada desde el navegador (scripts/capturas/demostracion.mjs).
//   · No falsea nada que importe. Las pantallas de cámara del operador
//     quedan fuera: una cámara simulada produciría una imagen que no es
//     un medidor, y una foto inventada en un manual de evidencia es
//     peor que una página en blanco.
//
// Uso:
//   node scripts/capturar-pantallas.mjs            → todo lo automatizable
//   node scripts/capturar-pantallas.mjs dashboard  → solo una app
//   node scripts/capturar-pantallas.mjs --catalogo → regenera el catálogo
//
// Playwright NO es dependencia del repositorio: es tooling de
// documentación y no tiene por qué entrar al lockfile ni al CI del
// producto. El arnés lo resuelve del caché de npx, y si no está, dice
// exactamente qué correr.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { APPS, CAPTURAS, DISPOSITIVOS } from "./capturas/manifiesto.mjs";
import { responder, responderTablero, TOKENS } from "./capturas/demostracion.mjs";
import { EQUIPO_DEMO, recorrido as recorridoPwa, responder as responderPwa } from "./capturas/pwa.mjs";

const RAIZ = new URL("..", import.meta.url).pathname;
const DESTINO = join(RAIZ, "docs/training/12_Capturas");
const VERSION_PLAYWRIGHT = "1.49.1";

/* ============ Playwright sin tocar el lockfile ============ */

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
    `No se encontró Playwright. Es tooling de documentación, no dependencia del producto:\n\n` +
      `  npx --yes -p playwright@${VERSION_PLAYWRIGHT} -c "true"\n\n` +
      `Eso lo deja en el caché de npx y este arnés lo encuentra solo.`,
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

/* ============ Servidor de desarrollo ============ */

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

/* ============ Captura ============ */

/**
 * La PWA es una máquina de estados: no se puede saltar a una pantalla
 * por URL. El arnés recorre el flujo real tocando los mismos botones
 * que toca un operador, y captura en cada parada.
 */
async function capturarPwa(chromium, capturas) {
  const servidor = levantar("pwa");
  if (!(await esperar(servidor.url))) {
    servidor.detener();
    throw new Error(`El servidor de la PWA no levantó en ${servidor.url}`);
  }

  const navegador = await chromium.launch();
  const carpeta = join(DESTINO, APPS.pwa.carpeta);
  mkdirSync(carpeta, { recursive: true });
  const hechas = [];

  for (const prefijo of ["and", "ios"]) {
    const dispositivo = DISPOSITIVOS[prefijo === "and" ? "android" : "iphone"];
    const perfil = "medidor_doble";
    const contexto = await navegador.newContext({
      viewport: dispositivo.viewport,
      deviceScaleFactor: dispositivo.escala,
      userAgent: dispositivo.userAgent,
      isMobile: true,
      hasTouch: true,
      locale: "es-CO",
      timezoneId: "America/Bogota",
      colorScheme: "dark",
      reducedMotion: "reduce",
      permissions: ["geolocation"],
      geolocation: { latitude: 3.9006, longitude: -76.2978 },
    });

    await contexto.route("**/api/v1/**", async (ruta, peticion) => {
      const { cuerpo, estado } = responderPwa(new URL(peticion.url()).pathname, perfil);
      await ruta.fulfill({
        status: estado,
        contentType: "application/json",
        body: JSON.stringify(cuerpo),
      });
    });

    const pagina = await contexto.newPage();
    await pagina.goto(servidor.url, { waitUntil: "networkidle" });
    await pagina.evaluate(() => document.fonts.ready);

    for (const parada of recorridoPwa(prefijo)) {
      if (!capturas.some((c) => c.archivo === parada.archivo)) continue;
      try {
        if (parada.antes) await parada.antes(pagina, { equipo: EQUIPO_DEMO[perfil] });
        await parada.esperar(pagina);
        await pagina.waitForTimeout(400);
        await pagina.screenshot({ path: join(carpeta, parada.archivo), fullPage: true });
        hechas.push(parada.archivo);
        console.log(`  ✓ ${APPS.pwa.carpeta}/${parada.archivo}`);
      } catch (error) {
        // Una parada que falla no puede tumbar el resto del recorrido:
        // el manifiesto ya declara qué está bloqueado y por qué.
        console.log(`  · ${parada.archivo} — no alcanzada (${error.message.split("\n")[0]})`);
        break;
      }
    }

    await contexto.close();
  }

  await navegador.close();
  servidor.detener();
  return hechas;
}

async function capturarApp(chromium, app, capturas) {
  const servidor = levantar(app);
  if (!(await esperar(servidor.url))) {
    servidor.detener();
    throw new Error(`El servidor de ${app} no levantó en ${servidor.url}`);
  }

  const navegador = await chromium.launch();
  const hechas = [];

  for (const captura of capturas) {
    const dispositivo = DISPOSITIVOS[captura.dispositivo];
    const contexto = await navegador.newContext({
      viewport: dispositivo.viewport,
      deviceScaleFactor: dispositivo.escala,
      userAgent: dispositivo.userAgent,
      isMobile: captura.dispositivo !== "escritorio",
      hasTouch: captura.dispositivo !== "escritorio",
      locale: "es-CO",
      timezoneId: "America/Bogota",
      colorScheme: "dark",
      reducedMotion: "reduce", // sin animaciones a medio camino en la imagen
    });

    // Toda la API se responde con datos de demostración. El producto no
    // se entera: para él es una respuesta HTTP normal. El Dashboard
    // responde por escenario (md · ci · md0 · ci0) desde P.2: sus datos
    // reales viven en la API y aquí se interceptan igual que el Admin.
    await contexto.route("**/api/v1/**", async (ruta, peticion) => {
      const url = new URL(peticion.url());
      const cuerpo =
        app === "dashboard"
          ? responderTablero(peticion.method(), url.pathname + url.search, captura.escenario)
          : responder(peticion.method(), url.pathname + url.search);
      await ruta.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(cuerpo),
      });
    });

    if (app === "admin" && !captura.sinSesion) {
      await contexto.addInitScript(
        ([clave, valor]) => window.localStorage.setItem(clave, valor),
        ["cuadreapp-admin:refresh", TOKENS.refresh_token],
      );
    }

    if (app === "dashboard" && !captura.sinSesion) {
      await contexto.addInitScript(
        ([clave, valor]) => window.localStorage.setItem(clave, valor),
        ["cuadreapp-tablero:refresh", TOKENS.refresh_token],
      );
    }

    const pagina = await contexto.newPage();
    await pagina.goto(`${servidor.url}${captura.ruta}`, { waitUntil: "networkidle" });
    // Las fuentes web deciden el alto de todo: capturar antes de que
    // carguen produce una imagen con la métrica equivocada.
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(400);

    const carpeta = join(DESTINO, APPS[app].carpeta);
    mkdirSync(carpeta, { recursive: true });
    await pagina.screenshot({ path: join(carpeta, captura.archivo), fullPage: true });

    hechas.push(captura.archivo);
    console.log(`  ✓ ${APPS[app].carpeta}/${captura.archivo}`);
    await contexto.close();
  }

  await navegador.close();
  servidor.detener();
  return hechas;
}

/* ============ Catálogo generado ============ */

function generarCatalogo() {
  const porEstado = (estado) => CAPTURAS.filter((c) => c.estado === estado);
  const fila = (c) => {
    const d = DISPOSITIVOS[c.dispositivo];
    const px = `${d.viewport.width * d.escala}×${d.viewport.height * d.escala}`;
    return `| \`${c.archivo}\` | ${c.pantalla} | ${c.titulo} | ${d.etiqueta} | ${px} | ${d.aspecto} | \`${c.momento}\` | ${c.manuales.join(", ")} |`;
  };
  const tabla = (lista) =>
    [
      "| Archivo | Pantalla | Qué muestra | Dispositivo | Resolución | Aspecto | Momento | Manuales |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...lista.map(fila),
    ].join("\n");

  const bloqueadas = CAPTURAS.filter((c) => c.estado !== "automatica");
  const contenido = `# Catálogo de capturas

**Generado por \`node scripts/capturar-pantallas.mjs --catalogo\`. No editar a mano.**

Cada captura existe **una sola vez**, aunque aparezca en varios manuales. La columna «Manuales» es la que evita que alguien la vuelva a producir.

Las imágenes están en \`Operadores/\`, \`Supervisores/\` y \`Admin/\`, junto a este archivo.

---

## Producidas por el arnés (${porEstado("automatica").length})

Se regeneran con \`node scripts/capturar-pantallas.mjs\`. **Sin infraestructura, sin credenciales, sin base sembrada.**

${tabla(porEstado("automatica"))}

---

## Pendientes de un entorno sembrado (${porEstado("sembrada").length})

Necesitan un dispositivo enrolado contra una base con datos. El arnés ya las tiene descritas: cuando exista ese entorno, se producen con la misma corrida.

${tabla(porEstado("sembrada"))}

---

## Pendientes de dispositivo físico (${porEstado("manual").length})

**No se pueden simular sin falsear la imagen.** Una cámara simulada no muestra un medidor, y una foto inventada en un manual de evidencia es peor que una página en blanco.

${tabla(porEstado("manual"))}

---

## Por qué está bloqueada cada una

| Archivo | Motivo |
| --- | --- |
${bloqueadas.map((c) => `| \`${c.archivo}\` | ${c.bloqueo} |`).join("\n")}

---

## Notas de producción

| Archivo | Nota |
| --- | --- |
${CAPTURAS.filter((c) => c.nota)
  .map((c) => `| \`${c.archivo}\` | ${c.nota} |`)
  .join("\n")}

---

## Convenciones

| | |
| --- | --- |
| **Nombre** | \`{contexto}-{orden}_{asunto}.png\` — \`and\`/\`ios\` operador, \`dsh\` supervisor, \`adm\` consola |
| **Escala** | Escritorio ×2, teléfono ×3 — para que un zoom al 300 % siga siendo nítido en papel |
| **Tema** | Oscuro, el mismo que ve el usuario |
| **Idioma** | es-CO, zona horaria \`America/Bogota\` |
| **Animaciones** | Desactivadas: ninguna captura queda a medio camino de una transición |
| **Página completa** | Sí — el diseñador recorta, nunca al revés |

## Totales

| Estado | Capturas |
| --- | --- |
| Producidas por el arnés | **${porEstado("automatica").length}** |
| Pendientes de entorno sembrado | ${porEstado("sembrada").length} |
| Pendientes de dispositivo físico | ${porEstado("manual").length} |
| **Total catalogadas** | **${CAPTURAS.length}** |
`;

  mkdirSync(DESTINO, { recursive: true });
  writeFileSync(join(DESTINO, "CATALOGO.md"), contenido);
  console.log(`Catálogo regenerado: ${CAPTURAS.length} capturas.`);
}

/* ============ Entrada ============ */

const argumentos = process.argv.slice(2);

if (argumentos.includes("--catalogo")) {
  generarCatalogo();
} else {
  const solicitadas = argumentos.filter((a) => !a.startsWith("--"));
  const apps = solicitadas.length ? solicitadas : ["dashboard", "admin"];
  const { chromium } = cargarPlaywright();

  let total = 0;
  for (const app of apps) {
    const pendientes = CAPTURAS.filter((c) => c.app === app && c.estado === "automatica");
    if (pendientes.length === 0) {
      console.log(`${app}: nada automatizable todavía.`);
      continue;
    }
    console.log(`\n${app} — ${pendientes.length} capturas`);
    total += (
      app === "pwa"
        ? await capturarPwa(chromium, pendientes)
        : await capturarApp(chromium, app, pendientes)
    ).length;
  }

  generarCatalogo();
  console.log(`\n${total} capturas producidas en docs/training/12_Capturas/.`);
}
