// Verificador del Training Experience (docs/training/).
//
// El kit promete estar "siempre sincronizado con el producto" y estar
// organizado por momentos del mundo real, no por pantallas. Sin un
// chequeo, las dos promesas duran hasta el primer cambio que nadie
// propague. Esto las hace comprobables:
//
//   1. SINCRONÍA CON EL CÓDIGO — cada pantalla del catálogo apunta a un
//      archivo fuente que existe. Si alguien borra o renombra una
//      pantalla, esto falla y dice cuál.
//   2. EL EJE SON LOS MOMENTOS — cada momento referenciado por un curso
//      existe en el catálogo, y cada momento del catálogo lo cubre al
//      menos un curso. Un momento huérfano es una parte del trabajo que
//      no le estamos enseñando a nadie.
//   3. FORMA PEDAGÓGICA — cada capítulo de operador trae sus elementos
//      obligatorios, cada decisión de supervisor los suyos, y cada
//      proceso de administrador los suyos. Es lo que impide que un
//      capítulo vuelva a ser una descripción de pantalla.
//   4. REFERENCIAS VIVAS — callouts, fotografías, zooms, preguntas y
//      fichas de problema existen en su biblioteca. Una referencia rota
//      es una página que no se puede diagramar.
//
// NO está enganchado a `pnpm verificar`: el kit es documentación y no
// debe romper el build del producto. Engancharlo es agregar un paso.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const KIT = join(RAIZ, "docs/training");

const MANUALES = {
  "OP-AND-MD": { carpeta: "01_Operadores", forma: "operador", guia: "QG-OP-MD" },
  "OP-AND-CI": { carpeta: "01_Operadores", forma: "operador", guia: "QG-OP-CI" },
  "OP-IOS-MD": { carpeta: "01_Operadores", forma: "operador", guia: "QG-OP-MD" },
  "OP-IOS-CI": { carpeta: "01_Operadores", forma: "operador", guia: "QG-OP-CI" },
  "SUP-MD": { carpeta: "02_Supervisores", forma: "supervisor", guia: "QG-SUP-MD" },
  "SUP-CI": { carpeta: "02_Supervisores", forma: "supervisor", guia: "QG-SUP-CI" },
  ADM: { carpeta: "03_Admin", forma: "admin", guia: "QG-ADM" },
};

// Los elementos que hacen que un capítulo enseñe a trabajar en vez de
// describir una pantalla. Sin ellos volvemos a la v1.0 del kit.
const FORMA = {
  operador: {
    bloque: /^# Capítulo \d+ ·(.+)$/gm,
    // Un capítulo del día de trabajo se reconoce porque tiene objetivo.
    // El último capítulo ("Si algo pasa") tiene otra forma a propósito.
    marcador: "### Objetivo",
    exigidos: [
      "### Objetivo",
      "### Qué está ocurriendo",
      "### Qué debe hacer",
      "### Qué nunca debe hacer",
      "### Qué verá en la aplicación",
      "### Resultado esperado",
      "### Errores frecuentes",
    ],
  },
  supervisor: {
    bloque: /^# Decisión \d+ ·(.+)$/gm,
    marcador: "### Si ve esto",
    exigidos: ["### Si ve esto", "### Qué significa", "### Qué decisión tomar", "### Qué NO hacer"],
  },
  admin: {
    bloque: /^# Proceso \d+ ·(.+)$/gm,
    marcador: "### Los pasos",
    exigidos: ["### Los pasos", "### Qué NO hacer"],
  },
};

const APOYO = [
  ["05_Layouts", "layout"],
  ["06_Checklists", "checklist"],
  ["07_Troubleshooting", "troubleshooting"],
  ["08_Storyboards", "storyboard de video"],
];

const errores = [];
const avisos = [];

const leer = (ruta) => readFileSync(join(KIT, ruta), "utf8");

// "`M-OP-E1` a `M-OP-E4`" y "`P-01` a `P-08`" son referencias a rangos.
// Sin expandirlos, el verificador reportaría como huérfano todo lo que
// vive en medio de un rango.
function expandirRangos(texto, ids) {
  const encontrados = new Set();
  const ordenados = [...ids];
  for (const m of texto.matchAll(/`([A-Z][A-Z0-9-]*)`\s*(?:a|–|-)\s*`([A-Z][A-Z0-9-]*)`/g)) {
    const desde = ordenados.indexOf(m[1]);
    const hasta = ordenados.indexOf(m[2]);
    if (desde !== -1 && hasta !== -1 && desde <= hasta) {
      for (const id of ordenados.slice(desde, hasta + 1)) encontrados.add(id);
    }
  }
  return encontrados;
}

/* ============ 1. Sincronía con el código ============ */

const catalogo = leer("00_Fuente/catalogo-pantallas.md");

const pantallas = new Map();
for (const bloque of catalogo.split(/^### /m).slice(1)) {
  const id = bloque.match(/^`([A-Z]+-\d+)`/)?.[1];
  if (!id) continue;
  const archivos = [...bloque.matchAll(/\*\*Código:\*\*\s*(.+)/g)]
    .flatMap((m) => [...m[1].matchAll(/`([^`]+)`/g)].map((r) => r[1]))
    .filter((ruta) => ruta.includes("/") && /\.(tsx?|mjs)$/.test(ruta));
  pantallas.set(id, { archivos });
}

if (pantallas.size === 0) {
  errores.push("El catálogo de pantallas no tiene entradas legibles: ¿cambió su formato?");
}

for (const [id, { archivos }] of pantallas) {
  if (archivos.length === 0) {
    avisos.push(`${id}: sin archivo de código asociado (¿es una pantalla del sistema operativo?)`);
    continue;
  }
  for (const archivo of archivos) {
    if (!existsSync(join(RAIZ, archivo))) {
      errores.push(
        `${id}: el archivo de código '${archivo}' YA NO EXISTE. ` +
          `La pantalla cambió de nombre o se eliminó — revisa los momentos que la usan.`,
      );
    }
  }
}

/* ============ 2. El eje son los momentos ============ */

const catalogoMomentos = leer("00_Fuente/catalogo-momentos.md");
const momentos = [...catalogoMomentos.matchAll(/^### `([A-Z][A-Z0-9-]*)`/gm)].map((m) => m[1]);

if (momentos.length === 0) {
  errores.push("El catálogo de momentos no tiene entradas legibles: ¿cambió su formato?");
}

// Cada momento declara las pantallas que usa. Ese vínculo es lo que
// mantiene unidos los dos catálogos.
for (const bloque of catalogoMomentos.split(/^### /m).slice(1)) {
  const id = bloque.match(/^`([A-Z][A-Z0-9-]*)`/)?.[1];
  if (!id) continue;
  for (const m of bloque.matchAll(/(?<!C-)\b((?:PWA|DSH|ADM)-\d+)\b/g)) {
    if (!pantallas.has(m[1])) {
      errores.push(`Momento ${id}: usa la pantalla ${m[1]}, que NO está en el catálogo.`);
    }
  }
}

const contenidoManual = {};
for (const [id, { carpeta }] of Object.entries(MANUALES)) {
  const ruta = join(KIT, carpeta, `${id}.md`);
  if (!existsSync(ruta)) {
    errores.push(`Falta el curso ${id} en ${carpeta}/`);
    continue;
  }
  contenidoManual[id] = readFileSync(ruta, "utf8");
}

const momentosCubiertos = new Set();
for (const [id, texto] of Object.entries(contenidoManual)) {
  const citados = new Set([
    ...[...texto.matchAll(/`([MSA]-[A-Z0-9-]+)`/g)].map((m) => m[1]),
    ...expandirRangos(texto, momentos),
  ]);
  for (const momento of citados) {
    if (!momentos.includes(momento)) {
      errores.push(`${id}: cita el momento ${momento}, que NO está en el catálogo de momentos.`);
      continue;
    }
    momentosCubiertos.add(momento);
  }
}

for (const momento of momentos) {
  if (!momentosCubiertos.has(momento)) {
    errores.push(
      `Momento ${momento}: ningún curso lo cubre. ` +
        `Es una parte del trabajo real que no le estamos enseñando a nadie.`,
    );
  }
}

/* ============ 3. Forma pedagógica ============ */

// En la v2.0 una pantalla se usa a través de su momento, no del curso:
// por eso el catálogo de momentos cuenta como uso legítimo.
const usadas = new Set(
  [...catalogoMomentos.matchAll(/(?<!C-)\b((?:PWA|DSH|ADM)-\d+)\b/g)].map((m) => m[1]),
);
for (const [id, texto] of Object.entries(contenidoManual)) {
  // El lookbehind evita confundir el callout `C-ADM-12` con una
  // pantalla `ADM-12`: comparten sufijo y solo los distingue el prefijo.
  for (const m of texto.matchAll(/(?<!C-)\b((?:PWA|DSH|ADM)-\d+)\b/g)) {
    usadas.add(m[1]);
    if (!pantallas.has(m[1])) {
      errores.push(`${id}: referencia la pantalla ${m[1]}, que NO está en el catálogo.`);
    }
  }

  const { bloque, marcador, exigidos } = FORMA[MANUALES[id].forma];
  const partes = texto.split(new RegExp(bloque.source, "m")).slice(1);
  let capitulos = 0;
  for (let i = 0; i < partes.length; i += 2) {
    const titulo = partes[i].trim();
    const cuerpo = partes[i + 1] ?? "";
    if (!cuerpo.includes(marcador)) continue; // capítulo de excepciones, otra forma
    capitulos += 1;
    for (const elemento of exigidos) {
      if (!cuerpo.includes(elemento)) {
        errores.push(`${id} · «${titulo}»: le falta el elemento obligatorio '${elemento}'.`);
      }
    }
  }
  if (capitulos === 0) {
    errores.push(
      `${id}: no tiene ningún capítulo con la forma de la v2.0. ` +
        `¿Volvió a estar organizado por pantallas?`,
    );
  }

  // Lo que el operador ve con sus propios ojos es la mitad del trabajo.
  // Un curso de operador sin fotografía de campo es un curso de software.
  if (MANUALES[id].forma === "operador") {
    const fisicos = (texto.match(/### Qué verá físicamente/g) ?? []).length;
    if (fisicos < 4) {
      errores.push(
        `${id}: solo ${fisicos} capítulos describen lo que el operador ve físicamente ` +
          `(mínimo 4). El curso se está volviendo una descripción de la aplicación.`,
      );
    }
  }
}

for (const id of pantallas.keys()) {
  if (!usadas.has(id)) {
    avisos.push(`${id}: está en el catálogo pero ningún curso la usa (entrada muerta).`);
  }
}

/* ============ 4. Referencias vivas ============ */

const inventarioReferencias = [
  ["callout", /`(C-\d+)`/g, /^\|\s*`(C-\d+)`/gm, "00_Fuente/biblioteca-callouts.md"],
  ["fotografía", /`(F-\d+)`/g, /^\|\s*(?:☐|☑)?\s*`(F-\d+)`/gm, "00_Fuente/inventario-fotografico.md"],
  ["zoom", /`(Z-\d+)`/g, /^\|\s*`(Z-\d+)`/gm, "00_Fuente/inventario-zooms.md"],
  ["pregunta", /`(P-\d+)`/g, /^\*\*`(P-\d+)`/gm, "00_Fuente/biblioteca-faq.md"],
  ["ficha de problema", /`(E-\d+)`/g, /^### `(E-\d+)`/gm, "00_Fuente/biblioteca-errores.md"],
  ["comparativa", /`(K-\d+)`/g, /^## `(K-\d+)`/gm, "13_Produccion/comparativas.md"],
  ["ícono", /`(I-\d+)`/g, /^\|\s*`(I-\d+)`/gm, "13_Produccion/catalogo-iconos.md"],
  // Normas del Training Design System (T4): el material no puede citar un
  // principio, un elemento, un tipo de página, un callout o una categoría
  // de ícono que el sistema no defina.
  ["principio", /`(PR-\d+)`/g, /^### `(PR-\d+)`/gm, "14_Sistema/01-filosofia.md"],
  ["elemento", /`(EL-\d+)`/g, /^## `(EL-\d+)`/gm, "14_Sistema/02-identidad.md"],
  ["tipo de página", /`(T-\d+)`/g, /^## `(T-\d+)`/gm, "14_Sistema/04-paginas.md"],
  ["categoría de callout", /`(CO-\d+)`/g, /^## `(CO-\d+)`/gm, "14_Sistema/05-callouts.md"],
  ["categoría de ícono", /`(IC-[A-G])`/g, /^### `(IC-[A-G])`/gm, "14_Sistema/08-iconografia.md"],
  ["criterio de calidad", /`(Q-\d+)`/g, /^### `(Q-\d+)`/gm, "14_Sistema/11-calidad.md"],
];

const fuentes = Object.fromEntries(
  Object.entries(MANUALES).map(([id, { carpeta }]) => [`${carpeta}/${id}.md`, contenidoManual[id]]),
);
for (const carpeta of [
  "06_Checklists",
  "07_Troubleshooting",
  "08_Storyboards",
  "10_QuickGuides",
  "13_Produccion",
  "14_Sistema",
]) {
  if (!existsSync(join(KIT, carpeta))) continue;
  for (const archivo of readdirSync(join(KIT, carpeta)).filter((f) => f.endsWith(".md"))) {
    fuentes[`${carpeta}/${archivo}`] = leer(`${carpeta}/${archivo}`);
  }
}

for (const [nombre, uso, definicion, biblioteca] of inventarioReferencias) {
  const definidos = new Set([...leer(biblioteca).matchAll(definicion)].map((m) => m[1]));
  if (definidos.size === 0) {
    errores.push(`${biblioteca}: no tiene entradas legibles: ¿cambió su formato?`);
    continue;
  }
  for (const [ruta, texto] of Object.entries(fuentes)) {
    if (!texto) continue;
    const citados = new Set([
      ...[...texto.matchAll(uso)].map((m) => m[1]),
      ...expandirRangos(texto, [...definidos].sort()),
    ]);
    for (const ref of citados) {
      if (!definidos.has(ref)) {
        errores.push(`${ruta}: usa la ${nombre} ${ref}, que no está en ${biblioteca}.`);
      }
    }
  }
}

/* ============ 5. Capturas: existe el archivo que promete el catálogo ============ */

// El catálogo se genera del manifiesto, así que no puede mentir sobre
// QUÉ existe — pero sí podría prometer un archivo que alguien borró.
const CAPTURAS_POR_CARPETA = { Operadores: /^(and|ios)-/, Supervisores: /^dsh-/, Admin: /^adm-/ };
const producidas = new Set();
for (const carpeta of Object.keys(CAPTURAS_POR_CARPETA)) {
  const ruta = join(KIT, "12_Capturas", carpeta);
  if (!existsSync(ruta)) continue;
  for (const archivo of readdirSync(ruta).filter((f) => f.endsWith(".png"))) producidas.add(archivo);
}

if (existsSync(join(KIT, "12_Capturas/CATALOGO.md"))) {
  const catalogoCapturas = leer("12_Capturas/CATALOGO.md");
  const seccionProducidas = catalogoCapturas.split("## Pendientes")[0];
  for (const m of seccionProducidas.matchAll(/^\|\s*`([a-z]+-[\w-]+\.png)`/gm)) {
    if (!producidas.has(m[1])) {
      errores.push(
        `12_Capturas/CATALOGO.md: promete '${m[1]}' como producida, pero el archivo no está. ` +
          `Vuelve a correr 'node scripts/capturar-pantallas.mjs'.`,
      );
    }
  }
}

/* ============ 6. Material de apoyo ============ */

for (const [id, { guia }] of Object.entries(MANUALES)) {
  for (const [carpeta, nombre] of APOYO) {
    if (!existsSync(join(KIT, carpeta, `${id}.md`))) {
      errores.push(`${id}: falta su ${nombre} en ${carpeta}/.`);
    }
  }
  if (!existsSync(join(KIT, "10_QuickGuides", `${guia}.md`))) {
    errores.push(`${id}: falta su guía rápida 10_QuickGuides/${guia}.md.`);
  }
}

/* ============ Resultado ============ */

const CARPETAS = [
  "00_Fuente",
  "13_Produccion",
  "14_Sistema",
  ...new Set(Object.values(MANUALES).map((m) => m.carpeta)),
  ...APOYO.map((a) => a[0]),
  "04_Assets",
  "09_Exports",
  "10_QuickGuides",
  "11_Academia",
  "12_Capturas",
];

const totalArchivos = CARPETAS.filter((c) => existsSync(join(KIT, c))).reduce(
  (suma, c) => suma + readdirSync(join(KIT, c)).filter((f) => f.endsWith(".md")).length,
  0,
);

if (avisos.length > 0) {
  console.log("Avisos (no bloquean):\n");
  for (const aviso of avisos) console.log(`  · ${aviso}`);
  console.log("");
}

if (errores.length > 0) {
  console.error("Training Experience DESINCRONIZADO:\n");
  for (const error of errores) console.error(`  ✘ ${error}`);
  console.error(
    "\nCorrige docs/training/00_Fuente/ antes de exportar: de lo contrario se " +
      "producirían cursos que enseñan un trabajo que ya no es el que se hace.",
  );
  process.exit(1);
}

console.log(
  `Training Experience OK — ${momentos.length} momentos cubiertos, ` +
    `${pantallas.size} pantallas verificadas contra el código, ` +
    `${Object.keys(contenidoManual).length} cursos completos, ` +
    `${producidas.size} capturas reales, ${totalArchivos} archivos.`,
);
