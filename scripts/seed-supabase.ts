import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/lib/supabase';

async function seedSupabase() {
  if (!supabase) {
    console.error('❌ Supabase não configurado.');
    return;
  }

  console.log('🚀 Testando conexão e enviando dados para o Supabase...');

  const dbPath = path.join(__dirname, '..', 'src', 'data', 'database.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Inserir Evento
  console.log('📅 Inserindo Evento...');
  const { error: eventError } = await supabase.from('yn_events').upsert({
    id: dbData.event.id || 'default-event',
    type: dbData.event.type || 'PANTRY_PARTY',
    title: dbData.event.title || 'Chá de Panela',
    date: dbData.event.date || '2026-10-11T13:00:00.000Z',
    time: dbData.event.time || '13:00',
    location: dbData.event.location || 'ADVEC Templo auxiliar',
    address: dbData.event.address || 'Rua Montevidéu, 1191 - 4º andar.',
    maps_url: dbData.event.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
    description: dbData.event.description || '',
  });

  if (eventError) {
    console.error('⚠️ Erro ao inserir evento:', eventError.message);
    if (eventError.message.includes('relation "yn_events" does not exist') || eventError.message.includes('404')) {
      console.log('\n❗ As tabelas yn_* ainda não foram criadas no Supabase.');
      console.log('👉 Por favor, execute o script SQL fornecido no SQL Editor do Supabase.');
      return;
    }
  } else {
    console.log('✅ Evento inserido com sucesso!');
  }

  // 2. Inserir Settings
  console.log('⚙️ Inserindo Configurações...');
  const { error: setErr } = await supabase.from('yn_settings').upsert({
    id: 'default',
    couple_names: dbData.settings.coupleNames || 'Naila & Yuri',
    site_title: dbData.settings.siteTitle || 'Naila & Yuri | Chá de Panela',
    site_description: dbData.settings.siteDescription || '',
    site_keywords: dbData.settings.siteKeywords || '',
    favicon_url: dbData.settings.faviconUrl || '/monograma_popyn.png',
    og_image_url: dbData.settings.ogImageUrl || '/pre-wedding/pre-wedding-01.webp',
    delivery_address: dbData.settings.deliveryAddress || 'Rua Montevidéu, 1191 - 4º andar.',
    pix_key: dbData.settings.pixKey || 'nailaeyuri@pix.com',
    pix_receiver: dbData.settings.pixReceiver || 'Naila & Yuri',
    pix_city: dbData.settings.pixCity || 'São Paulo',
    show_prices: dbData.settings.showPrices || false,
    history_text: dbData.settings.historyText || '',
  });
  if (setErr) console.error('Erro settings:', setErr.message);
  else console.log('✅ Configurações salvas!');

  // 3. Inserir Presentes
  console.log(`🎁 Inserindo ${dbData.gifts.length} presentes...`);
  const formattedGifts = dbData.gifts.map((g: any) => ({
    id: g.id,
    event_id: dbData.event.id || 'default-event',
    name: g.name,
    description: g.description || null,
    price: g.price || null,
    category: g.category || 'Geral',
    purchase_url: g.purchaseUrl || null,
    image_url: g.imageUrl || null,
    status: g.status || 'AVAILABLE',
    order: g.order || 0,
  }));

  // Lotes de 50 para evitar payload grande
  for (let i = 0; i < formattedGifts.length; i += 50) {
    const chunk = formattedGifts.slice(i, i + 50);
    const { error: giftErr } = await supabase.from('yn_gifts').upsert(chunk);
    if (giftErr) console.error(`Erro lote presentes ${i}:`, giftErr.message);
  }
  console.log('✅ Presentes enviados!');

  // 4. Inserir Fotos
  console.log(`📸 Inserindo ${dbData.photos.length} fotos...`);
  const formattedPhotos = dbData.photos.map((p: any) => ({
    id: p.id,
    url: p.url,
    caption: p.caption || null,
    is_hero: p.isHero || false,
    order: p.order || 0,
  }));
  const { error: photoErr } = await supabase.from('yn_photos').upsert(formattedPhotos);
  if (photoErr) console.error('Erro fotos:', photoErr.message);
  else console.log('✅ Fotos enviadas!');

  // 5. Inserir Atividades
  console.log(`📋 Inserindo ${dbData.activities.length} atividades...`);
  const formattedActivities = dbData.activities.map((a: any) => ({
    id: a.id,
    event_id: dbData.event.id || 'default-event',
    title: a.title,
    description: a.description || null,
    time: a.time || null,
    order: a.order || 0,
  }));
  const { error: actErr } = await supabase.from('yn_activities').upsert(formattedActivities);
  if (actErr) console.error('Erro atividades:', actErr.message);
  else console.log('✅ Atividades enviadas!');

  console.log('\n🎉 População do Supabase concluída com sucesso!');
}

seedSupabase().catch(console.error);
