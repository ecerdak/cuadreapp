// Feedback inmediato durante la captura (spec §8.1: R1 y R2 en vivo en
// [4], R3 al instante en [6]). Este módulo NO contiene reglas: arma un
// registro parcial y llama a las funciones del dominio. La UI muestra
// lo que el dominio devuelve — nada más.

import {
  reglaR1,
  reglaR2,
  reglaR3,
  reglaR4,
  reglaR7,
  reglaR8,
  type ContextoValidacion,
  type MarcaRegla,
  type RegistroCarga,
} from "@cuadreapp/dominio";

function registroParcial(parcial: Partial<RegistroCarga>): RegistroCarga {
  return {
    tandaInicialGal: 0,
    totInicialGal: 0,
    tandaFinalGal: 0,
    totFinalGal: 0,
    lecturaEquipo: null,
    iniciadaEn: "1970-01-01T00:00:00.000Z",
    finalizadaEn: "1970-01-01T00:00:00.000Z",
    lat: null,
    lng: null,
    origen: "app",
    fotoInicial: true,
    fotoFinal: true,
    ...parcial,
  };
}

/** Pantalla "Antes de cargar": R1 (tanda en 0,0) y R2 (salto de totalizador). */
export function marcasAntesDeCargar(
  valores: { tandaInicialGal: number; totInicialGal: number },
  contexto: ContextoValidacion,
): MarcaRegla[] {
  const registro = registroParcial(valores);
  return [reglaR1(registro), reglaR2(registro, contexto)].filter(
    (marca): marca is MarcaRegla => marca !== null,
  );
}

/** Pantalla "Después de cargar": R3/R4 (cuadre del totalizador) y R7/R8 (contador del equipo). */
export function marcasDespuesDeCargar(
  valores: {
    tandaInicialGal: number;
    totInicialGal: number;
    tandaFinalGal: number;
    totFinalGal: number;
    lecturaEquipo: number | null;
    iniciadaEn: string;
  },
  contexto: ContextoValidacion,
): MarcaRegla[] {
  const registro = registroParcial(valores);
  return [
    reglaR3(registro, contexto),
    reglaR4(registro),
    reglaR7(registro, contexto),
    reglaR8(registro, contexto),
  ].filter((marca): marca is MarcaRegla => marca !== null);
}
