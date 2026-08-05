# Catálogo de pantallas — fuente de verdad del Training Kit

Una entrada por pantalla real del producto. **Todo texto entre comillas está copiado literal del código**, y la columna `Código` dice de dónde. Si el código cambia, se corrige aquí y el verificador señala qué manuales revisar.

Convención de captura: `{contexto}-{NN}_{slug}.png` — contextos `and` (Android), `ios` (iPhone), `dsh` (Dashboard), `adm` (Admin). Android e iPhone son capturas distintas de la misma pantalla porque cambia la barra de estado y el flujo de instalación; el resto se comparte.

---

## PWA — flujo del operador

### `PWA-01` · Splash

- **Código:** `apps/pwa/src/pantallas/Splash.tsx`
- **Capturas:** `and-01_splash.png`, `ios-01_splash.png`
- **Perfiles:** ambos · **Manuales:** OP-AND-MD, OP-AND-CI, OP-IOS-MD, OP-IOS-CI
- **Textos:** «CADA GALÓN CUADRA» · «BY» + logo Lubryco · logotipo «Cuadre»
- **Interacción:** toda la pantalla es táctil; avanza sola a los 2 s.
- **Sin barra de avance.**

### `PWA-02` · Enrolar este dispositivo

- **Código:** `apps/pwa/src/pantallas/Enrolar.tsx`
- **Capturas:** `and-02_enrolar.png`, `ios-02_enrolar.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Título:** «Enrolar este dispositivo»
- **Subtítulo:** «Este celular se enrola una sola vez a la estación. Pídele el código de enrolamiento al supervisor.»
- **Campos:** «Código de enrolamiento» (texto, mayúsculas automáticas) · «Nombre del dispositivo (opcional)» (marcador «Tablet almacén»)
- **Botón:** «Enrolar» → «Enrolando…». Se habilita con 6 o más caracteres.
- **Error:** «No se pudo enrolar.»
- **Nota:** única pantalla con teclado alfanumérico. La usa el supervisor, no el operador.

### `PWA-03` · Inicio

- **Código:** `apps/pwa/src/pantallas/Inicio.tsx`
- **Capturas:** `and-03_inicio.png`, `ios-03_inicio.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Título:** «Buenos días» / «Buenas tardes» / «Buenas noches» + nombre del último operador
- **Botón principal:** «Cargar combustible» con subtexto «Toma unos 40 segundos»
- **Secciones:** «Cargas de hoy» (hora · equipo · «en cola» si falta subir · galones · chip de estado)
- **Chip de sincronización, un estado a la vez:** «Todo sincronizado» · «En cola: {n} — subiendo» · «Sin conexión — {n} en cola» · «Sincronizando {a} de {b}…» · «{n} con error — avisa al supervisor» · «Trabajando offline»
- **Aviso de riesgo:** «El navegador no garantiza conservar los datos» / «No borres los datos del navegador: las cargas sin subir se perderían.»
- **Enlace:** «Diagnóstico del dispositivo»
- **Sin barra de avance** (es la raíz; no tiene botón atrás).

### `PWA-04` · Equipo — lista

- **Código:** `apps/pwa/src/pantallas/Equipo.tsx` (vista lista)
- **Capturas:** `and-04_equipo-lista.png`, `ios-04_equipo-lista.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Título:** «¿Qué equipo vas a cargar?»
- **Subtítulo:** «Busca el código que está en el sticker de la máquina.»
- **Campo:** buscador con marcador «Buscar por código (T-04…)»
- **Avance:** 1 de 5

### `PWA-05` · Equipo — confirmación

- **Código:** `apps/pwa/src/pantallas/Equipo.tsx` (vista confirmación)
- **Capturas:** `and-05_equipo-confirma.png`, `ios-05_equipo-confirma.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Subtítulo:** «Confirma que es la máquina que vas a cargar.»
- **Tarjeta verde:** «Equipo reconocido» + código grande + descripción (+ «Horómetro de la última carga» / «Odómetro de la última carga» si aplica)
- **Botones:** «Sí, es este» · enlace «No, buscar otro»
- **Avance:** 1 de 5

### `PWA-06` · Operador — código

- **Código:** `apps/pwa/src/pantallas/Conductor.tsx` (sin operador identificado)
- **Capturas:** `and-06_operador-codigo.png`, `ios-06_operador-codigo.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Título:** «Confirma tu clave» · **Subtítulo:** «Cargando {CÓDIGO} · {descripción}»
- **Campo:** «Código de conductor» + teclado numérico. Reconoce solo, sin botón.
- **Error:** «Código o PIN incorrecto.»
- **Avance:** 2 de 5

### `PWA-07` · Operador — PIN

- **Código:** `apps/pwa/src/pantallas/Conductor.tsx` (con operador identificado)
- **Capturas:** `and-07_operador-pin.png`, `ios-07_operador-pin.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Tarjeta:** «Conductor» + nombre + «Código {n}» · cuatro puntos que se llenan · leyenda «Cuatro dígitos»
- **Botón:** «Continuar» (gris hasta completar 4 dígitos) · enlace «No soy {nombre} — cambiar»
- **Nota:** el PIN se verifica **sin señal**, contra el catálogo guardado en el teléfono.
- **Avance:** 2 de 5

### `PWA-08` · Antes de cargar · **solo Medidor Doble**

- **Código:** `apps/pwa/src/pantallas/AntesDeCargar.tsx`
- **Capturas:** `and-08_antes.png`, `ios-08_antes.png`
- **Perfiles:** medidor_doble · **Manuales:** OP-AND-MD, OP-IOS-MD
- **Título:** «Antes de cargar»
- **Subtítulo:** «Deja el medidor en 0.0 y toma la foto. Una sola foto muestra los dos números.»
- **Cámara:** «Foto del medidor (inicial)» · píldora «Encuadra la carátula completa» → «Foto tomada — toca para re-tomar» · pie «Solo cámara en vivo · queda con hora y ubicación»
- **Campos:** «Tanda de arriba» (ayuda «debe ser 0,0») · «Total gallons» (ayuda «esperado {n}»)
- **Avisos posibles:** «La tanda no está en cero» · «El medidor arrancó {n} gal más arriba»
- **Botón:** «Empezar a cargar» / «Toma la foto para seguir»
- **Avance:** 3 de 5

### `PWA-09` · Cargando

- **Código:** `apps/pwa/src/pantallas/Cargando.tsx`
- **Capturas:** `and-09_cargando.png`, `ios-09_cargando.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Título:** «Cargando» · cronómetro MM:SS · leyenda «Tiempo de carga»
- **Tarjeta:** «Equipo» · «Conductor» · «Medidor al iniciar» (solo Medidor Doble)
- **Botón:** «Terminé de cargar»
- **Avance:** 4 de 5

### `PWA-10` · Después de cargar · **solo Medidor Doble**

- **Código:** `apps/pwa/src/pantallas/DespuesDeCargar.tsx`
- **Capturas:** `and-10_despues.png`, `ios-10_despues.png`
- **Perfiles:** medidor_doble · **Manuales:** OP-AND-MD, OP-IOS-MD
- **Título:** «Después de cargar» · **Subtítulo:** «Toma la foto del cierre y copia los dos números.»
- **Cámara:** «Foto del medidor (final)»
- **Campos:** «Tanda de arriba» · «Total gallons» (ayuda «subió {n}») · «Horómetro del equipo» u «Odómetro del equipo» (ayuda «anterior {n}»)
- **Aviso de éxito:** «Cuadra: {n} galones» · **de error:** «La tanda dice {x} pero el totalizador subió {n}»
- **Nota condicional:** «Nota obligatoria — la tanda no arrancó en 0,0» + área de texto
- **Botón:** «Guardar la carga» → «Guardando…»
- **Avance:** 5 de 5

### `PWA-11` · Llegada del carrotanque · **solo Carga sobre Inventario**

- **Código:** `apps/pwa/src/pantallas/Llegada.tsx`
- **Capturas:** `and-11_llegada.png`, `ios-11_llegada.png`
- **Perfiles:** carga_inventario · **Manuales:** OP-AND-CI, OP-IOS-CI
- **Título:** «Llegada del carrotanque»
- **Subtítulo:** «Toma la foto del carrotanque y registra con cuántos galones llegó. Si llegó vacío, escribe 0,0.»
- **Cámara sin guía:** «Foto inicial del carrotanque» · «Encuadra el carrotanque completo»
- **Campo único:** «Galones con los que llegó» (ayuda «0,0 si llegó vacío»)
- **Botón:** «Empezar a cargar» / «Toma la foto para seguir»
- **Avance:** 3 de 5

### `PWA-12` · Despacho · **solo Carga sobre Inventario**

- **Código:** `apps/pwa/src/pantallas/Despacho.tsx`
- **Capturas:** `and-12_despacho.png`, `ios-12_despacho.png`
- **Perfiles:** carga_inventario · **Manuales:** OP-AND-CI, OP-IOS-CI
- **Título:** «Después de cargar»
- **Subtítulo:** «Toma la foto final y registra cuántos galones despachó Lubryco. El total al salir se calcula solo.»
- **Cámara sin guía:** «Foto final del carrotanque»
- **Campo único:** «Galones despachados por Lubryco» (ayuda «llegó con {n}»)
- **Tarjeta calculada:** «Llegó con» · «Despachado por Lubryco» · «Total al salir» (destacado) + leyenda «El total lo calcula la aplicación — nunca se escribe a mano.»
- **Campo libre:** «Observaciones (opcional)»
- **Aviso si 0:** «No se registró despacho»
- **Botón:** «Guardar la carga» → «Guardando…»
- **Avance:** 5 de 5

### `PWA-13` · Listo

- **Código:** `apps/pwa/src/pantallas/Listo.tsx`
- **Capturas:** `and-13_listo.png`, `ios-13_listo.png`
- **Perfiles:** ambos (la tarjeta cambia) · **Manuales:** los 4 de operador
- **Elementos:** círculo verde «✓» · cifra grande de galones · «galones cargados»
- **Tarjeta Medidor Doble:** «Equipo» · «Conductor» · «Hora» · «Medidor» ({inicial} → {final})
- **Tarjeta Carga sobre Inventario:** «Equipo» · «Conductor» · «Hora» · «Llegó con» · «Despachado por Lubryco» · «Total al salir»
- **Chip:** «Cuadra» / «Revisar» / «No cuadra»
- **Sin señal:** «Guardado en el celular» / «No hay señal en este momento. La carga se sube sola cuando vuelva la red. Ya quedó registrada.» · **Con señal:** «✓ Guardado y sincronizado»
- **Botón:** «Registrar otra carga»
- **Nota:** paso terminal — no tiene botón atrás por diseño.

### `PWA-14` · Diagnóstico

- **Código:** `apps/pwa/src/pantallas/Diagnostico.tsx`
- **Capturas:** `and-14_diagnostico.png`, `ios-14_diagnostico.png`
- **Perfiles:** ambos · **Manuales:** los 4 de operador (sección de problemas)
- **Título:** «Diagnóstico»
- **Filas:** «Versión instalada» · «Modo» · «Conectividad» · «Almacenamiento usado» · «Almacenamiento protegido» · «Cargas pendientes de subir» · «Fotografías pendientes» · «Registros con error» · «Captura en curso guardada» · «Última sincronización» · «Último error»
- **Botón:** «Volver»
- **Uso en manuales:** es la pantalla que el operador le muestra al supervisor cuando algo falla.

### `PWA-15` · Instalación en el teléfono · **pantalla del sistema operativo**

- **Código:** `apps/pwa/src/instalacion/InstalarApp.tsx` (la tarjeta que la invita) + flujo nativo del navegador
- **Capturas:** `and-15_instalar.png` (menú ⋮ de Chrome), `ios-15_instalar.png` (hoja Compartir de Safari)
- **Perfiles:** ambos · **Manuales:** los 4 de operador
- **Tarjeta en la app:** «Instala CuadreApp en este teléfono»
- **Android:** botón «Instalar CuadreApp»; si no aparece, «Abre el menú ⋮ de Chrome y toca "Agregar a la pantalla principal".»
- **iPhone:** «En Safari: toca Compartir (el cuadrado con la flecha) y luego "Añadir a pantalla de inicio".»
- **Nota:** es **la única diferencia sustancial** entre los manuales Android y iPhone además de la barra de estado. En iPhone la instalación solo funciona desde Safari (política de Apple) y no existe el botón automático.

---

## Dashboard — supervisor del cliente

### `DSH-01` · Hoy

- **Código:** `apps/dashboard/src/paginas/Hoy.tsx`
- **Captura:** `dsh-01_hoy.png` · **Manuales:** SUP-MD, SUP-CI
- **Paneles:** «Acción de hoy» (veredicto) · «Totalizador del medidor» (rodillo) · «Consumo diario · últimos 14 días» · «Cargas de hoy · {n} registradas»
- **Botón:** «Actualizar» · se refresca solo cada 60 s
- **Nota por perfil:** el panel del totalizador y su explicación son propios de Medidor Doble.

### `DSH-02` · Cargas — lista y filtros

- **Código:** `apps/dashboard/src/paginas/Cargas.tsx`
- **Captura:** `dsh-02_cargas.png` · **Manuales:** SUP-MD, SUP-CI
- **Zona superior:** «Estado del registro · últimos 14 días» · «Cargas que cuadran» · «Despachados sin equipo asignado» · «Carga sin foto final»
- **Export:** «Descargar el detalle» → «Día · hoy» y «Últimos 14 días» (→ «Generando…»)
- **Filtros:** «Todas» · «Cuadran» · «Revisar» · «No cuadran»
- **Tabla:** Fecha · Hora · Equipo · Conductor · Galones · Estado
- **Ayuda:** «Últimas cargas · toca una fila para ver la evidencia»

### `DSH-03` · Evidencia — Medidor Doble

- **Código:** `apps/dashboard/src/paginas/Cargas.tsx` (`PanelEvidencia`)
- **Captura:** `dsh-03_evidencia-medidor.png` · **Manuales:** SUP-MD
- **Contenido:** dos fotos («Antes de cargar» / «Después de cargar») con «Tanda» y «Totalizador» bajo cada una · «Verificación automática» con tres candados · mensajes por bandera · contador del equipo · «Nota del conductor:»
- **Candados:** «Tanda en 0,0» · «Continuidad del totalizador» · «La tanda cuadra»

### `DSH-04` · Evidencia — Carga sobre Inventario

- **Código:** `apps/dashboard/src/paginas/Cargas.tsx` (`EvidenciaInventario`)
- **Captura:** `dsh-04_evidencia-inventario.png` · **Manuales:** SUP-CI
- **Contenido:** recuadro de tres cifras («Llegó con» · «Despachado por Lubryco» · «Total al salir») + «El total lo calcula el sistema — el operador nunca lo escribe.» · dos fotos («Llegada» / «Salida») · duración · «Observaciones:»
- **No muestra** candados, tanda ni totalizador: ese perfil no los tiene.

### `DSH-05` · Equipos

- **Código:** `apps/dashboard/src/paginas/Equipos.tsx`
- **Captura:** `dsh-05_equipos.png` · **Manuales:** SUP-MD, SUP-CI
- **Zona superior:** «Desvío detectado» · «Equipos con consumo registrado»
- **Tabla:** Equipo · Descripción · Galones · Uso · Rendimiento · Desvío
- **Pie explicativo:** «El desvío compara cada equipo contra su propia mediana histórica…»

### `DSH-06` · Suministro

- **Código:** `apps/dashboard/src/paginas/Suministro.tsx`
- **Captura:** `dsh-06_suministro.png` · **Manuales:** SUP-MD, SUP-CI
- **Zona superior:** «Reabastecimiento» · «Autonomía restante» · «Pedido sugerido»
- **Tarjeta:** «Balance de suministro» («Entregado» · «Despachado» · «En tanque»)
- **Tabla:** Remisión · Fecha · Galones · Carrotanque · Recibido por

---

## Admin — consola de Lubryco

### `ADM-01` · Entrar

- **Código:** `apps/admin/src/paginas/Entrar.tsx` · **Captura:** `adm-01_entrar.png`
- **Textos:** «Consola administrativa de Lubryco» · campos «Correo» y «Contraseña» · botón «Entrar» → «Entrando…»
- **Errores:** «Correo o contraseña incorrectos.» · «No se pudo contactar la API. Revisa la conexión.»

### `ADM-02` · Resumen

- **Código:** `apps/admin/src/paginas/Resumen.tsx` · **Captura:** `adm-02_resumen.png`
- **Indicadores:** «Cargas hoy» · «Galones hoy» · «Clientes activos» · «Equipos activos» · «Operadores» · «Alertas»
- **Paneles:** «Alertas» · «Cargas recientes · todos los clientes» + enlace «Ver todas»

### `ADM-03` · Cargas

- **Código:** `apps/admin/src/paginas/Cargas.tsx` · **Captura:** `adm-03_cargas.png`
- **Tabla:** Hora · Cliente · Sede · Equipo · Operador · Galones · Estado · Observaciones · Fotos

### `ADM-04` · Clientes — lista maestra

- **Código:** `apps/admin/src/paginas/Clientes.tsx` · **Captura:** `adm-04_clientes.png`
- **Tabla:** Cliente (logo + comercial + razón social) · NIT · Perfil · Sedes · Estado · «Abrir ficha →»
- **Diálogo «Nuevo cliente»:** «Razón social» · «Nombre comercial (opcional)» · «NIT (opcional)» · «Perfil Operativo» + nota «El logo y los colores corporativos se configuran en la ficha del cliente, en Identidad.»

### `ADM-05` · Ficha → Identidad

- **Código:** `apps/admin/src/paginas/cliente/Identidad.tsx` · **Captura:** `adm-05_ficha-identidad.png`
- **Datos legales:** «Razón social» · «Nombre comercial» · «NIT»
- **Colores:** «Color primario» · «Color secundario» + «Solo estos dos colores se guardan. Estados, bordes, sombras y contrastes los deriva CuadreApp automáticamente: la identidad cambia, la experiencia no.»
- **Logo:** «Subir logo» / «Reemplazar» / «Eliminar» + «PNG, JPEG o WebP · máx. 1 MB.»
- **Vista previa** y botón «Guardar identidad» → «✓ Identidad actualizada»

### `ADM-06` · Ficha → Configuración

- **Código:** `apps/admin/src/paginas/cliente/Configuracion.tsx` · **Captura:** `adm-06_ficha-configuracion.png`
- **Selector:** «Perfil Operativo» / «Perfil» + «Define cómo el operador captura una carga y cómo se muestra la evidencia. Es lo único que decide el flujo — nunca el nombre del cliente.»
- **Aviso con historia:** «La historia conserva el perfil con el que fue registrada. Los dispositivos utilizarán el nuevo perfil después de sincronizar nuevamente.»
- **Panel:** «Próximas configuraciones»

### `ADM-07` · Ficha → Operación

- **Código:** `apps/admin/src/paginas/cliente/Operacion.tsx` · **Captura:** `adm-07_ficha-operacion.png`
- **Cuatro bloques en cascada:** «Sedes» · «Equipos» · «Operadores» · «Dispositivos»
- **Sede:** «Nombre visible de la sede» · «Ciudad / municipio» · «Dirección (opcional)» · «Referencia operativa (opcional)» (+ dispensador y totalizador si el perfil lo requiere)
- **Equipo/Operador:** selector «Sede» con opción «Todas las sedes»
- **Dispositivos:** «Generar código» → «Código de enrolamiento: {CÓDIGO} · válido 7 días, un solo uso.»

### `ADM-08` · Ficha → Dashboard del cliente

- **Código:** `apps/admin/src/paginas/cliente/Dashboard.tsx` · **Captura:** `adm-08_ficha-dashboard.png`
- **Tarjetas:** «Cargas del día» · «Galones» · «Duración promedio» · «Operadores» · «Última carga»
- **Paneles:** «Galones por equipo · hoy» · «Historial · últimos 14 días» (columnas «Llegó con» y «Total al salir» aparecen solo si hay cargas de inventario)
- **Modal:** «Ver fotos (n)»

### `ADM-09` · Equipos (vista global)

- **Código:** `apps/admin/src/paginas/Equipos.tsx` · **Captura:** `adm-09_equipos.png`
- **Tabla:** Código / placa · Cliente · Categoría · Observaciones · Estado · Acciones

### `ADM-10` · Operadores (vista global)

- **Código:** `apps/admin/src/paginas/Operadores.tsx` · **Captura:** `adm-10_operadores.png`
- **Tabla:** Nombre · Código · Cliente · Último acceso · Estado · «Editar / PIN»
- **PIN:** «PIN (4 dígitos)» al crear · «Nuevo PIN (vacío = no cambiar)» al editar

### `ADM-11` · Dispositivos (vista global)

- **Código:** `apps/admin/src/paginas/Dispositivos.tsx` · **Captura:** `adm-11_dispositivos.png`
- **Paneles:** «Generar código de enrolamiento» · «Dispositivos enrolados» · «Códigos de enrolamiento emitidos»
- **Acciones:** «Reenrolar» · «Revocar»

---

## Resumen de reutilización

| Contexto    | Pantallas                   | Capturas        | Comentario                                                         |
| ----------- | --------------------------- | --------------- | ------------------------------------------------------------------ |
| PWA Android | 15                          | 15              | 13 comunes a ambos perfiles, 2 exclusivas por perfil               |
| PWA iPhone  | 15                          | 15              | mismas pantallas, capturas propias (barra de estado e instalación) |
| Dashboard   | 6                           | 6               | 4 compartidas entre perfiles, 2 exclusivas de evidencia            |
| Admin       | 11                          | 11              | manual único                                                       |
| **Total**   | **32 entradas de pantalla** | **47 capturas** | 7 manuales                                                         |

Las 32 entradas producen 47 capturas porque cada pantalla de la PWA se fotografía dos veces —una en Android y otra en iPhone—, mientras que Dashboard y Admin tienen una sola captura por pantalla.

Sin el catálogo, los mismos contenidos exigirían **86 capturas** y describir «Inicio» cuatro veces. La reutilización no es un ahorro cosmético: es lo que hace que una pantalla se corrija en un solo lugar.
