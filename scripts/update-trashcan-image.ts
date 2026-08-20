import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Atualizando o produto Lixeira no banco com a foto exata da Lixeira Inteligente Automática...');

  // Foto HD exata da Lixeira Inteligente Automática Cinza/Inox de Cozinha e Banheiro
  const trashImage = 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1000&q=80';
  const trashUrl = 'https://www.mercadolivre.com.br/lixeira-inteligente-automatica-15l-ideal-para-casa-cozinha-e-banheiro-cores-cinza/p/MLB72198864?pdp_filters=item_id:MLB4762939043';

  await prisma.gift.updateMany({
    where: {
      name: { contains: 'Lixeira', mode: 'insensitive' },
    },
    data: {
      imageUrl: trashImage,
      purchaseUrl: trashUrl,
    },
  });

  console.log('✅ Foto da Lixeira Inteligente Automática atualizada com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
