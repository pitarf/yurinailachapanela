'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id?: string;
  url: string;
  caption?: string | null;
}

interface HeroSliderProps {
  photos: Photo[];
  intervalMs?: number;
}

export default function HeroSlider({ photos, intervalMs = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Se não houver fotos da galeria passadas, usamos um conjunto elegante de pré-wedding P&B
  const displayPhotos =
    photos && photos.length > 0
      ? photos
      : [
          { url: '/pre_wedding_hero.png', caption: 'Naila & Yuri' },
          { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', caption: 'Momentos inesquecíveis' },
          { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', caption: 'O Nosso Grande Dia' },
          { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', caption: 'Construindo o futuro juntos' },
        ];

  useEffect(() => {
    if (displayPhotos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [displayPhotos.length, intervalMs]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-0 bg-zinc-950 overflow-hidden group select-none">
      {/* Slides com Efeito Crossfade */}
      {displayPhotos.map((photo, index) => (
        <div
          key={photo.id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.caption || 'Foto Naila & Yuri'}
            className="w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-[10000ms] scale-100 group-hover:scale-105"
          />
          {/* Degradê sutil inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60" />
        </div>
      ))}

      {/* Controles de Navegação (Anterior / Próximo) - exibidos no hover */}
      {displayPhotos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicadores de Slide (Tracinhos Minimalistas) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
            {displayPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
