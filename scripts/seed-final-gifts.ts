import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

function cleanGiftName(name: string): string {
  let cleaned = name
    .replace(/[✅?*]/g, '')
    .replace(/\s*-\s*$/, '')
    .replace(/^\s*-\s*/, '')
    .trim();

  // Substituições cosméticas para ficar esteticamente perfeito
  cleaned = cleaned
    .replace(/\(mini\)\s*-?/i, '(Mini)')
    .replace(/\(grande\)\s*-?/i, '(Grande)')
    .replace(/\(kit\)\s*-?/i, '(Kit)')
    .replace(/\(só pratos\)\s*-?/i, '(Apenas Pratos)')
    .replace(/\(quadrada\)\s*-?/i, '(Quadrada)')
    .replace(/\(redonda\)\s*-?/i, '(Redonda)')
    .replace(/\(vidro\)\s*-?/i, '(Vidro)')
    .replace(/\(plástico\)\s*-?/i, '(Plástico)')
    .replace(/\(madeira\)\s*-?/i, '(Madeira)')
    .replace(/\(banheiro\)\s*-?/i, '(Banheiro)')
    .replace(/\(cozinha\)\s*-?/i, '(Cozinha)')
    .replace(/\(acessorios\)\s*-?/i, '(Acessórios)')
    .replace(/\(peças\)\s*-?/i, '(Peças)')
    .replace(/\(grande sala ou quarto\)\s*-?/i, '(Corpo Inteiro)')
    .replace(/\(modelo 1\)\s*-?/i, '(Modelo 1)')
    .replace(/\(modelo 2\)\s*-?/i, '(Modelo 2)')
    .replace(/\(modelo 3\)\s*-?/i, '(Modelo 3)')
    .replace(/\s+/g, ' ')
    .trim();

  // Garante a primeira letra maiúscula
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

function parseGiftList() {
  const filePath = path.join(__dirname, '..', 'public', 'lsita de produtos.md');
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  let currentCategory = 'Geral';
  let parentItemName = '';
  const products: { name: string; category: string; purchaseUrl?: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('Nai & Yuri')) continue;

    // Check if line is category header
    if (
      line === 'COZINHA – ELETROPORTÁTEIS' ||
      line === 'COZINHA – PANELAS E FORMAS' ||
      line === 'COZINHA – UTENSÍLIOS' ||
      line === 'QUARTO' ||
      line === 'BANHEIRO' ||
      line === 'ÁREA DE SERVIÇO E OUTROS ITENS'
    ) {
      if (line === 'COZINHA – ELETROPORTÁTEIS') currentCategory = 'Cozinha – Eletroportáteis';
      else if (line === 'COZINHA – PANELAS E FORMAS') currentCategory = 'Cozinha – Panelas e Formas';
      else if (line === 'COZINHA – UTENSÍLIOS') currentCategory = 'Cozinha – Utensílios';
      else if (line === 'QUARTO') currentCategory = 'Quarto';
      else if (line === 'BANHEIRO') currentCategory = 'Banheiro';
      else if (line === 'ÁREA DE SERVIÇO E OUTROS ITENS') currentCategory = 'Área de Serviço';
      parentItemName = '';
      continue;
    }

    // Check if line contains a URL
    const urlMatch = line.match(/(https:\/\/[^\s]+)/);

    if (urlMatch) {
      const url = urlMatch[1];
      const cleanUrl = url.replace(/[✅?*]+$/, '');

      let namePart = line.replace(urlMatch[0], '').replace(/[✅?*]/g, '').replace(/^-+|-+$/g, '').trim();

      if (namePart.startsWith('(') && parentItemName) {
        namePart = `${parentItemName} ${namePart}`;
      } else if (namePart.endsWith('-')) {
        namePart = namePart.replace(/-$/, '').trim();
      }

      if (!namePart && parentItemName) {
        namePart = parentItemName;
      }

      if (namePart) {
        products.push({
          name: cleanGiftName(namePart),
          category: currentCategory,
          purchaseUrl: cleanUrl,
        });
      }
    } else {
      const cleanLine = line.replace(/[✅?*:]/g, '').replace(/^-+|-+$/g, '').trim();
      if (cleanLine && !cleanLine.startsWith('http')) {
        parentItemName = cleanLine;
      }
    }
  }

  return products;
}

async function main() {
  console.log('🔄 Iniciando a substituição completa da lista de presentes...');

  let event = await prisma.event.findFirst({
    where: { type: 'PANTRY_PARTY' },
  });

  if (!event) {
    event = await prisma.event.create({
      data: {
        type: 'PANTRY_PARTY',
        title: 'Chá de Panela',
        date: new Date('2026-10-11T13:00:00'),
        location: 'ADVEC Templo auxiliar',
        address: 'Rua Montevidéu, 1191 - 4º andar.',
      },
    });
  }

  const products = parseGiftList();
  console.log(`📋 Total de produtos identificados na lista final: ${products.length}`);

  // Limpa reservas e presentes anteriores
  await prisma.reservation.deleteMany({});
  await prisma.gift.deleteMany({});
  console.log('🧹 Banco limpo de presentes e reservas antigas.');

  let order = 1;
  for (const item of products) {
    await prisma.gift.create({
      data: {
        eventId: event.id,
        name: item.name,
        category: item.category,
        purchaseUrl: item.purchaseUrl || null,
        imageUrl: null,
        price: null,
        status: 'AVAILABLE',
        order: order++,
      },
    });
  }

  console.log(`✅ Todos os ${products.length} presentes da lista final foram cadastrados com sucesso!`);
}

main()
  .catch((e) => {
    console.error('Erro ao atualizar presentes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
