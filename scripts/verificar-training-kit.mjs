// Verificador del Training Kit (docs/training/).
//
// El kit promete estar "siempre sincronizado con el producto". Sin un
// chequeo, esa promesa dura hasta el primer cambio de pantalla que
// nadie propague. Esto la hace comprobable:
//
//   1. SINCRONÍA CON EL CÓDIGO — cada pantalla del catálogo apunta a un
//      archivo fuente que existe. Si alguien borra o renombra una
//      pantalla, esto falla y dice cuál.
//   2. INTEGRIDAD INTERNA — cada pantalla referenciada por un manual
//      existe en el catálogo, y cada pantalla del catálogo la usa al
//      menos un manual (sin entradas muertas).
//   3. COBERTURA — cada manual tiene sus nueve secciones obligatorias y
//      sus cuatro archivos de apoyo (layout, checklist, troubleshooting
//      y storyboard).
//
// NO está enganchado a `pnpm verificar`: el kit es documentación y no
// debe romper el build del producto. Engancharlo es agregar un paso.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const KIT = join(RAIZ, "docs/training");

const MANUALES = {
  "OP-AND-MD": "01_Operadores",
  "OP-AND-CI": "01_Operadores",
  "OP-IOS-MD": "01_Operadores",
  "OP-IOS-CI": "01_Operadores",
  "SUP-MD": "02_Supervisores",
  "SUP-CI": "02_Supervisores",
  ADM: "03_Admin",
};

const SECCIONES = [
  "## 1. Resumen",
  "## 2. Storyboard",
  "## 3. Capturas requeridas",
  "## 4. Callouts",
  "## 5. Errores frecuentes",
  "## 6. Checklist operativo",
  "## 7. Troubleshooting",
  "## 8. Preguntas frecuentes",
  "## 9. Tiempo esperado",
];

const APOYO = [
  ["05_Layouts", "layout"],
  ["06_Checklists", "checklist"],
  ["07_Troubleshooting", "troubleshooting"],
  ["08_Storyboards", "storyboard de video"],
];

const errores = [];
const avisos = [];

/* ============ 1. Sincronía con el código ============ */

const catalogo = readFileSync(join(KIT, "00_Fuente/catalogo-pantallas.md"), "utf8");

// Entradas: "### `PWA-01` · Splash" seguidas de "- **Código:** `ruta`"
const pantallas = new Map(); // id -> { archivos: string[] }
const bloques = catalogo.split(/^### /m).slice(1);
for (const bloque of bloques) {
  const id = bloque.match(/^`([A-Z]+-\d+)`/)?.[1];
  if (!id) continue;
  const archivos = [...bloque.matchAll(/\*\*Código:\*\*\s*(.+)/g)]
    .flatMap((m) => [...m[1].matchAll(/`([^`]+)`/g)].map((r) => r[1]))
    .filter((ruta) => ruta.includes("/") && /\.(tsx?|mjs)$/.test(ruta));
  pantallas.set(id, { archivos });
}

if (pantallas.size === 0) {
  errores.push("El catálogo no tiene entradas legibles: ¿cambió su formato?");
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
          `La pantalla cambió de nombre o se eliminó — revisa los manuales que la usan.`,
      );
    }
  }
}

/* ============ 2. Integridad interna ============ */

const contenidoManual = {};
for (const [id, carpeta] of Object.entries(MANUALES)) {
  const ruta = join(KIT, carpeta, `${id}.md`);
  if (!existsSync(ruta)) {
    errores.push(`Falta el manual ${id} en ${carpeta}/`);
    continue;
  }
  contenidoManual[id] = readFileSync(ruta, "utf8");
}

const usadas = new Set();
for (const [id, texto] of Object.entries(contenidoManual)) {
  // El lookbehind evita confundir el callout `C-ADM-12` con una
  // pantalla `ADM-12`: comparten sufijo y solo los distingue el prefijo.
  for (const m of texto.matchAll(/(?<!C-)\b((?:PWA|DSH|ADM)-\d+)\b/g)) {
    const pantalla = m[1];
    usadas.add(pantalla);
    if (!pantallas.has(pantalla)) {
      errores.push(`${id}: referencia la pantalla ${pantalla}, que NO está en el catálogo.`);
    }
  }
}

for (const id of pantallas.keys()) {
  if (!usadas.has(id)) {
    avisos.push(`${id}: está en el catálogo pero ningún manual la usa (entrada muerta).`);
  }
}

/* ============ 3. Cobertura ============ */

for (const [id, texto] of Object.entries(contenidoManual)) {
  for (const seccion of SECCIONES) {
    if (!texto.includes(seccion)) {
      errores.push(`${id}: le falta la sección obligatoria '${seccion}'.`);
    }
  }
  for (const [carpeta, nombre] of APOYO) {
    if (!existsSync(join(KIT, carpeta, `${id}.md`))) {
      errores.push(`${id}: falta su ${nombre} en ${carpeta}/.`);
    }
  }
}

/* ============ Callouts referenciados ============ */

const biblioteca = readFileSync(join(KIT, "00_Fuente/biblioteca-callouts.md"), "utf8");
const callouts = new Set([...biblioteca.matchAll(/^\|\s*`(C-[A-Z]+-\d+)`/gm)].map((m) => m[1]));
for (const [id, texto] of Object.entries(contenidoManual)) {
  for (const m of texto.matchAll(/`(C-[A-Z]+-\d+)`/g)) {
    if (!callouts.has(m[1])) {
      errores.push(`${id}: usa el callout ${m[1]}, que no está en la biblioteca.`);
    }
  }
}

/* ============ Resultado ============ */

const totalArchivos = [
  "00_Fuente",
  ...new Set(Object.values(MANUALES)),
  ...APOYO.map((a) => a[0]),
  "04_Assets",
  "09_Exports",
]
  .filter((c) => existsSync(join(KIT, c)))
  .reduce((suma, c) => suma + readdirSync(join(KIT, c)).filter((f) => f.endsWith(".md")).length, 0);

if (avisos.length > 0) {
  console.log("Avisos (no bloquean):\n");
  for (const aviso of avisos) console.log(`  · ${aviso}`);
  console.log("");
}

if (errores.length > 0) {
  console.error("Training Kit DESINCRONIZADO:\n");
  for (const error of errores) console.error(`  ✘ ${error}`);
  console.error(
    "\nCorrige docs/training/00_Fuente/catalogo-pantallas.md antes de exportar: " +
      "de lo contrario se producirían manuales que enseñan pantallas que ya no existen.",
  );
  process.exit(1);
}

console.log(
  `Training Kit OK — ${pantallas.size} pantallas catalogadas y verificadas contra el código, ` +
    `${Object.keys(contenidoManual).length} manuales completos, ${callouts.size} callouts, ` +
    `${totalArchivos} archivos.`,
);
