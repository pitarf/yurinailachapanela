import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Função auxiliar para converter strings para Title Case respeitando preposições em PT-BR
function toTitleCase(str: string): string {
  const lowercaseWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'para', 'com', 'por', 'a', 'o'];
  return str
    .split(' ')
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && lowercaseWords.includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Mapeamento de imagens reais e elegantes por palavra-chave para cada produto
function getRealProductImage(name: string): string {
  const lower = name.toLowerCase();

  // Eletros & Cozinha
  if (lower.includes('cafeteira')) return 'https://images.unsplash.com/photo-1517668808822-9e428d694af1?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('sanduicheira') || lower.includes('grill')) return 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('torradeira')) return 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('liquidificador')) return 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('batedeira')) return 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('mixer')) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('pipoqueira')) return 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('chaleira')) return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('processador')) return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80';

  // Panelas & Formas
  if (lower.includes('panela de presso')) return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('panelas') || lower.includes('panela')) return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('frigideira')) return 'https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('assadeira') || lower.includes('forma') || lower.includes('tabuleiro')) return 'https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=600&q=80';

  // Utensílios
  if (lower.includes('faca') || lower.includes('facas')) return 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('tbua') || lower.includes('tabua')) return 'https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('prato') || lower.includes('pratos')) return 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('talher') || lower.includes('talheres')) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('copo') || lower.includes('copos') || lower.includes('jarra')) return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('xkara') || lower.includes('xicara') || lower.includes('xcaras')) return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('pote') || lower.includes('potes') || lower.includes('bowl')) return 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('temperos') || lower.includes('galheteiro')) return 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('escorredor')) return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';

  // Quarto & Cama
  if (lower.includes('cama') || lower.includes('lencl') || lower.includes('edredom') || lower.includes('colcha') || lower.includes('cobre-leito')) return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('manta') || lower.includes('travesseiro')) return 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('abajur')) return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('espelho')) return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('tapete')) return 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80';

  // Banheiro & Serviço
  if (lower.includes('toalha') || lower.includes('toalhas')) return 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('aspirador')) return 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('ferro')) return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80';
  if (lower.includes('varal') || lower.includes('tbua de passar')) return 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80';

  // Fallback genérico elegante
  return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80';
}

async function main() {
  console.log('Iniciando a formatação de nomes (Title Case) e atualização das fotos de capa reais...');

  const gifts = await prisma.gift.findMany();

  for (const gift of gifts) {
    const formattedName = toTitleCase(gift.name);
    const realImage = getRealProductImage(gift.name);

    await prisma.gift.update({
      where: { id: gift.id },
      data: {
        name: formattedName,
        imageUrl: realImage,
      },
    });

    console.log(`  ✓ "${gift.name}" -> "${formattedName}" (Foto atualizada)`);
  }

  console.log('Finalizada a atualização de nomes e imagens!');
}

main()
  .catch((err) => {
    console.error('Erro ao atualizar produtos:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
