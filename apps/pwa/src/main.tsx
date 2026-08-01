// Composición de la PWA (DEC-014): un TokenStore, un ClienteHttp, un
// ServicioSesion, un ClienteApi para el sincronizador. Los tokens no
// existen fuera de este cableado.

import "./estilos.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { crearBd } from "./offline/bd";
import { iniciarSincronizador } from "./offline/sincronizador";
import { crearClienteApi } from "./datos/api";
import { ClienteHttp } from "./datos/cliente-http";
import { TokenStoreNavegador } from "./seguridad/token-store";
import { ServicioSesion } from "./seguridad/sesion";
import { URL_API } from "./config";

const bd = crearBd();
const tokenStore = new TokenStoreNavegador();
const http = new ClienteHttp(URL_API, tokenStore, {
  alSesionVencida: () => window.dispatchEvent(new Event("cuadreapp:sesion-vencida")),
});
const api = crearClienteApi(http);
const sesion = new ServicioSesion(http, tokenStore, bd);

// Recuperación automática: evento 'online' + tic periódico, mientras
// la app esté abierta (iOS Safari no tiene Background Sync).
iniciarSincronizador(bd, api);

createRoot(document.getElementById("raiz")!).render(<App bd={bd} api={api} sesion={sesion} />);
