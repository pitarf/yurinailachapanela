'use client';

import { useState } from 'react';
import GiftReservationModal from './GiftReservationModal';
import { Heart, Search, ShoppingBag } from 'lucide-react';

interface Reservation {
  id?: string;
  personName?: string;
  email?: string;
  createdAt?: string;
}

interface Gift {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  purchaseUrl?: string | null;
  imageUrl?: string | null;
  status: 'AVAILABLE' | 'RESERVED' | 'PURCHASED' | 'DELIVERED' | 'CANCELLED';
  reservation?: Reservation | null;
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

  // Atualiza localmente o status e o nome de quem reservou o presente
  const handleReservationSuccess = (updatedGift: Gift) => {
    setGifts((prevGifts) =>
      prevGifts.map((g) =>
        g.id === updatedGift.id
          ? {
              ...g,
              status: updatedGift.status,
              reservation: updatedGift.reservation || g.reservation,
            }
          : g
      )
    );
  };

  const filteredGifts = gifts.filter((gift) => {
    const matchesCategory = activeCategory === 'Todos' || gift.category === activeCategory;
    const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* Search and Filters - Otimizados para Mobile e Desktop */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 sm:mb-8 md:mb-12">
        {/* Category Filters - Scroll horizontal invisível no celular e quebra elegante no desktop */}
        <div className="w-full md:flex-1 flex items-center md:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 no-scrollbar scrollbar-none snap-x touch-pan-x">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-sans tracking-wider uppercase whitespace-nowrap transition-all duration-300 border shrink-0 snap-start ${
                activeCategory === category
                  ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:text-zinc-400 dark:border-zinc-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar presente..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-xs font-sans tracking-wide focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Gifts Grid - 2 Colunas no Mobile, 5 no Desktop */}
      {filteredGifts.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-popyn">
          <p className="font-serif text-base sm:text-lg font-light text-zinc-400">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 md:gap-5">
          {filteredGifts.map((gift) => {
            const isReserved = gift.status !== 'AVAILABLE';
            const reservedByName = gift.reservation?.personName;

            return (
              <div
                key={gift.id}
                className={`group bg-white dark:bg-zinc-900 border rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  isReserved
                    ? 'border-zinc-200 dark:border-zinc-800 opacity-95 bg-zinc-50/50 dark:bg-zinc-900/50'
                    : 'border-zinc-150 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {/* Product Image */}
                {gift.imageUrl ? (
                  <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-100 dark:border-zinc-850">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gift.imageUrl}
                      alt={gift.name}
                      className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                        isReserved ? 'filter grayscale-[30%]' : ''
                      }`}
                      loading="lazy"
                    />

                    {/* Badge de Reservado sobre a foto */}
                    {isReserved && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-2 text-center text-white">
                        <span className="px-2.5 py-1 bg-black/60 border border-white/40 text-[8px] sm:text-[9px] tracking-widest font-sans font-semibold uppercase rounded-full mb-1">
                          🎁 Reservado
                        </span>
                        {reservedByName && (
                          <span className="text-[10px] sm:text-xs font-sans font-medium line-clamp-1 text-zinc-100">
                            por {reservedByName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-850 flex flex-col items-center justify-center p-4 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400">
                    <ShoppingBag className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-[9px] uppercase tracking-wider font-sans opacity-60">Presente</span>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow justify-between space-y-2 sm:space-y-3">
                  <div className="space-y-1">
                    <span className="text-[7px] sm:text-[8px] tracking-widest font-sans text-brand-muted uppercase block truncate">
                      {gift.category}
                    </span>
                    <h3 className="font-serif text-xs sm:text-sm md:text-base font-light text-zinc-950 dark:text-white leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                      {gift.name}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-1">
                    {showPrices && gift.price > 0 && (
                      <div>
                        <span className="text-[7px] sm:text-[8px] text-zinc-400 uppercase tracking-widest font-sans block">
                          Preço Estimado
                        </span>
                        <p className="font-serif text-xs sm:text-sm font-light text-zinc-900 dark:text-zinc-150">
                          {gift.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {!isReserved ? (
                        <button
                          onClick={() => setSelectedGift(gift)}
                          className="flex-1 py-2 sm:py-2.5 px-2 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-sm active:scale-95"
                        >
                          Presentear
                        </button>
                      ) : (
                        <div className="flex-1 py-2 px-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-sans text-rose-900 dark:text-rose-200 text-center truncate flex items-center justify-center gap-1">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 shrink-0" />
                          <span className="truncate">
                            {reservedByName ? (
                              <>
                                Por <strong>{reservedByName}</strong>
                              </>
                            ) : (
                              'Reservado'
                            )}
                          </span>
                        </div>
                      )}

                      {gift.purchaseUrl && (
                        <a
                          href={gift.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-sans font-semibold uppercase text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 flex items-center justify-center"
                          title="Ver produto na loja parceira"
                        >
                          Loja ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
