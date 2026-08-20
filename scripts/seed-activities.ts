import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding initial activities for event...');

  let event = await prisma.event.findFirst({
    where: { type: 'PANTRY_PARTY' },
  });

  if (!event) {
    event = await prisma.event.create({
      data: {
        type: 'PANTRY_PARTY',
        title: 'Chá de Panela',
        date: new Date('2026-10-11T15:00:00'),
        location: 'Espaço Jardins Premium',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        mapsUrl: 'https://maps.google.com',
      },
    });
  }

  const count = await prisma.activity.count({ where: { eventId: event.id } });

  if (count === 0) {
    await prisma.activity.createMany({
      data: [
        {
          eventId: event.id,
          time: '15:00',
          title: 'Boas-vindas & Drinks',
          description: 'Recepção dos convidados com coquetel de boas-vindas.',
          order: 1,
        },
        {
          eventId: event.id,
          time: '16:30',
          title: 'Brincadeiras do Casal',
          description: 'Momentos divertidos preparados pelos padrinhos.',
          order: 2,
        },
        {
          eventId: event.id,
          time: '18:00',
          title: 'Abertura dos Presentes',
          description: 'Celebração e agradecimento pelos carinhos recebidos.',
          order: 3,
        },
        {
          eventId: event.id,
          time: '19:00',
          title: 'Jantar & Confraternização',
          description: 'Comida boa, risadas e celebração da união.',
          order: 4,
        },
      ],
    });
    console.log('✅ 4 atividades criadas na programação do evento!');
  } else {
    console.log('Atividades já existem no banco.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
