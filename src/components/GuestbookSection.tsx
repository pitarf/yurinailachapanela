'use client';

import { useState } from 'react';
import { MessageSquare, Heart, Gift, Calendar, ArrowRight } from 'lucide-react';

export interface GuestMessage {
  id: string;
  name: string;
  notes: string;
  type: 'presence' | 'gift';
  giftName?: string | null;
  date: string;
}

interface GuestbookSectionProps {
  messages: GuestMessage[];
}

export default function GuestbookSection({ messages }: GuestbookSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'presence' | 'gift'>('all');
  const [visibleCount, setVisibleCount] = useState(6);

  // Filtrar recados
  const filteredMessages = messages.filter((msg) => {
    if (activeFilter === 'all') return true;
    return msg.type === activeFilter;
  });

  // Paginação simples
  const displayedMessages = filteredMessages.slice(0, visibleCount);
  const hasMore = filteredMessages.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <section id="recados" className="py-20 md:py-32 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full border-b border-zinc-100 dark:border-zinc-850">
      <div className="text-center space-y-4 mb-12 sm:mb-16">
        <span className="text-[10px] sm:text-xs tracking-widest font-sans text-brand-muted uppercase block">
          Mural de Carinho
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-zinc-900 dark:text-white">
          Recados dos Convidados
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
          Palavras de afeto e votos de felicidade deixados por nossos amigos e familiares ao confirmar presença ou reservar presentes.
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'all', label: 'Todos os Recados', icon: MessageSquare, count: messages.length },
            { id: 'presence', label: 'De Presença', icon: Calendar, count: messages.filter(m => m.type === 'presence').length },
            { id: 'gift', label: 'De Presentes', icon: Gift, count: messages.filter(m => m.type === 'gift').length }
          ].map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id as any);
                  setVisibleCount(6); // Reseta a paginação ao trocar filtro
                }}
                className={`px-4 py-2 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all flex items-center gap-2 border ${
                  activeFilter === filter.id
                    ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                    : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border-zinc-200/70 dark:border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{filter.label}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md ${
                  activeFilter === filter.id ? 'bg-white/20 text-white dark:bg-black/20 dark:text-zinc-950' : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Recados */}
      {displayedMessages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-popyn p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all hover:border-zinc-300 dark:hover:border-zinc-700 group"
            >
              <div className="space-y-4">
                {/* Ícone Indicador de Origem */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {formatDate(msg.date)}
                  </span>
                  <div className={`p-2 rounded-xl border ${
                    msg.type === 'gift' 
                      ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200' 
                      : 'bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950'
                  }`}>
                    {msg.type === 'gift' ? <Gift className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5 fill-current" />}
                  </div>
                </div>

                {/* Conteúdo do Recado */}
                <div className="relative">
                  <span className="absolute -top-3 -left-2 text-4xl font-serif text-zinc-150 dark:text-zinc-800 select-none group-hover:text-zinc-200 dark:group-hover:text-zinc-700 transition-colors">“</span>
                  <p className="font-serif italic text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed pl-3 relative z-10 pt-1">
                    {msg.notes}
                  </p>
                </div>
              </div>

              {/* Remetente & Tipo */}
              <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="font-serif text-sm font-semibold text-zinc-950 dark:text-white block">
                  {msg.name}
                </span>
                <span className="text-[10px] font-sans tracking-wide text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
                  {msg.type === 'presence' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Presença Confirmada
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-zinc-400 shrink-0" />
                      Presenteou: <strong className="text-zinc-700 dark:text-zinc-300 max-w-[150px] truncate">{msg.giftName}</strong>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-popyn max-w-xl mx-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="font-serif text-lg font-light text-zinc-800 dark:text-zinc-200">
            Nenhum recado encontrado
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light max-w-xs mx-auto">
            {activeFilter === 'all'
              ? 'Ainda não recebemos recados. Seja o primeiro a deixar uma mensagem ao confirmar presença ou presentear! ✨'
              : activeFilter === 'presence'
              ? 'Nenhum convidado deixou recados na confirmação de presença ainda.'
              : 'Nenhum convidado deixou recados ao escolher um presente ainda.'}
          </p>
        </div>
      )}

      {/* Botão Carregar Mais */}
      {hasMore && (
        <div className="text-center pt-10">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 active:scale-95"
          >
            <span>Ver Mais Recados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
