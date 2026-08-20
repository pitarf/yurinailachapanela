'use server';

import { cookies } from 'next/headers';
import {
  saveGiftItem,
  deleteGiftItem,
  bulkDeleteGiftItems,
  bulkUpdateGiftStatusItems,
  cancelGiftReservation,
  updateSystemSettings,
  updateEventDetails,
  saveGalleryPhoto,
  deleteGalleryPhoto,
  saveEventActivity,
  deleteEventActivity,
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
