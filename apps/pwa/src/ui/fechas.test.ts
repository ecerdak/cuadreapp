import { describe, expect, it } from "vitest";
import { fechaLocalDe, fechaLocalHoy } from "./fechas";

describe("RC1-A2 — fechas de negocio en America/Bogota (spec §13), nunca UTC", () => {
  it("a las 19:30 de Bogotá el instante UTC ya es 'mañana', pero el día de negocio sigue siendo hoy", () => {
    // 2026-08-02T00:30Z === 2026-08-01 19:30 en Bogotá (UTC-5)
    expect(fechaLocalDe("2026-08-02T00:30:00Z")).toBe("2026-08-01");
  });

  it("un instante con offset -05:00 conserva su fecha local", () => {
    expect(fechaLocalDe("2026-08-01T23:00:00-05:00")).toBe("2026-08-01");
  });

  it("la medianoche exacta de Bogotá abre el día siguiente", () => {
    // 2026-08-02T05:00Z === 2026-08-02 00:00 en Bogotá
    expect(fechaLocalDe("2026-08-02T05:00:00Z")).toBe("2026-08-02");
  });

  it("fechaLocalHoy con un 'ahora' inyectado equivale a fechaLocalDe", () => {
    const instante = new Date("2026-08-02T01:00:00Z"); // 20:00 del 1.º en Bogotá
    expect(fechaLocalHoy("America/Bogota", instante)).toBe("2026-08-01");
  });

  it("acepta Date además de string ISO", () => {
    expect(fechaLocalDe(new Date("2026-08-02T00:30:00Z"))).toBe("2026-08-01");
  });
});
