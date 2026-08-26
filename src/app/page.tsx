import Image from 'next/image';
import { getEventData, getSystemSettings, getGiftsData, getPhotosData } from '@/lib/json-db';
import Countdown from '@/components/Countdown';
import Logo from '@/components/Logo';
import GiftsList from '@/components/GiftsList';
import Gallery from '@/components/Gallery';
import HeroSlider from '@/components/HeroSlider';
import Header from '@/components/Header';
import RsvpSection from '@/components/RsvpSection';
import type { Metadata } from 'next';

export const revalidate = 0; // Garantir dados sempre em tempo real

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSystemSettings();
    return {
      title: settings?.siteTitle || 'Naila & Yuri | Chá de Panela',
      description:
        settings?.siteDescription ||
        'Seja bem-vindo ao site de Chá de Panela e futura celebração de casamento de Naila & Yuri.',
      keywords: settings?.siteKeywords || 'Naila, Yuri, Chá de Panela, Casamento',
      icons: {
        icon: settings?.faviconUrl || '/favicon.ico',
      },
      openGraph: {
        title: settings?.siteTitle || 'Naila & Yuri | Chá de Panela',
        description:
          settings?.siteDescription ||
          'Um dia especial para celebrar o início de uma nova história.',
        images: settings?.ogImageUrl ? [{ url: settings.ogImageUrl }] : [],
      },
    };
  } catch {
    return {
      title: 'Naila & Yuri | Chá de Panela',
    };
  }
}

export default async function Home() {
  const [event, settings, gifts, photos] = await Promise.all([
    getEventData(),
    getSystemSettings(),
    getGiftsData(),
    getPhotosData(),
  ]);

  // Dados de Fallback (Padrão) caso o banco ainda não tenha sido populado
  const eventTitle = event?.title || 'Chá de Panela';
  const eventDate = typeof event?.date === 'string' ? event.date : event?.date?.toISOString?.() || '2026-10-11T13:00:00';
  const eventTime = event?.time || '13:00';
  const eventLocation = event?.location || 'ADVEC Templo auxiliar';
  const eventAddress = event?.address || 'Rua Montevidéu, 1191 - 4º andar.';
  const eventMapsUrl = event?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191';
  const eventDescription = event?.description || 'Estamos preparando cada detalhe com muito amor para celebrar essa nova fase das nossas vidas com vocês!';

  const coupleNames = settings?.coupleNames || 'Naila & Yuri';
  const pixDetails = {
    pixKey: settings?.pixKey || '21991344006',
    pixReceiver: settings?.pixReceiver || 'Yuri Nogueira',
    pixCity: settings?.pixCity || 'Rio de Janeiro',
  };

  const historyParagraphs: string[] = settings?.historyText
    ? settings.historyText.split('\n').filter((p: string) => p.trim().length > 0)
    : [
        'Resumir a história de duas pessoas que se amam não é fácil mas falar sobre nós dois é. Existe um propósito na nossa união e, desde sempre, dizemos sim ao nosso amor.',
        'Gostamos de ideias diferentes, somos autênticos, gostamos da companhia um do outro e, principalmente, amamos vivenciar novas experiências juntos. Gostamos de rir e compartilhar o melhor da vida ao lado de Cristo.',
        'Fomos chamados para conhecê-lo e fazê-lo conhecido, formar nossa família e curtir uma boa noite de pipoca.',
        'E vocês testemunharão a cena mais linda das nossas vidas: o início da nossa família.',
      ];

  const activities = event?.activities || [
    { id: '1', title: 'Boas-vindas & Drinks', description: 'Recepção dos convidados com coquetel de boas-vindas.', time: '15:00' },
    { id: '2', title: 'Brincadeiras do Casal', description: 'Momentos divertidos preparados pelos padrinhos.', time: '16:30' },
    { id: '3', title: 'Abertura dos Presentes', description: 'Celebração e agradecimento pelos carinhos recebidos.', time: '18:00' },
    { id: '4', title: 'Jantar & Confraternização', description: 'Comida boa, risadas e celebração da união.', time: '19:00' },
  ];

  // Se a lista de presentes estiver vazia no banco, criamos itens demonstrativos elegantes
  const displayGifts = gifts.length > 0 ? gifts : [
    { id: 'mock-1', name: 'Jogo de Panelas Antiaderente (7 Peças)', price: 349.90, category: 'Cozinha', status: 'AVAILABLE', description: 'Conjunto completo de panelas de alta qualidade para o nosso dia a dia.' },
    { id: 'mock-2', name: 'Cafeteira Espresso Automática', price: 599.90, category: 'Eletros', status: 'AVAILABLE', description: 'Para os nossos cafés da manhã ficarem ainda mais especiais.' },
    { id: 'mock-3', name: 'Aparelho de Jantar Porcelana (20 Peças)', price: 289.00, category: 'Mesa Posta', status: 'AVAILABLE', description: 'Pratos elegantes para recebermos nossos amigos e familiares.' },
    { id: 'mock-4', name: 'Liquidificador Turbo de Inox', price: 189.90, category: 'Eletros', status: 'AVAILABLE', description: 'Item essencial para prepararmos nossas receitas preferidas.' },
    { id: 'mock-5', name: 'Kit de Assadeiras de Vidro (3 peças)', price: 120.00, category: 'Cozinha', status: 'AVAILABLE', description: 'Travessas ideais para assados e sobremesas deliciosas.' },
    { id: 'mock-6', name: 'Jogo de Toalhas de Banho Algodão Egípcio', price: 219.00, category: 'Banho', status: 'AVAILABLE', description: 'Toalhas macias e de alta absorção para o nosso novo banheiro.' },
  ];

  return (
    <main className="min-h-screen relative flex flex-col bg-white text-zinc-950">
      {/* Header com Menu Hamburguer no Mobile e Navegação Elegante no Desktop */}
      <Header />

      {/* Hero Section - Título & Nomes como Protagonistas */}
      <section className="relative w-full flex flex-col lg:flex-row items-stretch border-b border-zinc-100 bg-white">
        {/* Text Area */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 md:p-14 lg:p-20 space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-zinc-100/90 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-sans text-zinc-600 uppercase font-semibold">
              <span>Save the date</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-950 font-bold">{new Date(eventDate).toLocaleDateString('pt-BR')}</span>
            </div>

            {/* Título Oficial Editorial Personalizado (Vogue + Nautica + Popcorn) */}
            <div className="pt-2 select-none relative">
              {/* Linha Superior: NAILA [pipoca] YURI (Vogue) */}
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <span className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-normal text-zinc-950 font-normal uppercase leading-none">
                  NAILA
                </span>
                <div className="relative w-8 h-8 sm:w-11 sm:h-11 md:w-13 md:h-13 lg:w-14 lg:h-14 flex items-center justify-center shrink-0">
                  <Image
                    src="/SIMBOL_POP_BLACK.png"
                    alt="Símbolo Pipoca Naila & Yuri"
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
                <span className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-normal text-zinc-950 font-normal uppercase leading-none">
                  YURI
                </span>
              </div>

              {/* Linha Inferior: Chá de Panela (Nautica Cursiva natural com presença marcante) */}
              <h1 className="font-script text-[38px] sm:text-[48px] md:text-[58px] lg:text-[68px] text-zinc-950 block -mt-3 sm:-mt-4 md:-mt-5 lg:-mt-6 font-normal tracking-normal ml-2 sm:ml-4 select-none relative z-10 leading-none">
                Chá de Panela
              </h1>
            </div>
          </div>

          {/* Contador Discreto & Sofisticado */}
          <div className="py-2.5 px-4 bg-zinc-50 border border-zinc-150 rounded-2xl w-fit shadow-xs">
            <Countdown targetDate={eventDate} />
          </div>

          <div className="max-w-md space-y-5">
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
              {eventDescription}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <a
                href="#presenca"
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-850 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Confirmar Presença</span>
                <span>✨</span>
              </a>
              <a
                href="#presentes"
                className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <span>Lista de Presentes</span>
                <span>🎁</span>
              </a>
              <a
                href="#evento"
                className="px-4 py-3 text-zinc-600 hover:text-zinc-900 font-sans text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                O Evento 📍
              </a>
            </div>
          </div>
        </div>

        {/* B&W Hero Slider Area */}
        <div className="flex-1 relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-100 overflow-hidden">
          <HeroSlider photos={photos} />
        </div>
      </section>

      {/* Nossa História */}
      <section id="historia" className="py-14 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto text-center border-b border-zinc-100">
        <Logo variant="monogram" size={90} className="mx-auto mb-6 sm:mb-8 opacity-75" />
        <span className="text-[10px] sm:text-xs tracking-widest font-sans text-brand-muted uppercase block mb-3 sm:mb-4">Nossa História</span>
        <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light text-zinc-900 mb-6 sm:mb-8">O Início de Tudo</h2>
        <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base text-zinc-600 font-light leading-relaxed max-w-2xl mx-auto">
          {historyParagraphs.map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Galeria de Fotos */}
      <section id="galeria" className="py-14 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full border-b border-zinc-100">
        <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <span className="text-[10px] sm:text-xs tracking-widest font-sans text-brand-muted uppercase block">Galeria Editorial</span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light text-zinc-900">Momentos do Casal</h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-lg mx-auto leading-relaxed">
            Alguns dos nossos registros favoritos capturados em preto e branco.
          </p>
        </div>
        <Gallery initialPhotos={photos} />
      </section>

      {/* O Evento & Programação */}
      <section id="evento" className="py-14 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 border-b border-zinc-100">
        {/* Informações */}
        <div className="space-y-8 flex flex-col justify-center">
          <div>
            <span className="text-xs tracking-widest font-sans text-brand-muted uppercase block mb-2">Informações Importantes</span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-zinc-900">O Grande Dia</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-zinc-100 rounded-popyn space-y-2">
              <h3 className="font-serif text-lg font-light text-zinc-800">Quando & Onde</h3>
              <p className="text-sm font-light text-zinc-600">
                Domingo, 11 de Outubro de 2026, às {eventTime || '13:00'}.
              </p>
              <p className="text-sm font-medium text-zinc-800">
                {eventLocation}
              </p>
              <p className="text-xs font-light text-zinc-500">
                {eventAddress}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href={eventMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-zinc-950 hover:bg-zinc-850 text-white font-sans text-xs tracking-widest font-semibold uppercase rounded-xl transition-colors inline-block"
            >
              Como Chegar
            </a>
          </div>
        </div>

        {/* Atividades / Timeline */}
        <div className="space-y-8">
          <div>
            <span className="text-xs tracking-widest font-sans text-brand-muted uppercase block mb-2">Programação</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-zinc-900">O que vai acontecer</h2>
          </div>

          <div className="relative border-l border-zinc-150 pl-6 ml-2 space-y-8">
            {activities.map((activity: any) => (
              <div key={activity.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-zinc-950 border-4 border-white" />
                <span className="text-[10px] font-mono text-zinc-400 font-semibold tracking-wider block mb-1">
                  {activity.time}
                </span>
                <h3 className="font-serif text-lg font-light text-zinc-800">
                  {activity.title}
                </h3>
                {activity.description && (
                  <p className="text-xs text-zinc-500 font-light mt-1 leading-relaxed">
                    {activity.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confirmação de Presença (RSVP) */}
      <RsvpSection
        eventDate={typeof event?.date === 'string' ? event.date : event?.date?.toISOString?.() || '2026-10-11T13:00:00'}
        eventTime={eventTime}
        eventLocation={eventLocation}
        eventAddress={eventAddress}
        eventMapsUrl={eventMapsUrl}
      />

      {/* Lista de Presentes */}
      <section id="presentes" className="py-20 md:py-32 px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full border-t border-zinc-100">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs tracking-widest font-sans text-brand-muted uppercase block">Como presentear o casal</span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-zinc-900">Lista de Presentes</h2>
          <p className="text-sm text-zinc-500 font-light max-w-lg mx-auto leading-relaxed">
            Escolha um item da nossa lista abaixo para nos presentear. Você pode comprar na sua loja de preferência e entregar no endereço fornecido após a confirmação da reserva.
          </p>
        </div>

        <GiftsList
          initialGifts={displayGifts as any[]}
          pixDetails={pixDetails}
          showPrices={settings?.showPrices ?? false}
        />
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-12 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <Logo variant="full" size={120} className="opacity-50" />
        <div className="text-center md:text-right space-y-1">
          <p className="text-xs font-sans tracking-wide">
            © 2026 {coupleNames}. Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-zinc-400 flex items-center justify-center md:justify-end gap-1 select-none">
            Feito com carinho & 🍿
          </p>
        </div>
      </footer>
    </main>
  );
}
