import { useState } from 'react';
import { toast } from 'sonner';
import { X, Check, Copy, ExternalLink, ShoppingBag } from 'lucide-react';

interface Gift {
  id: string;
  name: string;
  price: number;
  purchaseUrl?: string | null;
  imageUrl?: string | null;
}

interface GiftReservationModalProps {
  gift: Gift;
  onClose: () => void;
  onSuccess: (updatedGift: any) => void;
  pixDetails?: {
    pixKey?: string | null;
    pixReceiver?: string | null;
    pixCity?: string | null;
  } | null;
  showPrices?: boolean;
}

export default function GiftReservationModal({
  gift,
  onClose,
  onSuccess,
  pixDetails,
  showPrices = false,
}: GiftReservationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [deliveryAddress, setDeliveryAddress] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          personName: name,
          email,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar reserva.');
      }

      setDeliveryAddress(data.deliveryAddress);
      setStep('success');
      onSuccess(data.gift);
      toast.success('Presente reservado com sucesso! ❤️');
    } catch (err: any) {
      toast.error(err.message || 'Não conseguimos reservar este presente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    if (pixDetails?.pixKey) {
      navigator.clipboard.writeText(pixDetails.pixKey);
      toast.success('Chave PIX copiada para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn shadow-2xl overflow-hidden p-6 md:p-8 animate-fade-in text-brand-black dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] tracking-widest font-sans text-brand-muted uppercase">Você escolheu presentear com:</span>
              <h3 className="font-serif text-2xl md:text-3xl font-light mt-1 text-zinc-950 dark:text-white">
                {gift.name}
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                {showPrices && gift.price > 0 && (
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Preço Estimado</span>
                    <p className="font-serif text-xl text-zinc-800 dark:text-zinc-200 font-light">
                      {gift.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                )}

                {gift.purchaseUrl && (
                  <a
                    href={gift.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-sans font-medium rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Ver Produto na Loja <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light">
              Informe seus dados para confirmar a reserva do presente em seu nome:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Souza"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                  Seu E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: maria@email.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                  Uma mensagem especial (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Deseje algo especial para o casal..."
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-sans text-xs tracking-widest font-semibold uppercase rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-white">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-zinc-950 dark:text-white">
                Presente Reservado! ❤️
              </h3>
              <p className="text-sm text-zinc-500 mt-2 font-light">
                Obrigado por fazer parte desse momento tão especial para nós.
              </p>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

            <div className="text-left space-y-4">
              {gift.purchaseUrl && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs tracking-widest font-sans text-brand-muted uppercase mb-1">Link para Compra</h4>
                  <p className="text-xs text-zinc-500 mb-3">Você pode comprar o item diretamente no site parceiro abaixo:</p>
                  <a
                    href={gift.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-[11px] font-sans tracking-widest font-semibold uppercase rounded-lg transition-colors"
                  >
                    Ir para o Site da Loja
                  </a>
                </div>
              )}

              {pixDetails?.pixKey && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs tracking-widest font-sans text-brand-muted uppercase mb-1">Opção PIX</h4>
                  <p className="text-xs text-zinc-500 mb-3">Se preferir enviar o valor do presente em dinheiro:</p>
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                    <span className="truncate pr-2 select-all">{pixDetails.pixKey}</span>
                    <button
                      onClick={handleCopyPix}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      title="Copiar chave PIX"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {pixDetails.pixReceiver && (
                    <p className="text-[10px] text-zinc-400 mt-2">
                      Favorecido: {pixDetails.pixReceiver} {pixDetails.pixCity ? `(${pixDetails.pixCity})` : ''}
                    </p>
                  )}
                </div>
              )}

              {deliveryAddress && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs tracking-widest font-sans text-brand-muted uppercase mb-1">Endereço de Entrega</h4>
                  <p className="text-xs text-zinc-500 mb-2">Para envio do produto direto para o casal:</p>
                  <p className="text-sm font-light text-zinc-800 dark:text-zinc-200 select-all whitespace-pre-line leading-relaxed">
                    {deliveryAddress}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-sans text-xs tracking-widest font-semibold uppercase rounded-xl transition-all"
            >
              Fechar Janela
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
