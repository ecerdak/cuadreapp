// Contratos de la API que la PWA consume (respuestas de /me, /catalogo
// y los tokens de auth). Tipos puros, sin lógica.

export interface TokensEmitidos {
  access_token: string;
  refresh_token: string;
  expira_en_s: number;
}

export interface PerfilMe {
  usuario_id: string;
  nombre: string;
  rol: string;
  cliente_id: string | null;
  sede_id: string | null;
  permisos: string[];
}

export interface CatalogoRemoto {
  sede: { id: string; nombre: string; lat: number | null; lng: number | null; radio_geocerca_m: number };
  dispensadores: Array<{ id: string; nombre: string; tot_actual_gal: number; tolerancia_tanda_gal: number }>;
  equipos: Array<{
    id: string;
    codigo_interno: string;
    descripcion: string | null;
    tipo_medidor: string;
    ultima_lectura: number | null;
    capacidad_tanque_gal: number | null;
  }>;
  conductores: Array<{ id: string; nombre: string; codigo: string; pin_hash: string }>;
}
