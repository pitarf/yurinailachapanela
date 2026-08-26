import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  send14DaysReminderEmail,
  send7DaysReminderEmail,
  send3DaysReminderEmail,
  sendEventDayEmail,
} from '@/services/brevo';

/**
 * Endpoint de Cron / Lembretes Automáticos via Brevo.
 * Executado diariamente pelo Vercel Cron ou manualmente pelo Painel Admin.
 * Envia lembretes inteligentes e equilibrados (14 dias, 7 dias, 3 dias e Dia do Evento).
 * Agrupa confirmações de presença (RSVP) e reservas de presentes sem duplicar e-mails.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secretParam = searchParams.get('secret');
    const forceType = searchParams.get('force'); // '14days' | '7days' | '3days' | 'today'
    const testEmail = searchParams.get('test_email'); // Para teste direto para um e-mail específico

    const cronSecret = process.env.CRON_SECRET || 'naila_yuri_cron_secret_2026';
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      secretParam === cronSecret ||
      process.env.NODE_ENV === 'development' ||
      forceType !== null;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 1. Busca configurações e data do evento
    const event = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });
    const settings = await prisma.systemSetting.findFirst();

    const eventDate = event?.date ? new Date(event.date) : new Date('2026-10-11T13:00:00.000Z');
    const now = new Date();

    // Formatações amigáveis do evento
    const eventDateFormatted = eventDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const eventTime = event?.time || '13:00';
    const eventLocation = event?.location || 'ADVEC Templo Auxiliar';
    const eventAddress = event?.address || 'Rua Montevidéu, 1191 - 4º andar.';
    const eventMapsUrl = event?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191';

    // Calcula diferença em dias (considerando apenas a data no fuso de Brasília)
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / msPerDay);

    console.log(`⏰ Cron Lembretes: Faltam ${diffDays} dias para o evento.`);

    // 2. Busca reservas de presentes e confirmações de presença (RSVP)
    const [reservations, rsvps] = await Promise.all([
      prisma.reservation.findMany({ include: { gift: true } }),
      prisma.rsvp.findMany(),
    ]);

    // 3. Mapa de convidados únicos (Deduplicação por e-mail)
    const guestsMap = new Map<
      string,
      {
        personName: string;
        email: string;
        giftName?: string;
        purchaseUrl?: string | null;
        isRsvp: boolean;
        isGift: boolean;
      }
    >();

    // Insere confirmações de presença
    for (const rsvp of rsvps) {
      const emailKey = rsvp.email.trim().toLowerCase();
      guestsMap.set(emailKey, {
        personName: rsvp.name,
        email: rsvp.email,
        isRsvp: true,
        isGift: false,
      });
    }

    // Insere ou mescla reservas de presentes
    for (const res of reservations) {
      const emailKey = res.email.trim().toLowerCase();
      const existing = guestsMap.get(emailKey);
      if (existing) {
        existing.giftName = res.gift?.name;
        existing.purchaseUrl = res.gift?.purchaseUrl;
        existing.isGift = true;
      } else {
        guestsMap.set(emailKey, {
          personName: res.personName,
          email: res.email,
          giftName: res.gift?.name,
          purchaseUrl: res.gift?.purchaseUrl,
          isRsvp: false,
          isGift: true,
        });
      }
    }

    const allGuests = Array.from(guestsMap.values());

    const targetGuests = testEmail
      ? allGuests.filter((g) => g.email.toLowerCase() === testEmail.toLowerCase())
      : allGuests;

    if (targetGuests.length === 0 && !testEmail) {
      return NextResponse.json({
        message: 'Nenhum convidado (RSVP ou Presente) encontrado para enviar lembretes.',
        diffDays,
      });
    }

    let typeToSend: '14days' | '7days' | '3days' | 'today' | null = null;

    if (forceType === '14days' || (!forceType && diffDays === 14)) {
      typeToSend = '14days';
    } else if (forceType === '7days' || (!forceType && diffDays === 7)) {
      typeToSend = '7days';
    } else if (forceType === '3days' || (!forceType && diffDays === 3)) {
      typeToSend = '3days';
    } else if (forceType === 'today' || (!forceType && diffDays === 0)) {
      typeToSend = 'today';
    }

    if (!typeToSend) {
      return NextResponse.json({
        message: `Hoje não é dia de disparo de lembrete (Faltam ${diffDays} dias). Disparos ocorrem em 14 dias, 7 dias, 3 dias e no dia do evento.`,
        diffDays,
        totalGuests: allGuests.length,
        totalReservations: reservations.length,
        totalRsvps: rsvps.length,
      });
    }

    const results = [];

    // Se for teste sem registros, cria simulação para enviar ao testEmail
    const listToProcess =
      testEmail && targetGuests.length === 0
        ? [
            {
              personName: 'Convidado de Teste',
              email: testEmail,
              giftName: 'Jogo de Panelas Antiaderente (7 Peças)',
              purchaseUrl: 'https://shopee.com.br',
              isRsvp: true,
              isGift: true,
            },
          ]
        : targetGuests;

    for (const item of listToProcess) {
      try {
        let sendResult;

        if (typeToSend === '14days') {
          sendResult = await send14DaysReminderEmail({
            personName: item.personName,
            email: item.email,
            eventDate: eventDateFormatted,
            eventTime,
            eventLocation,
            eventAddress,
            eventMapsUrl,
          });
        } else if (typeToSend === '7days') {
          sendResult = await send7DaysReminderEmail({
            personName: item.personName,
            email: item.email,
            giftName: item.giftName || 'Presente Especial',
            purchaseUrl: item.purchaseUrl,
            deliveryAddress: settings?.deliveryAddress,
            pixKey: settings?.pixKey,
            pixReceiver: settings?.pixReceiver,
          });
        } else if (typeToSend === '3days') {
          sendResult = await send3DaysReminderEmail({
            personName: item.personName,
            email: item.email,
            giftName: item.giftName || 'Presente Especial',
            purchaseUrl: item.purchaseUrl,
            deliveryAddress: settings?.deliveryAddress,
            pixKey: settings?.pixKey,
            pixReceiver: settings?.pixReceiver,
          });
        } else if (typeToSend === 'today') {
          sendResult = await sendEventDayEmail({
            personName: item.personName,
            email: item.email,
          });
        }

        results.push({
          email: item.email,
          name: item.personName,
          type: typeToSend,
          success: sendResult?.success,
        });
      } catch (sendErr: any) {
        results.push({
          email: item.email,
          error: sendErr.message,
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      typeSent: typeToSend,
      diffDays,
      processed: results.length,
      details: results,
    });
  } catch (err: any) {
    console.error('Erro na rota de Cron de Lembretes:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar lembretes.' },
      { status: 500 }
    );
  }
}
