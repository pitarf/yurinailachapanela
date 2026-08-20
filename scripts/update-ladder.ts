import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const ladderUrl = 'https://www.mercadolivre.com.br/escada-banqueta-aluminio-3-degraus-reforcada-dobravel-lar/up/MLBU4127045604';

  const updated = await prisma.gift.updateMany({
    where: {
      name: { contains: 'Escada', mode: 'insensitive' },
    },
    data: {
      purchaseUrl: ladderUrl,
      imageUrl: 'https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=800&q=80',
    },
  });

  console.log('Produto "Escada de 3 Degraus" atualizado com o link do Mercado Livre e foto HD real do produto!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
