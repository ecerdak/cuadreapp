# PWA Validation Report — sprint de hardening (2-ago-2026)

## Estado inicial (evidencia, no lectura de código)

Inspección del **artefacto de build** (`dist/sw.js`): precache completo del shell (index, JS, CSS, íconos, manifest) y `createHandlerBoundToURL("index.html")` + NavigationRoute → la app instalada abre sin red. `registerSW.js` sin recarga forzada → un deploy no interrumpe una captura. Manifest completo verificado en producción (name/short_name/íconos 192+512+maskable/standalone/start_url/scope/theme/background). HTTPS activo. Dexie con cargas/fotos/contexto/perfil/catálogo; idempotencia y backoff ya probados.

**Brechas encontradas:** sin UX de instalación; sin estados de conectividad/progreso/última sync; sin aviso de actualización; **borrador solo en memoria (fotos perdibles al matar la app)**; sin guardia de cierre con pendientes; cuota sin capturar; sin diagnóstico.

## Cambios (commits c4c9407 · 905aea2 · b66603d · 8a9a042)

K1 config workbox explícita + instalación Android/iOS · K2 estado observable (conectividad, X de Y, última sync persistida, actualización lista) · K3 borrador persistente + guardia de cierre + cuota · K4 diagnóstico.

## Verificación

- 58 pruebas de la PWA (203 en el monorepo), typecheck, lint y build de producción en verde.
- Precache y fallback verificados en el artefacto regenerado.
- Lighthouse: **no ejecutable en este entorno** (sin navegador); criterios de instalabilidad cubiertos por manifest+SW verificados en producción en el cierre de infraestructura.
- Offline en dispositivo físico: **procedimiento reproducible** en `OFFLINE_OPERATION_RUNBOOK.md` — pendiente de ejecución con teléfonos reales (Fase D del roadmap RC1).

## Veredicto: **GO CONDICIONAL**

Todo lo automatizable está demostrado con pruebas y artefactos. Condición para GO pleno: ejecutar el procedimiento offline del runbook en un Android y un iPhone físicos (incluye matar la app a mitad de captura y verificar el borrador). Sin esa evidencia física, declarar GO sería la afirmación optimista que este sprint prohíbe.
