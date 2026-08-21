/**
 * Serviço de Envio de E-mails Transacionais via Brevo (Sendinblue) API v3
 */

interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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
// TEMPLATES DE E-MAIL EM HTML DE ALTA COSTURA (RESPONSIVOS & ELEGANTES)
// ----------------------------------------------------------------------

function getBaseEmailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Naila & Yuri | Chá de Panela</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
    .container { max-width: 580px; margin: 24px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8ea; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
    .header { background-color: #0a0a0a; color: #ffffff; padding: 36px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; font-family: Didot, 'Bodoni MT', 'Cinzel', serif; }
    .header p { margin: 6px 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #a1a1aa; font-weight: 400; }
    .body-content { padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #333333; }
    .card { background-color: #fafafa; border: 1px solid #eeeeef; border-radius: 16px; padding: 20px; margin: 24px 0; }
    .btn { display: inline-block; background-color: #0a0a0a; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-top: 12px; }
    .footer { background-color: #fcfcfc; border-top: 1px solid #eeeeef; padding: 24px; text-align: center; font-size: 11px; color: #8c8c94; line-height: 1.5; }
    .tag { display: inline-block; padding: 4px 10px; background-color: #f4f4f5; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin-bottom: 8px; }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; border: none; }
      .body-content { padding: 24px 16px; }
    }
  </style>
</head>
<body>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f8; padding: 12px 0;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <h1>Naila & Yuri</h1>
            <p>Chá de Panela • 11 de Outubro de 2026</p>
          </div>
          <div class="body-content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Com muito amor e carinho,</p>
            <p style="margin: 0 0 16px; font-weight: 600; color: #18181b;">Naila Coutinho & Yuri Martins</p>
            <p style="margin: 0; font-size: 10px; color: #a1a1aa;">ADVEC Templo Auxiliar • Rua Montevidéu, 1191 - 4º andar • 13:00</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
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
    <p style="font-size: 16px; margin-top: 0;">Olá, <strong>${personName}</strong>! 💖</p>
    <p>Ficamos imensamente felizes e gratos pelo seu carinho em reservar um presente para o nosso <strong>Chá de Panela</strong>!</p>
    
    <div class="card">
      <span class="tag">🎁 Presente Escolhido</span>
      <h3 style="margin: 6px 0 4px; font-size: 18px; color: #0a0a0a;">${giftName}</h3>
      ${giftCategory ? `<p style="margin: 0 0 12px; font-size: 12px; color: #71717a;">Categoria: ${giftCategory}</p>` : ''}
      
      ${
        giftImageUrl
          ? `<div style="text-align: center; margin: 16px 0;">
              <img src="${giftImageUrl}" alt="${giftName}" style="max-width: 220px; max-height: 220px; object-fit: contain; border-radius: 12px; border: 1px solid #e4e4e7; background: #ffffff; padding: 4px;" />
            </div>`
          : ''
      }

      ${
        purchaseUrl
          ? `<div style="text-align: center; margin-top: 14px;">
              <a href="${purchaseUrl}" target="_blank" class="btn">Comprar Produto na Loja</a>
            </div>`
          : ''
      }
    </div>

    ${
      deliveryAddress
        ? `<div style="background-color: #fdfdfd; border-left: 3px solid #0a0a0a; padding: 12px 16px; margin: 20px 0; font-size: 13px;">
            <strong>📦 Opção de Envio / Entrega:</strong><br>
            Você pode levar o presente no dia do evento ou enviar diretamente para o endereço dos noivos:<br>
            <span style="color: #4b5563;">${deliveryAddress}</span>
          </div>`
        : ''
    }

    ${
      pixKey
        ? `<div style="background-color: #fdfdfd; border-left: 3px solid #0a0a0a; padding: 12px 16px; margin: 20px 0; font-size: 13px;">
            <strong>💳 Prefere presentear em dinheiro (PIX)?</strong><br>
            Chave PIX: <code style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${pixKey}</code><br>
            ${pixReceiver ? `Favorecido: <strong>${pixReceiver}</strong>` : ''}
          </div>`
        : ''
    }

    <div style="margin-top: 24px; padding: 16px; background-color: #fafafa; border-radius: 12px; font-size: 13px;">
      <strong>📅 Informações do Evento:</strong><br>
      • <strong>Data:</strong> Domingo, 11 de Outubro de 2026<br>
      • <strong>Horário:</strong> A partir das 13:00 (Almoço Feijoada)<br>
      • <strong>Local:</strong> ADVEC Templo Auxiliar (Rua Montevidéu, 1191 - 4º andar)<br>
      • <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="color: #0a0a0a; font-weight: 600;">Ver localização no Google Maps</a>
    </div>

    <p style="margin-top: 24px; font-size: 14px; text-align: center;">Estamos preparando cada detalhe com muito amor e mal podemos esperar para celebrar com você!</p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `🎁 Confirmação de Presente: ${giftName} — Chá de Panela Naila & Yuri`,
    htmlContent: getBaseEmailLayout(content),
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
    <p style="font-size: 16px; margin-top: 0;">Olá, <strong>${personName}</strong>! ⏰✨</p>
    <p>A contagem regressiva começou: <strong>falta exatamente 1 semana</strong> para o nosso <strong>Chá de Panela</strong>!</p>
    
    <p>Passando com muito carinho para lembrar do presente que você escolheu com tanto amor:</p>

    <div class="card">
      <span class="tag">🎁 Seu Presente Escolhido</span>
      <h3 style="margin: 6px 0 10px; font-size: 18px; color: #0a0a0a;">${giftName}</h3>
      <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.5;">
        Se você ainda não comprou, <strong>ainda dá tempo!</strong> E se você já comprou ou realizou o PIX, <strong>muito obrigado de coração pelo carinho!</strong> 🙏💖
      </p>

      ${
        purchaseUrl
          ? `<div style="text-align: center; margin-top: 16px;">
              <a href="${purchaseUrl}" target="_blank" class="btn">Link do Produto na Loja</a>
            </div>`
          : ''
      }
    </div>

    ${
      deliveryAddress
        ? `<div style="background-color: #fdfdfd; border-left: 3px solid #0a0a0a; padding: 12px 16px; margin: 16px 0; font-size: 12px;">
            <strong>📦 Endereço de Entrega dos Noivos:</strong><br>
            ${deliveryAddress}
          </div>`
        : ''
    }

    ${
      pixKey
        ? `<div style="background-color: #fdfdfd; border-left: 3px solid #0a0a0a; padding: 12px 16px; margin: 16px 0; font-size: 12px;">
            <strong>💳 Chave PIX:</strong> <code style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px;">${pixKey}</code> (${pixReceiver || 'Naila & Yuri'})
          </div>`
        : ''
    }

    <div style="margin-top: 24px; padding: 16px; background-color: #fafafa; border-radius: 12px; font-size: 13px;">
      <strong>📅 Detalhes do Encontro:</strong><br>
      • <strong>Data:</strong> Domingo, 11 de Outubro de 2026 às 13:00<br>
      • <strong>Local:</strong> ADVEC Templo Auxiliar (Rua Montevidéu, 1191 - 4º andar)<br>
      • <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="color: #0a0a0a; font-weight: 600;">Abrir no Google Maps</a>
    </div>

    <p style="margin-top: 24px; text-align: center; font-size: 14px;">Nos vemos no domingo que vem! 🎉</p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `⏰ Falta 1 Semana! Chá de Panela Naila & Yuri — Lembrete do seu presente`,
    htmlContent: getBaseEmailLayout(content),
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
    <p style="font-size: 16px; margin-top: 0;">Olá, <strong>${personName}</strong>! 💖</p>
    <p>O coração está a mil: <strong>faltam apenas 3 dias</strong> para o nosso <strong>Chá de Panela</strong>!</p>
    
    <div class="card">
      <span class="tag">🎁 Seu Presente</span>
      <h3 style="margin: 6px 0 10px; font-size: 18px; color: #0a0a0a;">${giftName}</h3>
      <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.5;">
        Se você já garantiu seu presente ou PIX, nosso <strong>muito obrigado pelo amor e dedicação</strong>! Se ainda não comprou, <strong>ainda dá tempo de garantir</strong> para estarmos juntos nessa festa!
      </p>

      ${
        purchaseUrl
          ? `<div style="text-align: center; margin-top: 14px;">
              <a href="${purchaseUrl}" target="_blank" class="btn">Acessar Loja</a>
            </div>`
          : ''
      }
    </div>

    ${
      pixKey
        ? `<div style="background-color: #fdfdfd; border-left: 3px solid #0a0a0a; padding: 12px 16px; margin: 16px 0; font-size: 12px;">
            <strong>💳 Chave PIX alternativa:</strong> <code style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px;">${pixKey}</code> (${pixReceiver || 'Naila & Yuri'})
          </div>`
        : ''
    }

    <div style="margin-top: 20px; padding: 16px; background-color: #fafafa; border-radius: 12px; font-size: 13px;">
      <strong>📅 Anote na sua agenda:</strong><br>
      • <strong>Data:</strong> Domingo, 11/10/2026 às 13:00<br>
      • <strong>Local:</strong> ADVEC Templo Auxiliar (Rua Montevidéu, 1191 - 4º andar)<br>
      • <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" style="color: #0a0a0a; font-weight: 600;">Ver mapa e rota</a>
    </div>

    <p style="margin-top: 24px; text-align: center; font-size: 14px; font-weight: 500;">Contamos com sua presença para viver esse momento inesquecível!</p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `💖 Faltam apenas 3 Dias! Chá de Panela Naila & Yuri`,
    htmlContent: getBaseEmailLayout(content),
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
    <div style="text-align: center; margin-bottom: 20px;">
      <span class="tag" style="background-color: #0a0a0a; color: #ffffff;">🎉 O GRANDE DIA CHEGOU!</span>
      <h2 style="font-size: 24px; margin: 12px 0 6px; font-weight: 300; font-family: Didot, 'Bodoni MT', 'Cinzel', serif;">É HOJE!</h2>
    </div>

    <p style="font-size: 16px; margin-top: 0; text-align: center;">Olá, <strong>${personName}</strong>! Nossos corações estão transbordando de alegria!</p>
    <p style="text-align: center; color: #52525b; font-size: 14px;">Hoje é o dia de celebrarmos o início da nossa família e a presença de vocês é o nosso maior presente!</p>
    
    <div class="card" style="text-align: center;">
      <h3 style="margin: 0 0 12px; font-size: 18px; color: #0a0a0a;">Esperamos por você!</h3>
      <p style="margin: 6px 0; font-size: 15px;">⏰ <strong>Horário de Início:</strong> 13:00</p>
      <p style="margin: 6px 0; font-size: 14px; color: #4b5563;">🍲 <strong>Recepção com Almoço Feijoada</strong></p>
      <p style="margin: 6px 0; font-size: 14px;">📍 <strong>Local:</strong> ADVEC Templo Auxiliar</p>
      <p style="margin: 6px 0; font-size: 14px;">🏢 <strong>Endereço:</strong> Rua Montevidéu, 1191 - 4º andar</p>

      <div style="margin-top: 20px;">
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191" target="_blank" class="btn">
          Abrir Rota no Google Maps 📍
        </a>
      </div>
    </div>

    <p style="margin-top: 24px; text-align: center; font-size: 15px; font-weight: 500;">Venha com o coração aberto para rir, celebrar e viver um dia maravilhoso conosco!</p>
  `;

  return await sendBrevoEmail({
    to: [{ email, name: personName }],
    subject: `🎉 É HOJE! Esperamos por você no Chá de Panela de Naila & Yuri!`,
    htmlContent: getBaseEmailLayout(content),
  });
}
