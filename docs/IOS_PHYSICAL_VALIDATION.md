# Validación física — iPhone

**URL:** https://cuadreapppwa-production.up.railway.app
**Código de enrolamiento:** `VAL-IPHONE-2783` (un solo uso, expira en 7 días)
**Datos de prueba:** equipo `T-01` · conductor código `03` · PIN `0000`

> ⚠️ **REQUISITO PREVIO:** los pasos 🆕 prueban el hardening que aún está SOLO
> en commits locales (sin push, por instrucción). Autorizar el push ANTES de
> ejecutar esta lista, o se validará la versión anterior.
>
> ⚠️ **Solo Safari.** Chrome en iPhone no puede instalar a pantalla de inicio.

Anota hora y lo que viste en cada paso. Si algo falla: pantallazo + número de paso.

## Checklist

- [ ] **1. Instalar:** abrir la URL en **Safari** → 🆕 aparece la guía de instalación → Compartir (cuadrado con flecha) → "Añadir a pantalla de inicio" → Añadir. Ícono azul con C amarilla visible.
- [ ] **2. Standalone:** abrir DESDE EL ÍCONO → pantalla completa, sin barra de Safari. 🆕 La guía de instalación ya NO aparece.
- [ ] **3. Enrolar:** código `VAL-IPHONE-2783`, nombre "iPhone validación" → inicio con "Cargar combustible".
- [ ] **4. Iniciar carga CON Internet:** T-01 → código 03 + PIN 0000 → "Antes de cargar".
- [ ] **5. MODO AVIÓN** (verificar WiFi apagado también).
- [ ] **6. Completar offline:** foto inicial → "Empezar a cargar" → ~1 min → "Terminé" → tanda `38,5`, totalizador = inicial + 38,5 → foto final → NO guardar todavía.
  - 👁️ **Punto de vigilancia iOS:** la foto debe previsualizarse bien — valida la corrección jpeg/png (Safari no produce WebP).
- [ ] **7. Matar la app** (deslizar hacia arriba en el selector). 🆕
- [ ] **8. Reabrir SIN Internet** desde el ícono → abre sin red.
- [ ] **9. 🆕 Borrador presente:** mismo paso, fotos intactas.
- [ ] **10. Guardar offline** → "Registro guardado" → chip de cola.
- [ ] **11. Quitar modo avión** con la app abierta.
- [ ] **12. Sincronización única:** 🆕 "Sincronizando 1 de 1…" → "Todo sincronizado" (≤60 s).
- [ ] **13. Cero duplicados / cero pendientes:** la carga UNA vez en "hoy", estado "Cuadra".
- [ ] **14. 🆕 Diagnóstico:** pendientes 0, fotografías 0, "Almacenamiento protegido" — **anotar qué dice** (iOS puede negar `persist()`: si dice "NO — riesgo de purga" NO es fallo, es la limitación documentada en KNOWN_IOS_LIMITATIONS.md).

**Resultado:** ☐ TODO OK ☐ FALLOS (listar números): ________
