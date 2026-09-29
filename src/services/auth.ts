/**
 * Autenticação do painel `/admin`.
 *
 * Modelo simples, suficiente para a fase de validação do guia:
 *  - A senha pode vir de `VITE_ADMIN_PASSWORD`.
 *  - Sem essa variável, cai na senha padrão de desenvolvimento (apenas local).
 *  - A sessão é marcada no `localStorage` e expira em 8 horas.
 *
 * ⚠️ Para produção, mover esta checagem para o servidor (Supabase Auth com RLS,
 * ou uma Edge Function) e remover a senha do bundle. O que está aqui serve para
 * que o painel seja utilizável já no primeiro deploy sem configuração extra.
 */

import { STORAGE_KEYS, nowISO, readJSON, removeKey, writeJSON } from './storage';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h

const DEV_PASSWORD = 'ubatuba';

export const ADMIN_PASSWORD: string =
  import.meta.env.VITE_ADMIN_PASSWORD?.trim() || DEV_PASSWORD;

export const isDevPassword = !import.meta.env.VITE_ADMIN_PASSWORD?.trim();

interface AdminSession {
  since: string;
}

function currentSession(): AdminSession | null {
  const s = readJSON<AdminSession | null>(STORAGE_KEYS.adminSession, null);
  if (!s) return null;
  if (Date.now() - new Date(s.since).getTime() > SESSION_TTL_MS) {
    removeKey(STORAGE_KEYS.adminSession);
    return null;
  }
  return s;
}

export const auth = {
  isAuthenticated(): boolean {
    return currentSession() !== null;
  },

  signIn(password: string): boolean {
    if (password !== ADMIN_PASSWORD) return false;
    writeJSON(STORAGE_KEYS.adminSession, { since: nowISO() } satisfies AdminSession);
    return true;
  },

  signOut(): void {
    removeKey(STORAGE_KEYS.adminSession);
  },
};
