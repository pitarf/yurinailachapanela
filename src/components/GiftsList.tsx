'use client';

import { useState } from 'react';
import GiftReservationModal from './GiftReservationModal';

interface Gift {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  purchaseUrl?: string | null;
  imageUrl?: string | null;
  status: 'AVAILABLE' | 'RESERVED' | 'PURCHASED' | 'DELIVERED' | 'CANCELLED';
}

interface GiftsListProps {
  initialGifts: Gift[];
  pixDetails?: {
    pixKey?: string | null;
    pixReceiver?: string | null;
    pixCity?: string | null;
  } | null;
  showPrices?: boolean;
}

export default function GiftsList({ initialGifts, pixDetails, showPrices = false }: GiftsListProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Extrai as categorias únicas
  const categories = ['Todos', ...Array.from(new Set(gifts.map((g) => g.category)))];

  // Atualiza localmente o status do presente após a reserva ser bem sucedida
  const handleReservationSuccess = (updatedGift: Gift) => {
    setGifts((prevGifts) =>
      prevGifts.map((g) => (g.id === updatedGift.id ? { ...g, status: updatedGift.status } : g))
    );
  };

  const filteredGifts = gifts.filter((gift) => {
    const matchesCategory = activeCategory === 'Todos' || gift.category === activeCategory;
    const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 md:mb-12">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-sans tracking-wider uppercase transition-all duration-300 border ${
                activeCategory === category
                  ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white'
                  : 'bg-transparent text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-650'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar presente..."
          className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-5 py-2.5 text-xs font-sans tracking-wide focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
        />
      </div>

      {/* Gifts Grid */}
      {filteredGifts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-popyn">
          <p className="font-serif text-lg font-light text-zinc-400">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filteredGifts.map((gift) => (
            <div
              key={gift.id}
              className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-popyn overflow-hidden flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Product Image (Renderizada apenas se houver foto real cadastrada) */}
              {gift.imageUrl && (
                <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-100 dark:border-zinc-850">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gift.imageUrl}
                    alt={gift.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {gift.status !== 'AVAILABLE' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1.5 border border-white text-white text-[9px] tracking-widest font-sans font-semibold uppercase rounded-full">
                        Reservado
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Product Info */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] tracking-widest font-sans text-brand-muted uppercase block">
                    {gift.category}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-light text-zinc-950 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem]">
                    {gift.name}
                  </h3>
                  {gift.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-light line-clamp-2 leading-relaxed">
                      {gift.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  {showPrices && gift.price > 0 && (
                    <div>
                      <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-sans block">Preço Estimado</span>
                      <p className="font-serif text-sm sm:text-base font-light text-zinc-900 dark:text-zinc-150">
                        {gift.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => gift.status === 'AVAILABLE' && setSelectedGift(gift)}
                      disabled={gift.status !== 'AVAILABLE'}
                      className={`flex-1 py-2.5 px-2 rounded-xl font-sans text-[9px] tracking-wider font-semibold uppercase transition-all duration-300 ${
                        gift.status === 'AVAILABLE'
                          ? 'bg-zinc-950 hover:bg-zinc-850 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {gift.status === 'AVAILABLE' ? 'Presentear' : 'Reservado'}
                    </button>

                    {gift.purchaseUrl && (
                      <a
                        href={gift.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-[9px] font-sans font-semibold uppercase text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 flex items-center justify-center"
                        title="Ver produto diretamente na loja parceira"
                      >
                        Loja ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      {selectedGift && (
        <GiftReservationModal
          gift={selectedGift}
          onClose={() => setSelectedGift(null)}
          onSuccess={handleReservationSuccess}
          pixDetails={pixDetails}
          showPrices={showPrices}
        />
      )}
    </div>
  );
}
