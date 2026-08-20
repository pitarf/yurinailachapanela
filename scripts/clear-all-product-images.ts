import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Removendo TODAS as imagens dos produtos do banco de dados...');

  const result = await prisma.gift.updateMany({
    data: {
      imageUrl: null,
    },
  });

  console.log(`✅ Sucesso! Imagens removidas de todos os ${result.count} produtos do banco de dados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
