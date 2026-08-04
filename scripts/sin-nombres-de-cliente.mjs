// DEC-016 y DEC-018: prohibido condicionar por cliente en cualquier
// capa. Este chequeo convierte la regla en máquina (como
// dependency-cruiser hace con DEC-007). Verifica dos cosas:
//
//   1. Ningún NOMBRE de cliente en el código fuente de apps/ ni
//      packages/, salvo donde es DATO y no lógica (fixtures, datos
//      simulados, assets de marca, comentarios históricos).
//   2. Ningún PATRÓN de lógica por cliente, aunque no nombre a
//      ninguno: comparaciones sobre cliente.nombre, switch(cliente),
//      rutas con nombre propio. Esto aplica a TODO el código, sin
//      excepciones de ruta — un fixture tampoco necesita ramificar
//      por nombre de cliente.
//
// Para agregar un cliente nuevo NO se toca este archivo: los clientes
// se crean en la consola Admin. Si este chequeo falla, el código está
// nombrando un cliente — eso es exactamente lo que DEC-016 prohíbe.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const NOMBRES_DE_CLIENTE = /sacyr|trébol|trebol/i;

// Lugares donde el nombre es dato (demo, fixtures, assets), no lógica.
const PERMITIDOS = [
  /\.test\.(ts|tsx)$/, // fixtures de prueba
  /\/pruebas\//, // fakes y ayudantes de prueba
  /\/marca\//, // assets de marca del paquete de diseño
  /apps\/dashboard\/src\/datos\/contexto-cliente\.ts$/, // identidad demo (fallback del marco)
  /apps\/dashboard\/src\/datos\/fuente-simulada\.ts$/, // fuente de demostración
  /apps\/dashboard\/src\/simulacion\//, // escenario simulado
];

// Patrones de LÓGICA por cliente (DEC-018): prohibidos en todas
// partes, incluidos fixtures y datos simulados. Nombrar a un cliente
// como dato es legítimo; ramificar el comportamiento por su nombre,
// jamás.
const PATRONES_DE_LOGICA = [
  {
    patron: /\bcliente[A-Za-z]*\s*\.\s*nombre(Comercial)?\s*(===|==|!==|!=)/,
    razon: "comparación por nombre de cliente",
  },
  {
    patron: /(===|==|!==|!=)\s*cliente[A-Za-z]*\s*\.\s*nombre(Comercial)?\b/,
    razon: "comparación por nombre de cliente",
  },
  {
    patron: /\bswitch\s*\(\s*cliente[A-Za-z]*(\s*\.\s*nombre[A-Za-z]*)?\s*\)/,
    razon: "switch por cliente",
  },
  {
    patron: /\bCLIENTE_(PILOTO|ACTUAL|ESPECIAL)\b/,
    razon: "constante de cliente especial",
  },
];

/** Los comentarios explican historia y contexto — no son lógica. */
const esComentario = (linea) => {
  const recortada = linea.trim();
  return (
    recortada.startsWith("//") ||
    recortada.startsWith("/*") ||
    recortada.startsWith("*") ||
    recortada.startsWith("* ")
  );
};

const EXTENSIONES = /\.(ts|tsx|mts|cts)$/;

function* archivos(directorio) {
  for (const nombre of readdirSync(directorio)) {
    if (nombre === "node_modules" || nombre === "dist" || nombre === "coverage") continue;
    const ruta = join(directorio, nombre);
    if (statSync(ruta).isDirectory()) yield* archivos(ruta);
    else if (EXTENSIONES.test(nombre)) yield ruta;
  }
}

const violaciones = [];
for (const base of ["apps", "packages"]) {
  for (const ruta of archivos(join(RAIZ, base))) {
    const relativa = relative(RAIZ, ruta).split(sep).join("/");
    const esDato = PERMITIDOS.some((patron) => patron.test(relativa));
    const lineas = readFileSync(ruta, "utf8").split("\n");

    lineas.forEach((linea, indice) => {
      if (esComentario(linea)) return;
      const ubicacion = `${relativa}:${indice + 1}`;

      // (2) Lógica por cliente: prohibida en TODO el código.
      for (const { patron, razon } of PATRONES_DE_LOGICA) {
        if (patron.test(linea)) {
          violaciones.push(`${ubicacion}: [${razon}] ${linea.trim()}`);
          return;
        }
      }

      // (1) Nombres de cliente: prohibidos salvo donde son dato.
      if (!esDato && NOMBRES_DE_CLIENTE.test(linea)) {
        violaciones.push(`${ubicacion}: [nombre de cliente] ${linea.trim()}`);
      }
    });
  }
}

if (violaciones.length > 0) {
  console.error("DEC-016/DEC-018 violadas — comportamiento atado a un cliente:\n");
  for (const violacion of violaciones) console.error(`  ${violacion}`);
  console.error(
    "\nLos clientes se administran desde la consola; el código despacha por PERFIL, jamás por cliente.",
  );
  process.exit(1);
}

console.log(
  "sin-nombres-de-cliente: OK — cero nombres de cliente en el código y cero lógica por cliente.",
);
