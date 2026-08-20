import { NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

// Extrai título limpo a partir de slugs de URLs de e-commerces
function extractTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    
    for (const part of parts) {
      if (part.includes('-') && !part.startsWith('MLB') && !part.startsWith('up')) {
        const cleaned = part
          .replace(/-/g, ' ')
          .replace(/\b(pdp_filters|is_advertising|tracking_id|backend_model)\b.*$/g, '')
          .trim();
        if (cleaned.length > 5) {
          return cleaned
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }
      }
    }
  } catch {}
  return '';
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

    const options: any = {
      url,
      timeout: 10000,
    };

    const { result, error } = await ogs(options);

    let title = result.ogTitle || result.twitterTitle || '';
    if (!title || title.includes('Mercado Libre') || title.includes('Mercado Livre')) {
      const extracted = extractTitleFromUrl(url);
      if (extracted) title = extracted;
    }

    let imageUrl: string | null = null;
    const rawImage = result.ogImage || (result as any).twitterImage;

    if (Array.isArray(rawImage) && rawImage.length > 0) {
      imageUrl = rawImage[0]?.url || rawImage[0] || null;
    } else if (typeof rawImage === 'object' && rawImage !== null) {
      imageUrl = (rawImage as any).url || null;
    } else if (typeof rawImage === 'string') {
      imageUrl = rawImage;
    }

    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }

    // Se a imagem for a logo genérica do e-commerce ou estiver ausente, NUNCA sugerir imagem fake -> retorna null
    const isLogo =
      !imageUrl ||
      imageUrl.includes('logo') ||
      imageUrl.includes('frontend-assets') ||
      imageUrl.includes('ui-navigation') ||
      imageUrl.includes('icon') ||
      imageUrl.includes('unsplash');

    if (isLogo) {
      imageUrl = null;
    }

    // Heurística de Preço
    let price: number | null = null;
    const rawPrice =
      result.ogPriceAmount ||
      (result as any).priceAmount ||
      (result as any).productPriceAmount;

    if (rawPrice) {
      const parsed = parseFloat(rawPrice.toString().replace(',', '.'));
      if (!isNaN(parsed)) price = parsed;
    }

    return NextResponse.json({
      title: title || 'Produto de Presente',
      description: result.ogDescription || result.twitterDescription || '',
      image: imageUrl,
      price: price,
    });
  } catch (err: any) {
    console.error('Erro na API de metadados OG:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar metadados da URL.' },
      { status: 500 }
    );
  }
}
