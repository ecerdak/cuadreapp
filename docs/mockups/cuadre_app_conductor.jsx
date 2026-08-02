import React, { useState } from "react";

/* ============================================================
   CUADRE — App del conductor  ·  MOCKUP INTERACTIVO
   Lubryco S.A.S. · Industrias Alimenticias El Trébol S.A.S.

   Siete pantallas, el mismo flujo del documento de especificación.
   El recorrido es real: el teclado escribe, las validaciones se
   evalúan en vivo y el totalizador arranca donde lo dejó la última
   carga del tablero (1.847 gal), así el demo encadena con el otro.
   ============================================================ */

const LOGO_LUBRYCO = "data:image/webp;base64,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";
const FOTO_MEDIDOR = "data:image/webp;base64,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";


/* ============================================================
   MARCA — CuadreApp
   Identidad tomada del logo de Lubryco. El logotipo se arma con
   cuatro copias del mismo texto: sombra dura, halo blanco,
   contorno negro y filete, igual que el letrero de Lubryco.
   ============================================================ */
const MARCA = {
  amarillo: "#F5E01B",
  azul: "#4A7CAB",
  negro: "#0B0B0B",
  halo: "#FFFFFF",
  script: "'Yellowtail', cursive",
  ui: "'Barlow', system-ui, -apple-system, sans-serif",
  condensada: "'Barlow Condensed', 'Barlow', sans-serif",
};

const FUENTES =
  "https://fonts.googleapis.com/css2?family=Yellowtail&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap";

/* Tabla de escala del documento de marca. Los tres tamaños canónicos
   llevan sus valores exactos; cualquier otro se deriva de las
   proporciones: sombra 17%, halo 13%, contorno 9%, filete 2.5%,
   desplazamiento 8%. */
const CAPAS = {
  118: { off: 10, sombra: 20, halo: 16, contorno: 11, filete: 3 },
  54: { off: 5, sombra: 10, halo: 8, contorno: 5, filete: 1.5 },
  34: { off: 3, sombra: 6, halo: 4.5, contorno: 3, filete: 1 },
};
const capas = (t) =>
  CAPAS[t] || { off: t * 0.08, sombra: t * 0.17, halo: t * 0.13, contorno: t * 0.09, filete: t * 0.025 };

function Logotipo({ tam = 34, texto = "Cuadre", halo = true }) {
  const k = capas(tam);
  const base = {
    fontFamily: MARCA.script,
    fontSize: tam,
    lineHeight: 1.35,
    whiteSpace: "nowrap",
    paintOrder: "stroke",
  };
  return (
    <span style={{ ...base, position: "relative", display: "inline-block" }}>
      <span style={{ ...base, position: "absolute", left: k.off, top: k.off, color: MARCA.negro, WebkitTextStroke: k.sombra + "px " + MARCA.negro }}>
        {texto}
      </span>
      {halo && (
        <span style={{ ...base, position: "absolute", left: 0, top: 0, color: MARCA.halo, WebkitTextStroke: k.halo + "px " + MARCA.halo }}>
          {texto}
        </span>
      )}
      <span style={{ ...base, position: "absolute", left: 0, top: 0, color: MARCA.negro, WebkitTextStroke: k.contorno + "px " + MARCA.negro }}>
        {texto}
      </span>
      <span style={{ ...base, position: "relative", color: MARCA.amarillo, WebkitTextStroke: k.filete + "px " + MARCA.negro }}>
        {texto}
      </span>
    </span>
  );
}

/* Placa APP · Barlow Condensed 700 sobre el amarillo del logotipo */
function Placa({ children = "APP", tam = 12 }) {
  return (
    <span
      style={{
        fontFamily: MARCA.condensada, fontWeight: 700, fontSize: tam,
        letterSpacing: "0.2em", color: MARCA.negro, background: MARCA.amarillo,
        padding: "5px 7px 4px", borderRadius: 3, lineHeight: 1, display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

/* Carga las fuentes, fija el título y dibuja el ícono de la app
   como favicon: cuadrado azul, esquinas al 22%, la C del script en
   amarillo. A ese tamaño va sin halo blanco. */
function useMarca(titulo) {
  React.useEffect(() => {
    if (!document.getElementById("fuentes-cuadreapp")) {
      const l = document.createElement("link");
      l.id = "fuentes-cuadreapp";
      l.rel = "stylesheet";
      l.href = FUENTES;
      document.head.appendChild(l);
    }
    if (titulo) document.title = titulo;

    const pintarIcono = () => {
      try {
        const lado = 64, r = lado * 0.22;
        const c = document.createElement("canvas");
        c.width = lado; c.height = lado;
        const g = c.getContext("2d");
        g.beginPath();
        g.moveTo(r, 0); g.lineTo(lado - r, 0); g.quadraticCurveTo(lado, 0, lado, r);
        g.lineTo(lado, lado - r); g.quadraticCurveTo(lado, lado, lado - r, lado);
        g.lineTo(r, lado); g.quadraticCurveTo(0, lado, 0, lado - r);
        g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0);
        g.closePath();
        g.fillStyle = MARCA.azul; g.fill(); g.clip();
        g.font = "400 52px Yellowtail, cursive";
        g.textAlign = "center"; g.textBaseline = "alphabetic";
        g.lineWidth = 4; g.strokeStyle = MARCA.negro;
        g.strokeText("C", lado / 2, lado * 0.76);
        g.fillStyle = MARCA.amarillo;
        g.fillText("C", lado / 2, lado * 0.76);
        let icono = document.querySelector("link[rel='icon']");
        if (!icono) {
          icono = document.createElement("link");
          icono.rel = "icon";
          document.head.appendChild(icono);
        }
        icono.href = c.toDataURL("image/png");
      } catch (err) {
        /* el favicon es cosmético: si el entorno no deja, seguimos */
      }
    };

    if (document.fonts && document.fonts.load) {
      document.fonts.load("400 52px Yellowtail").then(pintarIcono).catch(pintarIcono);
    } else {
      pintarIcono();
    }
  }, [titulo]);
}

const C = {
  fondo: "#0B1219",
  panel: "#111C26",
  linea: "#22374A",
  lineaSuave: "#1A2A38",
  texto: "#E7EEF6",
  suave: "#8AA0B6",
  amarillo: MARCA.amarillo,
  azul: "#5B90C4",
  verde: "#3FAE7E",
  ambar: "#E2A233",
  rojo: "#E2594C",
};
/* fondo de la app: más oscuro que la página, para que el celular
   se lea como un objeto y no como parte del sitio */
const APP = { fondo: "#070D13", tarjeta: "#121C25", tarjeta2: "#18242F" };

const TURNO = {
  equipo: "T-04",
  equipoDesc: "Tractor Massey 4292",
  conductor: "Duván Bonilla",
  codigo: "07",
  totEsperado: 1847,
  horometroPrevio: 1086.5,
  sede: "Planta Andalucía",
};

const CARGAS_HOY = [
  { hora: "06:12", equipo: "T-01", gal: "38,5" },
  { hora: "06:41", equipo: "AL-01", gal: "52,0" },
  { hora: "07:20", equipo: "P-01", gal: "14,2" },
];

const PASOS = [
  { n: 0, rot: "Bienvenida" },
  { n: 1, rot: "Inicio" },
  { n: 2, rot: "Equipo" },
  { n: 3, rot: "Conductor" },
  { n: 4, rot: "Antes de cargar" },
  { n: 5, rot: "Cargando" },
  { n: 6, rot: "Después de cargar" },
  { n: 7, rot: "Listo" },
];

const NOTAS = {
  0: {
    titulo: "La marca aparece una vez y se quita del camino",
    cuerpo:
      "El azul del logo de Lubryco a sangre completa, el logotipo, el eslogan y el endoso. Dura dos segundos, o lo que tarde el conductor en tocar la pantalla.",
    reglas: [
      "El endoso es «by» más el logo de Lubryco: la app es de Lubryco, pero el logo de Lubryco nunca reemplaza al logotipo de CuadreApp.",
      "Después de esta pantalla el conductor no vuelve a ver marca. El resto es trabajo.",
    ],
  },
  1: {
    titulo: "Una sola decisión por pantalla",
    cuerpo:
      "El conductor abre la app y solo puede hacer una cosa. Nada de menús. Abajo ve lo que ya se registró hoy, para saber si su carga quedó o no.",
    reglas: ["El chip de sincronización siempre está visible: el conductor tiene que poder ver qué falta subir."],
  },
  2: {
    titulo: "El equipo se escanea, no se escribe",
    cuerpo:
      "Cada máquina lleva un sticker con QR. Escanear elimina el error de digitación en la identificación, que es donde más se ensucia la data.",
    reglas: ["Si el sticker está roto o sucio, queda la búsqueda por código como salida."],
  },
  3: {
    titulo: "El PIN identifica, no protege",
    cuerpo:
      "El dispositivo ya está enrolado a la sede, así que no hay pantalla de login. El conductor solo confirma quién es.",
    reglas: [
      "La defensa contra el fraude son los tres candados aritméticos y las fotos, no el PIN.",
      "El dispositivo recuerda al último conductor: en la práctica es teclear cuatro dígitos.",
    ],
  },
  4: {
    titulo: "Foto y lectura, antes de abrir la manguera",
    cuerpo:
      "Una sola foto captura los dos registros del Fill-Rite: la tanda arriba y el totalizador abajo. El totalizador viene pre-llenado con el último valor conocido.",
    reglas: [
      "R1 — la tanda debe estar en 0.0: prueba de que reseteó el medidor.",
      "R2 — si el totalizador arrancó más arriba de lo esperado, alguien cargó sin registrar. Se avisa, se anota y se deja seguir.",
      "R9 — cámara en vivo, nunca galería. Con galería, en dos semanas están reciclando fotos viejas.",
    ],
  },
  5: {
    titulo: "El tiempo también es dato",
    cuerpo:
      "La app queda esperando con el cronómetro corriendo. La duración de la carga entra al registro y sirve para detectar tiempos atípicos.",
    reglas: ["R12 — una carga de tres segundos o de dos horas se marca para revisión."],
  },
  6: {
    titulo: "El cuadre se resuelve ahí parado",
    cuerpo:
      "La tanda final debe ser igual a lo que subió el totalizador. Si no cuadra, el conductor lo corrige en el momento, no el contador tres días después.",
    reglas: [
      "R3 — tolerancia de 1 galón: el totalizador solo muestra enteros y la tanda muestra décimas.",
      "R7 y R8 — el horómetro no puede retroceder ni saltar más de 24 horas desde la carga anterior.",
    ],
  },
  7: {
    titulo: "Sin señal también sirve",
    cuerpo:
      "El registro se guarda en el celular y se sube cuando vuelva la red. El conductor ve el estado sin tener que entender qué es una cola.",
    reglas: [
      "Si la app depende de conexión, el primer día sin señal vuelven al papel y no se recuperan.",
      "El servidor revalida todo al recibir: el celular propone, el servidor decide.",
    ],
  },
};

/* ---------- utilidades ---------- */
const aNum = (s) => parseFloat(String(s).replace(",", ".")) || 0;
const ent = (n) => Number(n).toLocaleString("es-CO", { maximumFractionDigits: 0 });

const inicial = () => ({
  paso: 0,
  equipoOk: false,
  pin: "",
  fotoIni: false,
  fotoFin: false,
  tandaIni: "0,0",
  totIni: String(TURNO.totEsperado),
  tandaFin: "",
  totFin: "",
  horometro: "",
  campo: "tandaIni",
  segundos: 184,
  sinSenal: false,
});

const CANON = {
  0: { ...inicial() },
  1: { ...inicial(), paso: 1 },
  2: { ...inicial(), paso: 2 },
  3: { ...inicial(), paso: 3, equipoOk: true, pin: "18" },
  4: { ...inicial(), paso: 4, equipoOk: true, pin: "1834", fotoIni: true, campo: "totIni" },
  5: { ...inicial(), paso: 5, equipoOk: true, pin: "1834", fotoIni: true },
  6: {
    ...inicial(), paso: 6, equipoOk: true, pin: "1834", fotoIni: true, fotoFin: true,
    tandaFin: "42,5", totFin: "1890", horometro: "1093,0", campo: "horometro",
  },
  7: {
    ...inicial(), paso: 7, equipoOk: true, pin: "1834", fotoIni: true, fotoFin: true,
    tandaFin: "42,5", totFin: "1890", horometro: "1093,0", sinSenal: true,
  },
};

/* ============================================================
   Piezas de la interfaz del celular
   ============================================================ */
function BarraEstado({ hora, sinSenal }) {
  return (
    <div className="flex items-center justify-between px-5" style={{ height: 30, fontSize: 11, color: C.suave }}>
      <span className="font-mono font-semibold" style={{ color: C.texto }}>{hora}</span>
      <div className="flex items-center" style={{ gap: 7 }}>
        {sinSenal ? (
          <span style={{ color: C.ambar, fontSize: 10 }}>Sin señal</span>
        ) : (
          <div className="flex items-end" style={{ gap: 2 }}>
            {[5, 8, 11].map((h) => (
              <span key={h} style={{ width: 3, height: h, background: C.suave, borderRadius: 1 }} />
            ))}
          </div>
        )}
        <span
          className="inline-flex items-center"
          style={{ width: 20, height: 10, border: "1px solid " + C.suave, borderRadius: 2, padding: 1 }}
        >
          <span style={{ width: "62%", height: "100%", background: C.suave, borderRadius: 1 }} />
        </span>
      </div>
    </div>
  );
}

function CabezaApp({ paso }) {
  const total = 5;
  const avance = paso >= 2 && paso <= 6 ? paso - 1 : paso === 7 ? total : 0;
  return (
    <div style={{ borderBottom: "1px solid " + C.lineaSuave }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center" style={{ gap: 9 }}>
          <img src={LOGO_LUBRYCO} alt="Lubryco" style={{ height: 26, width: "auto" }} />
          <div style={{ width: 1, height: 22, background: C.linea }} />
          <Logotipo tam={28} />
          <Placa tam={9.5} />
        </div>
        <span style={{ fontSize: 10, color: C.suave }}>{TURNO.sede}</span>
      </div>
      {avance > 0 && (
        <div className="flex px-4 pb-3" style={{ gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i < avance ? C.amarillo : C.lineaSuave,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const Titulo = ({ children, sub }) => (
  <div className="px-4 pt-5">
    <h2 className="font-semibold leading-snug" style={{ fontSize: 21, letterSpacing: "-0.01em" }}>{children}</h2>
    {sub && <p style={{ fontSize: 12.5, color: C.suave, marginTop: 6, lineHeight: 1.5 }}>{sub}</p>}
  </div>
);

function BotonGrande({ children, onClick, tono = "primario", chico }) {
  const fondo = tono === "primario" ? C.amarillo : APP.tarjeta2;
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl font-semibold"
      style={{
        background: fondo,
        color: tono === "primario" ? "#101A22" : C.texto,
        padding: chico ? "13px 16px" : "18px 16px",
        fontSize: chico ? 14 : 16,
        border: tono === "primario" ? "none" : "1px solid " + C.linea,
      }}
    >
      {children}
    </button>
  );
}

function Aviso({ tono, titulo, cuerpo }) {
  const col = tono === "ok" ? C.verde : tono === "alerta" ? C.ambar : C.rojo;
  return (
    <div
      className="rounded-lg px-3 py-3"
      style={{ background: col + "16", border: "1px solid " + col + "4D" }}
    >
      <div className="flex" style={{ gap: 9 }}>
        <span
          className="flex shrink-0 items-center justify-center font-bold"
          style={{ width: 18, height: 18, marginTop: 1, borderRadius: 5, background: col, color: "#0B1219", fontSize: 12 }}
        >
          {tono === "ok" ? "✓" : "!"}
        </span>
        <div>
          <div className="font-semibold" style={{ fontSize: 13, color: col }}>{titulo}</div>
          {cuerpo && <div style={{ fontSize: 11.5, color: C.suave, lineHeight: 1.5, marginTop: 3 }}>{cuerpo}</div>}
        </div>
      </div>
    </div>
  );
}

/* Cámara simulada: la foto real del medidor con el marco guía encima */
function Camara({ tomada, onDisparo, instruccion }) {
  return (
    <div className="px-4">
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ height: 244, background: "#05090D", border: "1px solid " + C.linea }}
      >
        <img
          src={FOTO_MEDIDOR}
          alt="Medidor"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: tomada ? "none" : "brightness(0.82) saturate(0.9)",
          }}
        />
        {/* marco guía sobre la carátula */}
        <div
          className="absolute"
          style={{
            left: "12%", right: "12%", top: "26%", height: "40%",
            border: "2px solid " + (tomada ? C.verde : C.amarillo),
            borderRadius: 6,
            boxShadow: "0 0 0 9999px rgba(4,8,12,.42)",
          }}
        />
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{ top: 12 }}
        >
          <span
            className="rounded-full px-3 py-1 font-semibold"
            style={{ fontSize: 10.5, background: "rgba(6,12,18,.78)", color: tomada ? C.verde : C.amarillo }}
          >
            {tomada ? "Foto tomada" : instruccion}
          </span>
        </div>
        {!tomada && (
          <button
            onClick={onDisparo}
            className="absolute left-1/2 flex items-center justify-center"
            style={{
              bottom: 14, transform: "translateX(-50%)", width: 54, height: 54,
              borderRadius: 27, background: "#F4F7FA", border: "4px solid rgba(255,255,255,.35)",
            }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 20, background: "#DCE4EB" }} />
          </button>
        )}
      </div>
      <div style={{ fontSize: 10.5, color: C.suave, marginTop: 7, textAlign: "center" }}>
        Solo cámara en vivo · queda con hora y ubicación
      </div>
    </div>
  );
}

/* Campo numérico grande, estilo carátula */
function CampoNum({ rot, valor, unidad, activo, onClick, tono, ayuda }) {
  const borde = tono === "malo" ? C.rojo : tono === "alerta" ? C.ambar : activo ? C.amarillo : C.linea;
  return (
    <button onClick={onClick} className="w-full rounded-lg px-3 py-3 text-left"
      style={{ background: APP.tarjeta, border: "1px solid " + borde }}>
      <div className="flex items-baseline justify-between">
        <span className="uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: "0.12em", color: C.suave }}>{rot}</span>
        {ayuda && <span style={{ fontSize: 10, color: C.suave }}>{ayuda}</span>}
      </div>
      <div className="mt-1 flex items-baseline" style={{ gap: 6 }}>
        <span className="font-mono font-bold" style={{ fontSize: 26, color: valor ? C.texto : C.linea }}>
          {valor || "—"}
        </span>
        <span style={{ fontSize: 11, color: C.suave }}>{unidad}</span>
      </div>
    </button>
  );
}

function Teclado({ onTecla }) {
  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];
  return (
    <div className="grid grid-cols-3 px-4" style={{ gap: 7 }}>
      {teclas.map((t) => (
        <button
          key={t}
          onClick={() => onTecla(t)}
          className="rounded-lg font-mono font-semibold"
          style={{
            padding: "13px 0", fontSize: 19, background: APP.tarjeta2,
            color: t === "⌫" ? C.suave : C.texto, border: "1px solid " + C.lineaSuave,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Las siete pantallas
   ============================================================ */
function Pantalla({ e, api }) {
  const { paso } = e;

  /* ---- 1 · Inicio ---- */
  if (paso === 1)
    return (
      <>
        <Titulo>Buenos días, {TURNO.conductor.split(" ")[0]}</Titulo>
        <div className="px-4 pt-5">
          <button
            onClick={() => api.ir(2)}
            className="w-full rounded-2xl font-semibold"
            style={{ background: C.amarillo, color: "#101A22", padding: "30px 18px", fontSize: 20, textAlign: "left" }}
          >
            Cargar combustible
            <span className="block font-normal" style={{ fontSize: 12, opacity: 0.72, marginTop: 5 }}>
              Toma unos 40 segundos
            </span>
          </button>
        </div>
        <div className="px-4 pt-6">
          <div className="flex items-baseline justify-between">
            <span className="uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: "0.12em", color: C.suave }}>
              Cargas de hoy
            </span>
            <span
              className="rounded-full px-2 py-1 font-semibold"
              style={{ fontSize: 9.5, color: C.verde, background: C.verde + "1C" }}
            >
              Todo sincronizado
            </span>
          </div>
          <div className="mt-3 flex flex-col" style={{ gap: 7 }}>
            {CARGAS_HOY.map((c) => (
              <div
                key={c.hora}
                className="flex items-center justify-between rounded-lg px-3 py-3"
                style={{ background: APP.tarjeta, border: "1px solid " + C.lineaSuave }}
              >
                <div className="flex items-baseline" style={{ gap: 10 }}>
                  <span className="font-mono" style={{ fontSize: 12, color: C.suave }}>{c.hora}</span>
                  <span className="font-mono font-semibold" style={{ fontSize: 13 }}>{c.equipo}</span>
                </div>
                <span className="font-mono font-semibold" style={{ fontSize: 14 }}>{c.gal} gal</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );

  /* ---- 2 · Equipo ---- */
  if (paso === 2)
    return (
      <>
        <Titulo sub="Apunta al sticker de la máquina.">¿Qué equipo vas a cargar?</Titulo>
        <div className="px-4 pt-4">
          {!e.equipoOk ? (
            <>
              <div
                className="relative flex items-center justify-center rounded-xl"
                style={{ height: 216, background: "#05090D", border: "1px solid " + C.linea }}
              >
                {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => (
                  <span
                    key={String(x) + y}
                    className="absolute"
                    style={{
                      width: 34, height: 34,
                      [x ? "right" : "left"]: 46, [y ? "bottom" : "top"]: 46,
                      [y ? "borderBottom" : "borderTop"]: "3px solid " + C.amarillo,
                      [x ? "borderRight" : "borderLeft"]: "3px solid " + C.amarillo,
                      borderRadius: y ? (x ? "0 0 8px 0" : "0 0 0 8px") : x ? "0 8px 0 0" : "8px 0 0 0",
                    }}
                  />
                ))}
                <span style={{ fontSize: 11.5, color: C.suave }}>Buscando código…</span>
              </div>
              <div className="mt-4">
                <BotonGrande chico onClick={api.escanear}>Simular escaneo del QR</BotonGrande>
              </div>
              <button className="mt-3 w-full" style={{ fontSize: 12.5, color: C.azul }}>
                Buscar por código
              </button>
            </>
          ) : (
            <>
              <div
                className="rounded-xl px-4 py-5"
                style={{ background: APP.tarjeta, border: "1px solid " + C.verde + "66" }}
              >
                <span className="uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: "0.12em", color: C.verde }}>
                  Equipo reconocido
                </span>
                <div className="mt-2 font-mono font-bold" style={{ fontSize: 34 }}>{TURNO.equipo}</div>
                <div style={{ fontSize: 13, color: C.suave, marginTop: 3 }}>{TURNO.equipoDesc}</div>
                <div style={{ fontSize: 11.5, color: C.suave, marginTop: 12 }}>
                  Horómetro de la última carga: <span className="font-mono">1.086,5 h</span>
                </div>
              </div>
              <div className="mt-4"><BotonGrande onClick={() => api.ir(3)}>Sí, es este</BotonGrande></div>
              <button onClick={api.reiniciarEquipo} className="mt-3 w-full" style={{ fontSize: 12.5, color: C.azul }}>
                No, escanear otro
              </button>
            </>
          )}
        </div>
      </>
    );

  /* ---- 3 · Conductor ---- */
  if (paso === 3)
    return (
      <>
        <Titulo sub={"Cargando " + TURNO.equipo + " · " + TURNO.equipoDesc}>Confirma tu clave</Titulo>
        <div className="px-4 pt-5">
          <div className="rounded-lg px-3 py-3" style={{ background: APP.tarjeta, border: "1px solid " + C.lineaSuave }}>
            <span className="uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: "0.12em", color: C.suave }}>
              Conductor
            </span>
            <div className="font-semibold" style={{ fontSize: 16, marginTop: 3 }}>{TURNO.conductor}</div>
            <div style={{ fontSize: 11, color: C.suave }}>Código {TURNO.codigo}</div>
          </div>
          <div className="mt-6 flex justify-center" style={{ gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  width: 15, height: 15, borderRadius: 8,
                  background: e.pin.length > i ? C.amarillo : "transparent",
                  border: "1.5px solid " + (e.pin.length > i ? C.amarillo : C.linea),
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.suave, textAlign: "center", marginTop: 10 }}>
            Cuatro dígitos
          </div>
        </div>
        <div className="pt-5">
          <Teclado onTecla={api.teclaPin} />
        </div>
        <div className="px-4 pt-4">
          <BotonGrande onClick={() => api.ir(4)} tono={e.pin.length === 4 ? "primario" : "gris"}>
            Continuar
          </BotonGrande>
        </div>
      </>
    );

  /* ---- 4 · Antes de cargar ---- */
  if (paso === 4) {
    const tandaMal = aNum(e.tandaIni) !== 0;
    const salto = Math.round(aNum(e.totIni) - TURNO.totEsperado);
    return (
      <>
        <Titulo sub="Deja el medidor en 0.0 y toma la foto. Una sola foto muestra los dos números.">
          Antes de cargar
        </Titulo>
        <div className="pt-4">
          <Camara tomada={e.fotoIni} onDisparo={api.dispararIni} instruccion="Encuadra la carátula completa" />
        </div>
        <div className="px-4 pt-4 flex flex-col" style={{ gap: 8 }}>
          <CampoNum
            rot="Tanda de arriba" valor={e.tandaIni} unidad="gal" activo={e.campo === "tandaIni"}
            onClick={() => api.foco("tandaIni")} tono={tandaMal ? "alerta" : null} ayuda="debe ser 0,0"
          />
          <CampoNum
            rot="Total gallons" valor={e.totIni ? ent(aNum(e.totIni)) : ""} unidad="gal" activo={e.campo === "totIni"}
            onClick={() => api.foco("totIni")} tono={salto !== 0 ? "alerta" : null}
            ayuda={"esperado " + ent(TURNO.totEsperado)}
          />
          {tandaMal && (
            <Aviso tono="alerta" titulo="La tanda no está en cero"
              cuerpo="Gira la perilla hasta 0.0 y vuelve a tomar la foto. Si no puedes, sigue y quedará anotado." />
          )}
          {salto > 0 && (
            <Aviso tono="alerta" titulo={"El medidor arrancó " + salto + " gal más arriba"}
              cuerpo={"Se esperaba " + ent(TURNO.totEsperado) + ". Alguien cargó sin registrar. El combustible no se perdió: lo que falta es saber a qué equipo fue. Puedes seguir."} />
          )}
        </div>
        <div className="pt-4"><Teclado onTecla={api.teclaCampo} /></div>
        <div className="px-4 pt-4">
          <BotonGrande onClick={() => api.ir(5)} tono={e.fotoIni ? "primario" : "gris"}>
            {e.fotoIni ? "Empezar a cargar" : "Toma la foto para seguir"}
          </BotonGrande>
        </div>
      </>
    );
  }

  /* ---- 5 · Cargando ---- */
  if (paso === 5) {
    const m = String(Math.floor(e.segundos / 60)).padStart(2, "0");
    const s = String(e.segundos % 60).padStart(2, "0");
    return (
      <>
        <Titulo>Cargando</Titulo>
        <div className="flex flex-col items-center px-4" style={{ paddingTop: 44 }}>
          <div className="font-mono font-bold" style={{ fontSize: 62, letterSpacing: "-0.02em" }}>{m}:{s}</div>
          <div style={{ fontSize: 12, color: C.suave, marginTop: 6 }}>Tiempo de carga</div>
          <div
            className="mt-9 w-full rounded-xl px-4 py-4"
            style={{ background: APP.tarjeta, border: "1px solid " + C.lineaSuave }}
          >
            {[
              ["Equipo", TURNO.equipo + " · " + TURNO.equipoDesc],
              ["Conductor", TURNO.conductor],
              ["Medidor al iniciar", ent(aNum(e.totIni)) + " gal"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between py-1">
                <span style={{ fontSize: 11.5, color: C.suave }}>{k}</span>
                <span className="font-mono" style={{ fontSize: 12.5 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4" style={{ paddingTop: 32 }}>
          <BotonGrande onClick={() => api.ir(6)}>Terminé de cargar</BotonGrande>
        </div>
      </>
    );
  }

  /* ---- 6 · Después de cargar ---- */
  if (paso === 6) {
    const subio = e.totFin ? Math.round(aNum(e.totFin) - aNum(e.totIni)) : null;
    const tanda = aNum(e.tandaFin);
    const listo = e.tandaFin && e.totFin;
    const cuadra = listo && Math.abs(tanda - subio) <= 1;
    const horoMal = e.horometro && aNum(e.horometro) < TURNO.horometroPrevio;
    return (
      <>
        <Titulo sub="Toma la foto del cierre y copia los dos números.">Después de cargar</Titulo>
        <div className="pt-4">
          <Camara tomada={e.fotoFin} onDisparo={api.dispararFin} instruccion="Encuadra la carátula completa" />
        </div>
        <div className="px-4 pt-4 flex flex-col" style={{ gap: 8 }}>
          <CampoNum
            rot="Tanda de arriba" valor={e.tandaFin} unidad="gal" activo={e.campo === "tandaFin"}
            onClick={() => api.foco("tandaFin")} tono={listo && !cuadra ? "malo" : null}
          />
          <CampoNum
            rot="Total gallons" valor={e.totFin ? ent(aNum(e.totFin)) : ""} unidad="gal" activo={e.campo === "totFin"}
            onClick={() => api.foco("totFin")} tono={listo && !cuadra ? "malo" : null}
            ayuda={subio !== null ? "subió " + subio : null}
          />
          {listo && cuadra && (
            <Aviso tono="ok" titulo={"Cuadra: " + e.tandaFin + " galones"}
              cuerpo={"La tanda coincide con lo que subió el totalizador (" + subio + " gal). Diferencia dentro del galón de tolerancia."} />
          )}
          {listo && !cuadra && (
            <Aviso tono="malo" titulo={"La tanda dice " + e.tandaFin + " pero el totalizador subió " + subio}
              cuerpo="Revisa los números en la carátula. Si están bien copiados, sigue: el supervisor lo verá marcado." />
          )}
          <CampoNum
            rot="Horómetro del tractor" valor={e.horometro} unidad="h" activo={e.campo === "horometro"}
            onClick={() => api.foco("horometro")} tono={horoMal ? "malo" : null}
            ayuda={"anterior " + TURNO.horometroPrevio.toLocaleString("es-CO", { minimumFractionDigits: 1 })}
          />
          {horoMal && <Aviso tono="malo" titulo="El horómetro no puede ir hacia atrás" cuerpo="La lectura anterior fue mayor. Revisa el número." />}
        </div>
        <div className="pt-4"><Teclado onTecla={api.teclaCampo} /></div>
        <div className="px-4 pt-4">
          <BotonGrande onClick={() => api.ir(7)} tono={e.fotoFin && listo ? "primario" : "gris"}>
            Guardar la carga
          </BotonGrande>
        </div>
      </>
    );
  }

  /* ---- 7 · Listo ---- */
  const galones = e.tandaFin || "42,5";
  return (
    <>
      <div className="flex flex-col items-center px-4" style={{ paddingTop: 40 }}>
        <span
          className="flex items-center justify-center font-bold"
          style={{ width: 62, height: 62, borderRadius: 31, background: C.verde + "22", color: C.verde, fontSize: 30, border: "1px solid " + C.verde + "66" }}
        >
          ✓
        </span>
        <div className="font-mono font-bold" style={{ fontSize: 52, marginTop: 18, letterSpacing: "-0.02em" }}>{galones}</div>
        <div style={{ fontSize: 12, color: C.suave }}>galones cargados</div>
        <div className="mt-7 w-full rounded-xl px-4 py-4" style={{ background: APP.tarjeta, border: "1px solid " + C.lineaSuave }}>
          {[
            ["Equipo", TURNO.equipo + " · " + TURNO.equipoDesc],
            ["Conductor", TURNO.conductor],
            ["Hora", "09:52"],
            ["Medidor", ent(aNum(e.totIni)) + " → " + ent(aNum(e.totFin || 1890))],
            ["Horómetro", (e.horometro || "1093,0") + " h"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between py-1">
              <span style={{ fontSize: 11.5, color: C.suave }}>{k}</span>
              <span className="font-mono" style={{ fontSize: 12.5 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 w-full">
          <Aviso tono="alerta" titulo="Guardado en el celular"
            cuerpo="No hay señal en este momento. La carga se sube sola cuando vuelva la red. Ya quedó registrada." />
        </div>
      </div>
      <div className="px-4" style={{ paddingTop: 22 }}>
        <BotonGrande onClick={api.reiniciar}>Registrar otra carga</BotonGrande>
      </div>
    </>
  );
}

/* ---------- pantalla de bienvenida ---------- */
function Splash({ onSeguir }) {
  return (
    <div
      onClick={onSeguir}
      className="flex h-full w-full flex-col items-center"
      style={{ background: MARCA.azul, cursor: "pointer", paddingBottom: 38 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center" style={{ paddingBottom: 54 }}>
        <Logotipo tam={54} />
        <div
          style={{
            fontFamily: MARCA.condensada, fontWeight: 700, fontSize: 13,
            letterSpacing: "0.3em", paddingLeft: "0.3em", color: MARCA.negro, marginTop: 20,
          }}
        >
          CADA GALÓN CUADRA
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span
          style={{
            fontFamily: MARCA.ui, fontWeight: 600, fontSize: 11,
            letterSpacing: "0.18em", paddingLeft: "0.18em", color: "#EAF2F8",
          }}
        >
          BY
        </span>
        <img src={LOGO_LUBRYCO} alt="Lubryco" style={{ height: 70, width: "auto", marginTop: 10 }} />
      </div>
    </div>
  );
}

/* ---------- carcasa del celular ---------- */
function Celular({ e, api, escala = 1 }) {
  const hora = e.paso >= 6 ? "09:52" : e.paso >= 4 ? "09:47" : "09:46";
  return (
    <div
      style={{
        width: 372, transform: escala === 1 ? "none" : "scale(" + escala + ")",
        transformOrigin: "top center",
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          borderRadius: 34, background: APP.fondo, border: "1px solid " + C.linea,
          boxShadow: "0 0 0 8px #0A1219, 0 22px 44px rgba(0,0,0,.5)",
          height: 760, display: "flex", flexDirection: "column",
        }}
      >
        {e.paso === 0 ? (
          <Splash onSeguir={() => api.ir(1)} />
        ) : (
          <>
            <BarraEstado hora={hora} sinSenal={e.sinSenal} />
            <CabezaApp paso={e.paso} />
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 22 }}>
              <Pantalla e={e} api={api} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Página contenedora
   ============================================================ */
export default function AppConductor() {
  useMarca("CuadreApp · App del conductor");
  const [e, setE] = useState(inicial());
  const [galeria, setGaleria] = useState(false);

  /* La bienvenida se va sola a los dos segundos */
  React.useEffect(() => {
    if (galeria || e.paso !== 0) return;
    const t = setTimeout(() => setE((v) => (v.paso === 0 ? { ...v, paso: 1 } : v)), 2000);
    return () => clearTimeout(t);
  }, [e.paso, galeria]);
  const set = (p) => setE((v) => ({ ...v, ...p }));

  const escribir = (campo, t) => {
    const actual = e[campo] || "";
    let v;
    if (t === "⌫") v = actual.slice(0, -1);
    else if (t === "," ) v = actual.includes(",") ? actual : actual + ",";
    else v = (actual + t).slice(0, 8);
    set({ [campo]: v });
  };

  const api = {
    ir: (n) => set({ paso: n, campo: n === 4 ? "totIni" : n === 6 ? "tandaFin" : e.campo }),
    escanear: () => set({ equipoOk: true }),
    reiniciarEquipo: () => set({ equipoOk: false }),
    teclaPin: (t) => set({ pin: t === "⌫" ? e.pin.slice(0, -1) : t === "," ? e.pin : (e.pin + t).slice(0, 4) }),
    teclaCampo: (t) => escribir(e.campo, t),
    foco: (c) => set({ campo: c }),
    dispararIni: () => set({ fotoIni: true }),
    dispararFin: () => set({ fotoFin: true }),
    reiniciar: () => setE(inicial()),
  };

  const nota = NOTAS[e.paso];

  return (
    <div className="min-h-screen w-full" style={{ background: C.fondo, color: C.texto, fontFamily: MARCA.ui }}>
      {/* encabezado de la página */}
      <header style={{ borderBottom: "1px solid " + C.linea, background: C.panel }}>
        <div className="mx-auto flex flex-wrap items-center justify-between px-5 py-4" style={{ maxWidth: 1180, gap: 14 }}>
          <div className="flex items-center" style={{ gap: 16 }}>
            <img src={LOGO_LUBRYCO} alt="Lubryco" style={{ height: 44, width: "auto" }} />
            <div style={{ width: 1, height: 40, background: C.linea }} />
            <div>
              <div className="flex items-center" style={{ gap: 9 }}>
                <Logotipo tam={34} />
                <Placa />
              </div>
              <div style={{ fontSize: 10.5, color: C.suave, marginTop: 3 }}>
                App del conductor · El Trébol S.A.S. · Planta Andalucía, Valle del Cauca
              </div>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="uppercase font-semibold"
              style={{ fontSize: 9.5, letterSpacing: "0.12em", color: C.amarillo, border: "1px solid " + C.amarillo + "66", borderRadius: 4, padding: "3px 7px" }}>
              Demo
            </span>
            {[["Recorrido", false], ["Las 8 pantallas", true]].map(([rot, v]) => (
              <button
                key={rot}
                onClick={() => setGaleria(v)}
                className="rounded-md font-semibold"
                style={{
                  fontSize: 12, padding: "7px 12px",
                  color: galeria === v ? "#101A22" : C.suave,
                  background: galeria === v ? C.amarillo : "transparent",
                  border: "1px solid " + (galeria === v ? C.amarillo : C.linea),
                }}
              >
                {rot}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto px-5 py-7" style={{ maxWidth: 1180 }}>
        {galeria ? (
          <>
            <p style={{ fontSize: 13, color: C.suave, maxWidth: 720, lineHeight: 1.6 }}>
              El flujo completo, en orden. De la bienvenida al registro guardado hay ocho pantallas y
              ninguna pide escribir una letra: se escanea, se toca y se teclean números.
            </p>
            <div className="mt-7 grid gap-x-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
              {PASOS.map((p) => (
                <div key={p.n} style={{ marginBottom: 34 }}>
                  <div className="mb-3 flex items-baseline" style={{ gap: 8 }}>
                    <span className="font-mono font-bold" style={{ fontSize: 13, color: C.amarillo }}>
                      {String(p.n).padStart(2, "0")}
                    </span>
                    <span className="font-semibold" style={{ fontSize: 13.5 }}>{p.rot}</span>
                  </div>
                  <div style={{ height: 520 }}>
                    <Celular e={CANON[p.n]} api={{ ...api, ir: () => {}, escanear: () => {}, dispararIni: () => {}, dispararFin: () => {}, teclaPin: () => {}, teclaCampo: () => {}, foco: () => {}, reiniciar: () => {} }} escala={0.66} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* celular */}
            <div className="flex flex-col items-center">
              <div className="mb-5 flex w-full overflow-x-auto" style={{ gap: 5 }}>
                {PASOS.map((p) => {
                  const on = p.n === e.paso;
                  return (
                    <button
                      key={p.n}
                      onClick={() => set({ paso: p.n, ...(p.n >= 3 ? { equipoOk: true } : {}) })}
                      className="whitespace-nowrap rounded-md font-semibold"
                      style={{
                        fontSize: 11.5, padding: "6px 10px",
                        color: on ? "#101A22" : C.suave,
                        background: on ? C.amarillo : "transparent",
                        border: "1px solid " + (on ? C.amarillo : C.lineaSuave),
                      }}
                    >
                      {String(p.n).padStart(2, "0")} {p.rot}
                    </button>
                  );
                })}
              </div>
              <Celular e={e} api={api} />
            </div>

            {/* notas de diseño */}
            <div>
              <div className="rounded-lg p-5" style={{ background: C.panel, border: "1px solid " + C.lineaSuave }}>
                <div className="uppercase font-semibold" style={{ fontSize: 10, letterSpacing: "0.14em", color: C.amarillo }}>
                  Pantalla {String(e.paso).padStart(2, "0")} · {PASOS.find((p) => p.n === e.paso).rot}
                </div>
                <h3 className="mt-2 font-semibold leading-snug" style={{ fontSize: 19, letterSpacing: "-0.01em" }}>
                  {nota.titulo}
                </h3>
                <p style={{ fontSize: 13.5, color: C.suave, lineHeight: 1.65, marginTop: 10 }}>{nota.cuerpo}</p>
                <div className="mt-5 pt-4 flex flex-col" style={{ borderTop: "1px solid " + C.lineaSuave, gap: 10 }}>
                  {nota.reglas.map((r, i) => (
                    <div key={i} className="flex" style={{ gap: 9 }}>
                      <span style={{ width: 4, height: 4, borderRadius: 2, background: C.amarillo, marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: C.texto, lineHeight: 1.55, opacity: 0.9 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-lg p-5" style={{ background: C.panel, border: "1px solid " + C.lineaSuave }}>
                <div className="uppercase font-semibold" style={{ fontSize: 10, letterSpacing: "0.14em", color: C.suave }}>
                  Cómo probarlo
                </div>
                <div className="mt-3 flex flex-col" style={{ gap: 8, fontSize: 12.5, color: C.suave, lineHeight: 1.6 }}>
                  <span>En la pantalla 04, cambia el <span style={{ color: C.texto }}>Total gallons</span> a 1.865 y mira el aviso del salto.</span>
                  <span>En la pantalla 06, escribe una tanda que no cuadre con lo que subió el totalizador.</span>
                  <span>En la pantalla 06, pon un horómetro menor a 1.086,5.</span>
                  <span>Toca <span style={{ color: C.texto }}>00 Bienvenida</span> arriba para volver a ver la pantalla de marca.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 pt-5" style={{ borderTop: "1px solid " + C.lineaSuave }}>
          <div style={{ fontSize: 11, color: C.suave, lineHeight: 1.6 }}>
            Cuadre · un servicio de Lubryco para sus clientes industriales · sin costo ·
            interfaz oscura para ahorrar batería en jornada larga; si el sol del mediodía la vuelve ilegible,
            se agrega un modo de alto contraste con fondo claro.
          </div>
        </footer>
      </main>
    </div>
  );
}
