// Fija el título del documento y dibuja el ícono de la app como
// favicon: cuadrado azul, esquinas al 22 %, la C del script en amarillo
// con contorno negro — transcrito del mockup aprobado (useMarca). Las
// fuentes van autoalojadas en CSS, no inyectadas.

import { useEffect } from "react";
import { MARCA } from "./tokens";

export function useMarca(titulo: string) {
  useEffect(() => {
    if (titulo) document.title = titulo;

    const pintarIcono = () => {
      try {
        const lado = 64;
        const r = lado * 0.22;
        const c = document.createElement("canvas");
        c.width = lado;
        c.height = lado;
        const g = c.getContext("2d");
        if (!g) return;
        g.beginPath();
        g.moveTo(r, 0);
        g.lineTo(lado - r, 0);
        g.quadraticCurveTo(lado, 0, lado, r);
        g.lineTo(lado, lado - r);
        g.quadraticCurveTo(lado, lado, lado - r, lado);
        g.lineTo(r, lado);
        g.quadraticCurveTo(0, lado, 0, lado - r);
        g.lineTo(0, r);
        g.quadraticCurveTo(0, 0, r, 0);
        g.closePath();
        g.fillStyle = MARCA.azul;
        g.fill();
        g.clip();
        g.font = "400 52px Yellowtail, cursive";
        g.textAlign = "center";
        g.textBaseline = "alphabetic";
        g.lineWidth = 4;
        g.strokeStyle = MARCA.negro;
        g.strokeText("C", lado / 2, lado * 0.76);
        g.fillStyle = MARCA.amarillo;
        g.fillText("C", lado / 2, lado * 0.76);
        let icono = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (!icono) {
          icono = document.createElement("link");
          icono.rel = "icon";
          document.head.appendChild(icono);
        }
        icono.href = c.toDataURL("image/png");
      } catch {
        /* el favicon es cosmético: si el entorno no deja, seguimos */
      }
    };

    if (document.fonts?.load) {
      document.fonts.load("400 52px Yellowtail").then(pintarIcono).catch(pintarIcono);
    } else {
      pintarIcono();
    }
  }, [titulo]);
}
