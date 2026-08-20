import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Iniciando o cadastro completo dos produtos da Lista de Chá de Panela do PDF...');

  // 1. Evento principal do Chá de Panela
  const event = await prisma.event.upsert({
    where: { type: 'PANTRY_PARTY' },
    update: {},
    create: {
      type: 'PANTRY_PARTY',
      title: 'Chá de Panela Naila & Yuri',
      date: new Date('2026-10-11T15:00:00Z'),
      time: '15:00',
      location: 'Espaço Jardins Premium',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      mapsUrl: 'https://maps.google.com',
      description:
        'Estamos preparando cada detalhe com muito amor para celebrar essa nova fase das nossas vidas com vocês!',
      activities: {
        create: [
          { title: 'Boas-vindas & Drinks', description: 'Recepção dos convidados com coquetel de boas-vindas.', time: '15:00', order: 1 },
          { title: 'Brincadeiras do Casal', description: 'Momentos divertidos preparados pelos padrinhos.', time: '16:30', order: 2 },
          { title: 'Abertura dos Presentes', description: 'Celebração e agradecimento pelos carinhos recebidos.', time: '18:00', order: 3 },
          { title: 'Jantar & Confraternização', description: 'Comida boa, risadas e celebração da união.', time: '19:00', order: 4 },
        ],
      },
    },
  });

  // 2. Configurações Globais do Sistema
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      coupleNames: 'Naila & Yuri',
      siteTitle: 'Naila & Yuri | Chá de Panela',
      siteDescription: 'Seja bem-vindo ao site de Chá de Panela e futura celebração de casamento de Naila & Yuri.',
      siteKeywords: 'Naila, Yuri, Chá de Panela, Casamento',
      deliveryAddress: 'Av. Brigadeiro Luís Antônio, 200 - Apto 42\nBela Vista, São Paulo - SP\nCEP: 01317-000',
      pixKey: 'nailaeyuri@pix.com',
      pixReceiver: 'Naila & Yuri',
      pixCity: 'São Paulo',
    },
  });

  // Limpa a lista anterior de presentes para reinserir com todas as categorias organizadas do PDF
  await prisma.reservation.deleteMany({});
  await prisma.gift.deleteMany({});

  const allGifts = [
    // --- COZINHA – ELETROPORTÁTEIS ---
    { name: 'Cafeteira elétrica', price: 150.00, category: 'Cozinha – Eletroportáteis', description: 'Para começarmos nossas manhãs com café quentinho.' },
    { name: 'Sanduicheira / Grill', price: 120.00, category: 'Cozinha – Eletroportáteis', description: 'Ideal para lanches rápidos e grelhados.' },
    { name: 'Torradeira', price: 130.00, category: 'Cozinha – Eletroportáteis', description: 'Pães crocantes no café da manhã.' },
    { name: 'Liquidificador', price: 180.00, category: 'Cozinha – Eletroportáteis', description: 'Para sucos, vitaminas e receitas deliciosas.' },
    { name: 'Batedeira', price: 220.00, category: 'Cozinha – Eletroportáteis', description: 'Essencial para bolos e sobremesas especiais.' },
    { name: 'Mixer 3 em 1', price: 160.00, category: 'Cozinha – Eletroportáteis', description: 'Praticidade no preparo de molhos e sopas.' },
    { name: 'Mixer de copo', price: 110.00, category: 'Cozinha – Eletroportáteis', description: 'Compacto e perfeito para vitaminas rápidas.' },
    { name: 'Pipoqueira elétrica', price: 140.00, category: 'Cozinha – Eletroportáteis', description: 'Para as nossas noites de cinema e pipoca 🍿.' },
    { name: 'Panela elétrica', price: 250.00, category: 'Cozinha – Eletroportáteis', description: 'Praticidade no cozimento dos nossos pratos.' },
    { name: 'Panela de arroz', price: 190.00, category: 'Cozinha – Eletroportáteis', description: 'Arroz soltinho e no ponto certo.' },
    { name: 'Chaleira elétrica', price: 120.00, category: 'Cozinha – Eletroportáteis', description: 'Água quente em poucos segundos para chás e cafés.' },
    { name: 'Espremedor elétrico', price: 100.00, category: 'Cozinha – Eletroportáteis', description: 'Sucos naturais de laranja e limão.' },
    { name: 'Mini processador', price: 130.00, category: 'Cozinha – Eletroportáteis', description: 'Para picar temperos e vegetais com agilidade.' },

    // --- COZINHA – PANELAS E FORMAS ---
    { name: 'Jogo de panelas antiaderente', price: 350.00, category: 'Cozinha – Panelas e Formas', description: 'Conjunto completo de panelas antiaderentes.' },
    { name: 'Panela de pressão comum', price: 140.00, category: 'Cozinha – Panelas e Formas', description: 'Essencial para o feijão do dia a dia.' },
    { name: 'Frigideira', price: 70.00, category: 'Cozinha – Panelas e Formas', description: 'Para ovos, tapiocas e grelhados rápidos.' },
    { name: 'Cuscuzeira', price: 60.00, category: 'Cozinha – Panelas e Formas', description: 'Para um cuscuz quentinho e saboroso.' },
    { name: 'Leiteira', price: 45.00, category: 'Cozinha – Panelas e Formas', description: 'Ferver leite e líquidos com segurança.' },
    { name: 'Bule', price: 55.00, category: 'Cozinha – Panelas e Formas', description: 'Servir chás e cafés quentes.' },
    { name: 'Forma de pudim (pequena e grande)', price: 65.00, category: 'Cozinha – Panelas e Formas', description: 'Para sobremesas tradicionais da família.' },
    { name: 'Jogo de formas redondas para bolo', price: 80.00, category: 'Cozinha – Panelas e Formas', description: 'Formas ideais para assar bolos deliciosos.' },
    { name: 'Forma quadrada', price: 50.00, category: 'Cozinha – Panelas e Formas', description: 'Para tortas e brownies saborosos.' },
    { name: 'Tabuleiro / assadeira grande', price: 60.00, category: 'Cozinha – Panelas e Formas', description: 'Assados grandes e pratos de forno.' },
    { name: 'Assadeiras de vidro (P, M e G)', price: 110.00, category: 'Cozinha – Panelas e Formas', description: 'Conjunto de travessas refratárias de vidro.' },
    { name: 'Assadeira de porcelana', price: 90.00, category: 'Cozinha – Panelas e Formas', description: 'Elegância ao assar e servir à mesa.' },

    // --- COZINHA – UTENSÍLIOS ---
    { name: 'Jogo de facas', price: 120.00, category: 'Cozinha – Utensílios', description: 'Facas de corte preciso para gastronomia.' },
    { name: 'Porta-facas', price: 60.00, category: 'Cozinha – Utensílios', description: 'Organização e segurança para o jogo de facas.' },
    { name: 'Tábua de corte (vidro e plástico)', price: 50.00, category: 'Cozinha – Utensílios', description: 'Higiene e praticidade na hora de picar alimentos.' },
    { name: 'Ralador', price: 30.00, category: 'Cozinha – Utensílios', description: 'Ralador multiuso de inox.' },
    { name: 'Fouet (batedor de ovos)', price: 25.00, category: 'Cozinha – Utensílios', description: 'Para bater molhos, cremes e ovos.' },
    { name: 'Moedor de pimenta e sal', price: 45.00, category: 'Cozinha – Utensílios', description: 'Temperos moídos na hora à mesa.' },
    { name: 'Rolo de massa', price: 35.00, category: 'Cozinha – Utensílios', description: 'Abrir massas de pizzas e tortas.' },
    { name: 'Galheteiro (azeite e vinagre)', price: 55.00, category: 'Cozinha – Utensílios', description: 'Recipiente elegante para azeite e vinagre.' },
    { name: 'Concha', price: 25.00, category: 'Cozinha – Utensílios', description: 'Servir sopas, feijão e caldos.' },
    { name: 'Colher de pau', price: 20.00, category: 'Cozinha – Utensílios', description: 'Utensílio clássico para mexer panelas.' },
    { name: 'Escumadeira', price: 25.00, category: 'Cozinha – Utensílios', description: 'Escorrer fritos e alimentos cozidos.' },
    { name: 'Espátulas de silicone', price: 40.00, category: 'Cozinha – Utensílios', description: 'Para raspar panelas sem riscar o antiaderente.' },
    { name: 'Pegador de alimentos', price: 30.00, category: 'Cozinha – Utensílios', description: 'Praticidade ao servir saladas e carnes.' },
    { name: 'Descascador de legumes', price: 20.00, category: 'Cozinha – Utensílios', description: 'Agilidade ao descascar batatas e vegetais.' },
    { name: 'Espremedor de batata', price: 35.00, category: 'Cozinha – Utensílios', description: 'Para purês macios e saborosos.' },
    { name: 'Espremedor manual de laranja e limão', price: 30.00, category: 'Cozinha – Utensílios', description: 'Prático para temperos e Sucos.' },
    { name: 'Tesoura de cozinha', price: 25.00, category: 'Cozinha – Utensílios', description: 'Corte de embalagens e ervas culinárias.' },
    { name: 'Abridor de lata', price: 25.00, category: 'Cozinha – Utensílios', description: 'Abrir enlatados com facilidade.' },
    { name: 'Abridor de vinho / saca-rolha', price: 35.00, category: 'Cozinha – Utensílios', description: 'Para as nossas noites de vinho.' },
    { name: 'Cortador de pizza', price: 20.00, category: 'Cozinha – Utensílios', description: 'Fatiar pizzas com agilidade.' },
    { name: 'Pegador de sorvete', price: 25.00, category: 'Cozinha – Utensílios', description: 'Bolas perfeitas de sorvete nas sobremesas.' },
    { name: 'Funil', price: 15.00, category: 'Cozinha – Utensílios', description: 'Transferir líquidos para recipientes sem derramar.' },
    { name: 'Kit de peneiras', price: 30.00, category: 'Cozinha – Utensílios', description: 'Coar sucos e peneirar farinhas.' },
    { name: 'Medidores de alimentos secos e líquidos', price: 35.00, category: 'Cozinha – Utensílios', description: 'Precisão para seguir receitas culinárias.' },
    { name: 'Descanso de panela', price: 25.00, category: 'Cozinha – Utensílios', description: 'Proteger a mesa de panelas quentes.' },
    { name: 'Porta detergente e sabão', price: 35.00, category: 'Cozinha – Utensílios', description: 'Organização da bancada da pia.' },
    { name: 'Rodo de pia', price: 15.00, category: 'Cozinha – Utensílios', description: 'Manter a pia da cozinha seca e limpa.' },
    { name: 'Pano de prato', price: 40.00, category: 'Cozinha – Utensílios', description: 'Kit de panos de prato absorventes.' },
    { name: 'Toalha de mesa', price: 70.00, category: 'Cozinha – Utensílios', description: 'Decoração e proteção para as refeições.' },
    { name: 'Fruteira', price: 80.00, category: 'Cozinha – Utensílios', description: 'Organizar frutas frescas com estilo.' },
    { name: 'Bomboniere', price: 50.00, category: 'Cozinha – Utensílios', description: 'Guardar doces e chocolates para convidados.' },
    { name: 'Jogo de pratos', price: 180.00, category: 'Cozinha – Utensílios', description: 'Conjunto elegante de pratos para as refeições.' },
    { name: 'Pratos de sobremesa', price: 90.00, category: 'Cozinha – Utensílios', description: 'Pratos específicos para servir doces e frutas.' },
    { name: 'Kit de talheres', price: 120.00, category: 'Cozinha – Utensílios', description: 'Faqueiro completo de inox.' },
    { name: 'Kit de copos', price: 60.00, category: 'Cozinha – Utensílios', description: 'Jogo de copos de vidro para água e refrigerante.' },
    { name: 'Kit de sobremesa', price: 70.00, category: 'Cozinha – Utensílios', description: 'Taças e recipientes para sobremesa.' },
    { name: 'Xícaras de café e chá', price: 90.00, category: 'Cozinha – Utensílios', description: 'Conjunto de xícaras com pires.' },
    { name: 'Jarra de suco', price: 45.00, category: 'Cozinha – Utensílios', description: 'Jarra de vidro para servir bebidas geladas.' },
    { name: 'Bandeja de servir', price: 65.00, category: 'Cozinha – Utensílios', description: 'Praticidade ao servir café e petiscos.' },
    { name: 'Cesto de pão', price: 40.00, category: 'Cozinha – Utensílios', description: 'Servir pães quentinhos à mesa.' },
    { name: 'Garrafa térmica', price: 85.00, category: 'Cozinha – Utensílios', description: 'Manter o café aquecido por horas.' },
    { name: 'Garrafa de água', price: 35.00, category: 'Cozinha – Utensílios', description: 'Garrafa de vidro ou inox para a geladeira.' },
    { name: 'Potes de mantimento', price: 90.00, category: 'Cozinha – Utensílios', description: 'Armazenar arroz, feijão, açúcar e café.' },
    { name: 'Kit de potes', price: 60.00, category: 'Cozinha – Utensílios', description: 'Potes plásticos para guardar sobras na geladeira.' },
    { name: 'Potes herméticos (kit e avulsos)', price: 110.00, category: 'Cozinha – Utensílios', description: 'Conservar grãos e alimentos crocantes por mais tempo.' },
    { name: 'Bowls com tampa (kit e individuais)', price: 75.00, category: 'Cozinha – Utensílios', description: 'Tigelas multiuso para misturar e armazenar alimentos.' },
    { name: 'Tigelas de vidro', price: 65.00, category: 'Cozinha – Utensílios', description: 'Servir saladas e acompanhamentos.' },
    { name: 'Potes de vidro', price: 70.00, category: 'Cozinha – Utensílios', description: 'Armazenamento livre de BPA para a geladeira.' },
    { name: 'Organizadores de geladeira', price: 85.00, category: 'Cozinha – Utensílios', description: 'Gavetas e caixas organizadoras transparentes.' },
    { name: 'Porta-temperos', price: 65.00, category: 'Cozinha – Utensílios', description: 'Suporte giratório para ter temperos à mão.' },
    { name: 'Escorredor de louça', price: 95.00, category: 'Cozinha – Utensílios', description: 'Escorredor de inox para bancada da pia.' },
    { name: 'Balança de alimentos', price: 50.00, category: 'Cozinha – Utensílios', description: 'Precisão digital para pesagem de ingredientes.' },
    { name: 'Bacias (variações)', price: 45.00, category: 'Cozinha – Utensílios', description: 'Bacias plásticas e inox de diversos tamanhos.' },
    { name: 'Centrífuga de salada', price: 55.00, category: 'Cozinha – Utensílios', description: 'Secar folhas de alface e verduras com rapidez.' },
    { name: 'Escorredor de arroz', price: 30.00, category: 'Cozinha – Utensílios', description: 'Lavar e escorrer o arroz sem desperdício.' },
    { name: 'Escorredor de macarrão', price: 35.00, category: 'Cozinha – Utensílios', description: 'Escorrer massas recém-cozidas.' },

    // --- QUARTO ---
    { name: 'Jogos de cama (2)', price: 220.00, category: 'Quarto', description: 'Jogos de lençol de algodão macio para a cama.' },
    { name: 'Edredom / Colcha', price: 190.00, category: 'Quarto', description: 'Conforto e aquecimento para as noites frias.' },
    { name: 'Cobre-leito', price: 170.00, category: 'Quarto', description: 'Arrumar e decorar a cama com sofisticação.' },
    { name: 'Mantas', price: 110.00, category: 'Quarto', description: 'Mantas leves para o sofá e cama.' },
    { name: 'Travesseiros', price: 90.00, category: 'Quarto', description: 'Par de travesseiros confortáveis de fibra.' },
    { name: 'Jogo de toalhas', price: 140.00, category: 'Quarto', description: 'Conjunto de toalhas de banho e rosto.' },
    { name: 'Abajur', price: 120.00, category: 'Quarto', description: 'Iluminação suave para o criado-mudo.' },
    { name: 'Tapete para quarto', price: 150.00, category: 'Quarto', description: 'Achego e conforto ao pisar ao lado da cama.' },
    { name: 'Organizador de gavetas', price: 60.00, category: 'Quarto', description: 'Divisórias para meias e peças íntimas.' },
    { name: 'Espelho', price: 130.00, category: 'Quarto', description: 'Espelho de parede decorativo.' },
    { name: 'Cabides', price: 45.00, category: 'Quarto', description: 'Kit de cabides aveludados no mesmo padrão.' },
    { name: 'Pregadores', price: 15.00, category: 'Quarto', description: 'Pregadores de roupa resistentes.' },

    // --- BANHEIRO ---
    { name: 'Jogo de toalhas', price: 130.00, category: 'Banheiro', description: 'Toalhas felpudas para o banheiro social.' },
    { name: 'Porta papel higiênico', price: 45.00, category: 'Banheiro', description: 'Suporte de chão ou parede para papel.' },
    { name: 'Cesto de lixo', price: 50.00, category: 'Banheiro', description: 'Lixeira de pedal de inox.' },
    { name: 'Tapete de banheiro', price: 55.00, category: 'Banheiro', description: 'Tapete antiderrapante e macio para a saída do banho.' },
    { name: 'Kit para banheiro', price: 75.00, category: 'Banheiro', description: 'Conjunto porta-sabonete líquido e porta-escovas.' },
    { name: 'Kit de tapete preto', price: 65.00, category: 'Banheiro', description: 'Jogo de tapetes pretos minimalistas.' },
    { name: 'Cesto para roupa suja', price: 85.00, category: 'Banheiro', description: 'Cesto organizador para roupas a lavar.' },

    // --- ÁREA DE SERVIÇO E OUTROS ITENS ---
    { name: 'Aspirador de pó', price: 290.00, category: 'Área de Serviço', description: 'Praticidade na limpeza da casa.' },
    { name: 'Ferro de passar a vapor', price: 130.00, category: 'Área de Serviço', description: 'Desamassar roupas com facilidade.' },
    { name: 'Ferro de passar comum', price: 90.00, category: 'Área de Serviço', description: 'Ferro leve para uso do dia a dia.' },
    { name: 'Tábua de passar', price: 110.00, category: 'Área de Serviço', description: 'Mesa dobrável acolchoada para passar roupas.' },
    { name: 'Varal de chão', price: 95.00, category: 'Área de Serviço', description: 'Varal dobrável para secagem de roupas.' },
    { name: 'Lixeira grande', price: 75.00, category: 'Área de Serviço', description: 'Lixeira de cozinha ou área de serviço.' },
    { name: 'Balde', price: 25.00, category: 'Área de Serviço', description: 'Balde reforçado para limpeza.' },
    { name: 'Porta sabão em pó', price: 30.00, category: 'Área de Serviço', description: 'Recipiente com dosador para sabão.' },
    { name: 'Tapete de cozinha', price: 50.00, category: 'Área de Serviço', description: 'Passadeira para a frente da pia da cozinha.' },
    { name: 'Escada de 3 degraus', price: 140.00, category: 'Área de Serviço', description: 'Escada doméstica leve de alumínio.' },
  ];

  console.log(`Cadastrando ${allGifts.length} produtos do PDF...`);

  let count = 1;
  for (const item of allGifts) {
    await prisma.gift.create({
      data: {
        eventId: event.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        status: 'AVAILABLE',
        order: count++,
      },
    });
  }

  console.log(`Todos os ${allGifts.length} produtos do PDF foram cadastrados com sucesso!`);
}

main()
  .catch((e) => {
    console.error('Erro ao cadastrar produtos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
