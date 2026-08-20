import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function checkActivities() {
  const activities = await prisma.activity.findMany({
    orderBy: { order: 'asc' },
  });
  console.log('Atividades no banco:', activities);
}

checkActivities()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
