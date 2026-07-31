# @cuadreapp/api

API propia de CuadreApp. Es la única vía de escritura del sistema: revalida las reglas R1–R12 (`packages/dominio`) contra el dato real de la base antes de aceptar una carga — el cliente nunca escribe directo a Supabase.

Se implementa a partir de la **Etapa 1** del roadmap — ver `docs/PRODUCT_BIBLE.md` §8. Este directorio es un placeholder de workspace hasta entonces.

Desplegada en **Railway** ([DEC-005](../../docs/PRODUCT_BIBLE.md#decisiones)). Diseñada como una API REST agnóstica del cliente: si en el futuro se agrega un cliente Expo/EAS, consume esta misma API sin cambios de backend.
