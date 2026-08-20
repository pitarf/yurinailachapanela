import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function fetchShopeeApi() {
  try {
    const res = await fetch('https://shopee.com.br/api/v4/item/get?itemid=22494956447&shopid=452823413', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'af-ac-enc-dat': '',
        'x-api-source': 'pc',
      },
    });

    const data = await res.json();
    if (data?.data?.image) {
      const imgUrl = `https://down-br.img.susercontent.com/file/${data.data.image}`;
      console.log('Shopee API Image:', imgUrl);
      await prisma.gift.updateMany({
        where: { name: { contains: 'Bomboniere (Mini)' } },
        data: { imageUrl: imgUrl },
      });
      console.log('✅ Atualizado com sucesso!');
    } else {
      console.log('API Response:', data);
    }
  } catch (e: any) {
    console.error('Erro:', e.message);
  }
}

fetchShopeeApi().finally(() => prisma.$disconnect());
