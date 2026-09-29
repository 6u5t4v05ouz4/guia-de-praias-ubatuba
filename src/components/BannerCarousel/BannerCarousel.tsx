import { useCallback, useEffect, useRef, useState } from 'react';
import type { Banner } from '@/types';
import { bannerArtDataUrl } from '@/assets/partnerArt';
import { bannersRepo } from '@/services/repository';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import './BannerCarousel.css';

interface BannerCarouselProps {
  position: Banner['position'];
}

/**
 * Banners rotativos dos parceiros (Módulo 3 do /admin).
 *
 * Só renderiza se houver banner ativo. Cliques são contabilizados no repositório
 * — é a métrica de retorno que justifica o plano Master do BUSINESS_MODEL.md.
 */
export function BannerCarousel({ position }: BannerCarouselProps) {
  const { data, loading } = useAsyncResource(
    () => bannersRepo.list(position),
    [position]
  );
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  const banners = data ?? [];

  const advance = useCallback(() => {
    setIndex((i) => (banners.length > 0 ? (i + 1) % banners.length : 0));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    timer.current = window.setInterval(advance, 5500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [banners.length, advance]);

  if (loading || banners.length === 0) return null;

  const current = banners[index % banners.length];

  return (
    <section className="banner-carousel" aria-label="Destaques dos parceiros">
      <div className="banner-carousel__viewport">
        {banners.map((b, i) => (
          <a
            key={b.id}
            className={`banner-carousel__slide ${i === index % banners.length ? 'is-active' : ''}`}
            href={b.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden={i !== index % banners.length}
            tabIndex={i === index % banners.length ? 0 : -1}
            onClick={() => bannersRepo.trackClick(b.id)}
          >
            <img
              className="banner-carousel__img"
              src={b.imageUrl || bannerArtDataUrl(b)}
              alt={b.title}
              loading="lazy"
              decoding="async"
            />
            <span className="banner-carousel__cta">
              {b.title} <span aria-hidden="true">→</span>
            </span>
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="banner-carousel__dots">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              className={`banner-carousel__dot ${i === index % banners.length ? 'is-active' : ''}`}
              aria-label={`Ver ${b.title}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      <span className="sr-only">
        Banner {index + 1} de {banners.length}: {current.title}
      </span>
    </section>
  );
}
