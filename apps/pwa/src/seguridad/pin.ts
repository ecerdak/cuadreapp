// Verificación offline del PIN del conductor contra el pin_hash
// (bcrypt) que llega en el catálogo del dispositivo enrolado —
// decisión aprobada de la Etapa S. El PIN identifica, no protege
// (spec §5): la defensa son los candados aritméticos y las fotos.

import bcrypt from "bcryptjs";

export function verificarPin(pin: string, pinHash: string): boolean {
  try {
    return bcrypt.compareSync(pin, pinHash);
  } catch {
    return false;
  }
}
