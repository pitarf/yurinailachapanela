import 'dotenv/config';
import ogs from 'open-graph-scraper';
import { prisma } from '../src/lib/prisma';

const userAgents = [
  'WhatsApp/2.21.12.21 A',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'TelegramBot (like TwitterBot)',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
];

async function fetchProductImage(url: string): Promise<string | null> {
  for (const ua of userAgents) {
    try {
      const { result } = await ogs({
        url,
        fetchOptions: {
          headers: {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        },
        timeout: 8000,
      });

      if (result?.ogImage?.[0]?.url) {
        return result.ogImage[0].url;
      }
    } catch (e) {
      // Tenta o próximo user-agent
    }
  }
  return null;
}

async function main() {
  console.log('🚀 Iniciando o Web Scraping das imagens dos produtos da lista final...');

  const gifts = await prisma.gift.findMany({
    where: {
      purchaseUrl: { not: null },
    },
    orderBy: { order: 'asc' },
  });

  console.log(`📦 Encontrados ${gifts.length} produtos para buscar fotos de capa.`);

  let successCount = 0;
  let failCount = 0;

  // Processa em lotes de 4 para ser rápido e respeitoso
  const batchSize = 4;
  for (let i = 0; i < gifts.length; i += batchSize) {
    const batch = gifts.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (gift) => {
        if (!gift.purchaseUrl) return;

        try {
          const imgUrl = await fetchProductImage(gift.purchaseUrl);

          if (imgUrl) {
            await prisma.gift.update({
              where: { id: gift.id },
              data: { imageUrl: imgUrl },
            });
            successCount++;
            console.log(`  ✅ [${successCount + failCount}/${gifts.length}] ${gift.name} -> Imagem obtida!`);
          } else {
            failCount++;
            console.log(`  ⚠️ [${successCount + failCount}/${gifts.length}] ${gift.name} -> Sem imagem.`);
          }
        } catch (err: any) {
          failCount++;
          console.log(`  ❌ [${successCount + failCount}/${gifts.length}] ${gift.name} -> Erro: ${err.message}`);
        }
      })
    );

    // Pequena pausa entre lotes
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log('\n========================================');
  console.log(`🎉 Scraping finalizado!`);
  console.log(`✅ Sucesso: ${successCount} produtos com imagem real.`);
  console.log(`⚠️ Sem imagem: ${failCount} produtos.`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('Erro crítico no scraper:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
