// Logging estructurado del ciclo de vida (Etapa H): una línea JSON por
// evento, al igual que la observabilidad por petición (DEC-012).
// Railway agrega y consulta stdout; no hace falta un agente.

export type NivelRegistro = "info" | "advertencia" | "error";

export function registrar(nivel: NivelRegistro, mensaje: string, datos: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ nivel, mensaje, timestamp: new Date().toISOString(), ...datos }));
}
