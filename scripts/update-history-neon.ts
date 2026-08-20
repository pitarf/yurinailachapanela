import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function updateHistoryText() {
  const newHistoryText = `Resumir a história de duas pessoas que se amam não é fácil mas falar sobre nós dois é. Existe um propósito na nossa união e, desde sempre, dizemos sim ao nosso amor.

Gostamos de ideias diferentes, somos autênticos, gostamos da companhia um do outro e, principalmente, amamos vivenciar novas experiências juntos. Gostamos de rir e compartilhar o melhor da vida ao lado de Cristo.

Fomos chamados para conhecê-lo e fazê-lo conhecido, formar nossa família e curtir uma boa noite de pipoca.

E vocês testemunharão a cena mais linda das nossas vidas: o início da nossa família.`;

  console.log('🔄 Atualizando história no banco Neon...');

  const setting = await prisma.systemSetting.findFirst();
  if (setting) {
    await prisma.systemSetting.update({
      where: { id: setting.id },
      data: {
        historyText: newHistoryText,
      },
    });
    console.log('✅ História atualizada com sucesso no banco de dados Neon!');
  } else {
    await prisma.systemSetting.create({
      data: {
        id: 'default',
        coupleNames: 'Naila & Yuri',
        siteTitle: 'Naila & Yuri | Chá de Panela',
        siteDescription: 'Seja bem-vindo ao site de Chá de Panela de Naila & Yuri.',
        siteKeywords: 'Naila, Yuri, Chá de Panela, Casamento',
        historyText: newHistoryText,
      },
    });
    console.log('✅ Registro de SystemSetting criado com nova história no Neon!');
  }
}

updateHistoryText()
  .catch((e) => {
    console.error('❌ Erro:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
