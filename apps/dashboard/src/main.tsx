// Composición del tablero: router + fuente de datos + sesión.
//
// Un único Dashboard para todos los clientes (DEC-018): no hay ruta,
// subdominio ni build por cliente. El login resuelve la empresa y el
// contexto la reparte al resto de la aplicación.
//
// Las rutas de los módulos existen siempre; cuáles se OFRECEN lo decide
// el perfil (las pestañas del marco). Entrar a mano a un módulo que el
// perfil no declara redirige a Hoy en lugar de mostrar una pantalla
// que no aplica.

import "./estilos.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import type { ModuloTablero } from "@cuadreapp/dominio";
import { ProveedorDatosTablero } from "./datos/proveedor";
import { FuenteApi } from "./datos/fuente-api";
import { ProveedorContextoTablero, useTablero } from "./datos/contexto";
import { haySesion } from "./datos/sesion";
import { DisposicionTablero } from "./disposicion/DisposicionTablero";
import { Entrar } from "./paginas/Entrar";
import { Hoy } from "./paginas/Hoy";
import { Cargas } from "./paginas/Cargas";
import { Equipos } from "./paginas/Equipos";
import { Suministro } from "./paginas/Suministro";

function ConSesion() {
  const navegar = useNavigate();
  if (!haySesion()) return <Navigate to="/entrar" replace />;
  return (
    <ProveedorContextoTablero alPerderSesion={() => navegar("/entrar", { replace: true })}>
      <Outlet />
    </ProveedorContextoTablero>
  );
}

/** Un módulo que el perfil del cliente no declara no se pinta. */
function ConModulo(props: { modulo: ModuloTablero; children: React.ReactNode }) {
  const { contexto } = useTablero();
  if (!contexto.perfil.modulos.includes(props.modulo)) return <Navigate to="/hoy" replace />;
  return <>{props.children}</>;
}

createRoot(document.getElementById("raiz")!).render(
  <ProveedorDatosTablero fuente={new FuenteApi()}>
    <BrowserRouter>
      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route element={<ConSesion />}>
          <Route element={<DisposicionTablero />}>
            <Route index element={<Navigate to="/hoy" replace />} />
            <Route path="/hoy" element={<Hoy />} />
            <Route path="/cargas" element={<Cargas />} />
            {/* Deep-link conservado: la evidencia vive en el panel derecho. */}
            <Route path="/cargas/:id" element={<Cargas />} />
            <Route
              path="/equipos"
              element={
                <ConModulo modulo="equipos">
                  <Equipos />
                </ConModulo>
              }
            />
            <Route
              path="/suministro"
              element={
                <ConModulo modulo="suministro">
                  <Suministro />
                </ConModulo>
              }
            />
            <Route path="*" element={<Navigate to="/hoy" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </ProveedorDatosTablero>,
);
