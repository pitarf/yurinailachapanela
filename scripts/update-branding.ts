import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.systemSetting.update({
    where: { id: 'default' },
    data: {
      faviconUrl: '/monograma_popyn.png',
      ogImageUrl: '/pre-wedding/pre-wedding-01.webp',
    },
  });
  console.log('✅ Favicon e OG Image atualizados no SystemSettings!');
}

main().finally(() => prisma.$disconnect());
