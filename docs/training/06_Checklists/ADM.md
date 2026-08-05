# Checklist · ADM — Administrador · Consola completa

> Página arrancable. Pensada para imprimirse y pegarse donde se usa: el almacén, la oficina del supervisor o el escritorio del administrador.
> Manual: [`../03_Admin/ADM.md`](../03_Admin/ADM.md)

---

## Alta de un cliente nuevo · en este orden

- [ ] **1.** Clientes → «Nuevo cliente»: razón social, nombre comercial, NIT y **Perfil Operativo**
- [ ] **2.** Ficha → Identidad: subir el logo (PNG/JPEG/WebP, < 1 MB) y poner los dos colores `#RRGGBB` → «Guardar identidad»
- [ ] **3.** Ficha → Configuración: confirmar el perfil (cambiarlo **antes** de que existan cargas)
- [ ] **4.** Ficha → Operación → Sedes: crear cada sede con su ciudad
  - [ ] Si el perfil requiere medidor: **verificar el totalizador de instalación contra la carátula física** antes de guardar
- [ ] **5.** Ficha → Operación → Equipos: dar de alta cada equipo y decidir sede propia o «Todas las sedes»
- [ ] **6.** Ficha → Operación → Operadores: nombre, código y PIN
  - [ ] **Anotar el PIN antes de guardar**: no se vuelve a mostrar nunca
- [ ] **7.** Ficha → Operación → Dispositivos: «Generar código» y dictárselo a quien instala
- [ ] **8.** Confirmar con el operador que enroló y que **ve sus equipos** en la lista
- [ ] **9.** Confirmar con el supervisor que entra al Dashboard y **ve la identidad** del cliente

## Mantenimiento semanal

- [ ] Revisar «Alertas» en Resumen
- [ ] Revisar dispositivos sin señal por más de 24 h
- [ ] Revocar los dispositivos de teléfonos que ya no están en uso

## Nunca

- [ ] ~~Editar datos directamente en la base de datos~~ — todo tiene su pantalla
- [ ] ~~Reutilizar un código de enrolamiento entre teléfonos~~ — sirve una sola vez, por diseño
- [ ] ~~Borrar un cliente para «empezar limpio»~~ — arrastra su historia, que es evidencia

## Verificación de que el alta quedó bien

- [ ] El operador ve el **logo del cliente** en la cabecera de su app
- [ ] El operador ve la **sede correcta** junto al logo
- [ ] El flujo que ve el operador corresponde al **perfil elegido**
- [ ] El supervisor ve las cargas del cliente en su Dashboard
