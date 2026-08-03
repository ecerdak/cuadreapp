// Composición de la consola: router + fuente HTTP + guardia de sesión.

import "./estilos.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ProveedorAdmin } from "./datos/proveedor";
import { FuenteAdminHttp } from "./datos/fuente-http";
import { haySesion } from "./datos/sesion";
import { Marco } from "./disposicion/Marco";
import { Entrar } from "./paginas/Entrar";
import { Resumen } from "./paginas/Resumen";
import { Cargas } from "./paginas/Cargas";
import { Clientes } from "./paginas/Clientes";
import { Equipos } from "./paginas/Equipos";
import { Operadores } from "./paginas/Operadores";
import { Dispositivos } from "./paginas/Dispositivos";
import { Sacyr } from "./paginas/Sacyr";

function ConSesion() {
  if (!haySesion()) return <Navigate to="/entrar" replace />;
  return <Outlet />;
}

createRoot(document.getElementById("raiz")!).render(
  <ProveedorAdmin fuente={new FuenteAdminHttp()}>
    <BrowserRouter>
      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route element={<ConSesion />}>
          <Route element={<Marco />}>
            <Route index element={<Navigate to="/resumen" replace />} />
            <Route path="/resumen" element={<Resumen />} />
            <Route path="/cargas" element={<Cargas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/operadores" element={<Operadores />} />
            <Route path="/dispositivos" element={<Dispositivos />} />
            <Route path="/sacyr" element={<Sacyr />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/resumen" replace />} />
      </Routes>
    </BrowserRouter>
  </ProveedorAdmin>,
);
