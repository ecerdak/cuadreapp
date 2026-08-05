// Datos de los siete storyboards, y el generador de sus documentos.
//
// Se generan en vez de escribirse a mano porque los cuatro videos de
// operador son el mismo guion con dos variables (plataforma y perfil):
// escritos a mano, el día que cambie una escena se corrigen tres y se
// olvida el cuarto. Aquí la escena se escribe una vez.
//
// Correr: node scripts/capturas/storyboards.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DESTINO = new URL("../../docs/training/08_Storyboards/", import.meta.url).pathname;

/* ============ Convenciones de rodaje ============ */

const CONVENCIONES = `## Convenciones de rodaje

Valen para las siete piezas. Una escena solo declara lo que se aparta de aquí.

| | |
| --- | --- |
| **Pausas** | 0,4 s de silencio entre escenas. Antes de una cifra o de una prohibición, 0,8 s. El silencio es lo que da tiempo a entender. |
| **Transiciones** | Corte seco entre escenas del mismo lugar. Fundido a negro de 0,3 s solo al cambiar de lugar (planta ↔ pantalla). Cero transiciones decorativas. |
| **Movimiento** | Cámara fija salvo donde se indique. Ningún movimiento sin motivo: en un video de instrucción, la cámara que se mueve compite con lo que hay que aprender. |
| **Ritmo** | Ninguna escena baja de 8 s. Una escena de 4 s no se alcanza a leer con ruido de planta de fondo. |
| **Audio** | Sin música con letra. La voz tiene que ganarle al ruido de la planta. |
| **Subtítulos** | Quemados siempre: muchos lo verán sin audio. |
| **Fotograma congelado** | Cada escena debe funcionar como imagen fija. Si alguien pausa, la pantalla se explica sola. |
| **Datos** | Los de demostración, los mismos de las capturas. Nunca datos de un cliente real. |`;

const NOTAS = `## Notas de producción

- **Grabación real de pantalla**, no animación de mockups: el operador tiene que reconocer exactamente lo que verá.
- **Las escenas de campo se graban en la misma visita que las fotografías** del [\`inventario-fotografico.md\`](../00_Fuente/inventario-fotografico.md). Es una sola coordinación con el cliente, no dos.
- **Los planos «mal hechos» se graban a propósito** y con cuidado: tienen que parecer el error real de alguien apurado, no una parodia.
- **Sin personas identificables sin autorización escrita.**

## Reglas de narración

1. **Tutear al operador, usted al supervisor y al administrador.** Es como se les habla en la planta.
2. **Nunca decir el nombre de una pantalla.** Se dice qué se hace, no dónde.
3. **Una idea por escena.** Si la narración necesita un «y además», falta una escena.
4. **Las cifras se dicen completas** («ciento cincuenta galones»), nunca leídas dígito a dígito.
5. **Cerrar con el tiempo real.** «Cuarenta segundos» es la promesa que hace que alguien lo intente.`;

/* ============ Guiones ============ */

const opMedidor = (plataforma) => {
  const iphone = plataforma === "iPhone";
  const p = iphone ? "ios" : "and";
  return {
    objetivo:
      "Que un operador que nunca ha usado la aplicación registre su primera carga solo, sin ayuda, el mismo día que ve el video.",
    momentos: "`M-MD-00` a `M-MD-05`, más `M-OP-E3` (sin señal)",
    duracion: iphone ? "3:15" : "3:05",
    formato: "Vertical 9:16 — se ve en el celular",
    escenas: [
      {
        objetivo: "Que se quede a ver los tres minutos",
        narracion:
          "Registrar una carga toma unos cuarenta segundos, con o sin señal. Te muestro cómo, de principio a fin.",
        plano: "Plano general del surtidor con un tractor llegando",
        movimiento: "Fija",
        imagen: "`F-01`, `F-09`",
        duracion: "0:00–0:08",
        animacion: "Logotipo con fundido de entrada",
        texto: "—",
        cierre: "Fundido a negro 0,3 s",
      },
      {
        objetivo: "Que la app quede instalada, no abierta en el navegador",
        narracion: iphone
          ? "En iPhone se instala solo desde Safari. Toca Compartir y después «Añadir a pantalla de inicio». Se hace una sola vez."
          : "Toca el botón amarillo. Si no aparece, entra al menú de tres puntos y toca «Agregar a la pantalla principal».",
        plano: "Grabación de pantalla",
        movimiento: iphone ? "Fija — esta escena no se puede acelerar" : "Fija",
        imagen: `\`${p}-15_instalar\``,
        duracion: iphone ? "0:08–0:28" : "0:08–0:25",
        animacion: "Velocidad normal, punto de toque resaltado con un círculo",
        texto: iphone ? "SOLO DESDE SAFARI" : "INSTALAR: UNA SOLA VEZ",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que sepa de dónde sale el código",
        narracion:
          "La primera vez, tu supervisor te da un código. Lo escribes aquí y aceptas cámara y ubicación. Esto se hace una sola vez.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-02_enrolar\``,
        duracion: iphone ? "0:28–0:43" : "0:25–0:40",
        animacion: "Escritura simulada; los diálogos de permiso aparecen y se aceptan",
        texto: "EL CÓDIGO LO DA TU SUPERVISOR",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que reconozca su pantalla de todos los días",
        narracion:
          "Esta es tu pantalla de todos los días. Un solo botón para empezar. Arriba ves si todo subió.",
        plano: "Plano medio del operador con el teléfono, frente al surtidor",
        movimiento: "Fija",
        imagen: `\`${p}-03_inicio\`, \`F-10\``,
        duracion: iphone ? "0:43–0:55" : "0:40–0:52",
        animacion: "Zoom lento al botón principal; después al aviso verde",
        texto: "—",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que verifique contra el sticker antes de confirmar",
        narracion:
          "Primero: qué equipo vas a cargar. Escribe las primeras letras del código del sticker y confirma.",
        plano: "Plano detalle del sticker → grabación de pantalla",
        movimiento: "Corte entre los dos, sin movimiento",
        imagen: `\`F-08\`, \`${p}-04_equipo-lista\`, \`${p}-05_equipo-confirma\``,
        duracion: iphone ? "0:55–1:11" : "0:52–1:08",
        animacion: "Escritura en el buscador, lista filtrándose, transición a la tarjeta verde",
        texto: "MIRA EL STICKER DE LA MÁQUINA",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que entienda que la clave funciona sin señal",
        narracion:
          "Segundo: quién eres. Tu código y tu clave de cuatro dígitos. Esto funciona aunque no haya señal.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-06_operador-codigo\`, \`${p}-07_operador-pin\``,
        duracion: iphone ? "1:11–1:25" : "1:08–1:22",
        animacion: "Los cuatro puntos llenándose uno a uno",
        texto: "—",
        cierre: "Fundido a negro 0,3 s",
      },
      {
        objetivo: "**La escena que sostiene el video**: que la tanda quede en cero",
        narracion:
          "Tercero, y es el paso más importante: deja la tanda en cero punto cero, gira la perilla, y toma la foto. Una sola foto muestra los dos números.",
        plano:
          "Plano detalle de la mano en la perilla → plano sobre el hombro con pantalla y medidor en el mismo cuadro",
        movimiento:
          "**Sin cortes durante el giro de la perilla.** El gesto se ve entero o no se aprende",
        imagen: `\`F-04\`, \`F-02\`, \`${p}-08_antes\``,
        duracion: iphone ? "1:25–1:48" : "1:22–1:45",
        animacion:
          "Video real del medidor girando a 0.0; después el marco de la captura pasando de amarillo a verde",
        texto: "TANDA EN 0.0",
        cierre: "Pausa de 0,8 s antes de cortar",
      },
      {
        objetivo: "Que distinga tanda de totalizador y no se detenga ante el aviso",
        narracion:
          "Copia los dos números tal como se ven. Si sale un aviso amarillo, no te detiene: puedes seguir y queda anotado.",
        plano: "Grabación de pantalla, recorte de los campos",
        movimiento: "Fija",
        imagen: `\`${p}-08_antes\`, zooms \`Z-04\`, \`Z-05\`, \`Z-06\``,
        duracion: iphone ? "1:48–2:01" : "1:45–1:58",
        animacion:
          "Los números apareciendo dígito a dígito; el aviso amarillo entrando y el botón habilitándose",
        texto: "ARRIBA: TANDA · ABAJO: TOTALIZADOR",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que no toque «terminé» antes de tiempo",
        narracion:
          "Cuarto: carga el combustible. El cronómetro corre solo. Toca «Terminé de cargar» solo cuando hayas terminado de verdad.",
        plano: "Plano medio del despacho en curso",
        movimiento: "Fija",
        imagen: `\`${p}-09_cargando\``,
        duracion: iphone ? "2:01–2:13" : "1:58–2:10",
        animacion: "Cronómetro corriendo acelerado",
        texto: "—",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que cierre la carga completa",
        narracion:
          "Quinto: la segunda foto y los dos números del cierre. Si aparece en verde que cuadra, ya está.",
        plano: "Plano detalle de la carátula → grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`F-03\`, \`${p}-10_despues\``,
        duracion: iphone ? "2:13–2:33" : "2:10–2:30",
        animacion: "Captura de foto; números apareciendo; aviso verde entrando",
        texto: "—",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que sepa qué hacer con cada uno de los tres sellos",
        narracion:
          "Listo. Ya quedó registrada. Si dice «Cuadra», todo bien. Si dice «Revisar» o «No cuadra», coméntaselo al supervisor hoy.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-13_listo\`, zoom \`Z-13\``,
        duracion: iphone ? "2:33–2:48" : "2:30–2:45",
        animacion: "Los tres sellos posibles apareciendo en secuencia",
        texto: "CUADRA / REVISAR / NO CUADRA",
        cierre: "Pausa de 0,8 s",
      },
      {
        objetivo: "Que nunca repita una carga por falta de señal",
        narracion:
          "Y si no había señal, también quedó guardada. Sube sola cuando vuelva la red. Nunca registres la misma carga dos veces.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-03b_inicio-offline\`, zooms \`Z-41\`, \`Z-42\``,
        duracion: iphone ? "2:48–3:03" : "2:45–2:58",
        animacion: "El aviso cambiando de «En cola» a «Todo sincronizado»",
        texto: "SIN SEÑAL TAMBIÉN QUEDA",
        cierre: "Corte seco",
      },
      {
        objetivo: "Dejar la sensación de que esto se domina hoy",
        narracion: "Eso es todo. Cuarenta segundos, con o sin señal.",
        plano: "Plano general del surtidor, el mismo de la escena 1",
        movimiento: "Fija",
        imagen: "`F-01`, `F-90`",
        duracion: iphone ? "3:03–3:15" : "2:58–3:05",
        animacion: "Cierre con marca",
        texto: iphone ? "NUNCA BORRES LOS DATOS DE SAFARI" : "—",
        cierre: "Fundido a negro",
      },
    ],
  };
};

const opInventario = (plataforma) => {
  const iphone = plataforma === "iPhone";
  const p = iphone ? "ios" : "and";
  return {
    objetivo:
      "Que quede grabado a fuego que el operador escribe dos números y la aplicación calcula el tercero.",
    momentos: "`M-CI-00` a `M-CI-05`, más `M-OP-E3` (sin señal)",
    duracion: iphone ? "3:00" : "2:50",
    formato: "Vertical 9:16 — se ve en el celular",
    escenas: [
      {
        objetivo: "Que se quede a ver el video",
        narracion:
          "Registrar un carrotanque toma menos de un minuto. Escribes dos números y la aplicación hace el resto.",
        plano: "Plano general del carrotanque entrando a la estación",
        movimiento: "Fija",
        imagen: "`F-20`, `F-26`",
        duracion: "0:00–0:09",
        animacion: "Logotipo con fundido de entrada",
        texto: "—",
        cierre: "Fundido a negro 0,3 s",
      },
      {
        objetivo: "Que la app quede instalada",
        narracion: iphone
          ? "En iPhone se instala solo desde Safari: Compartir, «Añadir a pantalla de inicio». Una sola vez."
          : "Instálala desde el botón amarillo, o desde el menú de tres puntos. Una sola vez.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-15_instalar\``,
        duracion: "0:09–0:24",
        animacion: "Velocidad normal, punto de toque resaltado",
        texto: iphone ? "SOLO DESDE SAFARI" : "INSTALAR: UNA SOLA VEZ",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que sepa de dónde sale el código",
        narracion: "Tu supervisor te da un código. Lo escribes y aceptas cámara y ubicación.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-02_enrolar\``,
        duracion: "0:24–0:38",
        animacion: "Escritura simulada; permisos aceptándose",
        texto: "—",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que reconozca su pantalla diaria",
        narracion: "Esta es tu pantalla de todos los días. Un botón para empezar.",
        plano: "Plano medio del operador junto al carrotanque",
        movimiento: "Fija",
        imagen: `\`${p}-03_inicio\`, \`F-25\``,
        duracion: "0:38–0:50",
        animacion: "Zoom lento al botón principal",
        texto: "—",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que mire la placa antes de confirmar",
        narracion: "Primero: qué vehículo es. Búscalo por su placa y confirma mirando el vehículo.",
        plano: "Plano detalle de la placa → grabación de pantalla",
        movimiento: "Corte entre los dos",
        imagen: `\`F-21\`, \`${p}-04_equipo-lista\`, \`${p}-05_equipo-confirma\``,
        duracion: "0:50–1:04",
        animacion: "Lista filtrándose, transición a la tarjeta verde",
        texto: "MIRA LA PLACA",
        cierre: "Corte seco",
      },
      {
        objetivo: "**La escena que sostiene el video**: la cifra de llegada",
        narracion:
          "Segundo, y es lo más importante: con cuántos galones llegó. Ese número es lo que el vehículo ya traía, no lo que vas a despachar. Si llegó vacío, escribe cero.",
        plano: "Plano general del carrotanque completo → grabación de pantalla",
        movimiento: "**Sin cortes mientras se escribe la cifra**",
        imagen: `\`F-20\`, \`${p}-11_llegada\`, zoom \`Z-22\``,
        duracion: "1:04–1:26",
        animacion: "La foto tomándose; el número apareciendo dígito a dígito",
        texto: "ESCRIBE CON CUÁNTO LLEGÓ · SI LLEGÓ VACÍO: 0,0",
        cierre: "Pausa de 0,8 s antes de cortar",
      },
      {
        objetivo: "Que no toque «terminé» antes de desconectar",
        narracion: "Tercero: despacha. El cronómetro corre solo. Toca «Terminé» solo al terminar.",
        plano: "Plano del acople de la manguera",
        movimiento: "Fija",
        imagen: `\`F-22\`, \`${p}-09_cargando\``,
        duracion: "1:26–1:40",
        animacion: "Cronómetro corriendo acelerado",
        texto: "—",
        cierre: "Corte seco",
      },
      {
        objetivo: "**La escena decisiva**: que se vea que el total se calcula solo",
        narracion:
          "Cuarto: la segunda foto y solo los galones que despachó Lubryco. Mira lo que pasa abajo: la aplicación suma sola.",
        plano: "Grabación de pantalla, recorte del bloque de tres cifras",
        movimiento: "**Sin cortes mientras el total se calcula.** Es lo único que hay que ver",
        imagen: `\`${p}-12_despacho\`, zooms \`Z-23\`, \`Z-24\``,
        duracion: "1:40–2:06",
        animacion: "Las tres líneas llenándose en cascada: llegada, despacho, total",
        texto: "EL TOTAL LO CALCULA LA APP",
        cierre: "Pausa de 0,8 s",
      },
      {
        objetivo: "Cerrar la duda de una vez",
        narracion: "Tú nunca escribes el total. No existe dónde escribirlo, y es a propósito.",
        plano: "Grabación de pantalla, el bloque de tres cifras congelado",
        movimiento: "Fija",
        imagen: "zoom `Z-24`",
        duracion: "2:06–2:16",
        animacion: "Ninguna. Imagen fija — es el único fotograma sin movimiento del video",
        texto: "USTED ESCRIBE DOS NÚMEROS",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que sepa qué hacer con cada sello",
        narracion:
          "Listo. Si dice «Cuadra», sigue con el siguiente. Si dice «Revisar» o «No cuadra», coméntaselo al supervisor hoy.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-13b_listo-inventario\`, zoom \`Z-26\``,
        duracion: "2:16–2:32",
        animacion: "Los tres sellos posibles en secuencia",
        texto: "CUADRA / REVISAR / NO CUADRA",
        cierre: "Corte seco",
      },
      {
        objetivo: "Que nunca repita una carga",
        narracion:
          "Sin señal también queda guardada y sube sola. Nunca registres el mismo vehículo dos veces.",
        plano: "Grabación de pantalla",
        movimiento: "Fija",
        imagen: `\`${p}-03b_inicio-offline\``,
        duracion: "2:32–2:44",
        animacion: "El aviso cambiando de «En cola» a «Todo sincronizado»",
        texto: "SIN SEÑAL TAMBIÉN QUEDA",
        cierre: "Corte seco",
      },
      {
        objetivo: "Cerrar con la promesa cumplida",
        narracion: "Eso es todo. Dos números y una foto en cada punta.",
        plano: "Plano general del carrotanque saliendo",
        movimiento: "Fija",
        imagen: "`F-27`, `F-90`",
        duracion: iphone ? "2:44–3:00" : "2:44–2:50",
        animacion: "Cierre con marca",
        texto: iphone ? "NUNCA BORRES LOS DATOS DE SAFARI" : "—",
        cierre: "Fundido a negro",
      },
    ],
  };
};

const supMedidor = {
  objetivo:
    "Que un supervisor entienda que su rutina diaria son cinco minutos, y que «no cuadra» no es una acusación.",
  momentos: "`S-01` a `S-07`, con énfasis en `S-06`",
  duracion: "3:10",
  formato: "Horizontal 16:9 — se ve en un escritorio",
  escenas: [
    {
      objetivo: "Prometer que esto cuesta cinco minutos al día",
      narracion:
        "Controlar el combustible de una planta no debería tomar una mañana. Le muestro cómo se hace en cinco minutos.",
      plano: "Plano medio del supervisor en su oficina",
      movimiento: "Fija",
      imagen: "`F-41`",
      duracion: "0:00–0:12",
      animacion: "Entrada con fundido",
      texto: "CINCO MINUTOS AL DÍA",
      cierre: "Fundido a negro 0,3 s",
    },
    {
      objetivo: "Que en verde no revise nada más",
      narracion:
        "Lo primero y muchas veces lo único: la frase de arriba. Si está en verde, las cargas de hoy cuadran y no hay nada que hacer.",
      plano: "Grabación de pantalla",
      movimiento: "Zoom lento al veredicto",
      imagen: "`dsh-01_hoy`, zoom `Z-60`",
      duracion: "0:12–0:32",
      animacion: "El veredicto entrando; los tres tonos en secuencia",
      texto: "VERDE: NO HAY NADA QUE HACER",
      cierre: "Corte seco",
    },
    {
      objetivo: "Enseñar a leer el semáforo de las cargas",
      narracion: "Si algo está marcado, está abajo, con su color y su hora.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`dsh-01_hoy`, zoom `Z-62`",
      duracion: "0:32–0:46",
      animacion: "Las filas apareciendo con su color",
      texto: "—",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que abra las fotos antes que cualquier número",
      narracion:
        "Abra la carga marcada y mire las dos fotografías antes que cualquier número. Están tomadas en el momento, con su hora.",
      plano: "Grabación de pantalla, detalle de las dos fotos",
      movimiento: "**Sostener más de lo cómodo.** Es la prueba, y tiene que sentirse como tal",
      imagen: "`dsh-03_evidencia-medidor`, zoom `Z-64`",
      duracion: "0:46–1:10",
      animacion: "Las dos fotos ampliándose",
      texto: "PRIMERO LAS FOTOS",
      cierre: "Pausa de 0,8 s",
    },
    {
      objetivo: "Que sepa qué revisa la máquina por él",
      narracion:
        "Debajo, las tres verificaciones que el sistema hace solo: que la tanda arrancó en cero, que el totalizador continúa donde quedó, y que las cuentas cierran.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`dsh-03_evidencia-medidor`, zoom `Z-65`",
      duracion: "1:10–1:30",
      animacion: "Las tres verificaciones apareciendo una a una",
      texto: "—",
      cierre: "Fundido a negro 0,3 s",
    },
    {
      objetivo: "**La escena más importante del video**: desactivar la acusación",
      narracion:
        "Y aquí lo más importante de todo este video. «No cuadra» casi nunca es un robo. Es, en este orden: un dígito mal copiado, o una carga que alguien hizo sin abrir la aplicación.",
      plano: "Grabación de pantalla congelada sobre el mensaje",
      movimiento: "**Fija, sin ningún movimiento.** El único momento del video sin animación",
      imagen: "`dsh-03_evidencia-medidor`, zoom `Z-66`",
      duracion: "1:30–1:56",
      animacion: "Ninguna",
      texto: "1. DÍGITO MAL COPIADO  2. CARGA SIN REGISTRAR  3. TODO LO DEMÁS",
      cierre: "Pausa de 1,0 s — la más larga del video",
    },
    {
      objetivo: "Explicar por qué un salto no es faltante",
      narracion:
        "Si el medidor arrancó más arriba de lo esperado, esos galones ya los contó. El combustible salió; lo que falta es saber a qué equipo fue. Pregunte quién cargó sin la aplicación ese día.",
      plano: "Grabación de pantalla",
      movimiento: "Zoom lento al contador del medidor",
      imagen: "`dsh-01_hoy`, zoom `Z-61`",
      duracion: "1:56–2:18",
      animacion: "El contador resaltándose",
      texto: "EL MEDIDOR YA CONTÓ ESOS GALONES",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que llame al taller antes que a la persona",
      narracion:
        "Semanalmente, los equipos. Un consumo que sube casi siempre es inyectores, filtros o motor encendido en las esperas. Taller antes que conversación.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`dsh-05_equipos`, zoom `Z-68`",
      duracion: "2:18–2:38",
      animacion: "La fila con desvío resaltándose",
      texto: "TALLER ANTES QUE CONVERSACIÓN",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que no confunda una estimación con una medición",
      narracion:
        "Y la autonomía: cuántos días quedan al ritmo actual. Es una estimación por balance, con un margen de dos por ciento. No es una medición del tanque.",
      plano: "Plano del tanque de la planta → grabación de pantalla",
      movimiento: "Corte entre los dos",
      imagen: "`F-42`, `dsh-06_suministro`, zoom `Z-69`",
      duracion: "2:38–2:58",
      animacion: "Los días de autonomía apareciendo",
      texto: "ES UNA ESTIMACIÓN, ±2 %",
      cierre: "Corte seco",
    },
    {
      objetivo: "Cerrar con la rutina completa",
      narracion: "Eso es su día: leer una frase, y si hay algo marcado, abrir sus fotos. Cinco minutos.",
      plano: "Plano medio del supervisor, el mismo de la escena 1",
      movimiento: "Fija",
      imagen: "`F-41`, `F-90`",
      duracion: "2:58–3:10",
      animacion: "Cierre con marca",
      texto: "—",
      cierre: "Fundido a negro",
    },
  ],
};

const supInventario = {
  objetivo:
    "Que un supervisor sepa sustentar cada galón facturado y deje de comparar la guía contra el total.",
  momentos: "`S-01` a `S-07`, con énfasis en la comparación contra la guía",
  duracion: "2:55",
  formato: "Horizontal 16:9",
  escenas: [
    {
      objetivo: "Prometer cinco minutos al día",
      narracion:
        "Saber qué entregó Lubryco y a qué vehículo no debería tomar una mañana. Le muestro cómo se hace en cinco minutos.",
      plano: "Plano medio del supervisor en su oficina",
      movimiento: "Fija",
      imagen: "`F-41`",
      duracion: "0:00–0:12",
      animacion: "Entrada con fundido",
      texto: "CINCO MINUTOS AL DÍA",
      cierre: "Fundido a negro 0,3 s",
    },
    {
      objetivo: "Delimitar qué prueba esto y qué no",
      narracion:
        "Antes de nada: esto es un registro de despacho, no un aforo. Dice cuánto entregó Lubryco y a qué vehículo, con evidencia. No dice cuánto hay en ningún tanque.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`dsh-01_hoy`",
      duracion: "0:12–0:32",
      animacion: "Ninguna",
      texto: "ESTO ES DESPACHO, NO AFORO",
      cierre: "Pausa de 0,8 s",
    },
    {
      objetivo: "Que en verde cierre el día",
      narracion:
        "La frase de arriba. En verde, las cargas de hoy quedaron completas y no hay nada que hacer.",
      plano: "Grabación de pantalla",
      movimiento: "Zoom lento al veredicto",
      imagen: "`dsh-01_hoy`, zoom `Z-60`",
      duracion: "0:32–0:48",
      animacion: "El veredicto entrando; los tres tonos en secuencia",
      texto: "—",
      cierre: "Corte seco",
    },
    {
      objetivo: "**La escena decisiva**: que el total no es editable",
      narracion:
        "En cada carga hay tres cifras. Las dos primeras las escribió el operador y cada una tiene su fotografía. La tercera la calculó el sistema, y nadie la puede editar.",
      plano: "Grabación de pantalla, detalle del bloque de tres cifras",
      movimiento: "**Sostener.** Es lo único que hay que entender de este perfil",
      imagen: "`dsh-04_evidencia-inventario`, zoom `Z-67`",
      duracion: "0:48–1:16",
      animacion: "Las tres líneas resaltándose una a una; la tercera con un candado",
      texto: "EL TOTAL LO CALCULA EL SISTEMA · NADIE PUEDE EDITARLO",
      cierre: "Pausa de 1,0 s",
    },
    {
      objetivo: "Que las fotos sean lo primero que mire",
      narracion:
        "Y las dos fotografías, con su hora y la placa visible. Eso es lo que convierte un número en algo que se puede sustentar.",
      plano: "Grabación de pantalla, detalle de las fotos",
      movimiento: "Sostener",
      imagen: "`dsh-04_evidencia-inventario`",
      duracion: "1:16–1:36",
      animacion: "Las dos fotos ampliándose",
      texto: "—",
      cierre: "Fundido a negro 0,3 s",
    },
    {
      objetivo: "**Resolver la consulta más frecuente del perfil**",
      narracion:
        "Si la guía de remisión dice otro número, casi siempre es esto: se está comparando contra el total al salir. Compárela contra «despachado por Lubryco», que es lo único que entregamos nosotros.",
      plano: "Grabación de pantalla congelada, con las dos líneas marcadas",
      movimiento: "Fija",
      imagen: "`dsh-04_evidencia-inventario`, zoom `Z-67`",
      duracion: "1:36–2:04",
      animacion: "Una flecha tachada hacia el total; una flecha correcta hacia la línea de despacho",
      texto: "COMPARE CONTRA «DESPACHADO POR LUBRYCO»",
      cierre: "Pausa de 0,8 s",
    },
    {
      objetivo: "Que una foto faltante se atienda el mismo día",
      narracion:
        "Si falta una fotografía, llame al operador hoy. Mañana ya no recuerda ese vehículo, y la foto no se recupera.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`dsh-02_cargas`, zoom `Z-63`",
      duracion: "2:04–2:22",
      animacion: "El recuadro ámbar de foto faltante entrando",
      texto: "EL MISMO DÍA",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que revise días sin registros, no diferencias de galones",
      narracion:
        "Al cierre, revise el acumulado. Lo que hay que buscar no es una diferencia de galones: es un día de operación sin ninguna carga registrada.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`dsh-06_suministro`, zoom `Z-70`",
      duracion: "2:22–2:42",
      animacion: "El acumulado apareciendo",
      texto: "—",
      cierre: "Corte seco",
    },
    {
      objetivo: "Cerrar con la rutina",
      narracion: "Eso es su día: una frase, y las fotos de lo que quedó marcado.",
      plano: "Plano medio del supervisor",
      movimiento: "Fija",
      imagen: "`F-41`, `F-90`",
      duracion: "2:42–2:55",
      animacion: "Cierre con marca",
      texto: "—",
      cierre: "Fundido a negro",
    },
  ],
};

const admin = {
  objetivo:
    "Que el administrador ejecute una incorporación completa siguiendo el video, sin volver a preguntar.",
  momentos: "`A-01` completo, con referencias a `A-04` y `A-06`",
  duracion: "3:20",
  formato: "Horizontal 16:9",
  escenas: [
    {
      objetivo: "Enmarcar el proceso completo",
      narracion:
        "Poner un cliente a operar son ocho pasos y unos diez minutos. Empieza con una llamada comercial y termina con un operador cargando combustible.",
      plano: "Plano medio del administrador en su escritorio",
      movimiento: "Fija",
      imagen: "`F-43`",
      duracion: "0:00–0:15",
      animacion: "Entrada con fundido",
      texto: "OCHO PASOS · DIEZ MINUTOS",
      cierre: "Fundido a negro 0,3 s",
    },
    {
      objetivo: "Que reúna los datos antes de abrir la consola",
      narracion:
        "Antes de tocar nada: razón social, NIT, nombre comercial, logo bajo un mega, dos colores, y cómo opera esa planta.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`adm-04_clientes`",
      duracion: "0:15–0:33",
      animacion: "La lista apareciendo",
      texto: "—",
      cierre: "Corte seco",
    },
    {
      objetivo: "**La decisión con más consecuencias del proceso**",
      narracion:
        "El perfil operativo. Si hay medidor en el surtidor, es Medidor Doble. Si se despacha a carrotanques, es Carga sobre Inventario. Esto decide lo que verá el operador mañana.",
      plano: "Grabación de pantalla, detalle del selector",
      movimiento: "**Sostener.** Es la decisión que más cuesta corregir",
      imagen: "`adm-04_clientes`, zoom `Z-81`",
      duracion: "0:33–0:57",
      animacion: "El selector abriéndose y las dos opciones apareciendo",
      texto: "EL PERFIL DETERMINA LO QUE VE EL OPERADOR",
      cierre: "Pausa de 0,8 s",
    },
    {
      objetivo: "Que sepa explicar por qué solo hay dos colores",
      narracion:
        "Identidad: el logo y exactamente dos colores. Todo lo demás —bordes, sombras, estados, contraste del texto— lo deriva el sistema. Es lo que garantiza que ningún cliente quede con un tablero ilegible.",
      plano: "Grabación de pantalla, detalle de los campos de color y la vista previa",
      movimiento: "Zoom lento a la vista previa",
      imagen: "`adm-05_ficha-identidad`, zooms `Z-82`, `Z-83`",
      duracion: "0:57–1:22",
      animacion: "La vista previa cambiando en vivo al escribir el color",
      texto: "DOS COLORES. NADA MÁS.",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que nunca cree un cliente sin sede",
      narracion:
        "Al menos una sede, siempre. Aunque el cliente tenga una sola planta: es lo que permite crecer después sin migrar nada.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`adm-07_ficha-operacion`",
      duracion: "1:22–1:40",
      animacion: "El bloque de sedes apareciendo",
      texto: "—",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que entienda «Todas las sedes»",
      narracion:
        "Los equipos van a su sede. Los que rotan, a «todas las sedes» — eso es lo habitual y no es una excepción.",
      plano: "Grabación de pantalla, detalle del selector de sede",
      movimiento: "Fija",
      imagen: "`adm-07_ficha-operacion`, zoom `Z-88`",
      duracion: "1:40–1:58",
      animacion: "El selector desplegándose",
      texto: "—",
      cierre: "Fundido a negro 0,3 s",
    },
    {
      objetivo: "**Que verifique el totalizador contra una fotografía**",
      narracion:
        "El totalizador de instalación es el número que marca el medidor hoy. Verifíquelo contra una fotografía, no contra lo que le dictaron por teléfono. No se puede cambiar después.",
      plano: "Grabación de pantalla con una fotografía del medidor al lado",
      movimiento: "**Sostener.** Es el único dato irreversible del proceso",
      imagen: "`adm-07_ficha-operacion`, zoom `Z-86`, `F-02`",
      duracion: "1:58–2:24",
      animacion: "El campo resaltándose; la fotografía entrando al lado",
      texto: "NO SE PUEDE CAMBIAR · VERIFÍQUELO CON UNA FOTOGRAFÍA",
      cierre: "Pausa de 1,0 s",
    },
    {
      objetivo: "Que dicte el PIN en persona",
      narracion:
        "Los operadores, con su código y su clave de cuatro dígitos. La clave no se vuelve a mostrar: dícteselo en persona, nunca por mensaje.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`adm-07_ficha-operacion`, zoom `Z-87`",
      duracion: "2:24–2:44",
      animacion: "El campo del PIN resaltándose y después ocultándose",
      texto: "EL PIN NO SE VUELVE A MOSTRAR",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que sepa cómo se enrola un teléfono",
      narracion:
        "Un código de enrolamiento por teléfono, de un solo uso. Se dicta mientras el operador tiene la aplicación abierta.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`adm-11_dispositivos`, zoom `Z-89`",
      duracion: "2:44–3:00",
      animacion: "El código generándose",
      texto: "—",
      cierre: "Corte seco",
    },
    {
      objetivo: "Que sepa qué hacer con un teléfono perdido",
      narracion:
        "Y si un teléfono se pierde: revóquelo de inmediato. Deja de poder registrar al instante.",
      plano: "Grabación de pantalla",
      movimiento: "Fija",
      imagen: "`adm-11_dispositivos`, zoom `Z-90`",
      duracion: "3:00–3:12",
      animacion: "La acción de revocar ejecutándose",
      texto: "REVOCAR ES INMEDIATO",
      cierre: "Corte seco",
    },
    {
      objetivo: "Cerrar con la verificación",
      narracion:
        "Sabe que quedó bien cuando el supervisor ve su tablero con sus colores y el operador registró su primera carga.",
      plano: "Plano medio del administrador",
      movimiento: "Fija",
      imagen: "`F-43`, `F-90`",
      duracion: "3:12–3:20",
      animacion: "Cierre con marca",
      texto: "—",
      cierre: "Fundido a negro",
    },
  ],
};

/* ============ Generación ============ */

const VIDEOS = {
  "OP-AND-MD": {
    titulo: "Cargar combustible · Android · planta con medidor",
    manual: "01_Operadores/OP-AND-MD.md",
    guion: opMedidor("Android"),
  },
  "OP-IOS-MD": {
    titulo: "Cargar combustible · iPhone · planta con medidor",
    manual: "01_Operadores/OP-IOS-MD.md",
    guion: opMedidor("iPhone"),
  },
  "OP-AND-CI": {
    titulo: "Registrar un carrotanque · Android",
    manual: "01_Operadores/OP-AND-CI.md",
    guion: opInventario("Android"),
  },
  "OP-IOS-CI": {
    titulo: "Registrar un carrotanque · iPhone",
    manual: "01_Operadores/OP-IOS-CI.md",
    guion: opInventario("iPhone"),
  },
  "SUP-MD": {
    titulo: "Controlar el combustible de su planta",
    manual: "02_Supervisores/SUP-MD.md",
    guion: supMedidor,
  },
  "SUP-CI": {
    titulo: "Controlar lo que Lubryco entrega",
    manual: "02_Supervisores/SUP-CI.md",
    guion: supInventario,
  },
  ADM: { titulo: "Poner un cliente a operar", manual: "03_Admin/ADM.md", guion: admin },
};

function documento(id, { titulo, manual, guion }) {
  const escenas = guion.escenas
    .map(
      (e, i) => `### Escena ${i + 1} · ${e.duracion}

- **Objetivo:** ${e.objetivo}
- **Narración:** «${e.narracion}»
- **Plano:** ${e.plano}
- **Movimiento de cámara:** ${e.movimiento}
- **Material:** ${e.imagen}
- **Animaciones:** ${e.animacion}
- **Texto en pantalla:** ${e.texto === "—" ? "ninguno" : `\`${e.texto}\``}
- **Cierre:** ${e.cierre}`,
    )
    .join("\n\n");

  return `# Storyboard · ${id}

## ${titulo}

> Guion de rodaje. **No sustituye al manual**: el video se ve una vez, el manual se consulta. El video enseña el camino normal; el manual resuelve los casos raros.
> Manual: [\`../${manual}\`](../${manual}) · Capturas: [\`../12_Capturas/CATALOGO.md\`](../12_Capturas/CATALOGO.md) · Fotografías: [\`../13_Produccion/orden-fotografica.md\`](../13_Produccion/orden-fotografica.md)

**Duración objetivo:** ${guion.duracion} · **Escenas:** ${guion.escenas.length} · **Formato:** ${guion.formato}

---

## Objetivo del video

${guion.objetivo}

**Momentos que cubre:** ${guion.momentos} — ver [\`../00_Fuente/catalogo-momentos.md\`](../00_Fuente/catalogo-momentos.md)

**Qué NO cubre.** Los casos raros. El video enseña el camino normal de principio a fin; todo lo que se sale de ahí vive en el manual y en el troubleshooting. Un video que intenta cubrir las excepciones deja de servir para aprender el flujo.

---

${CONVENCIONES}

---

## Escenas

${escenas}

---

${NOTAS}

---

## Qué hace falta para grabar

| Material | Estado |
| --- | --- |
| Guion | **Cerrado** — este documento |
| Capturas de pantalla | Ver [\`../12_Capturas/CATALOGO.md\`](../12_Capturas/CATALOGO.md) |
| Fotografías y planos de campo | Pendientes de la visita a planta |
| Locución | Pendiente |
| Montaje | Pendiente |

**El guion no vuelve a tocarse.** Si al grabar aparece la necesidad de cambiar una escena, se cambia aquí primero — no en la mesa de montaje, donde el cambio no queda registrado en ninguna parte.
`;
}

mkdirSync(DESTINO, { recursive: true });
for (const [id, video] of Object.entries(VIDEOS)) {
  writeFileSync(join(DESTINO, `${id}.md`), documento(id, video));
  console.log(`  ✓ 08_Storyboards/${id}.md — ${video.guion.escenas.length} escenas`);
}
console.log(`${Object.keys(VIDEOS).length} storyboards generados.`);
