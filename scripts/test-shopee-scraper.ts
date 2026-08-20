import ogs from 'open-graph-scraper';

const testUrls = [
  'https://shopee.com.br/product/984932739/18199207404',
  'https://shopee.com.br/product/1526836548/23198514586',
  'https://shopee.com.br/Tostador-de-P%C3%A3es-Pratic-Preto-Prata-700W-T-18-Mondial-i.443109642.58213597266',
];

async function testScrape() {
  const userAgents = [
    'WhatsApp/2.21.12.21 A',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Twitterbot/1.0',
  ];

  for (const url of testUrls) {
    console.log('\n--- Testando URL:', url);
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
          timeout: 10000,
        });

        if (result?.ogImage?.[0]?.url) {
          console.log(`  ✅ [UA: ${ua.split(' ')[0]}] Imagem encontrada:`, result.ogImage[0].url);
          break;
        } else {
          console.log(`  ❌ [UA: ${ua.split(' ')[0]}] Sem ogImage. Título:`, result?.ogTitle || 'Nenhum');
        }
      } catch (err: any) {
        console.log(`  ⚠️ [UA: ${ua.split(' ')[0]}] Erro:`, err.message);
      }
    }
  }
}

testScrape();
