import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Ajustando título do evento no banco para "Chá de Panela"...');

  const event = await prisma.event.findFirst();

  if (event) {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        title: 'Chá de Panela',
      },
    });
  }

  console.log('✅ Título do evento ajustado para "Chá de Panela"!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
