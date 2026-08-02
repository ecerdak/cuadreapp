// Variables de entorno tipadas y validadas (Etapa H): la API se niega
// a arrancar con configuración incompleta o malformada, con un mensaje
// que dice exactamente qué falta — nunca un fallo criptico en runtime.

import { z } from "zod";

const esquema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("postgres://") || v.startsWith("postgresql://"), {
      message: "debe ser una URL postgres://",
    }),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_JWT_SECRET: z.string().min(20),
  BUCKET_FOTOS: z.string().min(1).default("fotos-cargas"),
  /** Lista separada por comas; sin ella, se permiten los *.up.railway.app. */
  CORS_ORIGENES: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type Configuracion = z.infer<typeof esquema>;

export function cargarConfiguracion(
  env: Record<string, string | undefined> = process.env,
): Configuracion {
  const resultado = esquema.safeParse(env);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Configuración de entorno inválida — ${problemas}`);
  }
  return resultado.data;
}
