// Manifiesto de capturas: la ÚNICA fuente de verdad de qué se captura,
// con qué medidas y para qué manual.
//
// De aquí salen dos cosas y por eso no puede vivir en un documento:
//   1. Lo que el arnés captura (scripts/capturar-pantallas.mjs).
//   2. El catálogo que lee Claude Design
//      (docs/training/12_Capturas/CATALOGO.md, generado).
//
// Si estuviera escrito a mano en el markdown, el día que alguien
// agregue una captura tendría que acordarse de editar los dos, y no se
// acuerda nunca. Aquí se edita una vez.

/** Dispositivos de captura. Medidas reales, no aproximadas. */
export const DISPOSITIVOS = {
  escritorio: {
    etiqueta: "Escritorio",
    viewport: { width: 1440, height: 900 },
    aspecto: "16:10",
    escala: 2,
    nota: "Resolución de trabajo de un supervisor o del administrador.",
  },
  android: {
    etiqueta: "Android",
    viewport: { width: 412, height: 915 },
    aspecto: "9:19.5",
    escala: 3,
    nota: "Gama media típica de planta (Motorola G, Samsung A).",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; moto g54 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  },
  iphone: {
    etiqueta: "iPhone",
    viewport: { width: 390, height: 844 },
    aspecto: "9:19.5",
    escala: 3,
    nota: "iPhone 12–15 en Safari, instalada en pantalla de inicio.",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  },
};

/**
 * Estados de una captura:
 *   automatica — la produce el arnés hoy, sin infraestructura.
 *   sembrada   — necesita una base sembrada o un teléfono real.
 *   manual     — depende del sistema operativo o del hardware.
 */
export const CAPTURAS = [
  /* ---------- Dashboard del cliente (supervisor) ---------- */
  {
    archivo: "dsh-01_hoy.png",
    pantalla: "DSH-01",
    titulo: "Hoy — veredicto del día",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/hoy",
    momento: "S-01",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-02_cargas.png",
    pantalla: "DSH-02",
    titulo: "Cargas — lista y filtros",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/cargas",
    momento: "S-02",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-03_evidencia-medidor.png",
    pantalla: "DSH-03",
    titulo: "Evidencia de una carga con medidor",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/cargas/demo-002",
    momento: "S-02",
    manuales: ["SUP-MD"],
    estado: "automatica",
  },
  {
    archivo: "dsh-04_evidencia-inventario.png",
    pantalla: "DSH-04",
    titulo: "Evidencia de una carga sobre inventario",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/cargas/ci-002",
    escenario: "ci",
    momento: "S-02",
    manuales: ["SUP-CI"],
    estado: "automatica",
    nota: "Las fotos del carrotanque salen vacías a propósito: la fotografía real es de la visita a planta (orden fotográfica).",
  },
  {
    archivo: "dsh-05_equipos.png",
    pantalla: "DSH-05",
    titulo: "Equipos — consumo y desvíos",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/equipos",
    momento: "S-04",
    manuales: ["SUP-MD"],
    estado: "automatica",
  },
  {
    archivo: "dsh-06_suministro.png",
    pantalla: "DSH-06",
    titulo: "Suministro — balance y autonomía",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/suministro",
    momento: "S-05",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-07_entrar.png",
    pantalla: "DSH-07",
    titulo: "Entrar al Dashboard",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/entrar",
    sinSesion: true,
    momento: "S-00",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-08_crear-contrasena.png",
    pantalla: "DSH-08",
    titulo: "Crea tu contraseña (primer ingreso)",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/contrasena-nueva",
    momento: "S-00",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
    nota: "Capturada tras recarga: muestra también el campo «Contraseña actual». En el primer ingreso real ese campo no aparece (la temporal viaja en memoria).",
  },
  {
    archivo: "dsh-09_cambiar-contrasena.png",
    pantalla: "DSH-09",
    titulo: "Cambiar contraseña (voluntario)",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/contrasena",
    momento: "S-08",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-10_recuperar.png",
    pantalla: "DSH-10",
    titulo: "Recuperar acceso (olvidé mi contraseña)",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/recuperar",
    sinSesion: true,
    momento: "S-08",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-11_bienvenida.png",
    pantalla: "DSH-11",
    titulo: "Bienvenida — cliente sin cargas (medidor)",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/hoy",
    escenario: "md0",
    momento: "S-09",
    manuales: ["SUP-MD"],
    estado: "automatica",
  },
  {
    archivo: "dsh-12_bienvenida-inventario.png",
    pantalla: "DSH-11",
    titulo: "Bienvenida — cliente sin cargas (inventario)",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/hoy",
    escenario: "ci0",
    momento: "S-09",
    manuales: ["SUP-CI"],
    estado: "automatica",
  },
  {
    archivo: "dsh-13_acceso-desactivado.png",
    pantalla: "DSH-12",
    titulo: "Acceso desactivado — aviso en el login",
    app: "dashboard",
    dispositivo: "escritorio",
    ruta: "/entrar?motivo=desactivado",
    sinSesion: true,
    momento: "S-08",
    manuales: ["SUP-MD", "SUP-CI"],
    estado: "automatica",
  },

  /* ---------- Consola Admin ---------- */
  {
    archivo: "adm-01_entrar.png",
    pantalla: "ADM-01",
    titulo: "Entrar a la consola",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/entrar",
    momento: "A-07",
    manuales: ["ADM"],
    estado: "automatica",
    sinSesion: true,
  },
  {
    archivo: "adm-02_resumen.png",
    pantalla: "ADM-02",
    titulo: "Resumen — alertas de la plataforma",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/resumen",
    momento: "A-07",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-03_cargas.png",
    pantalla: "ADM-03",
    titulo: "Cargas de todos los clientes",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/cargas",
    momento: "A-07",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-04_clientes.png",
    pantalla: "ADM-04",
    titulo: "Clientes — lista maestra",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/clientes",
    momento: "A-01",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-05_ficha-identidad.png",
    pantalla: "ADM-05",
    titulo: "Ficha del cliente — Identidad",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/clientes/cli-001/identidad",
    momento: "A-01",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-06_ficha-configuracion.png",
    pantalla: "ADM-06",
    titulo: "Ficha del cliente — Configuración",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/clientes/cli-001/configuracion",
    momento: "A-06",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-07_ficha-operacion.png",
    pantalla: "ADM-07",
    titulo: "Ficha del cliente — Operación",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/clientes/cli-001/operacion",
    momento: "A-01",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-08_ficha-dashboard.png",
    pantalla: "ADM-08",
    titulo: "Ficha del cliente — Dashboard",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/clientes/cli-001/dashboard",
    momento: "A-07",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-09_equipos.png",
    pantalla: "ADM-09",
    titulo: "Equipos — vista global",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/equipos",
    momento: "A-02",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-10_operadores.png",
    pantalla: "ADM-10",
    titulo: "Operadores — vista global",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/operadores",
    momento: "A-03",
    manuales: ["ADM"],
    estado: "automatica",
  },
  {
    archivo: "adm-11_dispositivos.png",
    pantalla: "ADM-11",
    titulo: "Dispositivos y códigos de enrolamiento",
    app: "admin",
    dispositivo: "escritorio",
    ruta: "/dispositivos",
    momento: "A-04",
    manuales: ["ADM"],
    estado: "automatica",
  },

  /* ---------- PWA del operador ---------- */
  ...pwa("and", "android", ["OP-AND-MD", "OP-AND-CI"]),
  ...pwa("ios", "iphone", ["OP-IOS-MD", "OP-IOS-CI"]),
];

/**
 * Las 17 pantallas de la PWA, por plataforma. Se generan porque las dos
 * plataformas recorren exactamente el mismo flujo: escribirlas dos
 * veces garantizaría que un día se desincronicen.
 */
function pwa(prefijo, dispositivo, [manualMd, manualCi]) {
  const ambos = [manualMd, manualCi];
  const filas = [
    ["01_splash", "PWA-01", "Splash de arranque", "M-MD-00", ambos, "sembrada"],
    ["02_enrolar", "PWA-02", "Enrolar el teléfono", "M-MD-00", ambos, "automatica"],
    [
      "03_inicio",
      "PWA-03",
      "Inicio del operador",
      "M-MD-00",
      ambos,
      "automatica",
      "Capturada sin instalar: por eso salen el aviso de instalación y el de persistencia. En un teléfono con la app instalada no aparecen — el diseñador puede recortarlos o pedir la variante instalada.",
    ],
    ["03b_inicio-offline", "PWA-03", "Inicio sin señal — «En cola»", "M-OP-E3", ambos, "sembrada"],
    ["04_equipo-lista", "PWA-04", "Elegir el equipo", "M-MD-01", ambos, "automatica"],
    ["05_equipo-confirma", "PWA-05", "Confirmar el equipo", "M-MD-01", ambos, "automatica"],
    ["06_operador-codigo", "PWA-06", "Código del operador", "M-MD-02", ambos, "automatica"],
    ["07_operador-pin", "PWA-07", "Clave de cuatro dígitos", "M-MD-02", ambos, "automatica"],
    ["08_antes", "PWA-08", "Captura inicial del medidor", "M-MD-02", [manualMd], "manual"],
    ["09_cargando", "PWA-09", "Cronómetro de la carga", "M-MD-03", ambos, "manual"],
    ["10_despues", "PWA-10", "Captura final del medidor", "M-MD-04", [manualMd], "manual"],
    ["11_llegada", "PWA-11", "Galones con los que llegó", "M-CI-02", [manualCi], "manual"],
    ["12_despacho", "PWA-12", "Galones despachados y total", "M-CI-04", [manualCi], "manual"],
    ["13_listo", "PWA-13", "Carga registrada — medidor", "M-MD-05", [manualMd], "manual"],
    ["13b_listo-inventario", "PWA-13", "Carga registrada — inventario", "M-CI-05", [manualCi], "manual"],
    ["14_diagnostico", "PWA-14", "Diagnóstico del dispositivo", "M-OP-E4", ambos, "automatica"],
    ["15_instalar", "PWA-15", "Instalar en el teléfono", "M-MD-00", ambos, "manual"],
  ];

  // Todo lo que viene DESPUÉS de la primera pantalla de cámara queda
  // fuera del arnés: para llegar hay que haber tomado una fotografía, y
  // una cámara simulada no produce un medidor sino un patrón de prueba.
  const trasLaCamara =
    "Está después de la primera fotografía del flujo: se toma en planta, con el teléfono real.";

  const extra =
    prefijo === "ios"
      ? [
          {
            archivo: "ios-14b_diagnostico-persistencia.png",
            pantalla: "PWA-14",
            titulo: "Diagnóstico — almacenamiento protegido",
            app: "pwa",
            dispositivo,
            ruta: "/diagnostico",
            momento: "M-OP-E4",
            manuales: ambos,
            estado: "sembrada",
            bloqueo: "Solo se puede mostrar en un iPhone real: el valor lo decide el sistema operativo.",
          },
        ]
      : [];

  return [
    ...filas.map(([sufijo, pantalla, titulo, momento, manuales, estado, nota]) => ({
      archivo: `${prefijo}-${sufijo}.png`,
      pantalla,
      titulo,
      app: "pwa",
      dispositivo,
      ruta: "—",
      momento,
      manuales,
      estado,
      nota,
      bloqueo:
        estado === "automatica"
          ? undefined
          : estado === "manual"
            ? sufijo.includes("antes") ||
              sufijo.includes("despues") ||
              sufijo.includes("llegada") ||
              sufijo.includes("despacho")
              ? "Es una pantalla de cámara: una cámara simulada mostraría un patrón de prueba, no un medidor."
              : sufijo.includes("instalar")
                ? "El aviso de instalación lo dibuja el sistema operativo, no la aplicación."
                : trasLaCamara
            : "Se ve durante un instante o requiere estado acumulado en el teléfono.",
    })),
    ...extra,
  ];
}

export const APPS = {
  dashboard: { puerto: 5174, filtro: "@cuadreapp/dashboard", carpeta: "Supervisores" },
  admin: { puerto: 5175, filtro: "@cuadreapp/admin", carpeta: "Admin" },
  pwa: { puerto: 5173, filtro: "@cuadreapp/pwa", carpeta: "Operadores" },
};
