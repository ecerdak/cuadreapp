# ADM · Administrador — Consola completa

> Fuente: [`catalogo-pantallas.md`](../00_Fuente/catalogo-pantallas.md) · [`biblioteca-callouts.md`](../00_Fuente/biblioteca-callouts.md) · [`biblioteca-errores.md`](../00_Fuente/biblioteca-errores.md) · [`biblioteca-faq.md`](../00_Fuente/biblioteca-faq.md)
> Layout: [`../05_Layouts/ADM.md`](../05_Layouts/ADM.md) · Checklist: [`../06_Checklists/ADM.md`](../06_Checklists/ADM.md) · Troubleshooting: [`../07_Troubleshooting/ADM.md`](../07_Troubleshooting/ADM.md) · Video: [`../08_Storyboards/ADM.md`](../08_Storyboards/ADM.md)

---

## 1. Resumen

|                        |                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Audiencia**          | Equipo de Lubryco que administra la plataforma. Perfil técnico-comercial, no desarrollador.                                                                                     |
| **Objetivo**           | Dar de alta un cliente completo —identidad, configuración y operación— y dejarlo operando, **sin escribir una línea de código ni tocar la base de datos**.                      |
| **Tiempo de lectura**  | 18 minutos                                                                                                                                                                      |
| **Tiempo de práctica** | 1 cliente completo de prueba (unos 15 minutos)                                                                                                                                  |
| **Prerrequisitos**     | Usuario administrador de Lubryco · el logo del cliente en PNG/JPEG/WebP de menos de 1 MB · sus colores corporativos en formato `#RRGGBB` · los datos legales y las sedes reales |
| **Alcance**            | Ambos perfiles operativos                                                                                                                                                       |
| **Páginas estimadas**  | 22                                                                                                                                                                              |

**La promesa que este manual tiene que cumplir:** al terminarlo, quien lo lea debe poder crear un cliente nuevo de principio a fin. Si algún paso exige llamar a un desarrollador, es un defecto del producto y hay que reportarlo — no una limitación que el manual deba justificar.

---

## 2. Storyboard — página por página

### Página 1 · Portada

- **Título:** La consola de CuadreApp · **Subtítulo:** Guía del administrador · Lubryco
- **Pantalla:** `adm-02_resumen.png` (a sangre, difuminada)

### Página 2 · Qué se administra desde aquí

- **Título:** Todo, sin tocar código
- **Pantalla:** ninguna (diagrama `AS-DIA-05`, la jerarquía)
- **Contenido:** Cliente → Sedes → Equipos → Operadores → Dispositivos. Y transversal a todo: la identidad y la configuración del cliente.

### Página 3 · Entrar

- **Título:** Tu acceso · **Pantalla:** `adm-01_entrar.png`
- **Texto:** correo y contraseña. Si falla, los dos mensajes posibles y qué significa cada uno.

### Página 4 · El Resumen

- **Título:** El pulso de la operación · **Pantalla:** `adm-02_resumen.png`
- **Callouts:** `C-ADM-01` (Media), `C-ADM-02` (Alta)
- **Texto:** seis indicadores del día y el panel de alertas — que es tu lista de pendientes.

### Página 5 · Las alertas

- **Título:** Qué hacer con cada alerta
- **Pantalla:** `adm-02_resumen.png` recortada al panel de alertas
- **Contenido:** los dos tipos y su acción: carga que no cuadra → avisar al supervisor del cliente; dispositivo sin señal más de 24 h → confirmar que el teléfono sigue en la planta y encendido.

### Página 6 · Cargas de todos los clientes

- **Título:** El registro completo · **Pantalla:** `adm-03_cargas.png`
- **Texto:** filtro por cliente; la evidencia fotográfica se ve en el Dashboard de cada cliente, no aquí.

### Página 7 · Los clientes

- **Título:** La lista maestra · **Pantalla:** `adm-04_clientes.png`
- **Callouts:** `C-ADM-03` (Media), `C-ADM-04` (Alta)
- **Texto:** toda la fila abre la ficha; el buscador y el filtro de activos.

### Página 8 · Crear un cliente ★

- **Título:** Paso 1 · Crear el cliente
- **Pantalla:** `adm-04_clientes.png` recortada al diálogo «Nuevo cliente»
- **Callouts:** `C-ADM-04` (Alta)
- **Texto:** razón social, nombre comercial, NIT y perfil operativo. El logo y los colores vienen después, en la ficha.
- **Recuadro:** la diferencia entre razón social («Industrias Alimenticias El Trébol S.A.S.») y nombre comercial («El Trébol S.A.S.»): el primero va en documentos, el segundo es el que ven operadores y supervisores.

### Página 9 · La ficha del cliente ★

- **Título:** Las cuatro secciones · **Pantalla:** `adm-05_ficha-identidad.png` (con la navegación visible)
- **Contenido:** Identidad (quién es) · Configuración (cómo opera) · Operación (qué tiene) · Dashboard (cómo va). Este es el mapa del resto del manual.

### Página 10 · Identidad — datos y colores ★

- **Título:** Paso 2 · La identidad del cliente
- **Pantalla:** `adm-05_ficha-identidad.png` (grande)
- **Callouts:** `C-ADM-05` (Alta), `C-ADM-06` (Media)
- **Texto:** datos legales, los dos colores y el logo.

### Página 11 · Por qué solo dos colores ★

- **Título:** La identidad cambia, la experiencia no
- **Objetivo:** que no pidan «poder personalizar más».
- **Pantalla:** `adm-05_ficha-identidad.png` recortada a la vista previa
- **Callouts:** `C-ADM-05` (Alta)
- **Texto:** se guardan dos colores; el resto —bordes, estados, sombras, contraste del texto— lo deriva CuadreApp sola. Así ningún cliente termina con una interfaz distinta ni con texto ilegible sobre su color de marca.
- **Nota:** si un color contrasta poco, la consola avisa pero no bloquea.

### Página 12 · El logo

- **Título:** Subir, reemplazar, eliminar
- **Pantalla:** `adm-05_ficha-identidad.png` recortada al bloque del logo
- **Callouts:** `C-ADM-06` (Media)
- **Texto:** PNG, JPEG o WebP, máximo 1 MB. Sin logo se muestran las iniciales — nunca una imagen rota. SVG no se admite.

### Página 13 · Configuración — el perfil operativo ★

- **Título:** Paso 3 · Cómo opera este cliente
- **Pantalla:** `adm-06_ficha-configuracion.png` (grande)
- **Callouts:** `C-ADM-07` (Alta), `C-ADM-08` (Alta)
- **Texto:** el perfil decide qué ve el operador al capturar y qué ve el supervisor como evidencia.

### Página 14 · Elegir el perfil correcto ★

- **Título:** ¿Medidor Doble o Carga sobre Inventario?
- **Objetivo:** la decisión con más consecuencias de toda la consola.
- **Pantalla:** ninguna (tabla comparativa `AS-DIA-06`)
- **Contenido:**

  |                      | Medidor Doble                                                            | Carga sobre Inventario                           |
  | -------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
  | Cuándo               | La planta despacha con un dispensador con medidor de tanda y totalizador | Se carga a carrotanques y se controla inventario |
  | El operador registra | Tanda y totalizador, antes y después                                     | Con cuántos llegó y cuántos despachó Lubryco     |
  | El sistema calcula   | Nada: verifica con tres candados                                         | El total al salir                                |
  | La sede necesita     | Dispensador con totalizador inicial                                      | Solo la sede                                     |

- **Regla:** ante la duda, preguntar si hay un medidor con dos números en la misma carátula. Si lo hay, es Medidor Doble.

### Página 15 · Cambiar el perfil de un cliente que ya opera

- **Título:** Qué pasa con la historia
- **Pantalla:** `adm-06_ficha-configuracion.png` recortada al aviso ámbar
- **Callouts:** `C-ADM-08` (Alta)
- **Texto:** las cargas ya registradas conservan el suyo; los dispositivos toman el nuevo al sincronizar. La historia nunca se reinterpreta.

### Página 16 · Operación — las sedes ★

- **Título:** Paso 4 · Crear la sede
- **Pantalla:** `adm-07_ficha-operacion.png` (grande, con el bloque de sedes)
- **Callouts:** `C-ADM-09` (Alta)
- **Texto:** nombre visible, ciudad, dirección y referencia. Si el perfil requiere medidor, aquí se define el dispensador y su totalizador de instalación.
- **Advertencia:** el totalizador de instalación se escribe una vez y es la base de todo el histórico. Verificarlo contra la carátula física antes de guardar.

### Página 17 · Equipos y operadores

- **Título:** Paso 5 · Qué y quién
- **Pantalla:** `adm-07_ficha-operacion.png` recortada a los bloques de equipos y operadores
- **Callouts:** `C-ADM-10` (Media)
- **Texto:** cada uno puede ser de una sede o de todas. El PIN del operador se define aquí y no vuelve a mostrarse nunca.

### Página 18 · Dispositivos y enrolamiento ★

- **Título:** Paso 6 · Enrolar el teléfono
- **Pantalla:** `adm-07_ficha-operacion.png` recortada al bloque de dispositivos
- **Callouts:** `C-ADM-11` (Alta)
- **Texto:** «Generar código» → se lo dictas al operador → él lo escribe en su teléfono una sola vez. Vence en 7 días.

### Página 19 · Revocar y reenrolar

- **Título:** Cuando se pierde un teléfono · **Pantalla:** `adm-11_dispositivos.png`
- **Callouts:** `C-ADM-12` (Alta)
- **Texto:** «Revocar» corta el acceso en el acto. «Reenrolar» revoca y entrega un código nuevo en un solo paso.

### Página 20 · El Dashboard del cliente

- **Título:** Cómo va su operación · **Pantalla:** `adm-08_ficha-dashboard.png`
- **Texto:** la operación del día del cliente, sin salir de la consola. Las columnas cambian según el perfil de las cargas.

### Página 21 · Las vistas globales

- **Título:** Cuando administras muchos clientes
- **Pantallas:** `adm-09_equipos.png`, `adm-10_operadores.png`, `adm-11_dispositivos.png` (tres miniaturas)
- **Texto:** las mismas entidades vistas de forma transversal, útiles para buscar algo sin saber de qué cliente es.

### Página 22 · Alta de cliente en 10 minutos

- **Título:** La secuencia completa · **Pantalla:** ninguna
- **Contenido:** el checklist de §6 en una sola página, en orden, con casillas.

---

## 3. Capturas requeridas

Capturas de escritorio, navegador maximizado. **11 capturas.**

| #   | Archivo                          | Pantalla | Estado a capturar                                                           |
| --- | -------------------------------- | -------- | --------------------------------------------------------------------------- |
| 1   | `adm-01_entrar.png`              | ADM-01   | Formulario vacío                                                            |
| 2   | `adm-02_resumen.png`             | ADM-02   | Con al menos dos alertas visibles                                           |
| 3   | `adm-03_cargas.png`              | ADM-03   | Con el filtro de cliente desplegado                                         |
| 4   | `adm-04_clientes.png`            | ADM-04   | Con 3+ clientes, uno con logo y otro con iniciales                          |
| 5   | `adm-05_ficha-identidad.png`     | ADM-05   | Con logo cargado, dos colores puestos y la vista previa activa              |
| 6   | `adm-06_ficha-configuracion.png` | ADM-06   | Con el aviso ámbar de cambio de perfil visible                              |
| 7   | `adm-07_ficha-operacion.png`     | ADM-07   | Con las cuatro secciones pobladas (sede, equipos, operadores, dispositivos) |
| 8   | `adm-08_ficha-dashboard.png`     | ADM-08   | Con cargas del día e historial                                              |
| 9   | `adm-09_equipos.png`             | ADM-09   | Vista global con varios clientes                                            |
| 10  | `adm-10_operadores.png`          | ADM-10   | Vista global                                                                |
| 11  | `adm-11_dispositivos.png`        | ADM-11   | Con un dispositivo activo y uno revocado, y un código vigente               |

**Recortes:** panel de alertas, diálogo «Nuevo cliente», vista previa de identidad, bloque del logo, aviso ámbar de perfil, bloque de sedes, bloques de equipos y operadores, bloque de dispositivos. **8 recortes.**

**Datos para las capturas:** usar un cliente de demostración creado para esto (no el piloto real). Debe tener logo, dos colores, dos sedes y al menos un equipo compartido y uno exclusivo de sede, para que las capturas muestren las dos posibilidades.

---

## 4. Callouts

**12 callouts:** `C-ADM-01` a `C-ADM-12`. Ocho de prioridad alta.

Los cuatro decisivos, que deben tener el mayor peso visual: `C-ADM-05` (dos colores), `C-ADM-07` (el perfil decide el flujo), `C-ADM-08` (la historia no se toca), `C-ADM-11` (el código vence).

---

## 5. Errores frecuentes

`E-ADM-01` a `E-ADM-05`, y de la biblioteca de operadores, `E-OP-02` (el código de enrolamiento no funciona) — porque quien lo resuelve es el administrador.

---

## 6. Checklist operativo

**Alta de un cliente nuevo, en orden**

1. Crear el cliente: razón social, nombre comercial, NIT y **perfil operativo**.
2. Ficha → Identidad: subir el logo y poner los dos colores. Guardar.
3. Ficha → Configuración: confirmar el perfil (o cambiarlo antes de que haya cargas).
4. Ficha → Operación → Sedes: crear cada sede con su ciudad. Si el perfil requiere medidor, verificar el totalizador de instalación contra la carátula física.
5. Ficha → Operación → Equipos: dar de alta cada equipo y decidir si es de una sede o de todas.
6. Ficha → Operación → Operadores: nombre, código y PIN de cuatro dígitos. Anotar el PIN para dictárselo al operador — no se vuelve a ver.
7. Ficha → Operación → Dispositivos: generar el código y dictárselo a quien instala.
8. Confirmar con el operador que enroló y que ve sus equipos.
9. Confirmar con el supervisor que entra al Dashboard y ve su identidad.

**Mantenimiento semanal** 10. Revisar alertas en Resumen. 11. Revisar dispositivos sin señal por más de 24 h. 12. Revocar los dispositivos de teléfonos que ya no están en uso.

**Nunca**

- Nunca editar datos directamente en la base: todo tiene su pantalla.
- Nunca reutilizar un código de enrolamiento entre teléfonos.
- Nunca borrar un cliente para «empezar limpio»: arrastra su historia.

---

## 7. Troubleshooting

Matriz en [`../07_Troubleshooting/ADM.md`](../07_Troubleshooting/ADM.md).

---

## 8. Preguntas frecuentes

`F-ADM-01` a `F-ADM-08`. **8 preguntas.**

`F-ADM-02` («¿tengo que pedir código para un cliente nuevo?») debe ir primera: es la que confirma la promesa central del producto.

---

## 9. Tiempo esperado por pantalla

| Pantalla                                           | Primera vez  | En rutina      |
| -------------------------------------------------- | ------------ | -------------- |
| ADM-01 Entrar                                      | 30 s         | 10 s           |
| ADM-02 Resumen                                     | 2 min        | 1 min (diario) |
| ADM-04 Clientes + crear                            | 3 min        | 1 min          |
| ADM-05 Identidad (logo y colores)                  | 4 min        | 2 min          |
| ADM-06 Configuración                               | 1 min        | 20 s           |
| ADM-07 Operación (sede + 3 equipos + 2 operadores) | 8 min        | 4 min          |
| ADM-07 Dispositivos (generar código)               | 30 s         | 15 s           |
| **Alta completa de un cliente**                    | **≈ 18 min** | **≈ 10 min**   |

La cifra de rutina (10 minutos) es la que el manual debe prometer, y es la que valida la promesa del producto: un cliente nuevo operando sin escribir código.
