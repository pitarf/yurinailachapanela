/**
 * Serviço de Envio de E-mails Transacionais via Brevo (Sendinblue) API v3
 * Design System: Identidade Visual Editorial Premium (Vogue / Popyn Monograma)
 */

interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SITE_URL = 'https://yurinailachapanela.vercel.app';

export async function sendBrevoEmail({ to, subject, htmlContent }: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'coutinhonaila20@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Naila & Yuri';

  if (!apiKey) {
    console.warn('⚠️ BREVO_API_KEY não configurada. E-mail não enviado:', subject);
    return { success: false, error: 'Chave da Brevo não configurada.' };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to,
        subject,
        htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Erro da API Brevo:', data);
      return { success: false, error: data.message || 'Erro ao enviar e-mail via Brevo.' };
    }

    console.log('✅ E-mail enviado com sucesso via Brevo:', data.messageId || 'OK');
    return { success: true, messageId: data.messageId };
  } catch (err: any) {
    console.error('❌ Exceção ao enviar e-mail via Brevo:', err);
    return { success: false, error: err.message || 'Falha na conexão com o servidor de e-mail.' };
  }
}

// ----------------------------------------------------------------------
// TEMPLATE DE IDENTIDADE VISUAL EDITORIAL PREMIUM (VOGUE / POPYN)
// ----------------------------------------------------------------------

function getBaseEmailLayout({
  eyebrow = 'CHÁ DE PANELA',
  title = 'NAILA & YURI',
  subtitle = '11 DE OUTUBRO DE 2026',
  content,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  content: string;
}) {
  return `
<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Naila & Yuri | Chá de Panela</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap');

    body {
      margin: 0;
      padding: 0;
      background-color: #F8F8F7;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1A1A1A;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: #F8F8F7;
      padding: 40px 12px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid #EAEAEA;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
    }
    .header-banner {
      background-color: #0A0A0A;
      color: #FFFFFF;
      padding: 48px 32px 40px;
      text-align: center;
      position: relative;
    }
    .monogram-img {
      width: 58px;
      height: 58px;
      object-fit: contain;
      margin: 0 auto 18px;
      display: block;
      filter: invert(1);
    }
    .header-eyebrow {
      font-size: 10px;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: #A1A1AA;
      font-weight: 500;
      margin: 0 0 8px;
    }
    .header-title {
      font-family: 'Playfair Display', 'Cinzel', Didot, 'Bodoni MT', 'Times New Roman', serif;
      font-size: 32px;
      font-weight: 400;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin: 0;
      line-height: 1.15;
      color: #FFFFFF;
    }
    .header-subtitle {
      font-size: 11px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #D4D4D8;
      margin: 12px 0 0;
      font-weight: 300;
    }
    .divider-gold {
      width: 40px;
      height: 1px;
      background-color: #71717A;
      margin: 16px auto 0;
    }
    .body-content {
      padding: 40px 36px;
      line-height: 1.7;
      font-size: 14px;
      color: #27272A;
    }
    .greeting-script {
      font-family: 'Great Vibes', 'Playfair Display', cursive, serif;
      font-size: 30px;
      color: #0A0A0A;
      margin: 0 0 12px;
      font-weight: normal;
      line-height: 1.2;
    }
    .lead-text {
      font-size: 15px;
      color: #3F3F46;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    .luxury-card {
      background-color: #FAFAFA;
      border: 1px solid #EBEBEB;
      border-radius: 24px;
      padding: 28px 24px;
      margin: 28px 0;
      text-align: center;
    }
    .card-badge {
      display: inline-block;
      padding: 5px 14px;
      background-color: #0A0A0A;
      color: #FFFFFF;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .gift-title {
      font-family: 'Playfair Display', 'Cinzel', serif;
      font-size: 20px;
      font-weight: 600;
      color: #0A0A0A;
      margin: 0 0 6px;
      line-height: 1.3;
    }
    .gift-category {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #71717A;
      margin: 0 0 18px;
      font-weight: 500;
    }
    .gift-img-frame {
      width: 180px;
      height: 180px;
      margin: 0 auto 20px;
      border-radius: 18px;
      background-color: #FFFFFF;
      border: 1px solid #E4E4E7;
      padding: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    }
    .gift-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 12px;
    }
    .btn-luxury {
      display: inline-block;
      background-color: #0A0A0A;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
      margin-top: 10px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      transition: all 0.2s ease;
    }
    .info-box {
      background-color: #FFFFFF;
      border: 1px solid #EAEAEA;
      border-radius: 20px;
      padding: 20px;
      margin: 20px 0;
      font-size: 13px;
      line-height: 1.6;
    }
    .info-box-title {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #71717A;
      font-weight: 600;
      margin-bottom: 8px;
      display: block;
    }
    .event-details-card {
      background-color: #0A0A0A;
      color: #FFFFFF;
      border-radius: 24px;
      padding: 28px 24px;
      margin: 32px 0 20px;
      text-align: center;
    }
    .event-details-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0 0 16px;
      color: #FFFFFF;
    }
    .event-detail-item {
      font-size: 13px;
      color: #D4D4D8;
      margin: 6px 0;
    }
    .event-detail-item strong {
      color: #FFFFFF;
    }
    .footer-section {
      background-color: #FAFAFA;
      border-top: 1px solid #EAEAEA;
      padding: 36px 24px;
      text-align: center;
    }
    .footer-monogram {
      width: 36px;
      height: 36px;
      object-fit: contain;
      margin: 0 auto 12px;
      opacity: 0.85;
      display: block;
    }
    .footer-names {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      letter-spacing: 2px;
      color: #18181B;
      margin: 0 0 6px;
      text-transform: uppercase;
    }
    .footer-tagline {
      font-size: 11px;
      color: #71717A;
      margin: 0 0 14px;
      letter-spacing: 1px;
    }
    .footer-link {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #0A0A0A;
      text-decoration: underline;
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 12px 6px; }
      .email-container { border-radius: 20px; }
      .header-banner { padding: 36px 20px 30px; }
      .header-title { font-size: 26px; }
      .body-content { padding: 28px 20px; }
      .luxury-card { padding: 20px 16px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- HEADER EDITORIAL -->
      <div class="header-banner">
        <img src="${SITE_URL}/monograma_popyn.png" alt="Monograma Naila e Yuri" class="monogram-img" />
        <p class="header-eyebrow">${eyebrow}</p>
        <h1 class="header-title">${title}</h1>
        <p class="header-subtitle">${subtitle}</p>
        <div class="divider-gold"></div>
      </div>

      <!-- CORPO PRINCIPAL -->
      <div class="body-content">
        ${content}
      </div>

      <!-- FOOTER MINIMALISTA -->
      <div class="footer-section">
        <img src="${SITE_URL}/monograma_popyn.png" alt="N&Y" class="footer-monogram" />
        <p class="footer-names">Naila Coutinho & Yuri Martins</p>
        <p class="footer-tagline">Celebrando o início da nossa família ao lado de Cristo</p>
        <a href="${SITE_URL}" target="_blank" class="footer-link">Acessar Site Oficial</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. E-mail de Confirmação Imediata de Reserva de Presente
 */
export async function sendReservationConfirmationEmail({
  personName,
  email,
  giftName,
  giftCategory,
  giftImageUrl,
  purchaseUrl,
  deliveryAddress,
  pixKey,
  pixReceiver,
}: {
  personName: string;
  email: string;
  giftName: string;
  giftCategory?: string | null;
  giftImageUrl?: string | null;
  purchaseUrl?: string | null;
  deliveryAddress?: string | null;
  pixKey?: string | null;
  pixReceiver?: string | null;
}) {
  const content = `
    <h2 class="greeting-script">Olá, ${personName}</h2>
    <p class="lead-text">
      Ficamos profundamente felizes e gratos por você fazer parte deste momento tão sonhado. Confirmamos com muito amor a reserva do seu presente para o nosso <strong>Chá de Panela</strong>!
    </p>

    <!-- CARD DO PRESENTE -->
    <div class="luxury-card">
      <span class="card-badge">Item Reservado</span>
      <h3 class="gift-title">${giftName}</h3>
      ${giftCategory ? `<p class="gift-category">${giftCategory}</p>` : ''}

      ${
        giftImageUrl
          ? `<div class="gift-img-frame">
              <img src="${giftImageUrl}" alt="${giftName}" class="gift-img" />
            </div>`
          : ''
      }

      ${
        purchaseUrl
          ? `<div>
              <a href="${purchaseUrl}" target="_blank" class="btn-luxury">
                Acessar Produto na Loja ↗
              </a>
            </div>`
          : ''
      }
    </div>

    <!-- OPÇÃO DE ENVIO/ENTREGA -->
    ${
      deliveryAddress
        ? `<div class="info-box">
            <span class="info-box-title">📦 Opção de Envio / Entrega</span>
            Você pode levar o presente pessoalmente no dia do evento ou enviar diretamente para o endereço dos noivos:<br>
            <strong style="color: #0A0A0A; display: inline-block; margin-top: 4px;">${deliveryAddress}</strong>
          </div>`
        : ''
    }

    <!-- OPÇÃO PIX -->
    ${
      pixKey
        ? `<div class="info-box">
            <span class="info-box-title">💳 Prefere presentear em dinheiro (PIX)?</span>
            Chave PIX: <code style="background-color: #F4F4F5; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 600; color: #0A0A0A;">${pixKey}</code><br>
            ${pixReceiver ? `Favorecido: <strong>${pixReceiver}</strong>` : ''}
          </div>`
        : ''
    }

    <!-- DETALHES DO EVENTO -->
    <div class="event-details-card">
      <h4 class="event-details-title">Chá de Panela Naila & Yuri</h4>
      <p class="event-detail-item">📅 <strong>Data:</strong> Domingo, 11 de Outubro de 2026</p>
      <p class="event-detail-item">⏰ <strong>Horário:</strong> 13:00 (Início com Almoço Feijoada)</p>
      <p class="event-detail-item">📍 <strong>Local:</strong> ADVEC Templo Auxiliar</p>
      <p class="event-detail-item">🏢 <strong>Endereço:</strong> Rua Montevidéu, 1191 - 4º andar</p>

      <div style="margin-top: 18px;">
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="display: inline-block; background-color: #FFFFFF; color: #0A0A0A; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
          Abrir Rota no Google Maps 📍
        </a>
      </div>
    </div>

    <p style="text-align: center; font-size: 14px; color: #52525B; margin-top: 28px;">
      Estamos ansiosos para celebrar este dia inesquecível com você!
    </p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `🎁 Confirmação de Presente: ${giftName} — Chá de Panela Naila & Yuri`,
    htmlContent: getBaseEmailLayout({
      eyebrow: 'CHÁ DE PANELA',
      title: 'NAILA & YURI',
      subtitle: 'CONFIRMAÇÃO DE RESERVA',
      content,
    }),
  });
}

/**
 * 2. Lembrete: Faltando 7 Dias para o Evento
 */
export async function send7DaysReminderEmail({
  personName,
  email,
  giftName,
  purchaseUrl,
  deliveryAddress,
  pixKey,
  pixReceiver,
}: {
  personName: string;
  email: string;
  giftName: string;
  purchaseUrl?: string | null;
  deliveryAddress?: string | null;
  pixKey?: string | null;
  pixReceiver?: string | null;
}) {
  const content = `
    <h2 class="greeting-script">Olá, ${personName}</h2>
    <p class="lead-text">
      A contagem regressiva começou: <strong>falta exatamente 1 semana</strong> para o nosso <strong>Chá de Panela</strong>!
    </p>

    <p style="font-size: 14px; color: #52525B; line-height: 1.7;">
      Passando com muito amor para lembrar do presente que você escolheu com tanto carinho para o nosso futuro lar:
    </p>

    <!-- CARD DO PRESENTE -->
    <div class="luxury-card">
      <span class="card-badge">Falta 1 Semana</span>
      <h3 class="gift-title">${giftName}</h3>
      <p style="font-size: 13px; color: #52525B; margin: 12px 0 0; line-height: 1.6;">
        Se você ainda não comprou, <strong>ainda dá tempo!</strong> E se você já garantiu ou realizou o PIX, <strong>muito obrigado de coração pelo carinho!</strong> 🙏💖
      </p>

      ${
        purchaseUrl
          ? `<div style="margin-top: 18px;">
              <a href="${purchaseUrl}" target="_blank" class="btn-luxury">
                Acessar Produto na Loja ↗
              </a>
            </div>`
          : ''
      }
    </div>

    ${
      deliveryAddress
        ? `<div class="info-box">
            <span class="info-box-title">📦 Endereço de Entrega dos Noivos</span>
            ${deliveryAddress}
          </div>`
        : ''
    }

    ${
      pixKey
        ? `<div class="info-box">
            <span class="info-box-title">💳 Chave PIX Alternativa</span>
            <code style="background-color: #F4F4F5; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 600; color: #0A0A0A;">${pixKey}</code> (${pixReceiver || 'Naila & Yuri'})
          </div>`
        : ''
    }

    <!-- DETALHES DO EVENTO -->
    <div class="event-details-card">
      <h4 class="event-details-title">Nos Encontraremos em Breve!</h4>
      <p class="event-detail-item">📅 <strong>Data:</strong> Domingo, 11/10/2026 às 13:00</p>
      <p class="event-detail-item">📍 <strong>Local:</strong> ADVEC Templo Auxiliar (Rua Montevidéu, 1191 - 4º andar)</p>
      <div style="margin-top: 16px;">
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="display: inline-block; background-color: #FFFFFF; color: #0A0A0A; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
          Como Chegar no Local 📍
        </a>
      </div>
    </div>

    <p style="text-align: center; font-size: 14px; color: #52525B; margin-top: 24px;">
      Até domingo que vem! Mal podemos esperar para abraçar você.
    </p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `⏰ Falta 1 Semana! Chá de Panela Naila & Yuri — Lembrete do seu presente`,
    htmlContent: getBaseEmailLayout({
      eyebrow: 'CONTAGEM REGRESSIVA',
      title: 'FALTA 1 SEMANA',
      subtitle: 'CHÁ DE PANELA NAILA & YURI',
      content,
    }),
  });
}

/**
 * 3. Lembrete: Faltando 3 Dias para o Evento
 */
export async function send3DaysReminderEmail({
  personName,
  email,
  giftName,
  purchaseUrl,
  deliveryAddress,
  pixKey,
  pixReceiver,
}: {
  personName: string;
  email: string;
  giftName: string;
  purchaseUrl?: string | null;
  deliveryAddress?: string | null;
  pixKey?: string | null;
  pixReceiver?: string | null;
}) {
  const content = `
    <h2 class="greeting-script">Olá, ${personName}</h2>
    <p class="lead-text">
      O coração está acelerado: <strong>faltam apenas 3 dias</strong> para o nosso <strong>Chá de Panela</strong>!
    </p>

    <!-- CARD DO PRESENTE -->
    <div class="luxury-card">
      <span class="card-badge">Faltam 3 Dias</span>
      <h3 class="gift-title">${giftName}</h3>
      <p style="font-size: 13px; color: #52525B; margin: 12px 0 0; line-height: 1.6;">
        Se você já garantiu seu presente ou PIX, nosso <strong>muito obrigado pelo amor e dedicação</strong>! Se ainda não comprou, <strong>ainda dá tempo</strong> de garantir antes da nossa grande festa.
      </p>

      ${
        purchaseUrl
          ? `<div style="margin-top: 18px;">
              <a href="${purchaseUrl}" target="_blank" class="btn-luxury">
                Acessar Produto na Loja ↗
              </a>
            </div>`
          : ''
      }
    </div>

    ${
      pixKey
        ? `<div class="info-box">
            <span class="info-box-title">💳 Chave PIX</span>
            <code style="background-color: #F4F4F5; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 600; color: #0A0A0A;">${pixKey}</code> (${pixReceiver || 'Naila & Yuri'})
          </div>`
        : ''
    }

    <!-- DETALHES DO EVENTO -->
    <div class="event-details-card">
      <h4 class="event-details-title">Anote na sua agenda</h4>
      <p class="event-detail-item">📅 <strong>Data:</strong> Domingo, 11/10/2026 às 13:00</p>
      <p class="event-detail-item">📍 <strong>Local:</strong> ADVEC Templo Auxiliar (Rua Montevidéu, 1191 - 4º andar)</p>
      <div style="margin-top: 16px;">
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="display: inline-block; background-color: #FFFFFF; color: #0A0A0A; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
          Ver Rota no Mapa 📍
        </a>
      </div>
    </div>

    <p style="text-align: center; font-size: 14px; font-weight: 500; color: #18181B; margin-top: 24px;">
      Sua presença tornará o nosso dia perfeito!
    </p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `💖 Faltam apenas 3 Dias! Chá de Panela Naila & Yuri`,
    htmlContent: getBaseEmailLayout({
      eyebrow: 'ÚLTIMOS DIAS',
      title: 'FALTAM 3 DIAS',
      subtitle: 'CHÁ DE PANELA NAILA & YURI',
      content,
    }),
  });
}

/**
 * 4. Lembrete: No Dia do Evento (É Hoje!) — Sem falar de presentes
 */
export async function sendEventDayEmail({
  personName,
  email,
}: {
  personName: string;
  email: string;
}) {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 class="greeting-script" style="font-size: 38px; margin: 0 0 6px;">É Hoje!</h2>
      <p style="font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #71717A; font-weight: 600; margin: 0;">
        O Grande Dia Chegou
      </p>
    </div>

    <p class="lead-text" style="text-align: center;">
      Olá, <strong>${personName}</strong>! Nossos corações estão transbordando de alegria. O grande dia chegou e a sua presença é o nosso maior presente!
    </p>

    <!-- CARD DO EVENTO -->
    <div class="luxury-card" style="background-color: #0A0A0A; color: #FFFFFF; border: none;">
      <span class="card-badge" style="background-color: #FFFFFF; color: #0A0A0A;">Recepção</span>
      <h3 style="font-family: 'Playfair Display', serif; font-size: 22px; margin: 6px 0 16px; color: #FFFFFF; letter-spacing: 1px;">
        Esperamos por Você!
      </h3>
      <p class="event-detail-item" style="font-size: 15px; margin: 8px 0;">⏰ <strong>Horário:</strong> A partir das 13:00</p>
      <p class="event-detail-item" style="font-size: 14px; margin: 8px 0; color: #E4E4E7;">🍲 <strong>Almoço Feijoada Especial</strong></p>
      <p class="event-detail-item" style="font-size: 14px; margin: 8px 0;">📍 <strong>Local:</strong> ADVEC Templo Auxiliar</p>
      <p class="event-detail-item" style="font-size: 14px; margin: 8px 0;">🏢 <strong>Endereço:</strong> Rua Montevidéu, 1191 - 4º andar</p>

      <div style="margin-top: 24px;">
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="display: inline-block; background-color: #FFFFFF; color: #0A0A0A; text-decoration: none; padding: 14px 34px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);">
          Abrir Rota no Google Maps 📍
        </a>
      </div>
    </div>

    <p style="text-align: center; font-size: 15px; color: #27272A; font-weight: 500; margin-top: 28px; line-height: 1.7;">
      Venha com o coração aberto para sorrir, celebrar e viver momentos inesquecíveis conosco!
    </p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `🎉 É HOJE! Esperamos por você no Chá de Panela de Naila & Yuri!`,
    htmlContent: getBaseEmailLayout({
      eyebrow: 'O GRANDE DIA',
      title: 'É HOJE!',
      subtitle: 'DOMINGO, 11 DE OUTUBRO • 13:00',
      content,
    }),
  });
}
