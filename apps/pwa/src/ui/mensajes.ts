// Textos de UI por bandera del dominio. La UI se guía EXCLUSIVAMENTE
// por el resultado del dominio: este mapa traduce banderas a lenguaje
// de conductor/supervisor, nunca decide nada.
//
// Tono cuidado en R2 (spec §7): un salto de totalizador no es una
// acusación de robo — falta saber a qué equipo fueron esos galones.

import type { Bandera, EstadoCarga } from "@cuadreapp/dominio";

export const MENSAJES_BANDERA: Record<Bandera, string> = {
  TANDA_NO_RESETEADA: "La tanda no arrancó en 0,0. Escribe una nota explicando por qué.",
  SALTO_TOTALIZADOR:
    "El medidor arrancó más arriba de lo esperado. ¿Alguien cargó sin registrar? Puedes seguir; queda anotado.",
  SALTO_TOTALIZADOR_NEGATIVO:
    "El medidor arrancó más abajo del último valor registrado. Revisa el número; queda anotado.",
  TANDA_NO_CUADRA: "La tanda no cuadra con lo que subió el totalizador. Revisa los números.",
  TOTALIZADOR_RETROCEDE: "El totalizador no puede ir hacia atrás. Revisa la lectura final.",
  TOTALIZADOR_SIN_AVANCE: "El totalizador no se movió. Revisa la lectura final.",
  SIN_DESPACHO: "La tanda final está en 0: no se registró despacho.",
  EXCEDE_CAPACIDAD: "Los galones superan la capacidad del tanque de este equipo. Queda anotado.",
  CONTADOR_RETROCEDE: "El horómetro/odómetro está por debajo de la última lectura. Queda anotado.",
  SALTO_CONTADOR:
    "El salto del horómetro/odómetro no es posible en el tiempo transcurrido. Queda anotado.",
  FOTO_FALTANTE: "Faltan las fotos del medidor. Sin las dos fotos no se puede cerrar el registro.",
  FUERA_DE_SEDE: "El GPS marca fuera de la estación. Queda anotado.",
  SIN_GPS: "No se pudo verificar la ubicación (sin GPS). Solo informativo.",
  POSIBLE_DUPLICADO: "Hay otra carga de este equipo hace menos de 3 minutos. Queda anotado.",
  TIEMPO_ATIPICO: "La duración de la carga es atípica. Queda anotado.",
};

/* Semáforo del contrato visual: Cuadra / Revisar / No cuadra. */
export const TEXTO_ESTADO: Record<EstadoCarga, string> = {
  ok: "Cuadra",
  advertencia: "Revisar",
  inconsistente: "No cuadra",
};

export const COLOR_ESTADO: Record<EstadoCarga, string> = {
  ok: "#3FAE7E",
  advertencia: "#E2A233",
  inconsistente: "#E2594C",
};
