# Training Kit de CuadreApp — v1.0

Esto **no es un conjunto de manuales**. Es el sistema que los genera y los mantiene sincronizados con el producto.

La diferencia importa: siete manuales escritos a mano se desactualizan en la primera semana en que alguien mueve un botón. Aquí, cambiar una pantalla es cambiar **una entrada** en el catálogo, y todos los manuales que la usan quedan corregidos.

---

## Cómo está construido

```
docs/training/
├── README.md              ← este archivo
├── 00_Fuente/             ← LA FUENTE DE VERDAD (editar aquí primero)
│   ├── catalogo-pantallas.md      una entrada por pantalla REAL, con su archivo de código
│   ├── biblioteca-callouts.md     los callouts, escritos una sola vez
│   ├── biblioteca-errores.md      errores frecuentes + troubleshooting compartido
│   └── biblioteca-faq.md          preguntas frecuentes por audiencia
├── 01_Operadores/         4 manuales (Android/iPhone × 2 perfiles operativos)
├── 02_Supervisores/       2 manuales (Dashboard por perfil)
├── 03_Admin/              1 manual (consola completa)
├── 04_Assets/             inventario de todo lo gráfico que hay que producir
├── 05_Layouts/            cómo se diagrama cada página (para Claude Design)
├── 06_Checklists/         checklists operativos imprimibles
├── 07_Troubleshooting/    matrices problema → causa → solución
├── 08_Storyboards/        guiones para grabar los videos tutoriales
└── 09_Exports/            índice general: páginas, capturas, assets, prioridad, esfuerzo
```

**`00_Fuente/` no estaba en el encargo original y es la pieza clave.** Sin ella, la misma pantalla («Inicio») aparecería copiada en cuatro manuales de operador, y actualizarla serían cuatro ediciones que hay que acordarse de hacer. Con ella, se edita una vez y los manuales solo la referencian por ID.

---

## Las tres reglas del kit

1. **Ningún texto se inventa.** Todo lo que un manual pone entre comillas como «lo que el usuario ve» está copiado literal del código, y el catálogo dice de qué archivo salió. Si no está en el código, no va entre comillas.
2. **Una pantalla, una entrada.** Los manuales referencian pantallas por ID (`PWA-08`), nunca la describen de nuevo.
3. **Una captura, un nombre.** El nombre de archivo lo decide el catálogo. Dos manuales que muestran la misma pantalla comparten la captura — por eso 7 manuales necesitan 47 capturas y no 86.

---

## Cómo actualizar cuando el producto cambia

**Cambió un texto de una pantalla** (el caso más común):

1. Abrir `00_Fuente/catalogo-pantallas.md`, buscar la pantalla por su archivo de código.
2. Corregir el texto literal.
3. Correr `node scripts/verificar-training-kit.mjs` — dice qué manuales usan esa pantalla.
4. Revisar solo esos. **Tiempo típico: 5 minutos.**

**Se agregó una pantalla:**

1. Nueva entrada en el catálogo (con su archivo de código y su nombre de captura).
2. Callouts en `00_Fuente/biblioteca-callouts.md`.
3. Insertarla en el storyboard de los manuales donde aparece, y en su layout.
4. Sumarla a `09_Exports/indice-general.md`.

**Se eliminó o renombró una pantalla:**

El verificador falla y nombra el archivo que ya no existe. Eso es intencional: **es imposible que el kit quede en silencio desactualizado**.

---

## El verificador

```bash
node scripts/verificar-training-kit.mjs
```

Comprueba tres cosas:

- **Sincronía con el código:** cada pantalla del catálogo apunta a un archivo fuente que existe. Si alguien borra `AntesDeCargar.tsx`, esto falla.
- **Integridad interna:** cada pantalla que un manual referencia existe en el catálogo (sin referencias huérfanas), y cada pantalla del catálogo la usa al menos un manual (sin entradas muertas).
- **Cobertura:** cada manual tiene sus nueve secciones obligatorias, su layout, su checklist, su troubleshooting y su storyboard de video.

No está enganchado a `pnpm verificar` a propósito: el kit es documentación y no debe romper el build del producto. Engancharlo es una línea, y es decisión del propietario.

---

## Qué NO hay aquí (y es deliberado)

- **PDFs, imágenes y capturas exportadas.** Esta etapa produce la fuente; la producción visual es de Claude Design.
- **Diseño.** `05_Layouts/` dice _qué va en cada página y con qué jerarquía_, nunca colores, tipografías ni medidas: eso lo decide el sistema de diseño.
- **Manuales por cliente.** Un cliente no tiene manual propio: tiene un **perfil operativo**, y el perfil decide el manual. Esa es la misma regla que gobierna el producto ([DEC-016](../PRODUCT_BIBLE.md#decisiones)); si algún día se rompiera aquí, tendríamos siete manuales por cliente.

---

## Estado

| Manual                                          | ID          | Perfil           | Estado       |
| ----------------------------------------------- | ----------- | ---------------- | ------------ |
| Operadores Android · Medidor Doble              | `OP-AND-MD` | medidor_doble    | Fuente lista |
| Operadores Android · Carga sobre Inventario     | `OP-AND-CI` | carga_inventario | Fuente lista |
| Operadores iPhone · Medidor Doble               | `OP-IOS-MD` | medidor_doble    | Fuente lista |
| Operadores iPhone · Carga sobre Inventario      | `OP-IOS-CI` | carga_inventario | Fuente lista |
| Supervisores · Dashboard Medidor Doble          | `SUP-MD`    | medidor_doble    | Fuente lista |
| Supervisores · Dashboard Carga sobre Inventario | `SUP-CI`    | carga_inventario | Fuente lista |
| Administrador · Consola completa                | `ADM`       | ambos            | Fuente lista |

Detalle de páginas, capturas y esfuerzo: [`09_Exports/indice-general.md`](09_Exports/indice-general.md).
