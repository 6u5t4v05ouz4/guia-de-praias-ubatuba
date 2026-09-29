/**
 * Utilidades de imagem usadas pelo envio colaborativo de fotos.
 *
 * O SPEC (docs/SPEC.md §5) exige "compressão automática no cliente antes do
 * envio". Comprimir também é o que viabiliza o fallback local: a imagem vira um
 * data URL modesto, cabe no `localStorage` e continua visível offline.
 */

const DEFAULTS = {
  maxEdge: 1400,
  quality: 0.72,
  maxBytes: 900 * 1024,
} as const;

export interface CompressOptions {
  /** Lado maior máximo, em pixels. */
  maxEdge?: number;
  /** Qualidade JPEG inicial (0.4–1). */
  quality?: number;
  /** Teto de peso antes de reduzir a resolução. */
  maxBytes?: number;
}

export interface CompressionResult {
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Redimensiona e recomprime uma imagem. Se o navegador não suportar canvas
 * (ou a imagem for de um tipo não suportado), devolve o arquivo original.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressionResult> {
  const { maxEdge, quality: startQuality, maxBytes } = { ...DEFAULTS, ...options };

  const bitmap = await loadBitmap(file);

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return fromFile(file);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

  let dataUrl = canvas.toDataURL('image/jpeg', startQuality);

  // Reduz mais um passo enquanto estiver acima do orçamento de armazenamento.
  let quality = startQuality;
  while (approxBytes(dataUrl) > maxBytes && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // Se ainda assim estourar, corta a resolução pela metade.
  if (approxBytes(dataUrl) > maxBytes) {
    const small = document.createElement('canvas');
    small.width = Math.max(1, Math.round(width / 2));
    small.height = Math.max(1, Math.round(height / 2));
    const sctx = small.getContext('2d');
    if (sctx) {
      sctx.drawImage(canvas, 0, 0, small.width, small.height);
      dataUrl = small.toDataURL('image/jpeg', 0.6);
      return { dataUrl, width: small.width, height: small.height, bytes: approxBytes(dataUrl) };
    }
  }

  return { dataUrl, width, height, bytes: approxBytes(dataUrl) };
}

/** Converte um data URL em Blob, para envio ao Supabase Storage. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function approxDataUrlBytes(dataUrl: string): number {
  return approxBytes(dataUrl);
}

function approxBytes(dataUrl: string): number {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.floor((b64.length * 3) / 4);
}

function fromFile(file: File): Promise<CompressionResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        dataUrl: String(reader.result ?? ''),
        width: 0,
        height: 0,
        bytes: file.size,
      });
    reader.onerror = () => resolve({ dataUrl: '', width: 0, height: 0, bytes: 0 });
    reader.readAsDataURL(file);
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* cai no <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
