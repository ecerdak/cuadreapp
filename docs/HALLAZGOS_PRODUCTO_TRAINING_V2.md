# Hallazgos de producto — auditoría del Training Kit Clientes v2 (13-ago-2026)

Detectados al contrastar el material de capacitación contra el código real.
**Ninguno se corrigió**: esta fue una etapa documental. Los manuales describen
el comportamiento actual tal cual es; cuando alguno de estos se arregle, hay
que actualizar el catálogo de pantallas del kit (5 minutos, el verificador
señala qué cursos revisar).

## En la PWA (flujo del operador)

1. **El fix «el botón nombra lo que falta» quedó solo en el perfil inventario.**
   `apps/pwa/src/pantallas/AntesDeCargar.tsx:122` y `DespuesDeCargar.tsx:192`
   conservan el estado muerto: con la foto tomada pero un campo numérico
   vacío, el botón dice «Empezar a cargar» / «Guardar la carga», queda gris y
   no hace nada. En `Llegada.tsx:20-24` y `Despacho.tsx:33-38` sí está el CTA
   de tres estados. Mitiga: en medidor los campos vienen precargados.
2. **Wording inconsistente del mismo microcopy:** «Toma la foto para seguir»
   (`AntesDeCargar.tsx:122`) vs «Toma la foto para continuar» (`Llegada.tsx:22`,
   `Despacho.tsx:35`).
3. **«Conductor» y «operador» conviven en la misma pantalla:** rótulo «Código
   de conductor» y eyebrow «Conductor» (`Conductor.tsx:102,150`) frente al
   error «Código de operador no encontrado.» y la lista «Operadores de esta
   sede» (`Conductor.tsx:110,117`).
4. **Dos pantallas distintas comparten el título «Después de cargar»**
   (`DespuesDeCargar.tsx:92` en medidor y `Despacho.tsx:67` en inventario).
   Irrelevante para el operador (nunca ve ambas), relevante para quien
   diagrame por títulos.
5. **`Llegada.tsx` declara un prop `aviso` que `App.tsx` nunca pasa**
   (`Llegada.tsx:33,64` vs `App.tsx:757-769`): código muerto.
6. **El operador no puede cerrar sesión:** `ServicioSesion.cerrar()` existe
   (`seguridad/sesion.ts:111-125`) pero ninguna pantalla lo invoca. Decisión
   aparente de producto; se documenta porque el manual debe decir «eso lo hace
   su supervisor» y lo dice.

## En documentación de producto (fuera del kit)

7. **`docs/OFFLINE_OPERATION_RUNBOOK.md` cita textos del chip que ya no
   existen** («subiendo apenas se pueda», «último envío HH:MM», «N registro(s)
   con error»). El código dice «En cola: N — subiendo», «Todo sincronizado ·
   HH:MM», «N con error — avisa al supervisor». El kit sigue al código.
8. **`apps/pwa/README.md` está obsoleto en ≥4 afirmaciones:** dice que la PWA
   se despliega en Vercel (corre en Railway), que el catálogo es demo, y lista
   como pendientes el enrolamiento, la subida de fotos y el PIN real — todo
   implementado desde la Etapa S.
9. **`docs/PWA_INSTALLATION_GUIDE.md` hardcodea la URL de Railway**: válida
   hoy, pero es la única copia de esa URL en material que se comparte por
   WhatsApp — revisar al cambiar de dominio.

## Cobertura de verificadores (deuda de tooling, no de producto)

10. **`sin-nombres-de-cliente.mjs` no escanea `docs/`**: la prohibición de
    nombres reales en el kit se cumple hoy por disciplina, no por máquina.
11. **`verificar-training-kit.mjs` no escanea `04_Assets/`, `05_Layouts/`,
    `09_Exports/` ni `11_Academia/`**, y no corre en CI (decisión documentada
    en su cabecera).
12. **Restos con nombre de cliente fuera del alcance de ambos verificadores:**
    `apps/dashboard/src/marca/assets/trebol.webp` (solo lo usa la fuente
    simulada de pruebas) y `docs/mockups/cuadre_dashboard_trebol.jsx`
    (prototipo histórico).
