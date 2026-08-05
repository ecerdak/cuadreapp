# Storyboard de video · SUP-CI — Supervisores · Dashboard Carga sobre Inventario

> Guion para grabar el video tutorial. **No sustituye al manual**: el video se ve una vez, el manual se consulta. El video enseña el flujo; el manual resuelve los casos raros.
> Manual: [`../02_Supervisores/SUP-CI.md`](../02_Supervisores/SUP-CI.md) · Capturas: [`../04_Assets/inventario-assets.md`](../04_Assets/inventario-assets.md)

**Duración objetivo:** 2:12 · **Escenas:** 9 · **Formato:** horizontal 16:9 (se ve en el computador)

## Objetivo del video

Que un supervisor sepa sustentar cada galón facturado y deje de comparar la guía contra el total.

**Momentos que cubre:** `S-01` a `S-07`, con énfasis en la comparación contra la guía — ver [`../00_Fuente/catalogo-momentos.md`](../00_Fuente/catalogo-momentos.md)

**Qué NO cubre este video.** Los casos raros. El video enseña el camino normal de principio a fin; todo lo que se sale de ahí vive en el manual y en el troubleshooting. Un video que intenta cubrir las excepciones deja de servir para aprender el flujo.

---

---

## Escenas

| #   | Narración (lo que se dice)                                                                                                                                                                          | Pantalla                                            | Duración  | Animaciones                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| 1   | Este tablero responde tres preguntas: si los despachos de hoy cuadraron, si algún carrotanque se sale del patrón, y cuándo pedir el próximo despacho.                                               | dsh-01_hoy.png                                      | 0:00–0:12 | Tres bloques en secuencia                                                     |
| 2   | Empieza cada mañana por aquí. Una frase arriba te dice si hay algo que atender.                                                                                                                     | dsh-01_hoy.png                                      | 0:12–0:24 | Zoom al veredicto                                                             |
| 3   | En Cargas tienes catorce días. Filtra por «No cuadran» para quedarte solo con lo que importa.                                                                                                       | dsh-02_cargas.png                                   | 0:24–0:38 | Clic en la píldora; tabla filtrándose                                         |
| 4   | Toca una carga y ves su evidencia: tres cifras y dos fotos del carrotanque, la de llegada y la de salida.                                                                                           | dsh-04_evidencia-inventario.png                     | 0:38–0:56 | Panel entrando; zoom a cada foto                                              |
| 5   | Las tres cifras: con cuántos llegó, cuántos despachó Lubryco, y el total al salir. Las dos primeras las escribió el operador. La tercera la calculó el sistema.                                     | dsh-04_evidencia-inventario.png (recorte de cifras) | 0:56–1:16 | Las tres cifras resaltándose en secuencia; la tercera con un icono de cálculo |
| 6   | Eso es lo que hace confiable este perfil: el operador no puede cuadrar el total a conveniencia, porque no lo escribe. Tendría que mentir en las dos cifras a la vez y que las fotos lo respaldaran. | dsh-04_evidencia-inventario.png                     | 1:16–1:34 | Texto de apoyo sobre la captura                                               |
| 7   | Para verificar, contrasta los galones despachados contra la remisión de Lubryco, que ves en Suministro.                                                                                             | dsh-06_suministro.png                               | 1:34–1:50 | Transición a la tabla de entregas; una fila resaltándose                      |
| 8   | En Equipos ves qué carrotanque se salió de su patrón. Revisa mantenimiento antes de sospechar.                                                                                                      | dsh-05_equipos.png                                  | 1:50–2:05 | Fila con desvío resaltándose                                                  |
| 9   | Cinco minutos cada mañana. Eso es todo lo que pide.                                                                                                                                                 | dsh-01_hoy.png                                      | 2:05–2:12 | Cierre con marca                                                              |

---

## Notas de producción

- Grabación real de pantalla del Dashboard, con el chip «Demo» visible.
- El cursor debe moverse despacio y detenerse antes de cada clic.
- Las escenas 7 (Medidor Doble) y 5–6 (Inventario) son las que previenen decisiones injustas: no acortarlas para ganar tiempo.
- Subtítulos quemados.
- Cada escena debe funcionar como imagen fija.

## Reglas de narración

- **Segunda persona y voz activa:** «toma la foto», no «se debe tomar la fotografía».
- **Sin jerga:** nada de «sincronizar», «offline» ni «validación». Se dice «subir», «sin señal» y «revisar».
- **Los números literales se dicen en voz alta** («cero punto cero», «ciento cincuenta»): quien mira el video suele estar de pie, sin poder leer detalles.
- **Nunca se promete lo que el producto no hace.** Si la carga puede quedar marcada, el video lo dice.

---

## Planos

Un video de capacitación no es una grabación de pantalla con voz encima. Estos son los planos que hay que llevar al rodaje:

| Plano                 | Qué encuadra                                              | Dónde se usa                                     |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| Plano medio           | El supervisor en su oficina.                              | Escenas 1, 10                                    |
| Grabación de pantalla | El tablero real con datos de demostración, en horizontal. | Escenas 2 a 9                                    |
| Plano detalle         | El recuadro de las tres cifras, ampliado.                 | Escena 5 — **el plano más importante del video** |
| Plano de estación     | Un carrotanque cargando, para contextualizar el balance.  | Escena 8                                         |

**Regla de rodaje:** los planos de campo se graban en la misma visita que las fotografías del [`inventario-fotografico.md`](../00_Fuente/inventario-fotografico.md). Es una sola coordinación con el cliente, no dos.

## Textos en pantalla

Se queman sobre la imagen, en mayúsculas, sin animación de entrada llamativa. **Nunca repiten literalmente la narración**: la refuerzan con la frase que debe quedar.

| Momento | Texto                                             |
| ------- | ------------------------------------------------- |
| 0:10    | `CINCO MINUTOS AL DÍA`                            |
| 1:20    | `EL TOTAL LO CALCULA EL SISTEMA`                  |
| 1:35    | `NADIE PUEDE EDITARLO`                            |
| 2:10    | `COMPARE LA GUÍA CONTRA «DESPACHADO POR LUBRYCO»` |
| 2:25    | `NO CONTRA EL TOTAL AL SALIR`                     |
| 2:45    | `ESTO ES DESPACHO, NO AFORO`                      |
