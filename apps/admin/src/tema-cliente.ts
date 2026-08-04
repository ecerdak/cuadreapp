// TemaCliente (DEC-018): la base de datos almacena ÚNICAMENTE dos
// colores (#RRGGBB). Todo lo demás —hover, sombras, estados, badges,
// bordes, fondos, gradientes y contrastes— se deriva aquí, con las
// reglas del Design System de CuadreApp. Nunca CSS libre: un cliente
// no puede cambiar la experiencia, solo su identidad.
//
// La derivación es determinista y pura: mismos colores → mismas
// variables. Se aplica como variables CSS sobre un contenedor; los
// componentes consumen var(--cliente-*), jamás el color crudo.

/** Identidad mínima que la UI necesita para tematizar. */
export interface IdentidadColores {
  colorPrimario: string | null;
  colorSecundario: string | null;
}

/** Paleta CuadreApp: lo que se usa cuando el cliente no configuró
 *  colores (o los configuró mal). La experiencia nunca se rompe. */
export const COLOR_CUADREAPP = {
  primario: "#5B90C4",
  secundario: "#3C6489",
} as const;

const HEX = /^#[0-9A-Fa-f]{6}$/;

export function esHexValido(valor: string | null | undefined): valor is string {
  return typeof valor === "string" && HEX.test(valor);
}

function componentes(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** Luminancia relativa (WCAG 2.1) — base de las decisiones de contraste. */
export function luminancia(hex: string): number {
  const canal = (valor: number) => {
    const v = valor / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = componentes(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razón de contraste WCAG entre dos colores (1 a 21). */
export function contraste(unHex: string, otroHex: string): number {
  const a = luminancia(unHex);
  const b = luminancia(otroHex);
  const [claro, oscuro] = a > b ? [a, b] : [b, a];
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Texto legible SOBRE el color dado — decisión del Design System, no
 *  del cliente: nunca se pinta texto ilegible sobre su marca. */
export function textoSobre(hex: string): string {
  return contraste(hex, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#0B1116";
}

const aRgb = (hex: string) => componentes(hex).join(", ");

function mezclar(hex: string, haciaHex: string, proporcion: number): string {
  const [r1, g1, b1] = componentes(hex);
  const [r2, g2, b2] = componentes(haciaHex);
  const canal = (a: number, b: number) =>
    Math.round(a + (b - a) * proporcion)
      .toString(16)
      .padStart(2, "0");
  return `#${canal(r1, r2)}${canal(g1, g2)}${canal(b1, b2)}`;
}

/** Variables CSS derivadas de los dos colores del cliente. Este es el
 *  ÚNICO lugar donde se decide cómo se ve la identidad. */
export function variablesTema(identidad: IdentidadColores): Record<string, string> {
  const primario = esHexValido(identidad.colorPrimario)
    ? identidad.colorPrimario
    : COLOR_CUADREAPP.primario;
  const secundario = esHexValido(identidad.colorSecundario)
    ? identidad.colorSecundario
    : COLOR_CUADREAPP.secundario;

  return {
    "--cliente-primario": primario,
    "--cliente-primario-rgb": aRgb(primario),
    // Estados derivados: hover aclara, activo oscurece (tema oscuro).
    "--cliente-primario-hover": mezclar(primario, "#FFFFFF", 0.18),
    "--cliente-primario-activo": mezclar(primario, "#000000", 0.18),
    // Superficies: el color como fondo tenue, siempre legible.
    "--cliente-primario-suave": `rgba(${aRgb(primario)}, 0.14)`,
    "--cliente-primario-borde": `rgba(${aRgb(primario)}, 0.45)`,
    "--cliente-primario-sombra": `0 1px 12px rgba(${aRgb(primario)}, 0.22)`,
    // Texto legible sobre el color: lo decide el contraste, no el cliente.
    "--cliente-primario-texto": textoSobre(primario),
    "--cliente-secundario": secundario,
    "--cliente-secundario-rgb": aRgb(secundario),
    "--cliente-secundario-suave": `rgba(${aRgb(secundario)}, 0.14)`,
    "--cliente-secundario-texto": textoSobre(secundario),
    // Gradiente de identidad (encabezados de ficha).
    "--cliente-gradiente": `linear-gradient(135deg, rgba(${aRgb(primario)}, 0.20), rgba(${aRgb(secundario)}, 0.06))`,
  };
}

/** Advertencia de accesibilidad para la consola: un color que no
 *  contrasta con el panel oscuro se ve mal en la UI. No bloquea —
 *  informa, igual que el dominio marca sin bloquear. */
export function contrasteInsuficiente(hex: string | null, fondo = "#0F161C"): boolean {
  if (!esHexValido(hex)) return false;
  return contraste(hex, fondo) < 3;
}
