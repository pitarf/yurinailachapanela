import { getEventData, getSystemSettings, getGiftsData, getPhotosData } from '@/lib/json-db';
import Countdown from '@/components/Countdown';
import Logo from '@/components/Logo';
import GiftsList from '@/components/GiftsList';
import Gallery from '@/components/Gallery';
import HeroSlider from '@/components/HeroSlider';
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
  const event = await getEventData();
  const settings = await getSystemSettings();
  const gifts = await getGiftsData();
  const photos = await getPhotosData();

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
    pixKey: settings?.pixKey || 'nailaeyuri@pix.com',
    pixReceiver: settings?.pixReceiver || 'Naila & Yuri Ltda',
    pixCity: settings?.pixCity || 'São Paulo',
  };

  const historyParagraphs: string[] = settings?.historyText
    ? settings.historyText.split('\n').filter((p: string) => p.trim().length > 0)
    : [
        'Tudo começou de forma leve e genuína, descobrindo aos poucos que o nosso lugar favorito no mundo era sempre ao lado um do outro. Entre conversas sem pressa, olhares cúmplices e sonhos compartilhados, fomos construindo dia após dia o amor que hoje nos guia.',
        'O nosso Chá de Panela é um capítulo muito especial no caminho até o altar. Mais do que montar o nosso futuro lar, queremos celebrar a vida e brindar este momento ao lado de quem realmente faz parte da nossa história. Preparem-se para uma tarde cheia de abraços, boas risadas e memórias que guardaremos para sempre!',
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
      {/* Header */}
      <header className="w-full py-6 px-6 md:px-12 border-b border-zinc-100 flex items-center justify-between z-10">
        <Logo variant="symbol" size={40} />
        <nav className="flex items-center space-x-6">
          <a href="#historia" className="text-xs font-sans tracking-widest hover:text-zinc-500 uppercase transition-colors">História</a>
          <a href="#galeria" className="text-xs font-sans tracking-widest hover:text-zinc-500 uppercase transition-colors">Galeria</a>
          <a href="#evento" className="text-xs font-sans tracking-widest hover:text-zinc-500 uppercase transition-colors">O Evento</a>
          <a href="#presentes" className="text-xs font-sans tracking-widest hover:text-zinc-500 uppercase transition-colors">Presentes</a>
          <a href="/admin" className="text-xs font-sans tracking-widest font-semibold hover:text-zinc-500 uppercase border border-zinc-200 px-4 py-2 rounded-full transition-all hover:bg-zinc-50">Painel</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative w-full flex flex-col lg:flex-row items-stretch border-b border-zinc-100 min-h-[85vh]">
        {/* Text Area */}
        <div className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 space-y-12">
          <div className="space-y-4">
            <span className="text-xs tracking-widest font-sans text-brand-muted uppercase block">Save the date • {new Date(eventDate).toLocaleDateString('pt-BR')}</span>
            <h1 className="font-serif text-5xl md:text-7xl font-extralight tracking-tight text-zinc-900 leading-[1.1]">
              {(eventTitle || 'Chá de Panela').replace(/Naila & Yuri/gi, '').trim()} <br />
              <span className="font-script text-4xl md:text-6xl text-zinc-700 block mt-3 font-normal italic select-none">
                {coupleNames}
              </span>
            </h1>
          </div>

          {/* Countdown Area */}
          <div className="py-8 border-y border-zinc-100">
            <Countdown targetDate={eventDate} />
          </div>

          <div className="max-w-md">
            <p className="text-sm text-zinc-500 leading-relaxed font-light">
              {eventDescription}
            </p>
          </div>
        </div>

        {/* B&W Hero Slider Area */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-100 overflow-hidden">
          <HeroSlider photos={photos} />
        </div>
      </section>

      {/* Nossa História */}
      <section id="historia" className="py-20 md:py-32 px-6 md:px-12 max-w-4xl mx-auto text-center border-b border-zinc-100">
        <Logo variant="monogram" size={100} className="mx-auto mb-8 opacity-75" />
        <span className="text-xs tracking-widest font-sans text-brand-muted uppercase block mb-4">Nossa História</span>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-zinc-900 mb-8">O Início de Tudo</h2>
        <div className="space-y-6 text-sm md:text-base text-zinc-600 font-light leading-relaxed max-w-2xl mx-auto">
          {historyParagraphs.map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Galeria de Fotos */}
      <section id="galeria" className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto w-full border-b border-zinc-100">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs tracking-widest font-sans text-brand-muted uppercase block">Galeria Editorial</span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-zinc-900">Momentos do Casal</h2>
          <p className="text-sm text-zinc-500 font-light max-w-lg mx-auto leading-relaxed">
            Alguns dos nossos registros favoritos capturados em preto e branco.
          </p>
        </div>
        <Gallery initialPhotos={photos} />
      </section>

      {/* O Evento & Programação */}
      <section id="evento" className="py-20 md:py-32 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 border-b border-zinc-100">
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

      {/* Lista de Presentes */}
      <section id="presentes" className="py-20 md:py-32 px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full">
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
