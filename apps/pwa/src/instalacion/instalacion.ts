// Detección de plataforma y modo de ejecución para la experiencia de
// instalación. Funciones puras: la UI decide con esto qué mostrar.
// iOS no tiene beforeinstallprompt: solo guía manual vía Safari.

export type Plataforma = "android" | "ios" | "otra";

export function detectarPlataforma(userAgent: string): Plataforma {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  return "otra";
}

/** ¿Corre instalada (standalone) en vez de en una pestaña del navegador? */
export function enModoApp(
  nav: { standalone?: boolean } = navigator as { standalone?: boolean },
  consultarMedia: (consulta: string) => { matches: boolean } = (consulta) =>
    typeof matchMedia !== "undefined" ? matchMedia(consulta) : { matches: false },
): boolean {
  return nav.standalone === true || consultarMedia("(display-mode: standalone)").matches;
}
