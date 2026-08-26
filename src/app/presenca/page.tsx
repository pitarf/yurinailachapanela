import { getEventData, getSystemSettings } from '@/lib/json-db';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import Countdown from '@/components/Countdown';
import RsvpSection from '@/components/RsvpSection';
import { Calendar, MapPin, Gift, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSystemSettings();
    const coupleNames = settings?.coupleNames || 'Naila & Yuri';
    return {
      title: `Confirmação de Presença | ${coupleNames}`,
      description: `Confirme sua presença no Chá de Panela de ${coupleNames} que acontecerá no domingo, 11 de Outubro de 2026.`,
      openGraph: {
        title: `Confirmação de Presença | ${coupleNames}`,
        description: `Confirme sua presença no Chá de Panela de ${coupleNames}!`,
        images: settings?.ogImageUrl ? [{ url: settings.ogImageUrl }] : [],
      },
    };
  } catch {
    return {
      title: 'Confirmação de Presença | Naila & Yuri',
    };
  }
}

export default async function PresencaPage() {
  const [event, settings] = await Promise.all([
    getEventData(),
    getSystemSettings(),
  ]);

  const coupleNames = settings?.coupleNames || 'Naila & Yuri';
  const eventDate = typeof event?.date === 'string' ? event.date : event?.date?.toISOString?.() || '2026-10-11T13:00:00';
  const eventTime = event?.time || '13:00';
  const eventLocation = event?.location || 'ADVEC Templo Auxiliar';
  const eventAddress = event?.address || 'Rua Montevidéu, 1191 - 4º andar.';
  const eventMapsUrl = event?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191';

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Header />

      {/* Top Banner de Destaque */}
      <div className="w-full bg-zinc-950 text-white py-12 sm:py-16 px-4 sm:px-6 md:px-12 text-center border-b border-zinc-900 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 relative z-10">
          <Logo variant="monogram" size={70} className="mx-auto opacity-90 invert dark:invert-0" />
          
          <div className="space-y-2">
            <span className="text-[10px] sm:text-xs tracking-widest font-sans text-zinc-400 uppercase block">
              Chá de Panela
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-white">
              {coupleNames}
            </h1>
          </div>

          {/* Badge Informativo do Evento */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-sans font-light text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Domingo, 11/10/2026 às {eventTime}</span>
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <a
              href={eventMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{eventLocation}</span>
            </a>
          </div>

          <div className="pt-2 flex justify-center">
            <div className="py-2 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xs">
              <Countdown targetDate={eventDate} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção Principal de Confirmação de Presença */}
      <div className="w-full">
        <RsvpSection
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          eventAddress={eventAddress}
          eventMapsUrl={eventMapsUrl}
        />
      </div>

      {/* Convite para Lista de Presentes */}
      <div className="w-full py-12 px-4 sm:px-6 max-w-2xl mx-auto text-center border-t border-zinc-100 dark:border-zinc-850 space-y-4">
        <span className="text-[10px] tracking-widest font-sans text-brand-muted uppercase block">
          Deseja presentear os noivos?
        </span>
        <h3 className="font-serif text-xl sm:text-2xl font-light text-zinc-900 dark:text-white">
          Lista de Presentes Online
        </h3>
        <p className="text-xs text-zinc-500 font-light max-w-md mx-auto">
          Você também pode conferir nossa lista completa de presentes com sugestões de itens e opções de PIX.
        </p>
        <div className="pt-2">
          <a
            href="/#presentes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-850 dark:text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
          >
            <Gift className="w-4 h-4" />
            <span>Ver Lista de Presentes</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-10 px-6 md:px-12 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <Logo variant="full" size={100} className="opacity-50" />
        <p className="text-xs font-sans tracking-wide">
          © 2026 {coupleNames}. Feito com carinho & 🍿
        </p>
      </footer>
    </main>
  );
}
