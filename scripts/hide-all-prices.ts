import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Ocultando todos os valores dos produtos no site público...');

  const settings = await prisma.systemSetting.findFirst();

  if (settings) {
    await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        showPrices: false,
      },
    });
  } else {
    await prisma.systemSetting.create({
      data: {
        id: 'default',
        showPrices: false,
      },
    });
  }

  console.log('✅ Sucesso! A exibição de valores dos produtos foi desativada globalmente no site.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
