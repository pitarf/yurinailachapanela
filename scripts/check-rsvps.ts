import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Buscando confirmações de presença (RSVPs)...');
  try {
    const rsvps = await prisma.rsvp.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Total de RSVPs encontrados: ${rsvps.length}\n`);
    for (const r of rsvps) {
      console.log(`ID: ${r.id}`);
      console.log(`Nome: ${r.name}`);
      console.log(`E-mail: ${r.email}`);
      console.log(`Acompanhante: ${r.hasCompanion ? 'Sim' : 'Não'} (${r.companionCount})`);
      if (r.companionNames) console.log(`Nomes dos Acompanhantes: ${r.companionNames}`);
      if (r.notes) console.log(`Observações: ${r.notes}`);
      console.log(`Criado em: ${r.createdAt.toLocaleString('pt-BR')}`);
      console.log('-------------------------------------------');
    }
  } catch (err) {
    console.error('Erro ao buscar RSVPs:', err);
  }
}

main().finally(() => prisma.$disconnect());
