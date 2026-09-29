import { useCallback, useEffect, useRef, useState } from 'react';
import type { Beach, UGCPhoto } from '@/types';
import { BeachImage } from '../BeachCard/BeachImage';
import './PhotoCarousel.css';

export interface CarouselSlide {
  id: string;
  beach: Beach;
  url?: string;
  variant: number;
  author: string;
  instagram?: string;
}

interface PhotoCarouselProps {
  slides: CarouselSlide[];
  /** Galeria colaborativa (UGC) troca o rodapé para o crédito do autor. */
  community?: UGCPhoto[];
}

/**
 * Carrossel de fotos da página da praia (SPEC §4.1).
 *
 * Navegação por arrastar (pointer events), teclado, dots e thumbnails.
 * Usa `overflow: hidden` + `scroll-snap` para o toque performar bem no Android.
 */
export function PhotoCarousel({ slides, community }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (i: number) => {
      const n = slides.length;
      if (n === 0) return;
      const next = (i + n) % n;
      setIndex(next);
      const track = trackRef.current;
      if (track) track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    },
    [slides.length]
  );

  // Sincroniza o índice quando o usuário arrasta manualmente.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = track.clientWidth || 1;
        setIndex(Math.round(track.scrollLeft / w));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
    };
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index] ?? slides[0];

  return (
    <div className="carousel">
      <div
        className="carousel__track"
        ref={trackRef}
        role="group"
        aria-roledescription="carrossel"
        aria-label="Fotos da praia"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(index + 1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(index - 1);
          }
        }}
      >
        {slides.map((slide, i) => (
          <figure className="carousel__slide" key={slide.id} aria-hidden={i !== index}>
            <BeachImage beach={slide.beach} src={slide.url} variant={slide.variant} />
            <figcaption className="carousel__credit">
              📸 Foto por{' '}
              {slide.instagram ? (
                <a
                  href={`https://instagram.com/${slide.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {slide.instagram}
                </a>
              ) : (
                <span>{slide.author}</span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="icon-btn icon-btn--on-glass carousel__arrow carousel__arrow--prev"
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--on-glass carousel__arrow carousel__arrow--next"
            onClick={() => goTo(index + 1)}
            aria-label="Próxima foto"
          >
            ›
          </button>

          <div className="carousel__dots" role="tablist" aria-label="Selecionar foto">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Foto ${i + 1}`}
                className={`carousel__dot ${i === index ? 'is-active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}

      {community && community.length > 0 && (
        <span className="carousel__community-badge">
          📸 {community.length} foto{community.length > 1 ? 's' : ''} da comunidade
        </span>
      )}

      <span className="sr-only">
        Foto {index + 1} de {slides.length} — {current.author}
      </span>
    </div>
  );
}
