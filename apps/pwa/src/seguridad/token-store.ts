// TokenStore (DEC-014): la ÚNICA puerta a los tokens. Ningún
// componente React los toca; solo el cliente HTTP único consume esta
// interfaz.
//
// Implementación de navegador (mientras el MVP sea PWA):
//  - access token de vida mínima: SOLO en memoria — desaparece al
//    cerrar la pestaña, nunca se persiste.
//  - refresh token: almacenamiento local del navegador, con rotación y
//    detección de reutilización del lado del servidor.
//
// LIMITACIÓN DOCUMENTADA (DEC-014): el navegador no ofrece
// almacenamiento con respaldo de hardware. El riesgo residual es
// exfiltración por XSS, mitigado con CSP estricta, cero scripts de
// terceros, vida mínima del access y rotación del refresh. Cuando el
// proyecto migre a React Native + Expo, esta clase se sustituye por
// una implementación sobre SecureStore (Keychain/Keystore) sin
// modificar el resto del código.

import type { TokensEmitidos } from "../datos/contratos";

export interface AccesoVigente {
  token: string;
  expiraEnMs: number;
}

export interface TokenStore {
  obtenerAccess(): AccesoVigente | null;
  obtenerRefresh(): Promise<string | null>;
  guardar(tokens: TokensEmitidos): Promise<void>;
  limpiar(): Promise<void>;
}

const CLAVE_REFRESH = "cuadreapp:refresh";

export class TokenStoreNavegador implements TokenStore {
  private access: AccesoVigente | null = null;

  obtenerAccess(): AccesoVigente | null {
    return this.access;
  }

  async obtenerRefresh(): Promise<string | null> {
    return localStorage.getItem(CLAVE_REFRESH);
  }

  async guardar(tokens: TokensEmitidos): Promise<void> {
    this.access = { token: tokens.access_token, expiraEnMs: Date.now() + tokens.expira_en_s * 1000 };
    localStorage.setItem(CLAVE_REFRESH, tokens.refresh_token);
  }

  async limpiar(): Promise<void> {
    this.access = null;
    localStorage.removeItem(CLAVE_REFRESH);
  }
}

/** Para pruebas y para entornos sin almacenamiento del navegador. */
export class TokenStoreMemoria implements TokenStore {
  private access: AccesoVigente | null;
  private refresh: string | null;

  constructor(inicial: { refresh?: string | null; access?: AccesoVigente | null } = {}) {
    this.refresh = inicial.refresh ?? null;
    this.access = inicial.access ?? null;
  }

  obtenerAccess(): AccesoVigente | null {
    return this.access;
  }

  async obtenerRefresh(): Promise<string | null> {
    return this.refresh;
  }

  async guardar(tokens: TokensEmitidos): Promise<void> {
    this.access = { token: tokens.access_token, expiraEnMs: Date.now() + tokens.expira_en_s * 1000 };
    this.refresh = tokens.refresh_token;
  }

  async limpiar(): Promise<void> {
    this.access = null;
    this.refresh = null;
  }
}
