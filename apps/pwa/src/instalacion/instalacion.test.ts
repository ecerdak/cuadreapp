import { describe, expect, it } from "vitest";
import { detectarPlataforma, enModoApp } from "./instalacion";

describe("instalación — detección de plataforma y modo", () => {
  it("detecta iPhone y iPad como ios", () => {
    expect(detectarPlataforma("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("ios");
    expect(detectarPlataforma("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("ios");
  });

  it("detecta Android", () => {
    expect(detectarPlataforma("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe("android");
  });

  it("escritorio queda como otra (sin experiencia de instalación insistente)", () => {
    expect(detectarPlataforma("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("otra");
  });

  it("standalone de iOS (navigator.standalone) cuenta como modo app", () => {
    expect(enModoApp({ standalone: true }, () => ({ matches: false }))).toBe(true);
  });

  it("display-mode standalone (Android instalada) cuenta como modo app", () => {
    expect(enModoApp({}, (q) => ({ matches: q.includes("standalone") }))).toBe(true);
  });

  it("una pestaña normal de navegador NO es modo app", () => {
    expect(enModoApp({}, () => ({ matches: false }))).toBe(false);
  });
});
