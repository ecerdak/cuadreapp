# Inventario fotográfico

**Regla de la etapa: solo imágenes reales.** Sin mockups, sin ilustraciones de dispositivos, sin dibujos de medidores. Un operador reconoce su planta o no reconoce nada.

Dos familias, con costos y responsables distintos:

- **Fotografía de campo** — hay que ir a la planta con una cámara. Es lo que hace que el manual se sienta propio.
- **Captura de pantalla** — se produce desde la app con datos de demostración.

**Nada está producido.** Este documento es la orden de trabajo.

---

## A · Fotografía de campo — Medidor Doble

Se toman en la planta del cliente que opera con Fill-Rite Serie 900.

| ID     | Fotografía                             | Qué debe verse                                              | Estado                                                                | Usada en               |
| ------ | -------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| `F-01` | El surtidor completo, de frente        | El dispensador entero en su sitio, con la manguera colgada  | **Producir**                                                          | Portada, `M-MD-00`     |
| `F-02` | La carátula del Fill-Rite, de frente   | Los dos registros legibles: tanda arriba, totalizador abajo | **Existe parcialmente** — hay `fillrite-antes.webp` en el repositorio | `M-MD-02`              |
| `F-03` | La carátula después de una carga       | El mismo encuadre, con la tanda en un valor real            | **Existe parcialmente** — hay `fillrite-despues.webp`                 | `M-MD-04`              |
| `F-04` | La perilla lateral, en primer plano    | La mano girándola, con la tanda pasando a 0.0               | **Producir**                                                          | `M-MD-02`, zoom `Z-01` |
| `F-05` | Foto MAL tomada: carátula cortada      | Un número fuera del encuadre                                | **Producir**                                                          | `M-MD-02`, comparativa |
| `F-06` | Foto MAL tomada: reflejo en el vidrio  | El reflejo tapando un dígito                                | **Producir**                                                          | `M-MD-02`, comparativa |
| `F-07` | Foto BIEN tomada                       | Los dos números completos y legibles                        | **Producir**                                                          | `M-MD-02`, comparativa |
| `F-08` | El sticker de código en un equipo      | La placa pegada a la máquina, con su código visible         | **Producir**                                                          | `M-MD-01`              |
| `F-09` | Un tractor en el surtidor              | La escena real de una carga                                 | **Producir**                                                          | Portada, `M-MD-01`     |
| `F-10` | El operador con el teléfono, en planta | Manos con guantes sosteniendo el teléfono a pleno sol       | **Producir**                                                          | Portada, Quick Guide   |

**`F-05`, `F-06` y `F-07` son las tres fotografías más valiosas del kit.** El problema está documentado en la especificación técnica: el medidor está montado a la altura del techo y su vidrio refleja la cubierta. Una comparativa visual de foto inservible frente a foto buena evita más registros perdidos que tres páginas de texto.

---

## B · Fotografía de campo — Carga sobre Inventario

| ID     | Fotografía                                   | Qué debe verse                              | Estado       | Usada en               |
| ------ | -------------------------------------------- | ------------------------------------------- | ------------ | ---------------------- |
| `F-20` | Carrotanque completo, de perfil              | El vehículo entero con su placa legible     | **Producir** | Portada, `M-CI-01`     |
| `F-21` | La placa del carrotanque, en primer plano    | Solo la placa, nítida                       | **Producir** | `M-CI-01`, zoom `Z-20` |
| `F-22` | La operación de despacho en curso            | La manguera conectada al carrotanque        | **Producir** | `M-CI-03`              |
| `F-23` | Foto BIEN tomada del carrotanque             | Vehículo completo, placa legible, buena luz | **Producir** | `M-CI-02`, comparativa |
| `F-24` | Foto MAL tomada: plano demasiado cerrado     | Solo una parte del tanque, sin placa        | **Producir** | `M-CI-02`, comparativa |
| `F-25` | El operador registrando junto al carrotanque | La escena real                              | **Producir** | Portada, Quick Guide   |

---

## C · Fotografía de contexto — común

| ID     | Fotografía                         | Qué debe verse                                               | Estado       | Usada en                                     |
| ------ | ---------------------------------- | ------------------------------------------------------------ | ------------ | -------------------------------------------- |
| `F-40` | El teléfono con el ícono instalado | La pantalla de inicio del teléfono con el ícono de CuadreApp | **Producir** | `M-*-00`, Quick Guide                        |
| `F-41` | El supervisor frente al tablero    | Persona real usando el Dashboard en su oficina               | **Producir** | Portada supervisores                         |
| `F-42` | El tanque de la planta             | El tanque cilíndrico elevado                                 | **Producir** | Manual de supervisor, capítulo de suministro |

---

## D · Capturas de pantalla

Las mismas 47 de T1 (siguen siendo válidas: el producto no cambió), más las variantes. Detalle en [`catalogo-pantallas.md`](catalogo-pantallas.md) y en cada manual.

| Grupo             | Cantidad         | Estado       |
| ----------------- | ---------------- | ------------ |
| `and-*` Android   | 15 + 2 variantes | **Producir** |
| `ios-*` iPhone    | 15 + 3 variantes | **Producir** |
| `dsh-*` Dashboard | 6                | **Producir** |
| `adm-*` Admin     | 11               | **Producir** |

---

## E · Marca — ya existe

| ID     | Asset                  | Origen                                                 |
| ------ | ---------------------- | ------------------------------------------------------ |
| `F-90` | Logo Lubryco           | `apps/pwa/src/marca/assets/lubryco.webp`               |
| `F-91` | Logotipo «Cuadre»      | Componente `Logotipo` — hay que exportarlo como imagen |
| `F-92` | Placas «APP» / «ADMIN» | Componente `Placa` — ídem                              |
| `F-93` | Íconos de instalación  | `apps/pwa/public/`                                     |

---

## Resumen

| Familia                            | Cantidad | Existe                      | Producir |
| ---------------------------------- | -------- | --------------------------- | -------- |
| Fotografía de campo, Medidor Doble | 10       | 2 parciales                 | 8        |
| Fotografía de campo, Inventario    | 6        | 0                           | 6        |
| Fotografía de contexto             | 3        | 0                           | 3        |
| Capturas de pantalla               | 52       | 0                           | 52       |
| Marca                              | 4        | 4 (2 requieren exportación) | —        |
| **Total**                          | **75**   | **6**                       | **69**   |

---

## Cómo se producen las fotografías de campo

Esta es la parte del kit que no se puede hacer desde un escritorio.

1. **Una sola visita a planta alcanza** si se lleva la lista: `F-01` a `F-10` se toman en la misma sesión, en menos de una hora.
2. **Luz natural, sin flash.** El flash sobre el vidrio del Fill-Rite produce exactamente el reflejo que estamos enseñando a evitar.
3. **Las fotos «mal tomadas» se toman a propósito** y con cuidado: tienen que parecer el error real de un operador apurado, no una parodia.
4. **Con personas reales de la planta**, con su ropa de trabajo y con permiso. Una foto de banco de imágenes se nota y destruye la credibilidad del manual completo.
5. **Sin datos identificables**: placas de vehículos particulares, rostros sin autorización, documentos.
6. **Formato horizontal y vertical de cada escena clave**, porque los manuales de operador son verticales y los de supervisor horizontales.

**Prerrequisito:** coordinar con el cliente. Es la única tarea del kit que depende de un tercero, y por eso debe agendarse primero aunque se ejecute al final.
