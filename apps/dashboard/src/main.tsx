// Composición del tablero: router + fuente de datos inyectada. Cuando
// llegue la conexión real, la FuenteSimulada se reemplaza AQUÍ por la
// FuenteApi — cero cambios en páginas y componentes.

import "./estilos.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProveedorDatosTablero } from "./datos/proveedor";
import { FuenteSimulada } from "./datos/fuente-simulada";
import { DisposicionTablero } from "./disposicion/DisposicionTablero";
import { Hoy } from "./paginas/Hoy";
import { Cargas } from "./paginas/Cargas";
import { Equipos } from "./paginas/Equipos";
import { Suministro } from "./paginas/Suministro";

const fuente = new FuenteSimulada({
  // ?simular-error ejercita los estados de error en cualquier pantalla.
  simularError: new URLSearchParams(window.location.search).has("simular-error"),
});

createRoot(document.getElementById("raiz")!).render(
  <ProveedorDatosTablero fuente={fuente}>
    <BrowserRouter>
      <Routes>
        <Route element={<DisposicionTablero />}>
          <Route index element={<Navigate to="/hoy" replace />} />
          <Route path="/hoy" element={<Hoy />} />
          <Route path="/cargas" element={<Cargas />} />
          {/* Deep-link conservado: la evidencia vive en el panel derecho de Cargas. */}
          <Route path="/cargas/:id" element={<Cargas />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/suministro" element={<Suministro />} />
          <Route path="*" element={<Navigate to="/hoy" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ProveedorDatosTablero>,
);
