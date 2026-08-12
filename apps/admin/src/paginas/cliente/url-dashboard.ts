// URL del Dashboard de Cliente. Única para todas las empresas: el
// login decide cuál se carga (DEC-018). Configurable por entorno para
// que producción, preview y desarrollo apunten a su despliegue.
//
// Módulo hoja a propósito: la vista previa (Dashboard.tsx) y la
// entrega de credenciales (AccesosDashboard) la comparten sin
// importarse entre sí.

export const URL_DASHBOARD =
  (import.meta.env.VITE_DASHBOARD_URL as string | undefined) ??
  "https://cuadreappdashboard-production.up.railway.app";
