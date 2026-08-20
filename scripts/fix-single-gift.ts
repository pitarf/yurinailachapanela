import 'dotenv/config';
import ogs from 'open-graph-scraper';
import { prisma } from '../src/lib/prisma';

async function fixSingle() {
  const gift = await prisma.gift.findFirst({
    where: { imageUrl: null },
  });

  if (!gift || !gift.purchaseUrl) {
    console.log('Nenhum item sem imagem encontrado.');
    return;
  }

  console.log('Tentando obter imagem para:', gift.name, gift.purchaseUrl);

  const cleanUrl = 'https://shopee.com.br/product/452823413/22494956447';

  try {
    const { result } = await ogs({
      url: cleanUrl,
      fetchOptions: {
        headers: {
          'User-Agent': 'WhatsApp/2.21.12.21 A',
        },
      },
    });

    if (result?.ogImage?.[0]?.url) {
      console.log('Imagem encontrada:', result.ogImage[0].url);
      await prisma.gift.update({
        where: { id: gift.id },
        data: { imageUrl: result.ogImage[0].url },
      });
      console.log('✅ Atualizado no banco com sucesso!');
    } else {
      console.log('Resultado:', result);
    }
  } catch (e: any) {
    console.error('Erro:', e.message);
  }
}

fixSingle().finally(() => prisma.$disconnect());
