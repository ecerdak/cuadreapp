# Catálogo de íconos

Los 37 íconos del material, con su identificador, qué significan, dónde aparecen y su prioridad.

**Las reglas viven en [`../14_Sistema/08-iconografia.md`](../14_Sistema/08-iconografia.md).** Este documento es el inventario: qué existe. Aquel es la norma: cómo se usan y por qué.

**Ningún ícono nuevo sin entrada aquí.** Si al diagramar hace falta uno, se agrega a este catálogo antes de usarlo — el verificador falla si una página referencia un ícono que no existe.

Los grupos corresponden a las siete categorías del sistema: A estado, B veredicto, C acción, D persona, E mundo físico, F plataforma, G navegación.

---

## Grupo A · Estado y conectividad

| ID     | Ícono                      | Qué significa                      | Dónde aparece                             | Prioridad |
| ------ | -------------------------- | ---------------------------------- | ----------------------------------------- | --------- |
| `I-01` | Sincronizado               | Todo subió                         | Capítulo 1 y 6 de operador, guías rápidas | **P0**    |
| `I-02` | En cola                    | Guardado en el teléfono, sube solo | Capítulo 1, 6 y 7 de operador             | **P0**    |
| `I-03` | Sin conexión               | No hay red — **no es un error**    | Capítulo 7, troubleshooting               | **P0**    |
| `I-04` | Problema de sincronización | Requiere avisar                    | Capítulo 7                                | P1        |
| `I-05` | Internet                   | Conectividad en general            | Preguntas frecuentes                      | P1        |

**`I-02` es el ícono más malinterpretado del producto** y por eso es P0: tiene que verse claramente como un estado normal, no como una alarma.

---

## Grupo B · Los tres sellos

| ID     | Ícono     | Qué significa    | Dónde              | Prioridad |
| ------ | --------- | ---------------- | ------------------ | --------- |
| `I-10` | Cuadra    | Todo bien, siga  | Todos los manuales | **P0**    |
| `I-11` | Revisar   | Hay algo anotado | Todos los manuales | **P0**    |
| `I-12` | No cuadra | Algo no cerró    | Todos los manuales | **P0**    |

Los tres se usan **siempre juntos**, nunca sueltos: el lector aprende el semáforo completo o no aprende ninguno.

---

## Grupo C · Acciones del operador

| ID     | Ícono      | Qué significa                | Dónde                           | Prioridad |
| ------ | ---------- | ---------------------------- | ------------------------------- | --------- |
| `I-20` | Fotografía | Tomar una foto con la cámara | Capítulos 3 y 5                 | **P0**    |
| `I-21` | Cronómetro | El tiempo corre solo         | Capítulo 4                      | **P0**    |
| `I-22` | Guardar    | Cerrar el registro           | Capítulo 5                      | **P0**    |
| `I-23` | Ubicación  | Dónde se registró            | Evidencia, preguntas frecuentes | P1        |
| `I-24` | Clave      | Los cuatro dígitos           | Capítulo 3                      | P1        |
| `I-25` | Buscar     | Filtrar por código           | Capítulo 2                      | P1        |
| `I-26` | Corregir   | Enmendar antes de guardar    | Capítulo 7                      | P1        |

---

## Grupo D · Personas

| ID     | Ícono                     | Qué significa                | Dónde                          | Prioridad |
| ------ | ------------------------- | ---------------------------- | ------------------------------ | --------- |
| `I-30` | Operador                  | Quien carga combustible      | Portadas, matriz de audiencias | **P0**    |
| `I-31` | Supervisor                | Quien controla la planta     | Portadas, matriz               | **P0**    |
| `I-32` | Administrador             | Quien opera la plataforma    | Portadas, matriz               | **P0**    |
| `I-33` | Conductor del carrotanque | Tercero que trae el vehículo | `OP-*-CI` capítulo 3           | P2        |

---

## Grupo E · Mundo físico

| ID     | Ícono       | Qué significa                | Dónde                     | Prioridad |
| ------ | ----------- | ---------------------------- | ------------------------- | --------- |
| `I-40` | Surtidor    | El dispensador de la planta  | `OP-*-MD`, `SUP-MD`       | **P0**    |
| `I-41` | Medidor     | La carátula del Fill-Rite    | `OP-*-MD` capítulo 3      | **P0**    |
| `I-42` | Carrotanque | El vehículo de despacho      | `OP-*-CI`, `SUP-CI`       | **P0**    |
| `I-43` | Equipo      | Tractor, alzadora, camioneta | Capítulo 2, catálogos     | P1        |
| `I-44` | Tanque      | El tanque de la planta       | `SUP-MD` decisión 5       | P1        |
| `I-45` | Manguera    | El despacho en curso         | Capítulo 4                | P2        |
| `I-46` | Teléfono    | El dispositivo del operador  | Capítulo 1, guías rápidas | P1        |

---

## Grupo F · Estructura de la plataforma

Sigue la jerarquía congelada (DEC-018): **Cliente → Sedes → Equipos → Operadores → Dispositivos.** Los cinco íconos deben leerse como una familia, porque en la consola aparecen en cascada.

| ID     | Ícono                  | Qué significa                  | Dónde                | Prioridad |
| ------ | ---------------------- | ------------------------------ | -------------------- | --------- |
| `I-50` | Cliente                | La empresa                     | `ADM` procesos 1 y 5 | **P0**    |
| `I-51` | Sede                   | Una planta o frente de obra    | `ADM` procesos 1 y 2 | P1        |
| `I-52` | Dispositivo            | Un teléfono enrolado           | `ADM` proceso 4      | P1        |
| `I-53` | Perfil operativo       | La forma de operar del cliente | `ADM` procesos 1 y 6 | **P0**    |
| `I-54` | Código de enrolamiento | El código de un solo uso       | `ADM` procesos 1 y 3 | P2        |

---

## Grupo G · Navegación del documento

| ID     | Ícono     | Qué significa            | Dónde                     | Prioridad |
| ------ | --------- | ------------------------ | ------------------------- | --------- |
| `I-60` | Tablero   | El Dashboard del cliente | Portadas de supervisor    | P1        |
| `I-61` | Consola   | La consola de Lubryco    | Portada de administrador  | P2        |
| `I-62` | Descargar | Exportar a Excel         | `SUP-*` decisión 7        | P2        |
| `I-63` | Imprimir  | Página arrancable        | Checklists, guías rápidas | P2        |
| `I-64` | Video     | Hay un video de esto     | Aperturas de capítulo     | P2        |
| `I-65` | Tiempo    | Cuánto tarda             | Bloques de momento        | P1        |

---

---

## Resumen

| Grupo            | Íconos | P0     | P1     | P2    |
| ---------------- | ------ | ------ | ------ | ----- |
| A · Estado       | 5      | 3      | 2      | 0     |
| B · Sellos       | 3      | 3      | 0      | 0     |
| C · Acciones     | 7      | 3      | 4      | 0     |
| D · Personas     | 4      | 3      | 0      | 1     |
| E · Mundo físico | 7      | 3      | 3      | 1     |
| F · Plataforma   | 5      | 2      | 2      | 1     |
| G · Navegación   | 6      | 0      | 2      | 4     |
| **Total**        | **37** | **17** | **13** | **7** |

**Con los 17 de P0 se puede diagramar el 100 % de las páginas de prioridad P0 del kit.** Los otros 20 se pueden producir después sin bloquear nada.
