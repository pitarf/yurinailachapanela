import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function check() {
  const event = await prisma.event.findFirst({
    where: { type: 'PANTRY_PARTY' },
    include: {
      activities: true,
    },
  });

  console.log('Neon Event Activities:');
  console.log(JSON.stringify(event?.activities, null, 2));
}

check().finally(() => prisma.$disconnect());
