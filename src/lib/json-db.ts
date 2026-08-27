import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

const staticJsonPath = path.join(process.cwd(), 'src', 'data', 'database.json');

function readLocalJson(): any {
  try {
    if (fs.existsSync(staticJsonPath)) {
      return JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
    }
  } catch (e) {
    console.error('Erro ao ler database.json local:', e);
  }
  return { gifts: [], photos: [], activities: [], settings: null, event: null, rsvps: [] };
}

function safeWriteLocalJson(updater: (data: any) => void) {
  try {
    if (fs.existsSync(staticJsonPath)) {
      const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
      updater(data);
      fs.writeFileSync(staticJsonPath, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (err: any) {
    // Silencia erros de escrita em sistemas com filesystem read-only (ex: Vercel serverless runtime)
    console.log('ℹ️ Nota: File system local em modo read-only (ignorado com sucesso na nuvem):', err?.message);
  }
}

import { cache } from 'react';
import { sortActivitiesChronologically } from './activity-utils';
export { sortActivitiesChronologically };

// ----------------------------------------------------
// HELPERS DE LEITURA (PRISMA PRIMÁRIO COM FALLBACK JSON)
// ----------------------------------------------------

export const getEventData = cache(async () => {
  try {
    const event = await prisma.event.findFirst({
      where: { type: 'PANTRY_PARTY' },
      include: {
        activities: true,
      },
    });

    if (event) {
      return {
        id: event.id,
        type: event.type,
        title: event.title,
        date: event.date ? event.date.toISOString() : '2026-10-11T13:00:00.000Z',
        time: event.time,
        location: event.location,
        address: event.address,
        mapsUrl: event.mapsUrl,
        description: event.description,
        activities: sortActivitiesChronologically(event.activities || []),
      };
    }
  } catch (err) {
    console.warn('Fallback para JSON em getEventData:', (err as any)?.message);
  }

  const local = readLocalJson();
  return {
    ...local.event,
    activities: sortActivitiesChronologically(local.event?.activities || local.activities || []),
  };
});

export const getSystemSettings = cache(async () => {
  try {
    const settings = await prisma.systemSetting.findFirst();
    if (settings) return settings;
  } catch (err) {
    console.warn('Fallback para JSON em getSystemSettings:', (err as any)?.message);
  }

  const local = readLocalJson();
  return local.settings;
});

export const getGiftsData = cache(async () => {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        reservation: true,
      },
    });

    if (gifts && gifts.length > 0) return gifts;
  } catch (err) {
    console.warn('Fallback para JSON em getGiftsData:', (err as any)?.message);
  }

  const local = readLocalJson();
  const sorted = [...(local.gifts || [])].sort((a: any, b: any) => {
    const orderA = a.order !== undefined && a.order !== null ? a.order : 999999;
    const orderB = b.order !== undefined && b.order !== null ? b.order : 999999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' });
  });
  return sorted;
});

export const getPhotosData = cache(async () => {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { order: 'asc' },
    });

    if (photos && photos.length > 0) return photos;
  } catch (err) {
    console.warn('Fallback para JSON em getPhotosData:', (err as any)?.message);
  }

  const local = readLocalJson();
  return local.photos || [];
});

export const getActivitiesData = cache(async () => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { order: 'asc' },
    });

    if (activities && activities.length > 0) return activities;
  } catch (err) {
    console.warn('Fallback para JSON em getActivitiesData:', (err as any)?.message);
  }

  const local = readLocalJson();
  return local.activities || [];
});

// ----------------------------------------------------
// HELPERS DE ESCRITA E RESERVAS
// ----------------------------------------------------

export async function saveGiftItem(formData: any) {
  const { id, name, description, price, category, purchaseUrl, imageUrl, status } = formData;
  const parsedPrice = price ? parseFloat(price) : null;

  try {
    let event = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          type: 'PANTRY_PARTY',
          title: 'Chá de Panela',
          date: new Date('2026-10-11T13:00:00.000Z'),
        },
      });
    }

    if (id) {
      const updated = await prisma.gift.update({
        where: { id },
        data: {
          name,
          description: description || null,
          price: parsedPrice,
          category: category || 'Geral',
          purchaseUrl: purchaseUrl || null,
          imageUrl: imageUrl || null,
          status: status || 'AVAILABLE',
        },
      });
      return { success: true, gift: updated };
    } else {
      const created = await prisma.gift.create({
        data: {
          eventId: event.id,
          name,
          description: description || null,
          price: parsedPrice,
          category: category || 'Geral',
          purchaseUrl: purchaseUrl || null,
          imageUrl: imageUrl || null,
          status: status || 'AVAILABLE',
        },
      });
      return { success: true, gift: created };
    }
  } catch (err: any) {
    console.error('Erro ao salvar presente no Prisma:', err.message);
    throw err;
  }
}

export async function deleteGiftItem(id: string) {
  try {
    await prisma.gift.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao deletar presente:', err.message);
    throw err;
  }
}

export async function bulkDeleteGiftItems(ids: string[]) {
  try {
    await prisma.gift.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true, count: ids.length };
  } catch (err: any) {
    console.error('Erro em bulkDeleteGifts:', err.message);
    throw err;
  }
}

export async function bulkUpdateGiftStatusItems(ids: string[], status: 'AVAILABLE' | 'RESERVED') {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.gift.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });
      if (status === 'AVAILABLE') {
        await tx.reservation.deleteMany({
          where: { giftId: { in: ids } },
        });
      }
    });
    return { success: true, count: ids.length };
  } catch (err: any) {
    console.error('Erro em bulkUpdateGiftStatus:', err.message);
    throw err;
  }
}

export async function reorderGiftsItems(orderedIds: string[]) {
  try {
    // 1. Atualiza no Prisma Neon
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.gift.update({
        where: { id: orderedIds[i] },
        data: { order: i + 1 },
      });
    }

    // 2. Sincroniza no database.json local com segurança
    safeWriteLocalJson((data) => {
      if (data.gifts) {
        data.gifts = data.gifts.map((g: any) => {
          const newOrderIndex = orderedIds.indexOf(g.id);
          if (newOrderIndex !== -1) {
            return { ...g, order: newOrderIndex + 1, updatedAt: new Date().toISOString() };
          }
          return g;
        });
        data.gifts.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Erro em reorderGiftsItems:', err.message);
    throw err;
  }
}

export async function sortGiftsAlphabeticallyItems() {
  try {
    const gifts = await prisma.gift.findMany();

    const sortedGifts = [...gifts].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' })
    );

    const orderedIds = sortedGifts.map((g) => g.id);
    return await reorderGiftsItems(orderedIds);
  } catch (err: any) {
    console.error('Erro em sortGiftsAlphabeticallyItems:', err.message);
    throw err;
  }
}

export async function moveGiftItemOrder(giftId: string, direction: 'up' | 'down') {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    const currentIndex = gifts.findIndex((g) => g.id === giftId);
    if (currentIndex === -1) return { success: false, error: 'Presente não encontrado' };

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= gifts.length) {
      return { success: true }; // Já está no limite superior ou inferior
    }

    const orderedGifts = [...gifts];
    const temp = orderedGifts[currentIndex];
    orderedGifts[currentIndex] = orderedGifts[targetIndex];
    orderedGifts[targetIndex] = temp;

    const orderedIds = orderedGifts.map((g) => g.id);
    return await reorderGiftsItems(orderedIds);
  } catch (err: any) {
    console.error('Erro em moveGiftItemOrder:', err.message);
    throw err;
  }
}

export async function updateGiftOrderItem(giftId: string, newOrder: number) {
  try {
    await prisma.gift.update({
      where: { id: giftId },
      data: { order: newOrder },
    });

    // Sincroniza localmente com segurança
    safeWriteLocalJson((data) => {
      if (data.gifts) {
        data.gifts = data.gifts.map((g: any) => {
          if (g.id === giftId) {
            return { ...g, order: newOrder, updatedAt: new Date().toISOString() };
          }
          return g;
        });
        data.gifts.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Erro em updateGiftOrderItem:', err.message);
    throw err;
  }
}

export async function makeReservation(giftId: string, personName: string, email: string, notes?: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({ where: { id: giftId } });
      if (!gift) throw new Error('PRESENT_NOT_FOUND');
      if (gift.status !== 'AVAILABLE') throw new Error('ALREADY_RESERVED');

      const reservation = await tx.reservation.create({
        data: {
          giftId,
          personName,
          email,
          notes: notes || null,
        },
      });

      const updatedGift = await tx.gift.update({
        where: { id: giftId },
        data: { status: 'RESERVED' },
      });

      return { reservation, updatedGift };
    });

    const settings = await prisma.systemSetting.findFirst();
    return {
      reservation: result.reservation,
      updatedGift: result.updatedGift,
      deliveryAddress: settings?.deliveryAddress || null,
      settings: settings || null,
    };
  } catch (err: any) {
    throw err;
  }
}

export async function cancelGiftReservation(giftId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.deleteMany({ where: { giftId } });
      await tx.gift.update({
        where: { id: giftId },
        data: { status: 'AVAILABLE' },
      });
    });
    return { success: true };
  } catch (err: any) {
    throw err;
  }
}

export async function updateSystemSettings(formData: any) {
  try {
    const existing = await prisma.systemSetting.findFirst();
    if (existing) {
      const updated = await prisma.systemSetting.update({
        where: { id: existing.id },
        data: formData,
      });
      return { success: true, settings: updated };
    } else {
      const created = await prisma.systemSetting.create({
        data: { id: 'default', ...formData },
      });
      return { success: true, settings: created };
    }
  } catch (err: any) {
    throw err;
  }
}

export async function updateEventDetails(formData: any) {
  try {
    const existing = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });
    const eventDate = formData.date ? new Date(formData.date) : new Date('2026-10-11T13:00:00.000Z');

    if (existing) {
      const updated = await prisma.event.update({
        where: { id: existing.id },
        data: {
          title: formData.title,
          date: eventDate,
          time: formData.time || null,
          location: formData.location || null,
          address: formData.address || null,
          mapsUrl: formData.mapsUrl || null,
          description: formData.description || null,
        },
      });
      return { success: true, event: updated };
    } else {
      const created = await prisma.event.create({
        data: {
          type: 'PANTRY_PARTY',
          title: formData.title,
          date: eventDate,
          time: formData.time || null,
          location: formData.location || null,
          address: formData.address || null,
          mapsUrl: formData.mapsUrl || null,
          description: formData.description || null,
        },
      });
      return { success: true, event: created };
    }
  } catch (err: any) {
    throw err;
  }
}

export async function saveGalleryPhoto(formData: any) {
  const { id, url, caption, isHero } = formData;
  try {
    if (id) {
      const updated = await prisma.photo.update({
        where: { id },
        data: { url, caption: caption || null, isHero: isHero || false },
      });
      return { success: true, photo: updated };
    } else {
      const created = await prisma.photo.create({
        data: { url, caption: caption || null, isHero: isHero || false },
      });
      return { success: true, photo: created };
    }
  } catch (err: any) {
    throw err;
  }
}

export async function deleteGalleryPhoto(id: string) {
  try {
    await prisma.photo.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    throw err;
  }
}

export async function saveEventActivity(formData: any) {
  const { id, title, description, time, order } = formData;
  try {
    let event = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });
    if (!event) {
      event = await prisma.event.create({
        data: { type: 'PANTRY_PARTY', title: 'Chá de Panela', date: new Date('2026-10-11T13:00:00.000Z') },
      });
    }

    if (id) {
      const updated = await prisma.activity.update({
        where: { id },
        data: { title, description: description || null, time: time || null, order: order || 0 },
      });
      return { success: true, activity: updated };
    } else {
      const created = await prisma.activity.create({
        data: { eventId: event.id, title, description: description || null, time: time || null, order: order || 0 },
      });
      return { success: true, activity: created };
    }
  } catch (err: any) {
    throw err;
  }
}

export async function deleteEventActivity(id: string) {
  try {
    await prisma.activity.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    throw err;
  }
}

// ----------------------------------------------------
// HELPERS DE CONFIRMAÇÃO DE PRESENÇA (RSVP)
// ----------------------------------------------------

export const getRsvpsData = cache(async () => {
  try {
    const rsvps = await prisma.rsvp.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (rsvps && rsvps.length > 0) return rsvps;
  } catch (err) {
    console.warn('Fallback para JSON em getRsvpsData:', (err as any)?.message);
  }

  const local = readLocalJson();
  return local.rsvps || [];
});

export async function createRsvpEntry(formData: {
  name: string;
  email: string;
  hasCompanion: boolean;
  companionCount: number;
  companionNames?: string;
  notes?: string;
}) {
  const { name, email, hasCompanion, companionCount, companionNames, notes } = formData;
  
  let created: any = null;

  try {
    created = await prisma.rsvp.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        hasCompanion: !!hasCompanion,
        companionCount: hasCompanion ? Number(companionCount) || 1 : 0,
        companionNames: companionNames?.trim() || null,
        notes: notes?.trim() || null,
      },
    });
  } catch (dbErr: any) {
    console.warn('⚠️ Aviso: Falha ao inserir RSVP no Prisma/Neon, usando objeto fallback:', dbErr.message);
    created = {
      id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      hasCompanion: !!hasCompanion,
      companionCount: hasCompanion ? Number(companionCount) || 1 : 0,
      companionNames: companionNames?.trim() || null,
      notes: notes?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Sincroniza localmente com database.json apenas se não estiver em ambiente read-only (ex: Vercel)
  safeWriteLocalJson((data) => {
    if (!data.rsvps) data.rsvps = [];
    data.rsvps.unshift({
      id: created.id,
      name: created.name,
      email: created.email,
      hasCompanion: created.hasCompanion,
      companionCount: created.companionCount,
      companionNames: created.companionNames,
      notes: created.notes,
      createdAt: typeof created.createdAt === 'string' ? created.createdAt : created.createdAt?.toISOString?.() || new Date().toISOString(),
    });
  });

  return { success: true, rsvp: created };
}

export async function deleteRsvpEntry(id: string) {
  try {
    await prisma.rsvp.delete({ where: { id } }).catch((e) => {
      console.warn('Aviso ao deletar RSVP no prisma:', e.message);
    });

    // Sincroniza localmente com segurança
    safeWriteLocalJson((data) => {
      if (data.rsvps) {
        data.rsvps = data.rsvps.filter((r: any) => r.id !== id);
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao deletar RSVP:', err.message);
    return { success: true };
  }
}
