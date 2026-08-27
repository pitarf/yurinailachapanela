import { prisma } from './prisma';
import { cache } from 'react';
import { sortActivitiesChronologically } from './activity-utils';

export { sortActivitiesChronologically };

// ----------------------------------------------------
// CONSULTAS DE LEITURA (100% NEON POSTGRESQL)
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
  } catch (err: any) {
    console.error('Erro ao buscar dados do evento no banco:', err?.message);
  }

  return {
    id: 'default_event',
    type: 'PANTRY_PARTY',
    title: 'Chá de Panela Naila & Yuri',
    date: '2026-10-11T13:00:00.000Z',
    time: '13:00',
    location: 'ADVEC Templo Auxiliar',
    address: 'Rua Montevidéu, 1191 - 4º andar.',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
    description: 'Estamos preparando cada detalhe com muito amor para celebrar essa nova fase das nossas vidas com vocês!',
    activities: [],
  };
});

export const getSystemSettings = cache(async () => {
  try {
    const settings = await prisma.systemSetting.findFirst();
    if (settings) return settings;
  } catch (err: any) {
    console.error('Erro ao buscar configurações no banco:', err?.message);
  }

  return {
    id: 'default_settings',
    coupleNames: 'Naila & Yuri',
    siteTitle: 'Naila & Yuri | Chá de Panela',
    siteDescription: 'Seja bem-vindo ao site de Chá de Panela e futura celebração de casamento de Naila & Yuri.',
    siteKeywords: 'Naila, Yuri, Chá de Panela, Casamento',
    faviconUrl: '/monograma_popyn.png',
    ogImageUrl: '/pre-wedding/DSC01267.webp',
    historyText: null,
    welcomeMessage: null,
    pixKey: '21991344006',
    pixReceiver: 'Yuri Nogueira',
    pixCity: 'Rio de Janeiro',
    deliveryAddress: 'Rua Montevidéu, 1191 - 4º andar - Penha, Rio de Janeiro - RJ',
    showPrices: false,
  };
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
  } catch (err: any) {
    console.error('Erro ao buscar presentes no banco:', err?.message);
  }

  return [];
});

export const getPhotosData = cache(async () => {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { order: 'asc' },
    });

    if (photos && photos.length > 0) return photos;
  } catch (err: any) {
    console.error('Erro ao buscar fotos no banco:', err?.message);
  }

  return [];
});

export const getRsvpsData = cache(async () => {
  try {
    const rsvps = await prisma.rsvp.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (rsvps) return rsvps;
  } catch (err: any) {
    console.error('Erro ao buscar presenças no banco:', err?.message);
  }

  return [];
});

// ----------------------------------------------------
// OPERAÇÕES DE MUTAÇÃO / CRUD (100% NEON POSTGRESQL)
// ----------------------------------------------------

export async function saveGiftItem(giftData: any) {
  const { id, name, description, price, category, purchaseUrl, imageUrl, status } = giftData;
  const parsedPrice = price !== undefined && price !== null && price !== '' ? parseFloat(price) : null;

  try {
    let event = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          title: 'Chá de Panela Naila & Yuri',
          type: 'PANTRY_PARTY',
          date: new Date('2026-10-11T13:00:00.000Z'),
          time: '13:00',
          location: 'ADVEC Templo Auxiliar',
          address: 'Rua Montevidéu, 1191 - 4º andar.',
          mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
        },
      });
    }

    if (id) {
      const updated = await prisma.gift.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          price: parsedPrice,
          category: category || 'Geral',
          purchaseUrl: purchaseUrl || null,
          imageUrl: imageUrl || null,
          status: status || 'AVAILABLE',
        },
      });
      return { success: true, gift: updated };
    } else {
      const count = await prisma.gift.count();
      const created = await prisma.gift.create({
        data: {
          eventId: event.id,
          name: name.trim(),
          description: description ? description.trim() : null,
          price: parsedPrice,
          category: category || 'Geral',
          purchaseUrl: purchaseUrl || null,
          imageUrl: imageUrl || null,
          status: status || 'AVAILABLE',
          order: count + 1,
        },
      });
      return { success: true, gift: created };
    }
  } catch (err: any) {
    console.error('Erro ao salvar presente no banco:', err.message);
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
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.gift.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );
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
      return { success: true };
    }

    const currentGift = gifts[currentIndex];
    const targetGift = gifts[targetIndex];

    await prisma.$transaction([
      prisma.gift.update({ where: { id: currentGift.id }, data: { order: targetIndex + 1 } }),
      prisma.gift.update({ where: { id: targetGift.id }, data: { order: currentIndex + 1 } }),
    ]);

    return { success: true };
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
          personName: personName.trim(),
          email: email.trim().toLowerCase(),
          notes: notes ? notes.trim() : null,
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
    console.error('Erro em makeReservation:', err.message);
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
    console.error('Erro ao cancelar reserva:', err.message);
    throw err;
  }
}

export async function updateSystemSettings(data: any) {
  try {
    const existing = await prisma.systemSetting.findFirst();

    const payload = {
      coupleNames: data.coupleNames || 'Naila & Yuri',
      siteTitle: data.siteTitle || 'Naila & Yuri | Chá de Panela',
      siteDescription: data.siteDescription || null,
      siteKeywords: data.siteKeywords || null,
      faviconUrl: data.faviconUrl || '/monograma_popyn.png',
      ogImageUrl: data.ogImageUrl || '/pre-wedding/DSC01267.webp',
      pixKey: data.pixKey || null,
      pixReceiver: data.pixReceiver || null,
      pixCity: data.pixCity || null,
      deliveryAddress: data.deliveryAddress || null,
      showPrices: !!data.showPrices,
    };

    let settings;
    if (existing) {
      settings = await prisma.systemSetting.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      settings = await prisma.systemSetting.create({
        data: payload,
      });
    }

    return { success: true, settings };
  } catch (err: any) {
    console.error('Erro ao atualizar configurações:', err.message);
    throw err;
  }
}

export async function updateEventDetails(data: any) {
  try {
    let event = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });

    const payload = {
      title: data.title || 'Chá de Panela Naila & Yuri',
      type: 'PANTRY_PARTY' as const,
      date: data.date ? new Date(data.date) : new Date('2026-10-11T13:00:00.000Z'),
      time: data.time || '13:00',
      location: data.location || 'ADVEC Templo Auxiliar',
      address: data.address || 'Rua Montevidéu, 1191 - 4º andar.',
      mapsUrl: data.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=Rua+Montevid%C3%A9u%2C+1191',
      description: data.description || null,
    };

    let updatedEvent: any;
    if (event) {
      updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: payload,
        include: { activities: true },
      });
    } else {
      updatedEvent = await prisma.event.create({
        data: payload,
        include: { activities: true },
      });
    }

    return {
      success: true,
      event: {
        ...updatedEvent,
        date: updatedEvent.date ? updatedEvent.date.toISOString() : '2026-10-11T13:00:00.000Z',
        activities: sortActivitiesChronologically(updatedEvent.activities || []),
      },
    };
  } catch (err: any) {
    console.error('Erro ao atualizar evento:', err.message);
    throw err;
  }
}

export async function saveGalleryPhoto(photoData: any) {
  const { id, url, caption, isHero, order } = photoData;
  try {
    if (id) {
      const updated = await prisma.photo.update({
        where: { id },
        data: {
          caption: caption || null,
          isHero: !!isHero,
          order: order !== undefined ? Number(order) : undefined,
        },
      });
      return { success: true, photo: updated };
    } else {
      const count = await prisma.photo.count();
      const created = await prisma.photo.create({
        data: {
          url,
          caption: caption || null,
          isHero: !!isHero,
          order: count + 1,
        },
      });
      return { success: true, photo: created };
    }
  } catch (err: any) {
    console.error('Erro ao salvar foto:', err.message);
    throw err;
  }
}

export async function deleteGalleryPhoto(id: string) {
  try {
    await prisma.photo.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao deletar foto:', err.message);
    throw err;
  }
}

export async function saveEventActivity(activityData: any) {
  const { id, time, title, description } = activityData;
  try {
    let event = await prisma.event.findFirst({ where: { type: 'PANTRY_PARTY' } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          title: 'Chá de Panela Naila & Yuri',
          type: 'PANTRY_PARTY',
          date: new Date('2026-10-11T13:00:00.000Z'),
        },
      });
    }

    if (id) {
      const updated = await prisma.activity.update({
        where: { id },
        data: {
          time: time.trim(),
          title: title.trim(),
          description: description ? description.trim() : null,
        },
      });
      return { success: true, activity: updated };
    } else {
      const created = await prisma.activity.create({
        data: {
          eventId: event.id,
          time: time.trim(),
          title: title.trim(),
          description: description ? description.trim() : null,
        },
      });
      return { success: true, activity: created };
    }
  } catch (err: any) {
    console.error('Erro ao salvar atividade:', err.message);
    throw err;
  }
}

export async function deleteEventActivity(id: string) {
  try {
    await prisma.activity.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao deletar atividade:', err.message);
    throw err;
  }
}

export async function createRsvpEntry(formData: {
  name: string;
  email: string;
  hasCompanion: boolean;
  companionCount: number;
  companionNames?: string;
  notes?: string;
}) {
  const { name, email, hasCompanion, companionCount, companionNames, notes } = formData;
  try {
    const created = await prisma.rsvp.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        hasCompanion: !!hasCompanion,
        companionCount: hasCompanion ? Number(companionCount) || 1 : 0,
        companionNames: companionNames?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return { success: true, rsvp: created };
  } catch (err: any) {
    console.error('Erro ao salvar RSVP no banco:', err.message);
    throw err;
  }
}

export async function deleteRsvpEntry(id: string) {
  try {
    await prisma.rsvp.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao deletar RSVP:', err.message);
    throw err;
  }
}
