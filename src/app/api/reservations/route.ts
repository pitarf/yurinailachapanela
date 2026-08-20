import { NextResponse } from 'next/server';
import { makeReservation } from '@/lib/json-db';

/**
 * Endpoint de Server Action / API para realizar a reserva de presente.
 * Utiliza o gerenciador de dados desacoplado e compatível com Vercel Serverless.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { giftId, personName, email, notes } = body;

    if (!giftId || !personName || !email) {
      return NextResponse.json(
        { error: 'Nome, E-mail e Presente são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await makeReservation(giftId, personName, email, notes);

    return NextResponse.json({
      success: true,
      message: 'Presente reservado com sucesso!',
      reservation: result.reservation,
      gift: result.updatedGift,
      deliveryAddress: result.deliveryAddress,
    });
  } catch (error: any) {
    if (error.message === 'ALREADY_RESERVED') {
      return NextResponse.json(
        {
          error:
            'Esse presente acabou de ser reservado por outra pessoa. Mas não se preocupe, ainda existem outros presentes disponíveis.',
          code: 'ALREADY_RESERVED',
        },
        { status: 409 }
      );
    }

    if (error.message === 'PRESENT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'O presente informado não foi encontrado.' },
        { status: 404 }
      );
    }

    console.error('Erro ao processar reserva:', error);
    return NextResponse.json(
      { error: 'Não conseguimos concluir a reserva. Tente novamente.' },
      { status: 500 }
    );
  }
}
