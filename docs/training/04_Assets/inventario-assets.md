# Inventario de assets

Todo lo gráfico que hay que producir. **Nada de esto está exportado todavía** — este documento es la orden de trabajo.

Tres orígenes distintos, con costos muy distintos:

- **Ya existe en el repositorio** → solo hay que copiarlo. Costo cero.
- **Captura** → hay que producirla desde la app con datos de demostración. Costo: minutos.
- **Ilustración** → hay que diseñarla. Costo: el real del kit.

---

## A · Marca (ya existe — reutilizar, no rehacer)

| ID          | Asset                                    | Origen en el repositorio                                  | Uso                                                 |
| ----------- | ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| `AS-MRC-01` | Logo Lubryco                             | `apps/pwa/src/marca/assets/lubryco.webp`                  | Portadas y pies de los 7 manuales                   |
| `AS-MRC-02` | Logotipo «Cuadre»                        | Componente `Logotipo` (`apps/pwa/src/marca/Logotipo.tsx`) | Portadas                                            |
| `AS-MRC-03` | Placa «APP»                              | Componente `Placa`                                        | Manuales de operador                                |
| `AS-MRC-04` | Placa «ADMIN»                            | Componente `Placa`                                        | Manual de administrador                             |
| `AS-MRC-05` | Íconos de instalación (192/512/maskable) | `apps/pwa/public/`                                        | Página de instalación de los 4 manuales de operador |
| `AS-MRC-06` | Guía de encuadre Fill-Rite               | `apps/pwa/src/marca/assets/fillrite-antes.webp`           | Página de foto correcta, manuales Medidor Doble     |
| `AS-MRC-07` | Carátula Fill-Rite, después              | `apps/pwa/src/marca/assets/fillrite-despues.webp`         | Manuales Medidor Doble y supervisores               |

**Nota:** el logotipo y las placas son componentes React, no archivos de imagen. Para el manual hay que exportarlos como imagen desde la app o rehacerlos en el sistema de diseño respetando la tipografía Yellowtail y el amarillo de marca.

---

## B · Capturas de pantalla (producir — 47 + 5 variantes)

Detalle completo en cada manual y consolidado en [`../09_Exports/indice-general.md`](../09_Exports/indice-general.md).

| Grupo             | Cantidad         | Dispositivo                      | Notas de producción                             |
| ----------------- | ---------------- | -------------------------------- | ----------------------------------------------- |
| `and-*` Android   | 15 + 2 variantes | Teléfono Android real, vertical  | Barra de estado visible; batería y hora limpias |
| `ios-*` iPhone    | 15 + 2 variantes | iPhone real, vertical            | Notch/isla dinámica según el modelo del piloto  |
| `dsh-*` Dashboard | 6                | Escritorio, navegador maximizado | El chip «Demo» debe quedar visible              |
| `adm-*` Admin     | 11               | Escritorio, navegador maximizado | Cliente de demostración, nunca datos reales     |

**Variantes necesarias** (no son capturas nuevas de pantallas nuevas, sino estados distintos de la misma):

| Archivo                                | Base                     | Estado                                               |
| -------------------------------------- | ------------------------ | ---------------------------------------------------- |
| `and-03b_inicio-offline.png`           | `and-03_inicio.png`      | Chip en «Sin conexión — 2 en cola»                   |
| `ios-03b_inicio-offline.png`           | `ios-03_inicio.png`      | Ídem                                                 |
| `and-13b_listo-inventario.png`         | `and-13_listo.png`       | Tarjeta con Llegó con / Despachado / Total al salir  |
| `ios-13b_listo-inventario.png`         | `ios-13_listo.png`       | Ídem                                                 |
| `ios-14b_diagnostico-persistencia.png` | `ios-14_diagnostico.png` | «Almacenamiento protegido» en «NO — riesgo de purga» |

**Recortes** (derivados, no capturas): 18 en total — 7 del Dashboard Medidor Doble, 3 del Dashboard Inventario, 8 de la consola Admin.

### Reglas de producción de capturas

1. **Datos de demostración siempre.** Nunca capturar con datos reales de un cliente: el kit se comparte.
2. **Los mismos números en todas partes.** Perfil inventario: 150 / 600 / 750. Perfil medidor: el equipo `T-04` y valores coherentes entre capturas (si `and-08` muestra totalizador 1847, `and-10` debe mostrar 1889,5).
3. **Sin información personal.** Nombres de operador genéricos.
4. **Un estado por captura.** Si el manual necesita mostrar dos estados de la misma pantalla, son dos archivos.
5. **Resolución nativa del dispositivo**, sin escalar. El recorte se hace después.

---

## C · Ilustraciones y diagramas (diseñar — 8)

| ID          | Asset                                          | Descripción                                                                   | Usado en             |
| ----------- | ---------------------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| `AS-DIA-01` | Los cinco pasos · Medidor Doble                | Barra horizontal con Equipo → Tú → Antes → Cargando → Después                 | OP-AND-MD, OP-IOS-MD |
| `AS-DIA-02` | Los cinco pasos · Inventario                   | Barra con Carrotanque → Tú → Llegada → Cargando → Despacho                    | OP-AND-CI, OP-IOS-CI |
| `AS-DIA-03` | Las tres preguntas del tablero                 | Tres bloques enlazados a las pestañas                                         | SUP-MD, SUP-CI       |
| `AS-DIA-04` | Comparativa de los dos modelos de verificación | Tabla ilustrada: candados frente a evidencia + cálculo                        | SUP-CI               |
| `AS-DIA-05` | La jerarquía                                   | Cliente → Sedes → Equipos → Operadores → Dispositivos                         | ADM                  |
| `AS-DIA-06` | Cómo elegir el perfil                          | Árbol de decisión de una sola pregunta                                        | ADM                  |
| `AS-FOT-01` | Foto bien y mal encuadrada                     | Dos carátulas lado a lado: una completa y legible, otra cortada o con reflejo | OP-AND-MD, OP-IOS-MD |
| `AS-FOT-02` | Carrotanque bien y mal encuadrado              | Vehículo completo con placa visible frente a plano cerrado                    | OP-AND-CI, OP-IOS-CI |

**`AS-FOT-01` es el asset con más impacto del kit.** El problema físico está documentado en la especificación técnica: el medidor está montado alto y su vidrio refleja la cubierta. Un ejemplo visual de foto inservible evita más registros perdidos que tres páginas de texto.

---

## D · Iconografía funcional (diseñar — 6)

| ID          | Asset                              | Uso                                     |
| ----------- | ---------------------------------- | --------------------------------------- |
| `AS-ICO-01` | Chip verde «Cuadra»                | Los 6 manuales de operador y supervisor |
| `AS-ICO-02` | Chip ámbar «Revisar»               | Ídem                                    |
| `AS-ICO-03` | Chip rojo «No cuadra»              | Ídem                                    |
| `AS-ICO-04` | Candado cumplido / no cumplido     | SUP-MD                                  |
| `AS-ICO-05` | Marca de callout de prioridad alta | Los 7 manuales                          |
| `AS-ICO-06` | Marca de «qué NO hacer»            | Los 7 manuales                          |

Los tres chips deben tomar su color del sistema de diseño del producto (verde, ámbar y rojo de estado), no inventarse: el operador tiene que reconocer en el papel exactamente lo que ve en la pantalla.

---

## E · Plantillas de página (diseñar — 7)

| ID          | Plantilla                                          | Usada en           |
| ----------- | -------------------------------------------------- | ------------------ |
| `AS-TPL-01` | Portada                                            | 7 manuales         |
| `AS-TPL-02` | Página de paso (captura grande + hasta 4 callouts) | operador           |
| `AS-TPL-03` | Página de dos columnas (dos capturas relacionadas) | operador           |
| `AS-TPL-04` | Página de tabla                                    | supervisor y admin |
| `AS-TPL-05` | Página de recorte + explicación                    | supervisor y admin |
| `AS-TPL-06` | Página arrancable (reglas de oro / checklist)      | 7 manuales         |
| `AS-TPL-07` | Página de problema → causa → solución              | 7 manuales         |

---

## Resumen de esfuerzo

| Categoría            | Cantidad         | Estado                  |
| -------------------- | ---------------- | ----------------------- |
| Marca                | 7                | Ya existe — copiar      |
| Capturas             | 47 + 5 variantes | Producir                |
| Recortes             | 18               | Derivar de las capturas |
| Ilustraciones        | 8                | Diseñar                 |
| Iconografía          | 6                | Diseñar                 |
| Plantillas           | 7                | Diseñar                 |
| **Total a producir** | **91 piezas**    |                         |

**Bloqueante conocido:** la captura `dsh-04_evidencia-inventario.png` necesita que el escenario de demostración del Dashboard tenga al menos una carga del perfil inventario. Hoy es solo Medidor Doble. Sin eso, SUP-CI no se puede ilustrar. Es un cambio pequeño en los datos simulados, pero **toca código del producto** y esta etapa no lo hace.
