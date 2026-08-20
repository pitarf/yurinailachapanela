import 'dotenv/config';
import fs from 'fs';
import path from 'path';

function parseGiftList() {
  const filePath = path.join(__dirname, '..', 'public', 'lsita de produtos.md');
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  let currentCategory = 'Geral';
  let parentItemName = '';
  const products: { name: string; category: string; purchaseUrl?: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('Nai & Yuri')) continue;

    // Check if line is category header
    if (
      line === 'COZINHA – ELETROPORTÁTEIS' ||
      line === 'COZINHA – PANELAS E FORMAS' ||
      line === 'COZINHA – UTENSÍLIOS' ||
      line === 'QUARTO' ||
      line === 'BANHEIRO' ||
      line === 'ÁREA DE SERVIÇO E OUTROS ITENS'
    ) {
      if (line === 'COZINHA – ELETROPORTÁTEIS') currentCategory = 'Cozinha – Eletroportáteis';
      else if (line === 'COZINHA – PANELAS E FORMAS') currentCategory = 'Cozinha – Panelas e Formas';
      else if (line === 'COZINHA – UTENSÍLIOS') currentCategory = 'Cozinha – Utensílios';
      else if (line === 'QUARTO') currentCategory = 'Quarto';
      else if (line === 'BANHEIRO') currentCategory = 'Banheiro';
      else if (line === 'ÁREA DE SERVIÇO E OUTROS ITENS') currentCategory = 'Área de Serviço';
      parentItemName = '';
      continue;
    }

    // Check if line contains a URL
    const urlMatch = line.match(/(https:\/\/[^\s]+)/);

    if (urlMatch) {
      const url = urlMatch[1];
      // Clean up checkmarks / punctuation from url if captured
      const cleanUrl = url.replace(/[✅?*]+$/, '');

      // Check if this line is a sub-variation or full line
      let namePart = line.replace(urlMatch[0], '').replace(/[✅?*]/g, '').replace(/^-+|-+$/g, '').trim();
      
      // If the line starts with (sub-item) like "(quadrada) - https..." and we have parentItemName
      if (namePart.startsWith('(') && parentItemName) {
        namePart = `${parentItemName} ${namePart}`;
      } else if (namePart.endsWith('-')) {
        namePart = namePart.replace(/-$/, '').trim();
      }

      // If line is just url and previous line was name
      if (!namePart && parentItemName) {
        namePart = parentItemName;
      }

      if (namePart) {
        // Capitalize first letter properly
        namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        products.push({
          name: namePart,
          category: currentCategory,
          purchaseUrl: cleanUrl,
        });
      }
    } else {
      // Line doesn't have url - could be parent item name (e.g. "Assadeiras de vidro (P, M e G)")
      const cleanLine = line.replace(/[✅?*:]/g, '').replace(/^-+|-+$/g, '').trim();
      if (cleanLine && !cleanLine.startsWith('http')) {
        parentItemName = cleanLine;
      }
    }
  }

  console.log(`Total de produtos parseados: ${products.length}`);
  products.forEach((p, idx) => {
    console.log(`[${idx + 1}] (${p.category}) ${p.name} -> ${p.purchaseUrl?.substring(0, 60)}...`);
  });
}

parseGiftList();
