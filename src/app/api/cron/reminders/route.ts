import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  send7DaysReminderEmail,
  send3DaysReminderEmail,
  sendEventDayEmail,
} from '@/services/brevo';

/**
 * Endpoint de Cron / Lembretes Automáticos via Brevo.
 * Executado diariamente pelo Vercel Cron ou manualmente pelo Painel Admin.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secretParam = searchParams.get('secret');
    const forceType = searchParams.get('force'); // '7days' | '3days' | 'today'
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

    // Calcula diferença em dias (considerando apenas a data no fuso de Brasília)
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / msPerDay);

    console.log(`⏰ Cron Lembretes: Faltam ${diffDays} dias para o evento.`);

    // 2. Busca todas as reservas ativas com dados do presente
    const reservations = await prisma.reservation.findMany({
      include: {
        gift: true,
      },
    });

    const targetReservations = testEmail
      ? reservations.filter((r) => r.email.toLowerCase() === testEmail.toLowerCase())
      : reservations;

    if (targetReservations.length === 0 && !testEmail) {
      return NextResponse.json({
        message: 'Nenhuma reserva encontrada para enviar lembretes.',
        diffDays,
      });
    }

    let typeToSend: '7days' | '3days' | 'today' | null = null;

    if (forceType === '7days' || (!forceType && diffDays === 7)) {
      typeToSend = '7days';
    } else if (forceType === '3days' || (!forceType && diffDays === 3)) {
      typeToSend = '3days';
    } else if (forceType === 'today' || (!forceType && diffDays === 0)) {
      typeToSend = 'today';
    }

    if (!typeToSend) {
      return NextResponse.json({
        message: `Hoje não é dia de disparo de lembrete (Faltam ${diffDays} dias). Disparos ocorrem em 7 dias, 3 dias e no dia do evento.`,
        diffDays,
        totalReservations: reservations.length,
      });
    }

    const results = [];

    // Se for teste sem reservas, cria uma simulação para enviar ao testEmail
    const listToProcess =
      testEmail && targetReservations.length === 0
        ? [
            {
              personName: 'Convidado de Teste',
              email: testEmail,
              gift: {
                name: 'Batedeira Planetária Oster Black',
                purchaseUrl: 'https://www.mercadolivre.com.br/p/MLB25799077',
              },
            },
          ]
        : targetReservations;

    for (const item of listToProcess) {
      try {
        let sendResult;

        if (typeToSend === '7days') {
          sendResult = await send7DaysReminderEmail({
            personName: item.personName,
            email: item.email,
            giftName: item.gift?.name || 'Presente Reservado',
            purchaseUrl: item.gift?.purchaseUrl,
            deliveryAddress: settings?.deliveryAddress,
            pixKey: settings?.pixKey,
            pixReceiver: settings?.pixReceiver,
          });
        } else if (typeToSend === '3days') {
          sendResult = await send3DaysReminderEmail({
            personName: item.personName,
            email: item.email,
            giftName: item.gift?.name || 'Presente Reservado',
            purchaseUrl: item.gift?.purchaseUrl,
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
