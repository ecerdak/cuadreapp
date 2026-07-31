import "./estilos.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { crearBd } from "./offline/bd";
import { crearClienteApi } from "./datos/api";
import { iniciarSincronizador } from "./offline/sincronizador";
import { URL_API } from "./config";

const bd = crearBd();
const api = crearClienteApi(URL_API);

// Recuperación automática: evento 'online' + tic periódico, mientras
// la app esté abierta (iOS Safari no tiene Background Sync).
iniciarSincronizador(bd, api);

createRoot(document.getElementById("raiz")!).render(<App bd={bd} api={api} />);
