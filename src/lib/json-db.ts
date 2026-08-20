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
  return { gifts: [], photos: [], activities: [], settings: null, event: null };
}

// ----------------------------------------------------
// HELPERS DE LEITURA (PRISMA PRIMÁRIO COM FALLBACK JSON)
// ----------------------------------------------------

export async function getEventData() {
  try {
    const event = await prisma.event.findFirst({
      where: { type: 'PANTRY_PARTY' },
      include: {
        activities: {
          orderBy: { order: 'asc' },
        },
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
        activities: event.activities || [],
      };
    }
  } catch (err) {
    console.warn('Fallback para JSON em getEventData:', (err as any)?.message);
  }

  const local = readLocalJson();
  return {
    ...local.event,
    activities: local.activities || [],
  };
}

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findFirst();
    if (settings) return settings;
  } catch (err) {
    console.warn('Fallback para JSON em getSystemSettings:', (err as any)?.message);
  }

  const local = readLocalJson();
  return local.settings;
}

export async function getGiftsData() {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { order: 'asc' },
      include: {
        reservation: true,
      },
    });

    if (gifts && gifts.length > 0) return gifts;
  } catch (err) {
    console.warn('Fallback para JSON em getGiftsData:', (err as any)?.message);
  }

  const local = readLocalJson();
  return local.gifts || [];
}

export async function getPhotosData() {
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
}

export async function getActivitiesData() {
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
}

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
