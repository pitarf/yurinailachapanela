import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Atualizando os nomes do casal no banco para Naila & Yuri...');

  const settings = await prisma.systemSetting.findFirst();

  if (settings) {
    await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        coupleNames: 'Naila & Yuri',
        siteTitle: 'Naila & Yuri | Chá de Panela',
      },
    });
  } else {
    await prisma.systemSetting.create({
      data: {
        id: 'default',
        coupleNames: 'Naila & Yuri',
        siteTitle: 'Naila & Yuri | Chá de Panela',
      },
    });
  }

  console.log('✅ Nomes do casal Naila & Yuri gravados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
