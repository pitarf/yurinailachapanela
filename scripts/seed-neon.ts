import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🚀 Iniciando o Seed completo do banco Neon no schema yuri_naila...');

  const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Evento
  console.log('📅 Criando/Atualizando Evento...');
  const event = await prisma.event.upsert({
    where: { type: 'PANTRY_PARTY' },
    update: {
      title: dbData.event.title || 'Chá de Panela',
      date: new Date(dbData.event.date || '2026-10-11T13:00:00.000Z'),
      time: dbData.event.time || '13:00',
      location: dbData.event.location || 'ADVEC Templo auxiliar',
      address: dbData.event.address || 'Rua Montevidéu, 1191 - 4º andar.',
      mapsUrl: dbData.event.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
      description: dbData.event.description || '',
    },
    create: {
      type: 'PANTRY_PARTY',
      title: dbData.event.title || 'Chá de Panela',
      date: new Date(dbData.event.date || '2026-10-11T13:00:00.000Z'),
      time: dbData.event.time || '13:00',
      location: dbData.event.location || 'ADVEC Templo auxiliar',
      address: dbData.event.address || 'Rua Montevidéu, 1191 - 4º andar.',
      mapsUrl: dbData.event.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
      description: dbData.event.description || '',
    },
  });

  // 2. Configurações
  console.log('⚙️ Configurando Dados do Sistema...');
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {
      coupleNames: dbData.settings.coupleNames || 'Naila & Yuri',
      siteTitle: dbData.settings.siteTitle || 'Naila & Yuri | Chá de Panela',
      siteDescription: dbData.settings.siteDescription || '',
      siteKeywords: dbData.settings.siteKeywords || '',
      faviconUrl: dbData.settings.faviconUrl || '/monograma_popyn.png',
      ogImageUrl: dbData.settings.ogImageUrl || '/pre-wedding/pre-wedding-01.webp',
      deliveryAddress: dbData.settings.deliveryAddress || 'Rua Montevidéu, 1191 - 4º andar.',
      pixKey: dbData.settings.pixKey || 'nailaeyuri@pix.com',
      pixReceiver: dbData.settings.pixReceiver || 'Naila & Yuri',
      pixCity: dbData.settings.pixCity || 'São Paulo',
      showPrices: dbData.settings.showPrices || false,
      historyText: dbData.settings.historyText || '',
    },
    create: {
      id: 'default',
      coupleNames: dbData.settings.coupleNames || 'Naila & Yuri',
      siteTitle: dbData.settings.siteTitle || 'Naila & Yuri | Chá de Panela',
      siteDescription: dbData.settings.siteDescription || '',
      siteKeywords: dbData.settings.siteKeywords || '',
      faviconUrl: dbData.settings.faviconUrl || '/monograma_popyn.png',
      ogImageUrl: dbData.settings.ogImageUrl || '/pre-wedding/pre-wedding-01.webp',
      deliveryAddress: dbData.settings.deliveryAddress || 'Rua Montevidéu, 1191 - 4º andar.',
      pixKey: dbData.settings.pixKey || 'nailaeyuri@pix.com',
      pixReceiver: dbData.settings.pixReceiver || 'Naila & Yuri',
      pixCity: dbData.settings.pixCity || 'São Paulo',
      showPrices: dbData.settings.showPrices || false,
      historyText: dbData.settings.historyText || '',
    },
  });

  // 3. Limpar e Inserir Presentes
  console.log('🎁 Cadastrando 112 presentes com imagens reais da Shopee...');
  await prisma.reservation.deleteMany();
  await prisma.gift.deleteMany();

  for (const g of dbData.gifts) {
    await prisma.gift.create({
      data: {
        id: g.id,
        eventId: event.id,
        name: g.name,
        description: g.description || null,
        price: g.price ? Number(g.price) : 0,
        category: g.category || 'Geral',
        purchaseUrl: g.purchaseUrl || null,
        imageUrl: g.imageUrl || null,
        status: g.status || 'AVAILABLE',
        order: g.order || 0,
      },
    });
  }

  // 4. Fotos
  console.log('📸 Cadastrando 16 fotos de Pré-Wedding...');
  await prisma.photo.deleteMany();
  for (const p of dbData.photos) {
    await prisma.photo.create({
      data: {
        id: p.id,
        url: p.url,
        caption: p.caption || null,
        isHero: p.isHero || false,
        order: p.order || 0,
      },
    });
  }

  // 5. Atividades
  console.log('📋 Cadastrando Programação do Evento...');
  await prisma.activity.deleteMany();
  for (const a of dbData.activities) {
    await prisma.activity.create({
      data: {
        id: a.id,
        eventId: event.id,
        title: a.title,
        description: a.description || null,
        time: a.time || null,
        order: a.order || 0,
      },
    });
  }

  console.log('\n=============================================');
  console.log('🎉 BANCO NEON POPULADO COM 100% DE SUCESSO!');
  console.log('🛡️ Schema isolado: yuri_naila (zero conflitos)');
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('Erro no seed do Neon:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
