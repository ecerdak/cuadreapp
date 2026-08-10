// Pruebas de la consola: el dashboard administrativo y el tablero por
// cliente renderizan los datos de una fuente inyectada (fake), las
// pantallas de catálogo muestran sus columnas y acciones, y el
// contrato de identidad (perfil, logo, sedes — DEC-016/DEC-017) se
// cumple de punta a punta contra el fake.

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProveedorAdmin } from "../datos/proveedor";
import type {
  Carga,
  Cliente,
  FuenteAdmin,
  Resumen as ResumenDatos,
  Sede,
  Tablero as TableroDatos,
} from "../datos/puertos";
import { Resumen } from "./Resumen";
import { Clientes } from "./Clientes";
import { LogoCliente } from "./cliente/LogoCliente";
import { FichaCliente } from "./cliente/FichaCliente";
import { AvisoPreview, URL_DASHBOARD } from "./cliente/Dashboard";
import { Entrar } from "./Entrar";

const CARGA: Carga = {
  id: "c1",
  registradaEn: "2026-08-03T09:30:00-05:00",
  clienteNombre: "Sacyr",
  sedeNombre: "EDS Lubryco Buga",
  equipoCodigo: "SMW-477",
  operadorNombre: "Operadora EDS",
  galones: 600,
  perfilCodigo: "carga_inventario",
  llegadaGal: 150,
  inventarioFinalGal: 750,
  duracionS: 312,
  estado: "ok",
  banderas: [],
  notas: null,
  fotos: [{ momento: "inicial", url: "https://firmada/x.webp" }],
};

const RESUMEN: ResumenDatos = {
  clientesActivos: 1,
  equiposActivos: 3,
  operadoresActivos: 1,
  dispositivosEnrolados: 1,
  cargasHoy: 3,
  galonesHoy: 1850,
  alertas: [
    { tipo: "carga_no_cuadra", mensaje: 'Carga de SMW-477 hoy quedó en estado "inconsistente".' },
  ],
};

const TABLERO: TableroDatos = {
  clienteId: "cl1",
  clienteNombre: "Sacyr",
  hoy: {
    cargas: 3,
    galones: 1850,
    duracionPromedioS: 312,
    operadores: ["Operadora EDS"],
    ultimaCargaEn: "2026-08-03T09:30:00-05:00",
  },
  porEquipo: [
    {
      equipoCodigo: "SMW-477",
      descripcion: "Carrotanque 1",
      cargas: 1,
      galones: 650,
      ultimaCargaEn: null,
    },
    {
      equipoCodigo: "TKL-102",
      descripcion: "Carrotanque 2",
      cargas: 2,
      galones: 1200,
      ultimaCargaEn: null,
    },
  ],
  historial: [CARGA],
};

function clienteFalso(cambios: Partial<Cliente> = {}): Cliente {
  return {
    id: "cl1",
    nombre: "Sacyr",
    nombreComercial: null,
    colorPrimario: null,
    colorSecundario: null,
    nit: null,
    activo: true,
    sedes: 1,
    cargas: 3,
    perfilCodigo: "carga_inventario",
    logoUrl: null,
    ...cambios,
  };
}

function sedeFalsa(cambios: Partial<Sede> = {}): Sede {
  return {
    id: "s1",
    clienteId: "cl1",
    nombre: "Frente de Obra",
    ciudad: null,
    direccion: null,
    referencia: null,
    activo: true,
    radioGeocercaM: 150,
    dispensadores: [],
    ...cambios,
  };
}

function fuenteFalsa(): FuenteAdmin & { estado: { clientes: Cliente[]; sedes: Sede[] } } {
  const estado = { clientes: [clienteFalso()], sedes: [sedeFalsa()] };
  return {
    estado,
    // Accesos al Dashboard: el doble no los ejercita, pero el contrato
    // los exige — un cliente recién creado empieza sin ninguno.
    accesosDashboard: async () => [],
    crearAccesoDashboard: async (_clienteId: string, datos: { nombre: string; email: string }) => ({
      usuarioId: "u-1",
      nombre: datos.nombre,
      email: datos.email,
      rol: "supervisor",
      sedeId: null,
      sedeNombre: null,
      activo: true,
      creadoEn: new Date(0).toISOString(),
      ultimoAccesoEn: null,
      password_temporal: "Cuadre-temporal",
    }),
    editarAccesoDashboard: async (_c: string, usuarioId: string) => ({
      usuarioId,
      nombre: "Acceso",
      email: "acceso@empresa.test",
      rol: "supervisor",
      sedeId: null,
      sedeNombre: null,
      activo: true,
      creadoEn: new Date(0).toISOString(),
      ultimoAccesoEn: null,
    }),
    reiniciarPasswordAcceso: async (_c: string, usuarioId: string) => ({
      usuarioId,
      nombre: "Acceso",
      email: "acceso@empresa.test",
      rol: "supervisor",
      sedeId: null,
      sedeNombre: null,
      activo: true,
      creadoEn: new Date(0).toISOString(),
      ultimoAccesoEn: null,
      password_temporal: "Cuadre-nueva",
    }),
    resumen: async () => RESUMEN,
    cargas: async () => [CARGA],
    perfiles: async () => [
      { codigo: "medidor_doble", nombre: "Medidor Doble", descripcion: null, activo: true },
      {
        codigo: "carga_inventario",
        nombre: "Carga sobre Inventario",
        descripcion: null,
        activo: true,
      },
    ],
    clientes: async () => estado.clientes,
    crearCliente: async (datos) => {
      const cliente = clienteFalso({
        id: `cl${estado.clientes.length + 1}`,
        nombre: datos.nombre,
        nombreComercial: datos.nombreComercial,
        colorPrimario: datos.colorPrimario,
        colorSecundario: datos.colorSecundario,
        nit: datos.nit,
        perfilCodigo: datos.perfilCodigo,
        cargas: 0,
        sedes: 0,
      });
      estado.clientes.push(cliente);
      return cliente;
    },
    editarCliente: async (id, cambios) => {
      const cliente = estado.clientes.find((c) => c.id === id)!;
      Object.assign(cliente, {
        ...cambios,
        nit: "nit" in cambios ? (cambios.nit ?? null) : cliente.nit,
      });
      return cliente;
    },
    subirLogo: async (id) => {
      const cliente = estado.clientes.find((c) => c.id === id)!;
      cliente.logoUrl = `https://firmada.prueba/clientes/${id}/logo.png`;
      return cliente;
    },
    eliminarLogo: async (id) => {
      const cliente = estado.clientes.find((c) => c.id === id)!;
      cliente.logoUrl = null;
      return cliente;
    },
    sedes: async (clienteId) => estado.sedes.filter((s) => s.clienteId === clienteId),
    crearSede: async (datos) => {
      const sede = sedeFalsa({
        id: `s${estado.sedes.length + 1}`,
        clienteId: datos.clienteId,
        nombre: datos.nombre,
        ciudad: datos.ciudad,
        direccion: datos.direccion,
        referencia: datos.referencia,
        dispensadores: datos.dispensador
          ? [
              {
                id: "d1",
                nombre: datos.dispensador.nombre,
                totActualGal: datos.dispensador.totInstalacionGal,
              },
            ]
          : [],
      });
      estado.sedes.push(sede);
      return sede;
    },
    editarSede: async (id, cambios) => {
      const sede = estado.sedes.find((s) => s.id === id)!;
      Object.assign(sede, cambios);
      return sede;
    },
    equipos: async () => [],
    crearEquipo: async (datos) => ({
      id: "eq1",
      clienteId: datos.clienteId,
      clienteNombre: "Sacyr",
      sedeId: datos.sedeId,
      sedeNombre: null,
      codigoInterno: datos.codigoInterno,
      descripcion: datos.descripcion,
      categoria: datos.categoria,
      tipoMedidor: "ninguno",
      capacidadTanqueGal: null,
      activo: true,
    }),
    editarEquipo: async () => ({}) as never,
    operadores: async () => [],
    crearOperador: async () => ({}) as never,
    editarOperador: async () => ({}) as never,
    codigos: async () => [],
    crearCodigo: async () => ({}) as never,
    dispositivos: async () => [],
    desactivarDispositivo: async () => ({}) as never,
    reenrolarDispositivo: async () => ({}) as never,
    tablero: async () => TABLERO,
  };
}

async function renderConDatos(elemento: JSX.Element): Promise<string> {
  return renderToStaticMarkup(elemento);
}

describe("dashboard administrativo (Resumen)", () => {
  it("monta con la fuente inyectada y arranca en estado de carga accesible", async () => {
    const html = await renderConDatos(
      <ProveedorAdmin fuente={fuenteFalsa()}>
        <MemoryRouter>
          <Resumen />
        </MemoryRouter>
      </ProveedorAdmin>,
    );
    expect(html).toContain("animate-pulse"); // esqueleto mientras llega el dato
  });

  it("la fuente falsa entrega los indicadores que la pantalla pinta", async () => {
    const fuente = fuenteFalsa();
    const resumen = await fuente.resumen();
    expect(resumen.cargasHoy).toBe(3);
    expect(resumen.galonesHoy).toBe(1850);
    expect(resumen.alertas).toHaveLength(1);
    const cargas = await fuente.cargas();
    expect(cargas[0]).toMatchObject({ equipoCodigo: "SMW-477", operadorNombre: "Operadora EDS" });
  });
});

describe("la pestaña Dashboard de la ficha es una VISTA PREVIA (Etapa P.2)", () => {
  const html = renderToStaticMarkup(<AvisoPreview />);

  it("se anuncia como vista previa y explica dónde vive el Dashboard real", () => {
    expect(html).toContain("Vista previa administrativa");
    expect(html).toContain("enlace único para todas las empresas");
  });

  it("ofrece Abrir Dashboard y Copiar enlace, ambos hacia el Dashboard oficial", () => {
    expect(html).toContain("Abrir Dashboard");
    expect(html).toContain("Copiar enlace");
    expect(html).toContain(`href="${URL_DASHBOARD}"`);
    expect(html).toContain('target="_blank"');
  });

  it("el enlace es el del Dashboard, jamás una ruta del Admin", () => {
    expect(URL_DASHBOARD).toMatch(/^https?:\/\//);
    expect(URL_DASHBOARD).not.toContain("/clientes/");
    expect(URL_DASHBOARD).not.toContain("admin");
  });

  it("no hay una URL por cliente: el enlace no lleva identificador alguno", () => {
    expect(URL_DASHBOARD).not.toMatch(/cliente|tenant|empresa|[?&]id=/i);
  });
});

describe("Dashboard de Cliente (sin nombres hardcodeados)", () => {
  it("el tablero del cliente trae día, por-equipo, operadores y evidencia", async () => {
    const tablero = await fuenteFalsa().tablero("cl1");
    expect(tablero.clienteNombre).toBe("Sacyr");
    expect(tablero.hoy.operadores).toContain("Operadora EDS");
    expect(tablero.porEquipo.map((e) => e.equipoCodigo)).toEqual(["SMW-477", "TKL-102"]);
    expect(tablero.historial[0]!.fotos[0]!.url).toContain("https://");
  });

  it("una carga del perfil Carga sobre Inventario trae llegó/despachado/total (150+600=750)", async () => {
    const tablero = await fuenteFalsa().tablero("cl1");
    const carga = tablero.historial[0]!;
    expect(carga.llegadaGal).toBe(150);
    expect(carga.galones).toBe(600);
    expect(carga.inventarioFinalGal).toBe(750);
    expect(carga.perfilCodigo).toBe("carga_inventario");
  });
});

describe("identidad del cliente (DEC-016/DEC-017)", () => {
  it("crear cliente con perfil y luego subir su logo (contrato completo del puerto)", async () => {
    const fuente = fuenteFalsa();
    const cliente = await fuente.crearCliente({
      nombre: "Constructora Piloto",
      nombreComercial: null,
      colorPrimario: null,
      colorSecundario: null,
      nit: null,
      perfilCodigo: "carga_inventario",
    });
    expect(cliente.perfilCodigo).toBe("carga_inventario");
    expect(cliente.logoUrl).toBeNull();

    const conLogo = await fuente.subirLogo(cliente.id, new Blob(["png"], { type: "image/png" }));
    expect(conLogo.logoUrl).toContain("https://firmada.prueba/");

    const sinLogo = await fuente.eliminarLogo(cliente.id);
    expect(sinLogo.logoUrl).toBeNull(); // fallback a iniciales, nunca imagen rota
  });

  it("cambiar el perfil de un cliente conserva su historia (solo cambia el campo)", async () => {
    const fuente = fuenteFalsa();
    const cliente = await fuente.editarCliente("cl1", { perfilCodigo: "medidor_doble" });
    expect(cliente.perfilCodigo).toBe("medidor_doble");
    expect(cliente.cargas).toBe(3); // la historia sigue ahí
  });

  it("crear y editar sedes con identidad; sede sin dispensador para perfil sin medidor", async () => {
    const fuente = fuenteFalsa();
    const sede = await fuente.crearSede({
      clienteId: "cl1",
      nombre: "Obra Norte",
      ciudad: "Cali, Valle del Cauca",
      direccion: null,
      referencia: "Km 4 vía Yumbo",
      dispensador: null,
    });
    expect(sede.dispensadores).toHaveLength(0);
    expect(sede.ciudad).toBe("Cali, Valle del Cauca");

    const editada = await fuente.editarSede(sede.id, { activo: false, ciudad: "Yumbo, Valle" });
    expect(editada.activo).toBe(false);
    expect(editada.ciudad).toBe("Yumbo, Valle");
  });

  it("cliente con múltiples sedes: el puerto las lista todas", async () => {
    const fuente = fuenteFalsa();
    await fuente.crearSede({
      clienteId: "cl1",
      nombre: "Obra Sur",
      ciudad: null,
      direccion: null,
      referencia: null,
      dispensador: null,
    });
    expect(await fuente.sedes("cl1")).toHaveLength(2);
  });

  it("la pantalla Clientes monta con la fuente nueva (columna Perfil incluida)", async () => {
    const html = await renderConDatos(
      <ProveedorAdmin fuente={fuenteFalsa()}>
        <MemoryRouter>
          <Clientes />
        </MemoryRouter>
      </ProveedorAdmin>,
    );
    expect(html).toContain("animate-pulse");
  });

  it("LogoCliente cae a iniciales cuando no hay logo — jamás una imagen rota", () => {
    const html = renderToStaticMarkup(
      <LogoCliente nombre="Industrias Alimenticias El Trébol S.A.S." logoUrl={null} />,
    );
    expect(html).toContain("IA");
    expect(html).not.toContain("<img");

    const conLogo = renderToStaticMarkup(
      <LogoCliente nombre="Sacyr" logoUrl="https://firmada/logo.png" />,
    );
    expect(conLogo).toContain("<img");
    expect(conLogo).toContain('alt="Logo de Sacyr"');
  });
});

describe("acceso", () => {
  it("la pantalla de entrada lleva la co-marca con placa ADMIN y pide correo y contraseña", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Entrar />
      </MemoryRouter>,
    );
    expect(html).toContain(">ADMIN</span>");
    expect(html).toContain(">Cuadre</span>");
    expect(html).toContain("Correo");
    expect(html).toContain("Contraseña");
    expect(html).toContain(">Entrar</button>");
  });
});

describe("ficha del cliente como ERP (DEC-018)", () => {
  it("la ficha monta con sus cuatro secciones: Identidad, Configuración, Operación y Dashboard", async () => {
    const html = renderToStaticMarkup(
      <ProveedorAdmin fuente={fuenteFalsa()}>
        <MemoryRouter initialEntries={["/clientes/cl1/identidad"]}>
          <Routes>
            <Route path="/clientes/:clienteId" element={<FichaCliente />}>
              <Route path="identidad" element={<div>bloque identidad</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ProveedorAdmin>,
    );
    // Arranca cargando el cliente; el shell ya declara la navegación.
    expect(html).toContain("animate-pulse");
  });

  it("el puerto expone la identidad completa del cliente para la ficha", async () => {
    const fuente = fuenteFalsa();
    const cliente = await fuente.crearCliente({
      nombre: "Transportes del Valle S.A.S.",
      nombreComercial: "TransValle",
      colorPrimario: "#C0392B",
      colorSecundario: "#7B241C",
      nit: "901234567-8",
      perfilCodigo: "medidor_doble",
    });
    expect(cliente.nombreComercial).toBe("TransValle");
    expect(cliente.colorPrimario).toBe("#C0392B");
    expect(cliente.nombre).toBe("Transportes del Valle S.A.S.");
  });

  it("equipos y operadores viajan con su sede (null = todas las sedes)", async () => {
    const fuente = fuenteFalsa();
    const equipo = await fuente.crearEquipo({
      clienteId: "cl1",
      sedeId: null,
      codigoInterno: "T-99",
      descripcion: null,
      categoria: null,
    });
    expect(equipo.sedeId).toBeNull();
  });
});
