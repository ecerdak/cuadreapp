// Validación ESTRUCTURAL de la solicitud (DEC-011): forma, tipos y
// rangos físicos de los campos. Ninguna decisión de negocio — eso es
// exclusivo de packages/dominio.

import { z } from "zod";

export const esquemaCargaEntrante = z
  .object({
    // La app genera el uuid de la carga; reintento = mismo id (idempotencia, spec §10.4).
    id: z.string().uuid(),
    dispensador_id: z.string().uuid(),
    equipo_id: z.string().uuid(),
    conductor_id: z.string().uuid(),

    tanda_inicial_gal: z.number().finite().nonnegative(),
    tot_inicial_gal: z.number().finite().nonnegative(),
    tanda_final_gal: z.number().finite().nonnegative(),
    tot_final_gal: z.number().finite().nonnegative(),

    lectura_equipo: z.number().finite().nonnegative().nullable().optional(),

    iniciada_en: z.string().datetime({ offset: true }),
    finalizada_en: z.string().datetime({ offset: true }),

    lat: z.number().min(-90).max(90).nullable().optional(),
    lng: z.number().min(-180).max(180).nullable().optional(),
    precision_gps_m: z.number().finite().nonnegative().nullable().optional(),

    origen: z.enum(["app", "papel_retro", "correccion"]).default("app"),

    foto_inicial_path: z.string().min(1).nullable().optional(),
    foto_final_path: z.string().min(1).nullable().optional(),

    notas: z.string().max(2000).nullable().optional(),
    device_id: z.string().max(200).nullable().optional(),
    version_app: z.string().max(50).nullable().optional(),
  })
  .strict();

export type CargaEntrante = z.infer<typeof esquemaCargaEntrante>;
