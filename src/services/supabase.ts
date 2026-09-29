import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase (opcional).
 *
 * Se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estiverem preenchidos, o app
 * sincroniza com o banco em nuvem. Caso contrário, `supabase` é `null` e o
 * `repository.ts` usa automaticamente o `MockDataService` local.
 *
 * Nunca lance erro aqui: a ausência de backend é um estado esperado, não uma falha.
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured && url && anonKey) {
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'x-application-name': 'guia-de-praias-ubatuba' },
    },
  });
}

export const supabase: SupabaseClient | null = client;

/**
 * Wrapper tolerante a falhas: qualquer erro de rede/caixa vira `null` e o
 * repository cai no fallback local. É isso que garante que o app abra mesmo
 * com o celular sem sinal no meio da praia.
 */
export async function tryQuery<T>(
  run: (c: SupabaseClient) => PromiseLike<{ data: T | null; error: unknown }>
): Promise<T | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await run(supabase);
    if (error) {
      console.warn('[supabase] erro na consulta, usando fallback local:', error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.warn('[supabase] falha de rede, usando fallback local:', err);
    return null;
  }
}
