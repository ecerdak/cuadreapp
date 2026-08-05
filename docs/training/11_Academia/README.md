# Academia CuadreApp

**Esto es una propuesta documental. No hay nada construido y nada de esta etapa lo construye.**

Este documento existe para que, cuando alguien decida hacer la Academia, no tenga que volver a diseñarla: el contenido ya está escrito en `docs/training/`, y lo que falta es producción y una plataforma.

---

## Qué problema resolvería

Hoy la capacitación es un acompañamiento presencial de Lubryco en cada planta. Funciona con dos clientes. Con veinte, no.

Los tres síntomas que aparecen cuando la capacitación no escala:

1. **La calidad depende de quién fue.** Dos operadores de dos plantas reciben cursos distintos.
2. **La rotación deshace el trabajo.** Entra alguien nuevo y hay que volver a viajar, o se aprende de un compañero — que a su vez aprendió mal.
3. **No hay forma de saber quién sabe.** Cuando una carga sale mal, no se puede distinguir un descuido de una persona que nunca fue capacitada.

Los tres se resuelven con lo mismo: cursos cortos, iguales para todos, y un registro de quién los completó.

---

## Los cinco cursos

Cada uno se completa en una sesión. Ninguno pasa de 25 minutos.

### Curso 1 · Cargar combustible _(operador, Medidor Doble)_

|                    |                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Para quién**     | Operador de planta con medidor                                                              |
| **Dura**           | 20 min · video 3:05 + práctica                                                              |
| **Fuente**         | [`OP-AND-MD`](../01_Operadores/OP-AND-MD.md) / [`OP-IOS-MD`](../01_Operadores/OP-IOS-MD.md) |
| **Momentos**       | `M-MD-00` a `M-MD-05`                                                                       |
| **Aprueba cuando** | Registra una carga completa sin ayuda                                                       |

**Módulos:** antes de salir · llega un equipo · **antes de abrir la manguera** · está saliendo · se cerró la manguera · quedó registrada · si algo pasa.

El tercer módulo pesa el doble que los demás en la evaluación. Es donde se producen los errores que después nadie puede reconstruir.

### Curso 2 · Registrar un carrotanque _(operador, Carga sobre Inventario)_

|                    |                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Para quién**     | Operador de estación de despacho                                                            |
| **Dura**           | 18 min · video 2:50 + práctica                                                              |
| **Fuente**         | [`OP-AND-CI`](../01_Operadores/OP-AND-CI.md) / [`OP-IOS-CI`](../01_Operadores/OP-IOS-CI.md) |
| **Momentos**       | `M-CI-00` a `M-CI-05`                                                                       |
| **Aprueba cuando** | Registra una carga completa y explica por qué no escribe el total                           |

**El curso entero gira alrededor de una sola idea:** el operador escribe dos números y la aplicación calcula el tercero. La evaluación lo comprueba directamente.

### Curso 3 · Controlar el combustible de su planta _(supervisor)_

|                    |                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **Para quién**     | Supervisor del cliente                                                                        |
| **Dura**           | 25 min                                                                                        |
| **Fuente**         | [`SUP-MD`](../02_Supervisores/SUP-MD.md) / [`SUP-CI`](../02_Supervisores/SUP-CI.md)           |
| **Momentos**       | `S-01` a `S-07`                                                                               |
| **Aprueba cuando** | Resuelve tres casos: un descuadre por digitación, una foto faltante y un salto de totalizador |

**El caso del salto de totalizador es obligatorio y no se puede saltar.** Un supervisor que no lo entiende va a acusar a alguien de robo con la evidencia equivocada, y ese es el peor daño que esta herramienta puede causar.

### Curso 4 · Poner un cliente a operar _(administrador Lubryco)_

|                    |                                                          |
| ------------------ | -------------------------------------------------------- |
| **Para quién**     | Equipo interno de Lubryco                                |
| **Dura**           | 25 min                                                   |
| **Fuente**         | [`ADM`](../03_Admin/ADM.md)                              |
| **Momentos**       | `A-01` a `A-07`                                          |
| **Aprueba cuando** | Incorpora un cliente completo en el ambiente de práctica |

**Requisito para tener acceso a la consola de producción.** Es el único curso con esa condición, y se justifica: aquí es donde una equivocación afecta a un cliente entero.

### Curso 5 · Para qué sirve esto _(gerencia y comercial)_

|                    |                                                     |
| ------------------ | --------------------------------------------------- |
| **Para quién**     | Gerencia del cliente y equipo comercial de Lubryco  |
| **Dura**           | 12 min                                              |
| **Fuente**         | secciones de contexto de los manuales de supervisor |
| **Aprueba cuando** | No hay evaluación. Es un curso de contexto.         |

**Qué demuestra el registro y qué no.** Es el curso más corto y el que evita más conversaciones difíciles: una gerencia que cree que esto mide el nivel del tanque va a exigir algo que el sistema no promete.

---

## Cómo se conecta con lo que ya existe

```
docs/training/           →   Academia
─────────────────────────────────────────────
01–03 (manuales)         →   contenido de los módulos
08_Storyboards           →   guiones de los videos
06_Checklists            →   material descargable
10_QuickGuides           →   material descargable
00_Fuente/biblioteca-faq →   sección de dudas de cada curso
00_Fuente/momentos       →   estructura de los módulos
```

**No hay contenido nuevo que escribir.** La Academia es una forma de entregar lo que ya está redactado.

---

## Qué haría falta para construirla

| Pieza                          | Estado          | Depende de           |
| ------------------------------ | --------------- | -------------------- |
| Contenido de los 5 cursos      | **Listo**       | —                    |
| Guiones de video               | **Listos**      | —                    |
| Producción de video            | Pendiente       | Visita a planta      |
| Fotografías                    | Pendiente       | Visita a planta      |
| Plataforma                     | **No decidida** | Decisión de producto |
| Registro de quién completó qué | **No decidido** | Decisión de producto |
| Certificados                   | **No decidido** | Decisión de producto |

---

## Lo que esta propuesta deliberadamente no decide

- **Si la Academia es parte de CuadreApp o un producto aparte.** Meterla dentro del producto significa autenticación, permisos y una app más que mantener. Sacarla afuera significa un proveedor externo y datos de personas en un tercero. Las dos tienen costo y ninguna es obviamente mejor.
- **Si los cursos son obligatorios para operar.** Es una decisión comercial con el cliente, no técnica.
- **Si hay certificados con vigencia.** Tiene sentido para auditorías, pero implica un proceso de renovación que hoy nadie está en capacidad de sostener.

**Estas tres decisiones tienen que tomarse antes de escribir la primera línea de código, no después.**
