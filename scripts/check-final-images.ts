import 'dotenv/config';
import ogs from 'open-graph-scraper';
import { prisma } from '../src/lib/prisma';

async function main() {
  const url = 'https://shopee.com.br/Kit-1-a-3-Potes-De-Vidro-Herm%C3%A9tico-Com-Tampa-Para-Alimentos-Bomboniere-Doces-Massas-320ML-i.452823413.22494956447';
  
  const { result } = await ogs({
    url,
    fetchOptions: {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      },
    },
  });

  if (result?.ogImage?.[0]?.url) {
    console.log('Imagem achada via Facebook UA:', result.ogImage[0].url);
    await prisma.gift.updateMany({
      where: { name: { contains: 'Bomboniere (Mini)' } },
      data: { imageUrl: result.ogImage[0].url },
    });
  } else {
    console.log('Resultado:', result);
  }

  const totalWithImage = await prisma.gift.count({
    where: { imageUrl: { not: null } },
  });
  const total = await prisma.gift.count();
  console.log(`\n📊 Status Final do Banco: ${totalWithImage}/${total} presentes com foto de capa real.`);
}

main().finally(() => prisma.$disconnect());
