import { useState } from 'react';
import type { Beach, BeachGalleryPhoto } from '@/types';
import { beachArtDataUrl } from '@/assets/beachArt';
import './BeachImage.css';

interface BeachImageProps {
  beach: Beach;
  /** URL alternativa (foto enviada pela comunidade, por exemplo). */
  src?: string;
  variant?: number;
  alt?: string;
  className?: string;
  /** Se true, não tenta a arte procedural (útil quando `src` é obrigatório). */
  noFallback?: boolean;
}

/**
 * Imagem de praia com fallback em duas camadas:
 *   1. foto real (`src` ou `beach.coverImage`);
 *   2. arte procedural determinística, gerada na hora e sem custo de rede.
 *
 * É isso que faz a listagem continuar bonita e instantânea offline, mesmo antes
 * de o usuário ter visitado qualquer praia.
 */
export function BeachImage({
  beach,
  src,
  variant = 0,
  alt,
  className = '',
  noFallback = false,
}: BeachImageProps) {
  const remote = src || beach.coverImage || '';
  const [failed, setFailed] = useState(false);

  const generated = beachArtDataUrl(beach, { variant, width: 1200, height: 800 });
  const finalSrc = failed || !remote ? generated : remote;

  return (
    <img
      className={`beach-image ${className}`}
      src={finalSrc}
      alt={alt ?? `${beach.name}, Ubatuba`}
      loading={variant === 0 ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => {
        if (!noFallback) setFailed(true);
      }}
    />
  );
}

interface GalleryImageProps {
  beach: Beach;
  photo: BeachGalleryPhoto;
  index: number;
  className?: string;
}

/** Foto da galeria colaborativa; cai na arte se o arquivo sumiu. */
export function GalleryImage({ beach, photo, index, className = '' }: GalleryImageProps) {
  return <BeachImage beach={beach} src={photo.url} variant={index + 1} className={className} />;
}
