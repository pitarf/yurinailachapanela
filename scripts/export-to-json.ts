import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

async function exportToJson() {
  console.log('📦 Exportando dados do PostgreSQL para JSON...');

  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const [event, settings, gifts, photos, activities, reservations] = await Promise.all([
    prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' }, include: { activities: { orderBy: { order: 'asc' } } } }),
    prisma.systemSetting.findFirst(),
    prisma.gift.findMany({ orderBy: { order: 'asc' }, include: { reservation: true } }),
    prisma.photo.findMany({ orderBy: { order: 'asc' } }),
    prisma.activity.findMany({ orderBy: { order: 'asc' } }),
    prisma.reservation.findMany(),
  ]);

  const database = {
    event: event || {
      id: 'event-default',
      type: 'PANTRY_PARTY',
      title: 'Chá de Panela',
      date: '2026-10-11T13:00:00.000Z',
      time: '13:00',
      location: 'ADVEC Templo auxiliar',
      address: 'Rua Montevidéu, 1191 - 4º andar.',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
      description: 'Estamos preparando cada detalhe com muito amor e carinho para celebrar essa nova fase das nossas vidas com vocês!',
      activities: activities,
    },
    settings: settings || {
      id: 'default',
      coupleNames: 'Naila & Yuri',
      siteTitle: 'Naila & Yuri | Chá de Panela',
      siteDescription: 'Seja bem-vindo ao site de Chá de Panela de Naila & Yuri.',
      siteKeywords: 'Naila, Yuri, Chá de Panela, Casamento',
      faviconUrl: '/monograma_popyn.png',
      ogImageUrl: '/pre-wedding/pre-wedding-01.webp',
      deliveryAddress: 'Rua Montevidéu, 1191 - 4º andar.',
      pixKey: 'nailaeyuri@pix.com',
      pixReceiver: 'Naila & Yuri',
      pixCity: 'São Paulo',
      showPrices: false,
      historyText: 'Tudo começou de forma leve e genuína...',
    },
    gifts: gifts,
    photos: photos,
    activities: activities,
    reservations: reservations,
  };

  const jsonPath = path.join(dataDir, 'database.json');
  fs.writeFileSync(jsonPath, JSON.stringify(database, null, 2), 'utf8');

  console.log(`✅ Arquivo ${jsonPath} gerado com sucesso!`);
  console.log(`  - Presentes: ${database.gifts.length}`);
  console.log(`  - Fotos: ${database.photos.length}`);
  console.log(`  - Atividades: ${database.activities.length}`);
}

exportToJson()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
