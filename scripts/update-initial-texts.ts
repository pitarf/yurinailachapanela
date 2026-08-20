import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const historyText = `Tudo começou de forma leve e genuína, descobrindo aos poucos que o nosso lugar favorito no mundo era sempre ao lado um do outro. Entre conversas sem pressa, olhares cúmplices e sonhos compartilhados, fomos construindo dia após dia o amor que hoje nos guia.\n\nO nosso Chá de Panela é um capítulo muito especial no caminho até o altar. Mais do que montar o nosso futuro lar, queremos celebrar a vida e brindar este momento ao lado de quem realmente faz parte da nossa história. Preparem-se para uma tarde cheia de abraços, boas risadas e memórias que guardaremos para sempre!`;

  const heroDescription = `Estamos preparando cada detalhe com muito amor e carinho para celebrar essa nova fase das nossas vidas com vocês!`;

  await prisma.systemSetting.update({
    where: { id: 'default' },
    data: {
      coupleNames: 'Naila & Yuri',
      siteTitle: 'Naila & Yuri | Chá de Panela',
      siteDescription: 'Seja bem-vindo ao site de Chá de Panela de Naila & Yuri. Confira a nossa lista de presentes, programação e fotos.',
      historyText: historyText,
    },
  });

  await prisma.event.update({
    where: { type: 'PANTRY_PARTY' },
    data: {
      description: heroDescription,
    },
  });

  console.log('✅ Textos aprimorados e salvos no banco de dados com sucesso!');
}

main().finally(() => prisma.$disconnect());
