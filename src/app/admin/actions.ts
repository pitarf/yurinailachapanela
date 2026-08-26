'use server';

import { cookies } from 'next/headers';
import {
  saveGiftItem,
  deleteGiftItem,
  bulkDeleteGiftItems,
  bulkUpdateGiftStatusItems,
  cancelGiftReservation,
  reorderGiftsItems,
  sortGiftsAlphabeticallyItems,
  moveGiftItemOrder,
  updateGiftOrderItem,
  updateSystemSettings,
  updateEventDetails,
  saveGalleryPhoto,
  deleteGalleryPhoto,
  saveEventActivity,
  deleteEventActivity,
  createRsvpEntry,
  deleteRsvpEntry,
  getRsvpsData,
  getEventData,
} from '@/lib/json-db';

const SESSION_COOKIE_NAME = 'naila_yuri_admin_session';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yurienaila2026';

// Validação de sessão do administrador
export async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === 'authenticated';
}

// Lógica de Login
export async function login(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 dia
      path: '/admin',
    });
    return { success: true };
  }
  return { success: false, error: 'Senha incorreta. Tente novamente.' };
}

// Lógica de Logout
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

// CRUD Presentes: Criar ou Editar Presente
export async function saveGift(formData: {
  id?: string;
  name: string;
  description?: string;
  price?: number | null;
  category: string;
  purchaseUrl?: string;
  imageUrl?: string;
  status?: any;
}) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return saveGiftItem(formData);
}

// Excluir Presente
export async function deleteGift(id: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return deleteGiftItem(id);
}

// Cancelar Reserva (Liberar Presente)
export async function cancelReservation(giftId: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return cancelGiftReservation(giftId);
}

// Reenviar E-mail de Confirmação Manualmente
export async function resendReservationEmail(giftId: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }

  const { getGiftsData, getSystemSettings } = await import('@/lib/json-db');
  const { sendReservationConfirmationEmail } = await import('@/services/brevo');

  const gifts = (await getGiftsData()) as any[];
  const gift = gifts.find((g: any) => g.id === giftId);

  if (!gift || !gift.reservation) {
    return { success: false, error: 'Reserva não encontrada para este presente.' };
  }

  const settings = await getSystemSettings();

  const sendResult = await sendReservationConfirmationEmail({
    personName: gift.reservation.personName,
    email: gift.reservation.email,
    giftName: gift.name,
    giftCategory: gift.category,
    giftImageUrl: gift.imageUrl,
    purchaseUrl: gift.purchaseUrl,
    deliveryAddress: settings?.deliveryAddress,
    pixKey: settings?.pixKey,
    pixReceiver: settings?.pixReceiver,
  });

  if (!sendResult.success) {
    return { success: false, error: sendResult.error || 'Erro ao disparar e-mail via Brevo.' };
  }

  return { success: true, messageId: sendResult.messageId };
}

// Salvar Configurações Globais (Endereço, PIX, SEO, Textos)
export async function saveSettings(formData: {
  coupleNames?: string;
  siteTitle?: string;
  siteDescription?: string;
  siteKeywords?: string;
  deliveryAddress?: string;
  pixKey?: string;
  pixReceiver?: string;
  pixCity?: string;
  showPrices?: boolean;
  historyText?: string;
}) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return updateSystemSettings(formData);
}

// Excluir produtos em massa
export async function bulkDeleteGifts(ids: string[]) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return bulkDeleteGiftItems(ids);
}

// Atualizar status dos produtos em massa
export async function bulkUpdateGiftStatus(ids: string[], status: 'AVAILABLE' | 'RESERVED') {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return bulkUpdateGiftStatusItems(ids, status);
}

// Reordenar Lista de Presentes por IDs
export async function reorderGifts(orderedIds: string[]) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return reorderGiftsItems(orderedIds);
}

// Ordenar Todos os Presentes em Ordem Alfabética (A-Z)
export async function sortGiftsAlphabetically() {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return sortGiftsAlphabeticallyItems();
}

// Mover Presente para Cima ou para Baixo na Ordem
export async function moveGiftOrder(giftId: string, direction: 'up' | 'down') {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return moveGiftItemOrder(giftId, direction);
}

// Atualizar Número de Ordem Personalizado de um Presente
export async function updateGiftCustomOrder(giftId: string, newOrder: number) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return updateGiftOrderItem(giftId, newOrder);
}

// Salvar Informações do Evento
export async function saveEvent(formData: {
  title: string;
  date: string;
  time?: string;
  location?: string;
  address?: string;
  mapsUrl?: string;
  description?: string;
}) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return updateEventDetails(formData);
}

// Salvar / Adicionar Foto na Galeria
export async function savePhoto(formData: {
  id?: string;
  url: string;
  caption?: string;
  isHero?: boolean;
}) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return saveGalleryPhoto(formData);
}

// Excluir Foto da Galeria
export async function deletePhoto(id: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return deleteGalleryPhoto(id);
}

// Salvar / Criar / Editar Atividade da Programação
export async function saveActivity(formData: {
  id?: string;
  title: string;
  description?: string;
  time?: string;
  order?: number;
}) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return saveEventActivity(formData);
}

// Excluir Atividade da Programação
export async function deleteActivity(id: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return deleteEventActivity(id);
}

// Submeter Confirmação de Presença (RSVP)
export async function submitRsvp(formData: {
  name: string;
  email: string;
  hasCompanion: boolean;
  companionCount: number;
  companionNames?: string;
  notes?: string;
}) {
  if (!formData.name?.trim() || !formData.email?.trim()) {
    return { success: false, error: 'Nome e e-mail são obrigatórios.' };
  }

  const { sendRsvpConfirmationEmail } = await import('@/services/brevo');
  const event = await getEventData();

  const rsvpResult = await createRsvpEntry(formData);

  const eventDateFormatted = event?.date
    ? new Date(event.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Domingo, 11/10/2026';

  // Disparo assíncrono de e-mail de confirmação sem travar resposta caso a chave não esteja ativa
  try {
    await sendRsvpConfirmationEmail({
      name: formData.name,
      email: formData.email,
      hasCompanion: formData.hasCompanion,
      companionCount: formData.companionCount,
      companionNames: formData.companionNames,
      notes: formData.notes,
      eventDate: eventDateFormatted,
      eventTime: event?.time || '13:00',
      eventLocation: event?.location || 'ADVEC Templo Auxiliar',
      eventAddress: event?.address || 'Rua Montevidéu, 1191 - 4º andar.',
      eventMapsUrl: event?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
    });
  } catch (err: any) {
    console.warn('Aviso: E-mail de confirmação RSVP não pôde ser enviado imediatamente:', err?.message);
  }

  return { success: true, rsvp: rsvpResult.rsvp };
}

// Excluir Confirmação de Presença
export async function deleteRsvp(id: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }
  return deleteRsvpEntry(id);
}

// Reenviar E-mail de Confirmação de Presença
export async function resendRsvpEmail(rsvpId: string) {
  if (!(await isAdmin())) {
    throw new Error('Não autorizado');
  }

  const rsvps = (await getRsvpsData()) as any[];
  const rsvp = rsvps.find((r: any) => r.id === rsvpId);

  if (!rsvp) {
    return { success: false, error: 'Confirmação de presença não encontrada.' };
  }

  const { sendRsvpConfirmationEmail } = await import('@/services/brevo');
  const event = await getEventData();

  const eventDateFormatted = event?.date
    ? new Date(event.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Domingo, 11/10/2026';

  const sendResult = await sendRsvpConfirmationEmail({
    name: rsvp.name,
    email: rsvp.email,
    hasCompanion: rsvp.hasCompanion,
    companionCount: rsvp.companionCount,
    companionNames: rsvp.companionNames,
    notes: rsvp.notes,
    eventDate: eventDateFormatted,
    eventTime: event?.time || '13:00',
    eventLocation: event?.location || 'ADVEC Templo Auxiliar',
    eventAddress: event?.address || 'Rua Montevidéu, 1191 - 4º andar.',
    eventMapsUrl: event?.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
  });

  if (!sendResult.success) {
    return { success: false, error: sendResult.error || 'Erro ao reenviar e-mail via Brevo.' };
  }

  return { success: true, messageId: sendResult.messageId };
}
