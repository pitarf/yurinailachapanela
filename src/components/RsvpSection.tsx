'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { submitRsvp } from '@/app/admin/actions';
import {
  CheckCircle2,
  Users,
  User,
  Mail,
  MessageSquare,
  Sparkles,
  Calendar,
  MapPin,
  Loader2,
  Heart,
  Plus,
  Minus,
} from 'lucide-react';

interface RsvpSectionProps {
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventAddress?: string;
  eventMapsUrl?: string;
}

export default function RsvpSection({
  eventDate = 'Domingo, 11 de Outubro de 2026',
  eventTime = '13:00',
  eventLocation = 'ADVEC Templo Auxiliar',
  eventAddress = 'Rua Montevidéu, 1191 - 4º andar.',
  eventMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
}: RsvpSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hasCompanion: false,
    companionCount: 1,
    companionNames: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Por favor, informe o seu nome completo.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await submitRsvp({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        hasCompanion: formData.hasCompanion,
        companionCount: formData.hasCompanion ? formData.companionCount : 0,
        companionNames: formData.hasCompanion ? formData.companionNames.trim() : '',
        notes: formData.notes.trim(),
      });

      if (res.success) {
        setConfirmedData({
          name: formData.name.trim(),
          email: formData.email.trim(),
          hasCompanion: formData.hasCompanion,
          companionCount: formData.hasCompanion ? formData.companionCount : 0,
          companionNames: formData.companionNames.trim(),
        });
        setIsSuccess(true);
        toast.success('Presença confirmada com sucesso! Enviamos os detalhes para o seu e-mail.');
      } else {
        toast.error(res.error || 'Não foi possível confirmar a presença. Tente novamente.');
      }
    } catch {
      toast.error('Erro de conexão ao enviar sua confirmação. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      hasCompanion: false,
      companionCount: 1,
      companionNames: '',
      notes: '',
    });
    setIsSuccess(false);
    setConfirmedData(null);
  };

  return (
    <section id="presenca" className="py-20 md:py-32 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
        <span className="text-[10px] sm:text-xs tracking-widest font-sans text-brand-muted uppercase block">
          Confirmação de Presença
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-zinc-900 dark:text-white">
          Celebre Conosco
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-lg mx-auto leading-relaxed">
          Para que possamos preparar tudo com o maior carinho e conforto, por favor confirme a sua presença até a data do evento.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-popyn p-6 sm:p-10 md:p-14 shadow-sm relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 dark:bg-zinc-850/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        {isSuccess ? (
          /* Estado de Sucesso */
          <div className="text-center space-y-6 py-6 animate-fade-in max-w-lg mx-auto">
            <div className="w-16 h-16 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-sans uppercase tracking-widest text-zinc-400 font-semibold">
                Confirmação Realizada
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 dark:text-white font-light">
                Presença Confirmada!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                Obrigado por confirmar, <strong>{confirmedData?.name}</strong>! Enviamos um e-mail com todos os detalhes e o mapa do local para <strong>{confirmedData?.email}</strong>.
              </p>
            </div>

            {/* Resumo da Confirmação */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-850/60 rounded-2xl border border-zinc-150 dark:border-zinc-800 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-750 pb-2">
                <span className="text-zinc-500 font-light">Convidado Titular:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{confirmedData?.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-750 pb-2">
                <span className="text-zinc-500 font-light">E-mail:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{confirmedData?.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-750 pb-2">
                <span className="text-zinc-500 font-light">Acompanhantes:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {confirmedData?.hasCompanion && confirmedData?.companionCount > 0
                    ? `Sim (${confirmedData.companionCount} pessoa${confirmedData.companionCount > 1 ? 's' : ''})`
                    : 'Apenas você'}
                </span>
              </div>
              {confirmedData?.companionNames && (
                <div className="pt-1">
                  <span className="text-zinc-500 font-light block mb-0.5">Nome(s) do(s) Acompanhante(s):</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{confirmedData.companionNames}</span>
                </div>
              )}
            </div>

            {/* Ações do Sucesso */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={eventMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Ver Rota no Google Maps</span>
              </a>
              <button
                onClick={handleReset}
                type="button"
                className="w-full sm:w-auto px-5 py-3 border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
              >
                Confirmar Outra Pessoa
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Confirmação */
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {/* Grid Nome e E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Seu Nome Completo *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Ana Clara Silva"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Seu E-mail *</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Ex: anaclara@gmail.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                />
                <span className="text-[10px] text-zinc-400 block font-light">
                  Enviaremos a confirmação e o lembrete para este endereço.
                </span>
              </div>
            </div>

            {/* Acompanhante Toggle */}
            <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-850/40 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-sans font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span>Vai levar acompanhante(s)?</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-light mt-0.5">
                    Cônjuge, namorado(a), filhos ou familiares que irão com você.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, hasCompanion: false }))}
                    className={`px-4 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
                      !formData.hasCompanion
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Apenas Eu
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, hasCompanion: true }))}
                    className={`px-4 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
                      formData.hasCompanion
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Com Acompanhante
                  </button>
                </div>
              </div>

              {/* Campos condicionais se tiver acompanhante */}
              {formData.hasCompanion && (
                <div className="pt-4 border-t border-zinc-200/70 dark:border-zinc-750 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300">
                      Quantidade de Acompanhantes:
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            companionCount: Math.max(1, p.companionCount - 1),
                          }))
                        }
                        disabled={formData.companionCount <= 1}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-sm font-semibold w-8 text-center text-zinc-900 dark:text-white">
                        {formData.companionCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            companionCount: Math.min(5, p.companionCount + 1),
                          }))
                        }
                        disabled={formData.companionCount >= 5}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300">
                      Nome(s) do(s) Acompanhante(s) <span className="text-zinc-400 font-light">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companionNames}
                      onChange={(e) => setFormData((p) => ({ ...p, companionNames: e.target.value }))}
                      placeholder="Ex: João Silva e Lucas Silva"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem / Recadinho para os Noivos */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                <span>Mensagem ou Recadinho para os Noivos <span className="text-zinc-400 font-light">(Opcional)</span></span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Deixe uma mensagem de carinho, bênção ou votos para Naila & Yuri..."
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all resize-none"
              />
            </div>

            {/* Botão de Envio */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-sans text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirmando sua Presença...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Minha Presença</span>
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
