import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔄 Atualizando item Batedeira para a nova Batedeira Planetária Oster do Mercado Livre...');

  const newName = 'Batedeira Planetária Oster Black (850W)';
  const newDescription = 'Batedeira Planetária Black 12 Velocidade Obat640 Oster 850w Cor Preto/Inox';
  const newUrl = 'https://www.mercadolivre.com.br/p/MLB25799077';
  const newImageUrl = 'https://http2.mlstatic.com/D_NQ_NP_724372-MLA99503362964_112025-O.jpg';

  // 1. Atualizar database.json
  const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const giftIndex = dbData.gifts.findIndex(
    (g: any) => g.id === 'cmt1uibss00045cc6wph3b4wd' || g.name.toLowerCase().includes('batedeira')
  );

  if (giftIndex !== -1) {
    dbData.gifts[giftIndex].name = newName;
    dbData.gifts[giftIndex].description = newDescription;
    dbData.gifts[giftIndex].purchaseUrl = newUrl;
    dbData.gifts[giftIndex].imageUrl = newImageUrl;
    dbData.gifts[giftIndex].updatedAt = new Date().toISOString();
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log('✅ database.json atualizado com sucesso!');
  } else {
    console.warn('⚠️ Presente batedeira não encontrado no database.json');
  }

  // 2. Atualizar no Neon PostgreSQL
  try {
    const giftInDb = await prisma.gift.findFirst({
      where: {
        OR: [
          { id: 'cmt1uibss00045cc6wph3b4wd' },
          { name: { contains: 'Batedeira', mode: 'insensitive' } },
        ],
      },
    });

    if (giftInDb) {
      await prisma.gift.update({
        where: { id: giftInDb.id },
        data: {
          name: newName,
          description: newDescription,
          purchaseUrl: newUrl,
          imageUrl: newImageUrl,
        },
      });
      console.log('✅ Banco Neon PostgreSQL atualizado com a nova Batedeira Oster!');
    } else {
      console.warn('⚠️ Presente não encontrado no Neon para atualizar.');
    }
  } catch (err: any) {
    console.error('❌ Erro ao atualizar no Neon:', err.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
