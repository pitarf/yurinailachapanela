import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { sortActivitiesChronologically } from '../src/lib/json-db';

async function main() {
  console.log('🔄 Reordenando atividades cronologicamente no Neon PostgreSQL...');

  const activities = await prisma.activity.findMany();
  console.log(`Encontradas ${activities.length} atividades.`);

  const sorted = sortActivitiesChronologically(activities);

  for (let i = 0; i < sorted.length; i++) {
    const act = sorted[i];
    const cleanTime = (act.time || '').trim();
    const newOrder = i + 1;
    console.log(`Atualizando [${cleanTime}] ${act.title} -> order: ${newOrder}`);

    await prisma.activity.update({
      where: { id: act.id },
      data: {
        time: cleanTime,
        order: newOrder,
      },
    });
  }

  // Atualizar também no database.json
  const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const updatedDbActivities = await prisma.activity.findMany({
    orderBy: { order: 'asc' },
  });

  if (dbData.event) {
    dbData.event.activities = updatedDbActivities;
  }
  dbData.activities = updatedDbActivities;
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');

  console.log('✅ Atividades ordenadas cronologicamente com sucesso no Neon e no database.json!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
