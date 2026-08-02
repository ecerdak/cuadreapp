# Validación física — Android

**URL:** https://cuadreapppwa-production.up.railway.app
**Código de enrolamiento:** `VAL-ANDROID-A316` (un solo uso, expira en 7 días)
**Datos de prueba:** equipo `T-04` · conductor código `07` · PIN `0000`

> ⚠️ **REQUISITO PREVIO:** los pasos marcados 🆕 prueban el hardening que aún
> está SOLO en commits locales (sin push, por instrucción). Sin ese deploy,
> validarás la versión anterior: los pasos 🆕 fallarán y NO cuenta como fallo.
> Autorizar el push ANTES de ejecutar esta lista.

Anota junto a cada paso: hora y qué viste. Si algo falla: pantallazo + número de paso.

## Checklist

- [ ] **1. Instalar:** abrir la URL en Chrome → 🆕 botón amarillo "Instalar CuadreApp" (o menú ⋮ → "Agregar a la pantalla principal"). El ícono azul con C amarilla aparece en el inicio.
- [ ] **2. Standalone:** abrir DESDE EL ÍCONO → sin barra de direcciones de Chrome (pantalla completa).
- [ ] **3. Enrolar:** código `VAL-ANDROID-A316`, nombre "Android validación". Aceptar el permiso de almacenamiento si aparece. → pantalla de inicio con "Cargar combustible".
- [ ] **4. Iniciar carga CON Internet:** Cargar combustible → equipo T-04 → código 07 + PIN 0000 → pantalla "Antes de cargar" (totalizador pre-llenado).
- [ ] **5. MODO AVIÓN.** (Ajustes rápidos → avión ON. Verifica que no haya WiFi.)
- [ ] **6. Completar offline:** foto inicial (cámara en vivo) → "Empezar a cargar" → esperar ~1 min → "Terminé" → tanda final `42,5`, totalizador final = inicial + 42,5 → foto final → NO guardar todavía.
- [ ] **7. Matar la app** a mitad de captura: recientes → deslizar CuadreApp fuera. 🆕
- [ ] **8. Reabrir SIN Internet** desde el ícono → abre sin red (shell offline).
- [ ] **9. 🆕 Borrador presente:** vuelve al MISMO paso, con las fotos ya tomadas intactas.
- [ ] **10. Guardar la carga offline** → pantalla "Registro guardado" → chip: 🆕 "Sin conexión — 1 en cola" (o "En cola: 1" en la versión vieja).
- [ ] **11. Quitar modo avión** con la app abierta.
- [ ] **12. Sincronización única:** 🆕 chip "Sincronizando 1 de 1…" → "Todo sincronizado · último envío HH:MM" (≤60 s).
- [ ] **13. Cero duplicados / cero pendientes:** en "Tus cargas de hoy" la carga aparece UNA vez, estado "Cuadra". (Supervisor: verificar una sola fila en la base.)
- [ ] **14. 🆕 Diagnóstico:** enlace abajo del inicio → pendientes 0, fotografías 0, almacenamiento protegido "sí", última sincronización reciente.

**Resultado:** ☐ TODO OK ☐ FALLOS (listar números): ________
