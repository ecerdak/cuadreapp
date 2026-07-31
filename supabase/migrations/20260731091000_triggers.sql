-- ============================================================
-- CuadreApp — Triggers (Etapa 0)
--
-- docs/ESPEC_App_Cuadre_Lubryco.md §6: "dispensadores.tot_actual_gal se
-- actualiza por trigger al aceptar una carga, y solo si tot_final_gal
-- es mayor." Este trigger es aritmética pura, no reglas de negocio: la
-- decisión de si una carga es válida (R1-R12) ya se tomó antes de
-- llegar aquí, en la API propia (packages/dominio) — ver DEC-003.
--
-- security definer: la actualización de dispensadores debe suceder sin
-- depender de que el rol que insertó la carga tenga permiso de UPDATE
-- sobre dispensadores (hoy nadie lo tiene vía RLS; solo la service role
-- inserta cargas).
-- ============================================================

create or replace function actualizar_tot_actual_gal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update dispensadores
  set tot_actual_gal = new.tot_final_gal
  where id = new.dispensador_id
    and new.tot_final_gal > tot_actual_gal;

  return new;
end;
$$;

create trigger cargas_actualizar_tot_actual_gal
  after insert on cargas
  for each row
  execute function actualizar_tot_actual_gal();
