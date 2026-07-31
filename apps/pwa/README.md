# @cuadreapp/pwa

Cliente PWA de CuadreApp: el flujo del conductor en 7 pasos (spec §8.1), offline por defecto. Desplegada en **Vercel**.

Principios que este paquete respeta a rajatabla:

- **La PWA nunca recalcula reglas de negocio.** Importa `@cuadreapp/dominio` para feedback inmediato y la UI obedece sus salidas (`estado`, `banderas`, `exigeNota`, `bloqueaAvance`, `bloqueaCierre`) sin reinterpretarlas. Los textos por bandera viven en `src/ui/mensajes.ts` — presentación, no decisión.
- **El servidor es la autoridad.** El veredicto local se muestra de inmediato; cuando el `POST /api/v1/cargas` responde, el veredicto del servidor se guarda junto al local y manda en la UI.
- **Offline es el camino normal.** Toda carga nace en Dexie (`src/offline/`); el sincronizador la sube cuando hay señal, con backoff exponencial (tope 5 min) y recuperación automática en el evento `online`. El contexto local de validación avanza como el trigger del servidor para que cargas consecutivas en modo avión encadenen el totalizador.
- **Cámara en vivo, nunca galería** (`capture="environment"`).

## Estructura

```
src/
  App.tsx                máquina de estados de los 7 pasos
  pantallas/             Inicio, Equipo, Conductor, AntesDeCargar, Cargando, DespuesDeCargar, Listo
  flujo/en-vivo.ts       feedback inmediato: solo invoca reglas del dominio
  offline/               bd (Dexie), cola, sincronizador — probados con fake-indexeddb
  datos/api.ts           cliente del POST /api/v1/cargas (clasifica respuestas para la cola)
  datos/catalogo.ts      catálogo DEMO temporal (hasta enrolamiento + endpoint de catálogo)
  captura/               cámara en vivo + compresión (1024px WebP 0.7) + GPS puntual
  ui/                    básicos, mensajes por bandera, formato numérico colombiano
```

## Comandos

```
pnpm dev          # desarrollo (VITE_API_URL apunta a la API; por defecto http://localhost:3000)
pnpm build        # producción + service worker (precache del shell)
pnpm test         # cola y sincronizador, incluidas pruebas de modo avión
pnpm typecheck
```

## Pendiente de fases posteriores

- Enrolamiento del dispositivo y catálogo real vía API (hoy: `datos/catalogo.ts` demo).
- Subida de los blobs de fotos a Storage (hoy quedan en Dexie; los paths viajan en el payload).
- Escaneo QR del sticker del equipo (hoy: lista con búsqueda, la salida que define el propio spec).
- Verificación real del PIN vía API (hoy: catálogo demo).
