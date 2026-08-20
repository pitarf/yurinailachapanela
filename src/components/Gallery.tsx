'use client';

import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
  isHero?: boolean;
}

interface GalleryProps {
  initialPhotos: Photo[];
}

export default function Gallery({ initialPhotos }: GalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Fotos de fallback elegantes P&B caso nenhuma tenha sido cadastrada no admin ainda
  const photos =
    initialPhotos.length > 0
      ? initialPhotos
      : [
          {
            id: 'g-1',
            url: '/pre_wedding_hero.png',
            caption: 'Naila & Yuri • O Início de uma Nova História',
          },
          {
            id: 'g-2',
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            caption: 'Momentos inesquecíveis compartilhados juntos',
          },
          {
            id: 'g-3',
            url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
            caption: 'Sorrisos e a expectativa para o grande dia',
          },
          {
            id: 'g-4',
            url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
            caption: 'Construindo o nosso lar com amor & carinho',
          },
        ];

  return (
    <div className="w-full">
      {/* Grid da Galeria Editorial B&W */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-popyn overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption || 'Foto do Casal Naila & Yuri'}
              className="w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 text-white">
              <div className="flex justify-end">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
              {photo.caption && (
                <p className="font-serif text-sm font-light leading-snug tracking-wide drop-shadow-md">
                  {photo.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal de Expansão de Foto */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-fade-in"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full bg-zinc-950 border border-zinc-800 rounded-popyn overflow-hidden flex flex-col items-center p-4 shadow-2xl"
          >
            <div className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.url}
                alt=""
                className="max-w-full max-h-full object-contain filter grayscale contrast-125"
              />
            </div>
            {selectedPhoto.caption && (
              <p className="font-serif text-base text-zinc-300 font-light mt-4 text-center px-4">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
