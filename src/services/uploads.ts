import { supabase, isSupabaseConfigured } from './supabase';
import { compressImage, dataUrlToBlob, type CompressOptions } from './image';
import { uid } from './storage';

/**
 * Envio de imagens (capas de praia, galeria e fotos da comunidade).
 *
 * Dois destinos, um só contrato:
 *  - **Com Supabase configurado:** a imagem vai para o bucket público `uploads`
 *    e devolvemos uma URL. É o caminho de produção — URLs leves, o `localStorage`
 *    não pesa e o app funciona entre dispositivos.
 *  - **Sem backend (modo local):** devolvemos o próprio data URL comprimido, que
 *    fica no `localStorage`. Continua funcionando offline, com a limitação
 *    natural de cota do navegador.
 *
 * O `coverImage` de uma praia pode ficar vazio de propósito: o `<BeachImage>`
 * cai na arte procedural. Ou seja, o upload é opcional por design.
 */

export const UPLOAD_BUCKET = 'uploads';

export type UploadFolder = 'covers' | 'gallery' | 'ugc';

export interface UploadResult {
  /** URL pública (Storage) ou data URL (modo local). */
  url: string;
  width: number;
  height: number;
  bytes: number;
  storagePath: string | null;
  persisted: 'storage' | 'local';
}

const FOLDER_OPTIONS: Record<UploadFolder, CompressOptions> = {
  // Capas aparecem grandes na listagem e no carrossel: capricha no tamanho.
  covers: { maxEdge: 1600, quality: 0.74, maxBytes: 1.1 * 1024 * 1024 },
  // Galeria é uma grade pequena: leve é melhor.
  gallery: { maxEdge: 1100, quality: 0.68, maxBytes: 500 * 1024 },
  ugc: { maxEdge: 1400, quality: 0.72, maxBytes: 900 * 1024 },
};

export class UploadError extends Error {}

export async function uploadImage(
  file: File,
  folder: UploadFolder = 'covers'
): Promise<UploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new UploadError('Selecione um arquivo de imagem (JPG, PNG ou WebP).');
  }

  const compressed = await compressImage(file, FOLDER_OPTIONS[folder]);

  // Extensão sempre jpeg: `compressImage` normaliza para JPEG.
  const ext = 'jpg';
  const base = uid(folder).replace(/[^a-z0-9_]/gi, '');
  const path = `${folder}/${base}.${ext}`;

  if (!isSupabaseConfigured || !supabase) {
    return {
      url: compressed.dataUrl,
      width: compressed.width,
      height: compressed.height,
      bytes: compressed.bytes,
      storagePath: null,
      persisted: 'local',
    };
  }

  try {
    const blob = await dataUrlToBlob(compressed.dataUrl);
    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) throw new UploadError('URL pública não foi gerada.');

    return {
      url: data.publicUrl,
      width: compressed.width,
      height: compressed.height,
      bytes: compressed.bytes,
      storagePath: path,
      persisted: 'storage',
    };
  } catch (err) {
    // Nunca perder o upload por causa do Storage: cai para o modo local.
    console.warn('[uploads] Storage indisponível, mantendo a imagem localmente:', err);
    return {
      url: compressed.dataUrl,
      width: compressed.width,
      height: compressed.height,
      bytes: compressed.bytes,
      storagePath: null,
      persisted: 'local',
    };
  }
}

/** Remove um arquivo enviado anteriormente ao Storage (ignora data URLs). */
export async function deleteUpload(storagePath: string | null): Promise<void> {
  if (!storagePath || storagePath.startsWith('data:') || !supabase) return;
  try {
    await supabase.storage.from(UPLOAD_BUCKET).remove([storagePath]);
  } catch (err) {
    console.warn('[uploads] não foi possível remover', storagePath, err);
  }
}
