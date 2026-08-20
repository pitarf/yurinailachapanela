import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function updateEvent() {
  console.log('Atualizando informações do evento...');

  const date = new Date('2026-10-11T13:00:00');

  const updated = await prisma.event.upsert({
    where: { type: 'PANTRY_PARTY' },
    update: {
      location: 'ADVEC Templo auxiliar',
      address: 'Rua Montevidéu, 1191 - 4º andar.',
      time: '13:00',
      date: date,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
    },
    create: {
      type: 'PANTRY_PARTY',
      title: 'Chá de Panela Naila & Yuri',
      date: date,
      time: '13:00',
      location: 'ADVEC Templo auxiliar',
      address: 'Rua Montevidéu, 1191 - 4º andar.',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
      description: 'Estamos preparando cada detalhe com muito amor para celebrar essa nova fase das nossas vidas com vocês!',
    },
  });

  console.log('Evento atualizado no banco:', updated);
}

updateEvent()
  .catch((e) => {
    console.error('Erro ao atualizar evento:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
