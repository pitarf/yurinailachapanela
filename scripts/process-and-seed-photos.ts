import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../src/lib/prisma';

async function main() {
  const sourceDir = path.join(__dirname, '..', 'Fotos');
  const targetDir = path.join(__dirname, '..', 'public', 'pre-wedding');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.jpeg' || ext === '.jpg' || ext === '.png' || ext === '.webp';
  });

  console.log(`Encontradas ${files.length} fotos para processamento e otimização...`);

  // Limpa registros anteriores da galeria para reinserir as fotos reais
  await prisma.photo.deleteMany({});

  const captions = [
    'Naila & Yuri — Início da nossa caminhada',
    'Sintonia & Amor em cada detalhe',
    'Nosso lugar favorito é juntos',
    'Construindo o nosso futuro',
    'Sorrisos que iluminam nossos dias',
    'Cumplicidade & Parceria',
    'O amor que nos uniu',
    'Momentos inesquecíveis',
    'Rumo ao altar',
    'Celebrando nossa união',
    'Para todo o sempre',
    'Histórias que guardamos no coração',
    'Amor que transborda em cada olhar',
    'O melhor capítulo das nossas vidas',
    'Promessa de uma vida inteira juntos',
    'Amor eterno e verdadeiro',
  ];

  let index = 1;
  for (const file of files) {
    const sourceFilePath = path.join(sourceDir, file);
    const outputFileName = `pre-wedding-${String(index).padStart(2, '0')}.webp`;
    const targetFilePath = path.join(targetDir, outputFileName);

    console.log(`Otimizando [${index}/${files.length}]: ${file} -> ${outputFileName}`);

    // Processa a imagem: redimensiona mantendo proporção e converte para WebP 85%
    await sharp(sourceFilePath)
      .resize({
        width: 1600,
        height: 1600,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp({ quality: 85, effort: 6 })
      .toFile(targetFilePath);

    const stats = fs.statSync(targetFilePath);
    const originalStats = fs.statSync(sourceFilePath);
    console.log(`  Tamanho original: ${(originalStats.size / 1024).toFixed(1)} KB -> WebP: ${(stats.size / 1024).toFixed(1)} KB`);

    const publicUrl = `/pre-wedding/${outputFileName}`;
    const caption = captions[(index - 1) % captions.length];

    await prisma.photo.create({
      data: {
        url: publicUrl,
        caption: caption,
        isHero: index <= 4, // Primeiras 4 fotos marcam presença no Hero
        order: index,
      },
    });

    index++;
  }

  console.log('✅ Todas as fotos foram otimizadas e cadastradas no banco de dados com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao processar fotos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
