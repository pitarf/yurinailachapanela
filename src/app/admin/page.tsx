import { redirect } from 'next/navigation';
import { isAdmin } from './actions';
import { getGiftsData, getEventData, getSystemSettings, getPhotosData } from '@/lib/json-db';
import AdminPanel from '@/components/AdminPanel';
import type { Metadata } from 'next';

// Segurança adicional de SEO: Forçar robôs a ignorar o painel administrativo
export const metadata: Metadata = {
  title: 'Painel Administrativo | Naila & Yuri',
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0; // Sempre ler dados em tempo real no dashboard

async function getAdminData() {
  const [gifts, event, settings, photos] = await Promise.all([
    getGiftsData(),
    getEventData(),
    getSystemSettings(),
    getPhotosData(),
  ]);

  return { gifts, event, settings, photos };
}

export default async function AdminPage() {
  const authenticated = await isAdmin();

  if (!authenticated) {
    redirect('/admin/login');
  }

  const { gifts, event, settings, photos } = await getAdminData();

  return (
    <AdminPanel
      initialGifts={gifts}
      initialEvent={event}
      initialSettings={settings}
      initialPhotos={photos}
    />
  );
}
