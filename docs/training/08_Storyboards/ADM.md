# Storyboard de video · ADM — Administrador · Consola completa

> Guion para grabar el video tutorial. **No sustituye al manual**: el video se ve una vez, el manual se consulta. El video enseña el flujo; el manual resuelve los casos raros.
> Manual: [`../03_Admin/ADM.md`](../03_Admin/ADM.md) · Capturas: [`../04_Assets/inventario-assets.md`](../04_Assets/inventario-assets.md)

**Duración objetivo:** 3:32 · **Escenas:** 11 · **Formato:** horizontal 16:9 (se ve en el computador)

---

## Escenas

| #   | Narración (lo que se dice)                                                                                                                                                                                                   | Pantalla                                               | Duración  | Animaciones                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------ |
| 1   | Voy a dar de alta un cliente completo, de principio a fin, sin escribir una línea de código. Toma unos diez minutos.                                                                                                         | adm-02_resumen.png                                     | 0:00–0:10 | Título sobre la captura difuminada                                       |
| 2   | La jerarquía es siempre la misma: un cliente, sus sedes, y en cada sede sus equipos, sus operadores y sus dispositivos.                                                                                                      | diagrama AS-DIA-05                                     | 0:10–0:24 | El diagrama construyéndose nivel por nivel                               |
| 3   | Paso uno: crear el cliente. Razón social, nombre comercial, NIT y —lo más importante— su perfil operativo.                                                                                                                   | adm-04_clientes.png (diálogo)                          | 0:24–0:44 | Escritura en cada campo; el selector de perfil desplegándose             |
| 4   | El perfil decide qué ve el operador al capturar. Si la planta despacha con un medidor de dos números en la misma carátula, es Medidor Doble. Si se carga a carrotanques y se controla inventario, es Carga sobre Inventario. | diagrama AS-DIA-06                                     | 0:44–1:04 | Árbol de decisión resolviéndose                                          |
| 5   | Paso dos: su identidad. Subes el logo y eliges dos colores. Solo dos: el resto de la interfaz lo deriva CuadreApp sola, garantizando que el texto siempre se lea.                                                            | adm-05_ficha-identidad.png                             | 1:04–1:28 | Subida del logo; selector de color; la vista previa cambiando en vivo    |
| 6   | Paso tres: confirmar la configuración. Si el cliente ya tiene cargas y cambias el perfil, la consola te avisa: la historia conserva el suyo y no se reinterpreta.                                                            | adm-06_ficha-configuracion.png                         | 1:28–1:46 | Selector cambiando; el aviso ámbar apareciendo                           |
| 7   | Paso cuatro: la operación. Primero la sede, con su ciudad. Si el perfil usa medidor, aquí defines el dispensador y su totalizador de instalación. Verifícalo contra la carátula física: es la base de todo el histórico.     | adm-07_ficha-operacion.png (bloque sedes)              | 1:46–2:12 | Diálogo de sede llenándose; recuadro de advertencia sobre el totalizador |
| 8   | Paso cinco: equipos y operadores. Cada uno puede ser de una sede o estar disponible en todas. Ojo con el PIN del operador: se define aquí y no se vuelve a mostrar nunca.                                                    | adm-07_ficha-operacion.png (equipos y operadores)      | 2:12–2:38 | Dos diálogos en secuencia; el campo PIN con marca de advertencia         |
| 9   | Paso seis: el dispositivo. Generas un código, se lo dictas al operador, y él lo escribe en su teléfono una sola vez. Vence en siete días.                                                                                    | adm-07_ficha-operacion.png (dispositivos)              | 2:38–2:58 | Botón «Generar código»; el código apareciendo resaltado                  |
| 10  | Y si alguna vez se pierde un teléfono: Revocar corta el acceso en el acto. Reenrolar lo revoca y entrega un código nuevo en un solo paso.                                                                                    | adm-11_dispositivos.png                                | 2:58–3:14 | Acción «Revocar» resaltándose; estado cambiando a revocado               |
| 11  | Listo. El operador ya ve el logo de su cliente en la app, con el flujo de su perfil. Y el supervisor ya ve sus cargas en el tablero. Sin escribir una línea de código.                                                       | and-03_inicio.png + dsh-01_hoy.png (pantalla dividida) | 3:14–3:32 | Las dos pantallas entrando en paralelo                                   |

---

## Notas de producción

- Grabación real de la consola, con un cliente de demostración creado para el video.
- **El video debe grabarse de una sola pasada** siguiendo la secuencia real del alta: si se edita saltando pasos, deja de servir como guía para hacerlo en vivo.
- Las escenas 7 y 8 llevan advertencias en pantalla (totalizador de instalación y PIN): no se pueden dar solo en la voz.
- La escena 11 es la prueba de la promesa del producto: debe mostrar las dos aplicaciones reales, no un montaje.
- Subtítulos quemados.

## Reglas de narración

- **Segunda persona y voz activa:** «toma la foto», no «se debe tomar la fotografía».
- **Sin jerga:** nada de «sincronizar», «offline» ni «validación». Se dice «subir», «sin señal» y «revisar».
- **Los números literales se dicen en voz alta** («cero punto cero», «ciento cincuenta»): quien mira el video suele estar de pie, sin poder leer detalles.
- **Nunca se promete lo que el producto no hace.** Si la carga puede quedar marcada, el video lo dice.
