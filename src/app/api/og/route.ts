import { NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

// Extrai título amigável a partir de URLs e slugs de e-commerces
function extractTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);

    for (const part of parts) {
      if (part.includes('-') && !part.startsWith('MLB') && !part.startsWith('up')) {
        const cleaned = part
          .replace(/-/g, ' ')
          .replace(/\b(pdp_filters|is_advertising|tracking_id|backend_model|attributes)\b.*$/gi, '')
          .trim();
        if (cleaned.length > 5) {
          return cleaned
            .split(' ')
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }
      }
    }
  } catch {}
  return '';
}

// Scraper especializado para Mercado Livre
async function scrapeMercadoLivre(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });

    const html = await res.text();

    // 1. Imagem OG ou D_NQ_NP
    let image: string | null = null;
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes('logo') && !ogImageMatch[1].includes('frontend-assets')) {
      image = ogImageMatch[1];
    } else {
      const mlMatches = html.match(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[^"'\s<>]+/g);
      if (mlMatches && mlMatches.length > 0) {
        image = mlMatches[0];
      }
    }

    // 2. Título
    let title: string | null = null;
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].replace(/\s*-\s*R\$.*$/i, '').trim();
    } else {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/\s*\|\s*Mercado Livre.*$/i, '').replace(/\s*\|\s*Parcelamento sem juros.*$/i, '').trim();
      }
    }

    // 3. Descrição
    let description: string | null = null;
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (ogDescMatch && ogDescMatch[1]) {
      description = ogDescMatch[1].trim();
    }

    // 4. Preço
    let price: number | null = null;
    const priceMatch = html.match(/class=["'][^"']*andes-money-amount__fraction[^"']*["']>([^<]+)</i);
    if (priceMatch && priceMatch[1]) {
      const rawNum = priceMatch[1].replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(rawNum);
      if (!isNaN(parsed)) price = parsed;
    }

    return { title, description, image, price };
  } catch (err) {
    console.warn('Erro ao raspar Mercado Livre via HTML direto:', err);
    return null;
  }
}

// Scraper especializado para Shopee
async function scrapeShopee(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      redirect: 'follow',
    });

    const html = await res.text();

    let image: string | null = null;
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes('logo')) {
      image = ogImageMatch[1];
    } else {
      const shopeeImgs = html.match(/https:\/\/down-br\.img\.susercontent\.com\/file\/[^"'\s<>]+/g);
      if (shopeeImgs && shopeeImgs.length > 0) {
        image = shopeeImgs[0];
      }
    }

    let title: string | null = null;
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].replace(/\s*\|\s*Shopee Brasil.*$/i, '').trim();
    }

    return { title, image };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'A URL é obrigatória.' }, { status: 400 });
    }

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 });
    }

    let scrapedTitle: string | null = null;
    let scrapedDescription: string | null = null;
    let scrapedImage: string | null = null;
    let scrapedPrice: number | null = null;

    // 1. Verificação Mercado Livre
    if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) {
      const mlData = await scrapeMercadoLivre(url);
      if (mlData) {
        scrapedTitle = mlData.title;
        scrapedDescription = mlData.description;
        scrapedImage = mlData.image;
        scrapedPrice = mlData.price;
      }
    }

    // 2. Verificação Shopee
    if (!scrapedImage && (url.includes('shopee.com') || url.includes('s.shopee.com'))) {
      const shopeeData = await scrapeShopee(url);
      if (shopeeData) {
        scrapedTitle = scrapedTitle || shopeeData.title;
        scrapedImage = shopeeData.image;
      }
    }

    // 3. Fallback Open Graph Geral (Amazon, Magalu, Casas Bahia, etc.)
    if (!scrapedImage || !scrapedTitle) {
      try {
        const { result } = await ogs({
          url,
          timeout: 8000,
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          },
        } as any);

        if (!scrapedTitle) {
          scrapedTitle = result.ogTitle || result.twitterTitle || '';
        }

        if (!scrapedDescription) {
          scrapedDescription = result.ogDescription || result.twitterDescription || '';
        }

        if (!scrapedImage) {
          const rawImage = result.ogImage || (result as any).twitterImage;
          if (Array.isArray(rawImage) && rawImage.length > 0) {
            scrapedImage = rawImage[0]?.url || rawImage[0] || null;
          } else if (typeof rawImage === 'object' && rawImage !== null) {
            scrapedImage = (rawImage as any).url || null;
          } else if (typeof rawImage === 'string') {
            scrapedImage = rawImage;
          }
        }

        if (!scrapedPrice) {
          const rawPrice =
            result.ogPriceAmount ||
            (result as any).priceAmount ||
            (result as any).productPriceAmount;
          if (rawPrice) {
            const parsed = parseFloat(rawPrice.toString().replace(',', '.'));
            if (!isNaN(parsed)) scrapedPrice = parsed;
          }
        }
      } catch (ogsErr) {
        console.warn('Fallback OGS falhou:', ogsErr);
      }
    }

    // Limpeza de título fallback
    if (!scrapedTitle || scrapedTitle.includes('Mercado Libre') || scrapedTitle.includes('Mercado Livre') || scrapedTitle.includes('Shopee')) {
      const extracted = extractTitleFromUrl(url);
      if (extracted) scrapedTitle = extracted;
    }

    if (scrapedImage && scrapedImage.startsWith('//')) {
      scrapedImage = 'https:' + scrapedImage;
    }

    // Filtra logos genéricas para nunca salvar ícones falsos
    const isLogo =
      !scrapedImage ||
      scrapedImage.includes('logo__small') ||
      scrapedImage.includes('ui-navigation') ||
      scrapedImage.includes('favicon');

    if (isLogo) {
      scrapedImage = null;
    }

    return NextResponse.json({
      title: scrapedTitle || 'Produto de Presente',
      description: scrapedDescription || '',
      image: scrapedImage,
      price: scrapedPrice,
      url,
    });
  } catch (err: any) {
    console.error('Erro na API de metadados OG:', err);
    return NextResponse.json(
      { error: 'Erro interno ao extrair dados da loja.' },
      { status: 500 }
    );
  }
}
