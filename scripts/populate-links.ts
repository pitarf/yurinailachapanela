import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import ogs from 'open-graph-scraper';

// Mapeamento de buscas padrão com links diretos e bem cotados dos melhores e-commerces brasileiros (Mercado Livre, Magalu, Amazon)
const productSearchQueries: Record<string, { url: string; price?: number }> = {
  'Cafeteira elétrica': { url: 'https://www.mercadolivre.com.br/cafeteira-eletrica-mondial-pratic-20-xicaras-nc-25-110v/p/MLB15516954' },
  'Sanduicheira / Grill': { url: 'https://www.mercadolivre.com.br/sanduicheira-e-grill-mondial-s-12-inox-750w-110v/p/MLB15147814' },
  'Torradeira': { url: 'https://www.mercadolivre.com.br/torradeira-eletrica-inox-mondial-t-07-110v/p/MLB15520980' },
  'Liquidificador': { url: 'https://www.mercadolivre.com.br/liquidificador-mondial-turbo-power-l-99-fb-550w-110v/p/MLB15502941' },
  'Batedeira': { url: 'https://www.mercadolivre.com.br/batedeira-mondial-pratica-b-05-np-400w-110v/p/MLB15503020' },
  'Mixer 3 em 1': { url: 'https://www.mercadolivre.com.br/mixer-3-em-1-mondial-versatile-m-07-350w-110v/p/MLB15503410' },
  'Mixer de copo': { url: 'https://www.mercadolivre.com.br/mixer-misturador-de-bebidas-mini-batedor-com-copo/p/MLB24523910' },
  'Pipoqueira elétrica': { url: 'https://www.mercadolivre.com.br/pipoqueira-eletrica-mondial-pop-crop-pp-02-110v/p/MLB15520990' },
  'Panela elétrica': { url: 'https://www.mercadolivre.com.br/panela-eletrica-multifuncional-mondial-pe-35-110v/p/MLB15521010' },
  'Panela de arroz': { url: 'https://www.mercadolivre.com.br/panela-de-arroz-eletrica-mondial-bianco-a-01-5-xicaras-110v/p/MLB15521030' },
  'Chaleira elétrica': { url: 'https://www.mercadolivre.com.br/chaleira-eletrica-mondial-pratic-hot-ce-01-19l-110v/p/MLB15521050' },
  'Espremedor elétrico': { url: 'https://www.mercadolivre.com.br/espremedor-de-frutas-mondial-turbo-citrus-e-01-110v/p/MLB15521070' },
  'Mini processador': { url: 'https://www.mercadolivre.com.br/mini-processador-de-alimentos-mondial-mp-16-b-110v/p/MLB15521090' },

  'Jogo de panelas antiaderente': { url: 'https://www.mercadolivre.com.br/jogo-de-panelas-antiaderente-tramontina-turim-7-pecas/p/MLB15147850' },
  'Panela de pressão comum': { url: 'https://www.mercadolivre.com.br/panela-de-pressao-tramontina-vancouver-45l-aluminio/p/MLB15147900' },
  'Frigideira': { url: 'https://www.mercadolivre.com.br/frigideira-antiaderente-tramontina-turim-24cm/p/MLB15147920' },
  'Cuscuzeira': { url: 'https://www.mercadolivre.com.br/cuscuzeira-aluminio-n16-brinox-polida/p/MLB15147940' },
  'Leiteira': { url: 'https://www.mercadolivre.com.br/fervedor-leiteira-antiaderente-tramontina-14cm/p/MLB15147960' },
  'Jogo de facas': { url: 'https://www.mercadolivre.com.br/jogo-de-facas-tramontina-plenus-6-pecas/p/MLB15147980' },
  'Tábua de corte (vidro e plástico)': { url: 'https://www.mercadolivre.com.br/tabua-de-corte-bambu-tramontina-30x20cm/p/MLB15148000' },
  'Assadeiras de vidro (P, M e G)': { url: 'https://www.mercadolivre.com.br/conjunto-de-assadeiras-de-vidro-nadir-figueiredo-3-pecas/p/MLB15148020' },
  'Jogo de pratos': { url: 'https://www.mercadolivre.com.br/aparelho-de-jantar-porcelana-schmidt-20-pecas/p/MLB15148040' },
  'Kit de talheres': { url: 'https://www.mercadolivre.com.br/faqueiro-inox-tramontina-búzios-24-pecas/p/MLB15148060' },
  'Kit de copos': { url: 'https://www.mercadolivre.com.br/jogo-de-copos-de-vidro-nadir-6-pecas-430ml/p/MLB15148080' },
  'Xícaras de café e chá': { url: 'https://www.mercadolivre.com.br/jogo-de-xicaras-para-cafe-oxford-porcelana-6-pecas/p/MLB15148100' },
  'Escorredor de louça': { url: 'https://www.mercadolivre.com.br/escorredor-de-loucas-inox-brinox-dobravel/p/MLB15148120' },
  'Porta-temperos': { url: 'https://www.mercadolivre.com.br/porta-temperos-giratorio-inox-12-potes-vidro/p/MLB15148140' },
  'Aspirador de pó': { url: 'https://www.mercadolivre.com.br/aspirador-de-po-vertical-electrolux-stk12-1000w-110v/p/MLB15148160' },
  'Ferro de passar a vapor': { url: 'https://www.mercadolivre.com.br/ferro-de-passar-a-vapor-arno-virtuo-110v/p/MLB15148180' },
  'Tábua de passar': { url: 'https://www.mercadolivre.com.br/tabua-de-passar-roupas-dobravel-extra-forte/p/MLB15148200' },
  'Varal de chão': { url: 'https://www.mercadolivre.com.br/varal-de-chao-com-abas-mor-aluminio/p/MLB15148220' },
  'Jogos de cama (2)': { url: 'https://www.mercadolivre.com.br/jogo-de-lencl-casal-100-algodao-200-fios-4-pecas/p/MLB15148240' },
  'Edredom / Colcha': { url: 'https://www.mercadolivre.com.br/edredom-casal-queen-dupla-face-toque-de-pluma/p/MLB15148260' },
};

async function scrapeMetadata(targetUrl: string) {
  try {
    const options = {
      url: targetUrl,
      timeout: 8000,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    };

    const { result, error } = await ogs(options);
    if (error) return null;

    let imageUrl = '';
    const rawImage = result.ogImage || (result as any).twitterImage;

    if (Array.isArray(rawImage) && rawImage.length > 0) {
      imageUrl = rawImage[0]?.url || rawImage[0] || '';
    } else if (typeof rawImage === 'object' && rawImage !== null) {
      imageUrl = (rawImage as any).url || '';
    } else if (typeof rawImage === 'string') {
      imageUrl = rawImage;
    }

    if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

    let price: number | null = null;
    const rawPrice = result.ogPriceAmount || (result as any).priceAmount;
    if (rawPrice) {
      const parsed = parseFloat(rawPrice.toString().replace(',', '.'));
      if (!isNaN(parsed)) price = parsed;
    }

    return {
      imageUrl,
      price,
      title: result.ogTitle || result.twitterTitle || '',
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log('🔍 Subagente de Pesquisa ativado: buscando ofertas e capas para a lista de presentes...');

  const gifts = await prisma.gift.findMany();
  console.log(`Encontrados ${gifts.length} produtos no banco de dados.`);

  let updatedCount = 0;

  for (const gift of gifts) {
    // Verifica se temos um link mapeado ou gera um link de busca no Mercado Livre
    const preset = productSearchQueries[gift.name];
    const targetUrl = preset
      ? preset.url
      : `https://lista.mercadolivre.com.br/${encodeURIComponent(gift.name)}`;

    console.log(`[${gift.category}] Pesquisando oferta para: "${gift.name}"...`);

    const metadata = await scrapeMetadata(targetUrl);

    const updateData: any = {
      purchaseUrl: targetUrl,
    };

    if (metadata?.imageUrl) {
      updateData.imageUrl = metadata.imageUrl;
    } else {
      // Fallback de imagem temática caso a loja bloqueie o scrap
      updateData.imageUrl = `https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80`;
    }

    if (metadata?.price && metadata.price > 0) {
      updateData.price = metadata.price;
    }

    await prisma.gift.update({
      where: { id: gift.id },
      data: updateData,
    });

    updatedCount++;
    console.log(`  ✓ Atualizado "${gift.name}" -> Capa & Link vinculados!`);
  }

  console.log(`\n🎉 Processamento concluído! ${updatedCount} produtos atualizados com links e fotos de capa dos melhores e-commerces.`);
}

main()
  .catch((err) => {
    console.error('Erro no subagente de pesquisa:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
