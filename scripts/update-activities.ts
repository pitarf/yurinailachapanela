import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function updateActivities() {
  const event = await prisma.event.findFirst({
    where: { type: 'PANTRY_PARTY' },
  });

  if (!event) return;

  await prisma.activity.deleteMany({ where: { eventId: event.id } });

  await prisma.activity.createMany({
    data: [
      {
        eventId: event.id,
        time: '13:00',
        title: 'Boas-vindas & Recepção',
        description: 'Recepção dos convidados com coquetel de boas-vindas.',
        order: 1,
      },
      {
        eventId: event.id,
        time: '14:30',
        title: 'Brincadeiras do Casal',
        description: 'Momentos divertidos preparados pelos padrinhos.',
        order: 2,
      },
      {
        eventId: event.id,
        time: '16:00',
        title: 'Abertura dos Presentes',
        description: 'Celebração e agradecimento pelos carinhos recebidos.',
        order: 3,
      },
      {
        eventId: event.id,
        time: '17:00',
        title: 'Confraternização Especial',
        description: 'Comida boa, risadas e celebração dessa união.',
        order: 4,
      },
    ],
  });

  console.log('✅ Cronograma de atividades atualizado para o horário das 13h!');
}

updateActivities()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
