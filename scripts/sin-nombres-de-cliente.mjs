// DEC-016: prohibido condicionar por cliente en cualquier capa. Este
// chequeo convierte la regla en máquina (como dependency-cruiser hace
// con DEC-007): ningún nombre de cliente puede aparecer en el código
// fuente de apps/ ni packages/, salvo la lista explícita de lugares
// donde es DATO y no lógica (fixtures de prueba, datos simulados de
// demostración, identidad de fallback del marco demo, assets de marca
// y el alias de ruta para marcadores viejos).
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
  /apps\/dashboard\/src\/disposicion\/DisposicionTablero\.tsx$/, // fallback demo + asset
  /apps\/admin\/src\/main\.tsx$/, // alias de ruta /sacyr para marcadores viejos
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
    if (PERMITIDOS.some((patron) => patron.test(relativa))) continue;
    const contenido = readFileSync(ruta, "utf8");
    const lineas = contenido.split("\n");
    lineas.forEach((linea, indice) => {
      if (NOMBRES_DE_CLIENTE.test(linea) && !esComentario(linea)) {
        violaciones.push(`${relativa}:${indice + 1}: ${linea.trim()}`);
      }
    });
  }
}

if (violaciones.length > 0) {
  console.error("DEC-016 violada — nombres de cliente en el código (no en datos):\n");
  for (const violacion of violaciones) console.error(`  ${violacion}`);
  console.error(
    "\nLos clientes se administran desde la consola; el código despacha por PERFIL, jamás por cliente.",
  );
  process.exit(1);
}

console.log("sin-nombres-de-cliente: OK — cero condicionales por cliente en el código.");
