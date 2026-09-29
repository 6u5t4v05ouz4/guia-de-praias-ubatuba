/**
 * Links de saída: WhatsApp (o canal central de leads — docs/BUSINESS_MODEL.md §2)
 * e mapas. Tudo é montado por aqui para que a mensagem seja sempre rastreável.
 */

/** Normaliza um telefone para o formato internacional exigido pelo wa.me (só dígitos). */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  if (digits.length <= 11) return `55${digits}`; // celular/fixo sem DDI
  return digits;
}

/**
 * Monta o link de lead. O texto pré-definido é o que permite ao comerciante
 * saber, mensagem a mensagem, que a venda veio do Guia.
 */
export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export interface MapTarget {
  lat: number;
  lng: number;
  name: string;
}

/** Google Maps com pin e navegação por estrada. */
export function googleMapsLink(target: MapTarget): string {
  const { lat, lng } = target;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
}

/** Waze — costuma ser mais confiável nas estradas de Ubatuba. */
export function wazeLink(target: MapTarget): string {
  const { lat, lng } = target;
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes&zoom=17`;
}

/** Abre um link externo de forma segura (noopener). */
export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Gera o slug de uma praia a partir do nome, no formato do catálogo
 * (`praia-de-itamambuca`). Usado pelo /admin ao criar uma praia nova.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
