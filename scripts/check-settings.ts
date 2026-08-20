import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const setting = await prisma.systemSetting.findFirst();
  console.log('SystemSettings:', setting);
  const count = await prisma.photo.count();
  console.log('Total Photos in DB:', count);
}

main().finally(() => prisma.$disconnect());
