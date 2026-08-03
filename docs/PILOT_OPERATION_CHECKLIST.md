# Checklist de operación diaria — Piloto interno Sacyr

**Operación:** 3 carrotanques de Sacyr cargan diariamente en la EDS de
Lubryco. La operadora de Lubryco registra cada carga con CuadreApp.
**Supervisión:** consola Admin (pestañas Resumen y Sacyr).

## Arranque único (una sola vez, antes del primer día)

- [ ] Migración `20260803090000_admin.sql` aplicada y API redeplegada.
- [ ] Usuario admin creado (bootstrap documentado en OPERACIONES §admin)
      y login verificado en la consola.
- [ ] Cliente **Sacyr** creado en la consola (pestaña Clientes).
- [ ] Sede **EDS Lubryco** creada con su dispensador (totalizador de
      instalación = lectura REAL del medidor en el momento del arranque).
- [ ] Los 3 carrotanques creados en Equipos (placa como código,
      categoría "Carrotanque").
- [ ] La operadora creada en Operadores, con su código y PIN de 4
      dígitos (entregado en persona, no por chat).
- [ ] Código de enrolamiento generado en Dispositivos y el teléfono de
      la operadora enrolado e instalado como PWA.
- [ ] Carga de prueba completa (registrar → sincronizar → verla en el
      tablero Sacyr con sus 2 fotos) y verificada.
- [ ] La carga de prueba queda anotada para excluirla del conteo real.

## Antes de iniciar (cada día, 5 min)

- [ ] Teléfono de la operadora: batería > 50 % y app abre en la
      bienvenida azul.
- [ ] Diagnóstico del dispositivo: pendientes **0**, fotografías **0**,
      última sincronización reciente.
- [ ] El totalizador físico del Fill-Rite coincide con el "esperado"
      que muestra la app en la primera carga (si no: anotar y avisar).
- [ ] Consola Admin → Resumen: sin alertas pendientes de ayer.

## Durante la operación (cada carga)

1. La operadora registra la carga completa en la app: carrotanque →
   su código+PIN → foto ANTES (tanda en 0,0) → cargar → foto DESPUÉS →
   guardar. Nada más: la app valida y sincroniza sola.
2. Si el carrotanque no aparece: NO improvisar. Avisar al admin, que lo
   crea en Equipos; la operadora reintenta.
3. Si la app avisa que algo no cuadra (ámbar/rojo): leer el mensaje,
   corregir el número si fue digitación (botón ← Atrás) y seguir. El
   registro queda marcado para revisión — nunca se borra ni se repite.
4. Sin señal: seguir registrando con normalidad. El chip mostrará
   "Sin conexión — N en cola"; se sube solo al volver la señal.

## Después de la operación (cierre del día, 10 min)

- [ ] App: chip "Todo sincronizado" y Diagnóstico con pendientes 0.
- [ ] Consola → Sacyr: nº de cargas del día = nº de tanqueos reales
      (contra la planilla física de la EDS si se lleva).
- [ ] Galones por carrotanque razonables (sin ceros ni dobles).
- [ ] Cada carga del día tiene sus 2 fotos y estado "Cuadra".
- [ ] Cargas "Revisar"/"No cuadra": abrir evidencia, decidir y anotar
      la causa en la bitácora del piloto.
- [ ] Totalizador físico del medidor = totalizador del tablero.

## Sincronización — reglas y verificación

- La cola vive en el teléfono; el orden es fotos primero, luego el
  registro; los reintentos son automáticos con el mismo identificador
  (cero duplicados). No hay que "empujarla": solo dejar la app abierta
  con señal.
- Verificar: chip verde en la app + la carga visible en la consola.
- Si tras 10 min con señal sigue en cola: Diagnóstico → anotar "último
  error" → cerrar y abrir la app → si persiste, incidente.

## Incidentes

| Situación                                | Acción inmediata                                         | Después                                                               |
| ---------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| Teléfono perdido/dañado                  | Admin → Dispositivos → **Revocar**                       | Enrolar el teléfono de repuesto con código nuevo (Reenrolar)          |
| La operadora olvidó el PIN               | Admin → Operadores → Editar/PIN (nuevo PIN de 4 dígitos) | Entregarlo en persona                                                 |
| Carga con estado rojo                    | NO borrar ni repetir: el registro es evidencia           | Revisar fotos en el tablero, anotar causa                             |
| App no abre / pantalla en blanco         | Probar en el navegador la URL de la PWA                  | Si la PWA responde: reinstalar la app; si no: incidente de plataforma |
| "Registros con error" > 0 en Diagnóstico | Anotar el mensaje exacto                                 | Reportar al soporte técnico (Esteban) con pantallazo                  |
| Consola caída                            | La operación NO se detiene: la app funciona offline      | Verificar /listo de la API; revisar Railway                           |

Toda incidencia va a la bitácora del piloto: fecha, hora, qué pasó,
qué se hizo, cuánto tardó. Esa bitácora decide el GO hacia El Trébol.

## Cierre del piloto (tras ≥ 5 días operativos)

- [ ] 0 cargas perdidas y 0 duplicadas en todo el piloto.
- [ ] 100 % de cargas con evidencia fotográfica completa.
- [ ] Diferencia totalizador físico vs. sistema ≤ tolerancia acumulada.
- [ ] Incidencias cerradas y clasificadas (app / operación / red).
- [ ] Veredicto de la operadora (usabilidad real en isla).
- [ ] Decisión: ajustes → repetir ciclo · OK → preparar El Trébol.
