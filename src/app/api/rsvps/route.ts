import { NextResponse } from 'next/server';
import { createRsvpEntry, getEventData } from '@/lib/json-db';
import { sendRsvpConfirmationEmail } from '@/services/brevo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, hasCompanion, companionCount, companionNames, notes } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios para confirmar presença.' },
        { status: 400 }
      );
    }

    const result = await createRsvpEntry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hasCompanion: !!hasCompanion,
      companionCount: hasCompanion ? Number(companionCount) || 1 : 0,
      companionNames: companionNames?.trim() || null,
      notes: notes?.trim() || null,
    });

    const event = await getEventData();
    const eventDateFormatted = event?.date
      ? new Date(event.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'Domingo, 11/10/2026';

    // Dispara e-mail de confirmação via Brevo
    try {
      await sendRsvpConfirmationEmail({
        name: result.rsvp.name,
        email: result.rsvp.email,
        hasCompanion: result.rsvp.hasCompanion,
        companionCount: result.rsvp.companionCount,
        companionNames: result.rsvp.companionNames,
        notes: result.rsvp.notes,
        eventDate: eventDateFormatted,
        eventTime: event?.time || '13:00',
        eventLocation: event?.location || 'ADVEC Templo Auxiliar',
        eventAddress: event?.address || 'Rua Montevidéu, 1191 - 4º andar.',
        eventMapsUrl: event?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
      });
    } catch (emailErr: any) {
      console.warn('Aviso: Falha no envio do e-mail de confirmação de RSVP:', emailErr?.message);
    }

    return NextResponse.json({
      success: true,
      rsvp: result.rsvp,
    });
  } catch (err: any) {
    console.error('Erro na API de RSVP:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar confirmação de presença.' },
      { status: 500 }
    );
  }
}
