'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  saveGift,
  deleteGift,
  cancelReservation,
  resendReservationEmail,
  reorderGifts,
  sortGiftsAlphabetically,
  moveGiftOrder,
  updateGiftCustomOrder,
  deleteRsvp,
  resendRsvpEmail,
  saveSettings,
  saveEvent,
  savePhoto,
  deletePhoto,
  bulkDeleteGifts,
  bulkUpdateGiftStatus,
  saveActivity,
  deleteActivity,
  logout,
} from '@/app/admin/actions';
import { sortActivitiesChronologically } from '@/lib/activity-utils';
import {
  LayoutDashboard,
  Gift,
  Calendar,
  Settings,
  Plus,
  Trash2,
  XCircle,
  LogOut,
  Globe,
  Loader2,
  MapPin,
  QrCode,
  DollarSign,
  Link,
  ChevronRight,
  ExternalLink,
  Camera,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  FileText,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  ArrowDownAZ,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Users,
  UserCheck,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';

interface AdminPanelProps {
  initialGifts: any[];
  initialEvent: any;
  initialSettings: any;
  initialPhotos?: any[];
  initialRsvps?: any[];
}

export default function AdminPanel({
  initialGifts,
  initialEvent,
  initialSettings,
  initialPhotos = [],
  initialRsvps = [],
}: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gifts' | 'reservations' | 'rsvps' | 'schedule' | 'gallery' | 'content' | 'settings'>('dashboard');

  // Estados dos Dados
  const [gifts, setGifts] = useState(initialGifts);
  const [event, setEvent] = useState(initialEvent);
  const [settings, setSettings] = useState(initialSettings);
  const [photos, setPhotos] = useState(initialPhotos);
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [rsvpSearchQuery, setRsvpSearchQuery] = useState('');
  const [sendingResendRsvpId, setSendingResendRsvpId] = useState<string | null>(null);
  const [copiedList, setCopiedList] = useState(false);
  const [copiedRsvpLink, setCopiedRsvpLink] = useState(false);

  // Estados para edição de legendas das fotos
  const [photoCaptions, setPhotoCaptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    initialPhotos.forEach((p) => {
      initial[p.id] = p.caption || '';
    });
    return initial;
  });
  const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null);

  // Estados de Carregamento e Formulários
  const [isSaving, setIsSaving] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [editingGift, setEditingGift] = useState<any | null>(null);

  // Campos do formulário de Presente
  const [giftForm, setGiftForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: 'Geral',
    purchaseUrl: '',
    imageUrl: '',
  });

  const [scrapingUrl, setScrapingUrl] = useState('');

  // Campos de Configuração do Evento
  const [eventForm, setEventForm] = useState({
    title: event?.title || 'Chá de Panela Naila & Yuri',
    date: event?.date ? new Date(event.date).toISOString().substring(0, 16) : '2026-10-11T15:00',
    location: event?.location || '',
    address: event?.address || '',
    mapsUrl: event?.mapsUrl || '',
    description: event?.description || '',
  });

  // Seleção em Massa de Presentes
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);

  // Lista de Atividades da Programação
  const [activities, setActivities] = useState<any[]>(() => sortActivitiesChronologically(event?.activities || []));
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [activityForm, setActivityForm] = useState({
    id: '',
    time: '',
    title: '',
    description: '',
  });

  // Campos de Configurações do Sistema (PIX, Endereço, SEO, Exibição de Preços, História)
  const [settingsForm, setSettingsForm] = useState({
    coupleNames: settings?.coupleNames || 'Naila & Yuri',
    siteTitle: settings?.siteTitle || 'Naila & Yuri | Chá de Panela',
    siteDescription: settings?.siteDescription || '',
    siteKeywords: settings?.siteKeywords || '',
    deliveryAddress: settings?.deliveryAddress || '',
    pixKey: settings?.pixKey || '',
    pixReceiver: settings?.pixReceiver || '',
    pixCity: settings?.pixCity || '',
    showPrices: settings?.showPrices ?? false,
    historyText: settings?.historyText || '',
  });

  // Estados de Teste de E-mails e Lembretes (Brevo)
  const [testEmailTarget, setTestEmailTarget] = useState('coutinhonaila20@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendingResendGiftId, setSendingResendGiftId] = useState<string | null>(null);

  const handleResendReservation = async (giftId: string, guestEmail: string) => {
    setSendingResendGiftId(giftId);
    try {
      const res = await resendReservationEmail(giftId);
      if (res.success) {
        toast.success(`E-mail de confirmação reenviado com sucesso para ${guestEmail}!`);
      } else {
        toast.error(res.error || 'Erro ao reenviar e-mail de confirmação.');
      }
    } catch {
      toast.error('Erro de conexão ao reenviar e-mail.');
    } finally {
      setSendingResendGiftId(null);
    }
  };

  const [isSorting, setIsSorting] = useState(false);
  const [movingGiftId, setMovingGiftId] = useState<string | null>(null);

  // Ordenar lista de presentes de A a Z
  const handleSortAlphabetical = async () => {
    setIsSorting(true);
    try {
      const res = await sortGiftsAlphabetically();
      if (res.success) {
        const sorted = [...gifts]
          .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }))
          .map((g, idx) => ({ ...g, order: idx + 1 }));
        setGifts(sorted);
        toast.success('Presentes ordenados alfabeticamente (A-Z) com sucesso!');
        router.refresh();
      } else {
        toast.error('Não foi possível ordenar os presentes.');
      }
    } catch {
      toast.error('Erro de conexão ao ordenar presentes.');
    } finally {
      setIsSorting(false);
    }
  };

  // Mover presente para cima ou para baixo
  const handleMoveGift = async (giftId: string, direction: 'up' | 'down') => {
    const index = gifts.findIndex((g) => g.id === giftId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gifts.length) return;

    setMovingGiftId(giftId);

    // Optimistic UI update
    const newGifts = [...gifts];
    const temp = newGifts[index];
    newGifts[index] = newGifts[targetIndex];
    newGifts[targetIndex] = temp;
    const reordered = newGifts.map((g, i) => ({ ...g, order: i + 1 }));
    setGifts(reordered);

    try {
      await moveGiftOrder(giftId, direction);
      router.refresh();
    } catch {
      toast.error('Erro ao salvar nova posição do presente.');
    } finally {
      setMovingGiftId(null);
    }
  };

  // Alterar número da ordem diretamente
  const handleUpdateOrder = async (giftId: string, newOrderVal: number) => {
    if (isNaN(newOrderVal) || newOrderVal < 1) return;
    try {
      await updateGiftCustomOrder(giftId, newOrderVal);
      setGifts((prev) =>
        prev
          .map((g) => (g.id === giftId ? { ...g, order: newOrderVal } : g))
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      );
      toast.success('Posição do presente atualizada com sucesso!');
      router.refresh();
    } catch {
      toast.error('Erro ao atualizar posição do presente.');
    }
  };

  const handleSelectAllGifts = () => {
    if (selectedGiftIds.length === gifts.length) {
      setSelectedGiftIds([]);
    } else {
      setSelectedGiftIds(gifts.map((g) => g.id));
    }
  };

  const handleToggleSelectGift = (id: string) => {
    setSelectedGiftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedGiftIds.length === 0) return;
    if (!confirm(`Tem certeza de que deseja excluir ${selectedGiftIds.length} presente(s)?`)) return;

    try {
      const res = await bulkDeleteGifts(selectedGiftIds);
      if (res.success) {
        setGifts((prev) => prev.filter((g) => !selectedGiftIds.includes(g.id)));
        setSelectedGiftIds([]);
        toast.success(`${res.count} presente(s) excluído(s) com sucesso!`);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao excluir presentes selecionados.');
    }
  };

  const handleBulkStatus = async (status: 'AVAILABLE' | 'RESERVED') => {
    if (selectedGiftIds.length === 0) return;

    try {
      const res = await bulkUpdateGiftStatus(selectedGiftIds, status);
      if (res.success) {
        setGifts((prev) =>
          prev.map((g) => (selectedGiftIds.includes(g.id) ? { ...g, status } : g))
        );
        setSelectedGiftIds([]);
        toast.success(`Status de ${res.count} presente(s) atualizado!`);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao atualizar status dos presentes.');
    }
  };

  // Cálculos do Dashboard
  const totalGifts = gifts.length;
  const reservedGifts = gifts.filter((g) => g.status === 'RESERVED').length;
  const availableGifts = totalGifts - reservedGifts;
  const totalValue = gifts.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const reservedValue = gifts.filter((g) => g.status === 'RESERVED').reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  // Cálculos de Confirmação de Presença (RSVP)
  const totalRsvps = rsvps.length;
  const totalCompanionAttendees = rsvps.reduce((acc, r) => acc + (r.hasCompanion ? Number(r.companionCount) || 0 : 0), 0);
  const totalAttendees = totalRsvps + totalCompanionAttendees;

  // Lógica de Scraping Open Graph
  const handleScrape = async () => {
    if (!scrapingUrl) {
      toast.error('Informe a URL do produto.');
      return;
    }

    setIsScraping(true);
    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(scrapingUrl)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setGiftForm((prev) => ({
        ...prev,
        name: data.title || prev.name,
        description: data.description || prev.description,
        price: data.price ? data.price.toString() : prev.price,
        imageUrl: data.image || prev.imageUrl,
        purchaseUrl: scrapingUrl,
      }));

      toast.success('Dados preenchidos automaticamente com sucesso!');
      setScrapingUrl('');
    } catch (err: any) {
      toast.error(err.message || 'Não foi possível preencher automaticamente.');
    } finally {
      setIsScraping(false);
    }
  };

  // Salvar Presente (Criar/Editar)
  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftForm.name) {
      toast.error('Informe o nome do presente.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveGift({
        ...giftForm,
        price: giftForm.price ? parseFloat(giftForm.price) : 0,
      });

      if (res.success) {
        toast.success(giftForm.id ? 'Presente atualizado!' : 'Presente criado!');
        // Atualiza a lista local
        if (giftForm.id) {
          setGifts((prev) => prev.map((g) => (g.id === res.gift.id ? res.gift : g)));
        } else {
          setGifts((prev) => [res.gift, ...prev]);
        }
        // Reseta form
        setGiftForm({
          id: '',
          name: '',
          description: '',
          price: '',
          category: 'Geral',
          purchaseUrl: '',
          imageUrl: '',
        });
        setEditingGift(null);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar presente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Iniciar Edição de Presente
  const startEditGift = (gift: any) => {
    setActiveTab('gifts');
    setEditingGift(gift);
    setGiftForm({
      id: gift.id,
      name: gift.name,
      description: gift.description || '',
      price: gift.price != null ? gift.price.toString() : '',
      category: gift.category,
      purchaseUrl: gift.purchaseUrl || '',
      imageUrl: gift.imageUrl || '',
    });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Salvar / Editar Atividade da Programação
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title) {
      toast.error('Informe o título da atividade.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveActivity({
        id: activityForm.id || undefined,
        title: activityForm.title,
        description: activityForm.description,
        time: activityForm.time,
      });

      if (res.success) {
        toast.success(activityForm.id ? 'Atividade atualizada!' : 'Atividade criada!');
        if (activityForm.id) {
          setActivities((prev) =>
            sortActivitiesChronologically(prev.map((a) => (a.id === res.activity.id ? res.activity : a)))
          );
        } else {
          setActivities((prev) => sortActivitiesChronologically([...prev, res.activity]));
        }
        setActivityForm({ id: '', time: '', title: '', description: '' });
        setEditingActivity(null);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao salvar atividade da programação.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditActivity = (act: any) => {
    setEditingActivity(act);
    setActivityForm({
      id: act.id,
      time: act.time || '',
      title: act.title || '',
      description: act.description || '',
    });
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta atividade da programação?')) return;
    try {
      const res = await deleteActivity(id);
      if (res.success) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
        toast.success('Atividade removida com sucesso!');
        router.refresh();
      }
    } catch {
      toast.error('Erro ao remover atividade.');
    }
  };

  // Captura de capa do produto automática ao colar URL no campo de compra
  const handlePurchaseUrlBlur = async () => {
    if (!giftForm.purchaseUrl || giftForm.imageUrl) return;
    try {
      setIsScraping(true);
      const res = await fetch(`/api/og?url=${encodeURIComponent(giftForm.purchaseUrl)}`);
      const data = await res.json();
      if (res.ok) {
        setGiftForm((prev) => ({
          ...prev,
          name: prev.name || data.title || '',
          description: prev.description || data.description || '',
          price: prev.price || (data.price ? data.price.toString() : ''),
          imageUrl: data.image || prev.imageUrl,
        }));
        if (data.image) {
          toast.success('Foto de capa do produto capturada automaticamente!');
        }
      }
    } catch {
      // Ignora silenciosamente no blur em caso de erro
    } finally {
      setIsScraping(false);
    }
  };

  // Excluir Presente
  const handleDeleteGift = async (id: string) => {
    if (!confirm('Deseja realmente excluir este presente?')) return;

    try {
      const res = await deleteGift(id);
      if (res.success) {
        setGifts((prev) => prev.filter((g) => g.id !== id));
        toast.success('Presente excluído.');
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao excluir presente.');
    }
  };

  // Liberar Reserva de Presente
  const handleCancelReservation = async (giftId: string) => {
    if (!confirm('Liberar esta reserva fará o produto voltar ao status de disponível. Deseja continuar?')) return;

    try {
      const res = await cancelReservation(giftId);
      if (res.success) {
        setGifts((prev) =>
          prev.map((g) => (g.id === giftId ? { ...g, status: 'AVAILABLE', reservation: null } : g))
        );
        toast.success('Reserva cancelada e presente liberado!');
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao cancelar reserva.');
    }
  };

  // Excluir Confirmação de Presença
  const handleDeleteRsvp = async (id: string) => {
    if (!confirm('Deseja realmente remover esta confirmação de presença?')) return;
    try {
      const res = await deleteRsvp(id);
      if (res.success) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
        toast.success('Confirmação de presença removida com sucesso!');
        router.refresh();
      }
    } catch {
      toast.error('Erro ao remover confirmação de presença.');
    }
  };

  // Reenviar E-mail de Confirmação de Presença
  const handleResendRsvp = async (rsvpId: string, guestEmail: string) => {
    setSendingResendRsvpId(rsvpId);
    try {
      const res = await resendRsvpEmail(rsvpId);
      if (res.success) {
        toast.success(`E-mail de confirmação de presença reenviado para ${guestEmail}!`);
      } else {
        toast.error(res.error || 'Erro ao reenviar e-mail de confirmação.');
      }
    } catch {
      toast.error('Erro de conexão ao reenviar e-mail.');
    } finally {
      setSendingResendRsvpId(null);
    }
  };

  // Copiar Lista Formatada de Convidados
  const handleCopyRsvpList = () => {
    if (rsvps.length === 0) {
      toast.error('Nenhum convidado confirmado para copiar.');
      return;
    }

    const totalTitulares = rsvps.length;
    const totalAcompanhantes = rsvps.reduce((acc, r) => acc + (r.hasCompanion ? r.companionCount || 0 : 0), 0);
    const totalGeral = totalTitulares + totalAcompanhantes;

    let text = `📋 LISTA DE PRESENÇAS CONFIRMADAS — CHÁ DE PANELA NAILA & YURI\n`;
    text += `Total de Pessoas: ${totalGeral} (${totalTitulares} titulares + ${totalAcompanhantes} acompanhantes)\n`;
    text += `--------------------------------------------------\n\n`;

    rsvps.forEach((r, idx) => {
      text += `${idx + 1}. ${r.name} (${r.email})\n`;
      if (r.hasCompanion && r.companionCount > 0) {
        text += `   ↳ +${r.companionCount} acompanhante(s)${r.companionNames ? `: ${r.companionNames}` : ''}\n`;
      }
      if (r.notes) {
        text += `   ↳ Recado: "${r.notes}"\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedList(true);
    toast.success('Lista de convidados copiada para a área de transferência!');
    setTimeout(() => setCopiedList(false), 3000);
  };

  // Copiar Link Direto para Confirmação de Presença (/presenca)
  const handleCopyDirectLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const directUrl = `${origin}/presenca`;
    navigator.clipboard.writeText(directUrl);
    setCopiedRsvpLink(true);
    toast.success(`Link direto copiado: ${directUrl}`);
    setTimeout(() => setCopiedRsvpLink(false), 3000);
  };

  // Disparo de Teste de E-mails e Lembretes Automáticos (Brevo)
  const handleSendTestReminder = async (type: '14days' | '7days' | '3days' | 'today') => {
    if (!testEmailTarget) {
      toast.error('Informe o e-mail de destino para o teste.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/cron/reminders?force=${type}&test_email=${encodeURIComponent(testEmailTarget)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`E-mail de teste (${type}) enviado com sucesso para ${testEmailTarget}!`);
      } else {
        toast.error(data.error || data.message || 'Falha ao enviar e-mail de teste.');
      }
    } catch {
      toast.error('Erro de conexão ao disparar e-mail de teste.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Salvar Configurações Globais
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveSettings(settingsForm);
      if (res.success) {
        setSettings(res.settings);
        toast.success('Configurações atualizadas!');
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao atualizar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar Evento
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveEvent(eventForm);
      if (res.success) {
        setEvent(res.event);
        toast.success('Evento atualizado!');
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao salvar evento.');
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar Legenda da Foto na Galeria
  const handleUpdatePhotoCaption = async (photo: any) => {
    setSavingPhotoId(photo.id);
    const newCaption = photoCaptions[photo.id] ?? photo.caption ?? '';
    try {
      const res = await savePhoto({
        id: photo.id,
        url: photo.url,
        caption: newCaption,
        isHero: photo.isHero,
      });
      if (res.success) {
        setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, caption: newCaption } : p)));
        toast.success(`Legenda da foto atualizada com sucesso!`);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao atualizar a legenda da foto.');
    } finally {
      setSavingPhotoId(null);
    }
  };

  // Excluir Foto da Galeria
  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Deseja excluir esta foto da galeria?')) return;
    try {
      const res = await deletePhoto(id);
      if (res.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        toast.success('Foto excluída da galeria.');
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao excluir foto.');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão encerrada.');
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white flex items-center gap-2">
              Painel Y&N
            </h2>
            <p className="text-[9px] tracking-widest font-sans text-zinc-400 mt-1 uppercase">Gestão da Plataforma</p>
          </div>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar scrollbar-none">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'gifts', label: 'Presentes', icon: Gift },
              { id: 'reservations', label: 'Reservas', icon: DollarSign },
              { id: 'rsvps', label: 'Presenças (RSVP)', icon: Users, badge: totalAttendees },
              { id: 'schedule', label: 'Programação', icon: Calendar },
              { id: 'gallery', label: 'Galeria', icon: Camera },
              { id: 'content', label: 'Textos & História', icon: BookOpen },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-between px-4 py-3 text-xs tracking-wider uppercase font-sans font-medium rounded-xl transition-all w-full min-w-max md:min-w-0 ${
                    activeTab === tab.id
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-850 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-zinc-950'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850 mt-6 md:mt-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase font-sans font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl overflow-x-hidden">
        
        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">Resumo Geral</h1>
              <p className="text-xs text-zinc-500 mt-1">Estatísticas e visão geral de reservas e presenças do Chá de Panela.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Presentes', value: totalGifts, sub: 'Itens na lista' },
                { label: 'Reservados', value: reservedGifts, sub: `${((reservedGifts / (totalGifts || 1)) * 100).toFixed(0)}% do total` },
                {
                  label: 'Presenças Confirmadas',
                  value: `${totalAttendees} pessoas`,
                  sub: `${totalRsvps} titulares + ${totalCompanionAttendees} acompanhantes`,
                  highlight: true,
                },
                {
                  label: 'Arrecadação Esperada',
                  value: reservedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                  sub: `De ${totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} total`,
                },
              ].map((card, i) => (
                <div key={i} className={`border rounded-popyn p-6 shadow-sm ${
                  card.highlight
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}>
                  <span className={`text-[10px] tracking-widest font-sans uppercase ${
                    card.highlight ? 'text-zinc-400 dark:text-zinc-500' : 'text-brand-muted'
                  }`}>{card.label}</span>
                  <div className={`font-serif text-3xl font-light mt-2 ${
                    card.highlight ? 'text-white dark:text-zinc-950' : 'text-zinc-950 dark:text-white'
                  }`}>{card.value}</div>
                  <p className={`text-xs mt-1.5 font-light ${
                    card.highlight ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
                  }`}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Ultimas Reservas */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white mb-6">Reservas Recentes</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 pb-3 text-zinc-400 uppercase tracking-widest font-sans">
                      <th className="py-3 font-semibold">Convidado</th>
                      <th className="py-3 font-semibold">Presente</th>
                      <th className="py-3 font-semibold">Preço</th>
                      <th className="py-3 font-semibold">Data Reserva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts
                      .filter((g) => g.status === 'RESERVED' && g.reservation)
                      .slice(0, 5)
                      .map((gift) => (
                        <tr key={gift.id} className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                          <td className="py-4">
                            <p className="font-medium text-zinc-900 dark:text-white">{gift.reservation?.personName}</p>
                            <p className="text-[10px] text-zinc-400 font-light mt-0.5">{gift.reservation?.email}</p>
                          </td>
                          <td className="py-4 font-serif text-zinc-850 dark:text-zinc-200">{gift.name}</td>
                          <td className="py-4 font-mono">{gift.price != null && !isNaN(Number(gift.price)) && Number(gift.price) > 0 ? Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                          <td className="py-4 text-zinc-400">
                            {new Date(gift.reservation?.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    {gifts.filter((g) => g.status === 'RESERVED').length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-zinc-400 font-light font-serif">
                          Nenhuma reserva realizada ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Gifts Management */}
        {activeTab === 'gifts' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">Gerenciar Presentes</h1>
                <p className="text-xs text-zinc-500 mt-1">Adicione, edite ou remova produtos da lista de presentes.</p>
              </div>
            </div>

            {/* Cadastro / Edição Form */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm">
              {editingGift ? (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-sans font-medium text-amber-800 dark:text-amber-200 block">
                      ✏️ Editando produto: <strong>{editingGift.name}</strong>
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-light">
                      Altere os campos abaixo e clique em &quot;Salvar Alterações&quot; para atualizar.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGift(null);
                      setGiftForm({
                        id: '',
                        name: '',
                        description: '',
                        price: '',
                        category: 'Geral',
                        purchaseUrl: '',
                        imageUrl: '',
                      });
                    }}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
                  >
                    Cancelar Edição
                  </button>
                </div>
              ) : (
                <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white mb-6">
                  Novo Presente
                </h2>
              )}

              {/* URL Scraping Helper */}
              {!editingGift && (
                <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                  <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                    Preencher Automaticamente via Link da Loja (Mercado Livre, Magalu, Shopee, Amazon)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={scrapingUrl}
                      onChange={(e) => setScrapingUrl(e.target.value)}
                      placeholder="Cole o link do produto aqui"
                      className="flex-grow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                    <button
                      type="button"
                      disabled={isScraping}
                      onClick={handleScrape}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isScraping ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Raspando...
                        </>
                      ) : (
                        'Autocompletar'
                      )}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveGift} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Nome do Presente *
                    </label>
                    <input
                      type="text"
                      required
                      value={giftForm.name}
                      onChange={(e) => setGiftForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Microondas de Inox"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Preço (R$) (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={giftForm.price}
                      onChange={(e) => setGiftForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="Ex: 450.00"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white animate-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={giftForm.category}
                      onChange={(e) => setGiftForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Ex: Cozinha, Eletros, Banho..."
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Link para Compra (Mercado Livre, Magalu, etc.)
                    </label>
                    <input
                      type="url"
                      value={giftForm.purchaseUrl}
                      onChange={(e) => setGiftForm((p) => ({ ...p, purchaseUrl: e.target.value }))}
                      onBlur={handlePurchaseUrlBlur}
                      placeholder="https://mercadolivre.com.br/..."
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      URL da Imagem da Capa do Produto
                    </label>
                    <input
                      type="url"
                      value={giftForm.imageUrl}
                      onChange={(e) => setGiftForm((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="https://loja.com/foto.jpg ou link direto da imagem"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                    <span className="text-[10px] text-zinc-400 font-light block mt-1">
                      💡 Você pode colar diretamente o link de qualquer imagem (.jpg / .webp / .png) para exibir a foto exata no produto.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Descrição / Observações (Opcional)
                    </label>
                    <textarea
                      value={giftForm.description}
                      onChange={(e) => setGiftForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Ex: Voltagem 110v, Cor preta..."
                      rows={2}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                    />
                  </div>
                </div>

                {/* Preview ao vivo da Imagem da Capa */}
                {giftForm.imageUrl && (
                  <div className="md:col-span-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <div className="w-16 h-16 relative bg-white rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={giftForm.imageUrl} alt="Preview Capa" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <span className="text-[10px] font-sans uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-300 block">
                        Preview da Capa do Produto Capturada
                      </span>
                      <span className="text-xs text-zinc-400 font-light truncate block max-w-lg">
                        {giftForm.imageUrl}
                      </span>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingGift && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGift(null);
                        setGiftForm({
                          id: '',
                          name: '',
                          description: '',
                          price: '',
                          category: 'Geral',
                          purchaseUrl: '',
                          imageUrl: '',
                        });
                      }}
                      className="px-5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-sans tracking-wider uppercase font-semibold transition-colors text-zinc-600 dark:text-zinc-300"
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isSaving ? 'Salvando...' : editingGift ? 'Salvar Alterações' : 'Criar Presente'}
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela de Presentes Cadastrados */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white">
                    Presentes Cadastrados ({gifts.length})
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-light mt-0.5">
                    Defina a ordem de exibição na lista pública ou ordene em A-Z com 1 clique.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Botão de Ordenação Alfabética A-Z */}
                  <button
                    type="button"
                    onClick={handleSortAlphabetical}
                    disabled={isSorting}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                    title="Ordenar todos os produtos por ordem alfabética de A a Z"
                  >
                    {isSorting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                        <span>Ordenando...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownAZ className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        <span>Ordenar A-Z (Alfabético)</span>
                      </>
                    )}
                  </button>

                  {/* Barra de Ações em Massa */}
                  {selectedGiftIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-4 py-2 rounded-xl text-xs shadow-lg animate-fade-in">
                      <span className="font-semibold">{selectedGiftIds.length} selecionado(s)</span>
                      <div className="h-4 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />
                      <button
                        onClick={handleBulkDelete}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-sans text-[10px] tracking-wider uppercase font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                      <button
                        onClick={() => handleBulkStatus('AVAILABLE')}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-sans text-[10px] tracking-wider uppercase font-semibold transition-colors"
                      >
                        Disponível
                      </button>
                      <button
                        onClick={() => handleBulkStatus('RESERVED')}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-sans text-[10px] tracking-wider uppercase font-semibold transition-colors"
                      >
                        Reservado
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 pb-3 text-zinc-400 uppercase tracking-widest font-sans">
                      <th className="py-3 font-semibold w-10">
                        <button
                          type="button"
                          onClick={handleSelectAllGifts}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                          title="Selecionar Todos"
                        >
                          {selectedGiftIds.length === gifts.length && gifts.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-black dark:text-white" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 font-semibold w-24 text-center">Ordem</th>
                      <th className="py-3 font-semibold w-16">Foto</th>
                      <th className="py-3 font-semibold">Produto</th>
                      <th className="py-3 font-semibold">Categoria</th>
                      <th className="py-3 font-semibold">Preço</th>
                      <th className="py-3 font-semibold">Status</th>
                      <th className="py-3 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts.map((gift, index) => (
                      <tr
                        key={gift.id}
                        className={`border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 ${
                          selectedGiftIds.includes(gift.id) ? 'bg-zinc-50/80 dark:bg-zinc-800/40' : ''
                        }`}
                      >
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectGift(gift.id)}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                          >
                            {selectedGiftIds.includes(gift.id) ? (
                              <CheckSquare className="w-4 h-4 text-black dark:text-white" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              defaultValue={gift.order != null ? gift.order : index + 1}
                              key={`${gift.id}-${gift.order}`}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val !== gift.order) {
                                  handleUpdateOrder(gift.id, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                                  if (!isNaN(val) && val !== gift.order) {
                                    handleUpdateOrder(gift.id, val);
                                  }
                                }
                              }}
                              className="w-10 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-750 rounded px-1 py-1 text-center font-mono text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                              title="Digite a posição desejada e clique fora ou dê Enter"
                            />
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleMoveGift(gift.id, 'up')}
                                disabled={movingGiftId === gift.id || index === 0}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                title="Mover para Cima (posição anterior)"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveGift(gift.id, 'down')}
                                disabled={movingGiftId === gift.id || index === gifts.length - 1}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                title="Mover para Baixo (próxima posição)"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="relative w-10 h-10 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                            {gift.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={gift.imageUrl} alt="" className="object-cover w-full h-full" />
                            ) : (
                              <span className="font-serif text-[10px] font-light text-zinc-400">YN</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-medium text-zinc-900 dark:text-white">
                          <p>{gift.name}</p>
                          {gift.purchaseUrl && (
                            <a
                              href={gift.purchaseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-zinc-400 hover:text-zinc-650 flex items-center gap-1 mt-0.5"
                            >
                              Link externo <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="py-3 text-zinc-500">{gift.category}</td>
                        <td className="py-3 font-mono">{gift.price != null && !isNaN(Number(gift.price)) && Number(gift.price) > 0 ? Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                        <td className="py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[9px] font-sans tracking-wide uppercase font-semibold w-fit ${
                                gift.status === 'AVAILABLE'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                              }`}
                            >
                              {gift.status === 'AVAILABLE' ? 'Disponível' : 'Reservado'}
                            </span>
                            {gift.reservation?.personName && (
                              <span className="text-[10px] text-zinc-500 font-sans">
                                por <strong>{gift.reservation.personName}</strong>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEditGift(gift)}
                              className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300"
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteGift(gift.id)}
                              className="p-2 border border-red-150 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-650 dark:text-red-400"
                              title="Excluir"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {gifts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-400 font-light font-serif">
                          Nenhum presente cadastrado na lista.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reservations Management */}
        {activeTab === 'reservations' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">Reservas Realizadas</h1>
              <p className="text-xs text-zinc-500 mt-1">Visualize e cancele as reservas de presentes.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 pb-3 text-zinc-400 uppercase tracking-widest font-sans">
                      <th className="py-3 font-semibold">Convidado</th>
                      <th className="py-3 font-semibold">Presente</th>
                      <th className="py-3 font-semibold">Mensagem / Observação</th>
                      <th className="py-3 font-semibold">Preço</th>
                      <th className="py-3 font-semibold">Data</th>
                      <th className="py-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts
                      .filter((g) => g.status === 'RESERVED' && g.reservation)
                      .map((gift) => (
                        <tr key={gift.id} className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                          <td className="py-4">
                            <p className="font-medium text-zinc-900 dark:text-white">{gift.reservation?.personName}</p>
                            <p className="text-[10px] text-zinc-400 font-light mt-0.5">{gift.reservation?.email}</p>
                          </td>
                          <td className="py-4">
                            <p className="font-serif text-zinc-800 dark:text-zinc-200">{gift.name}</p>
                            <p className="text-[9px] tracking-wider text-zinc-400 uppercase mt-0.5">{gift.category}</p>
                          </td>
                          <td className="py-4 text-zinc-500 font-light max-w-xs truncate" title={gift.reservation?.notes}>
                            {gift.reservation?.notes || '-'}
                          </td>
                          <td className="py-4 font-mono">{gift.price != null && !isNaN(Number(gift.price)) && Number(gift.price) > 0 ? Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                          <td className="py-4 text-zinc-400">
                            {new Date(gift.reservation?.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleResendReservation(gift.id, gift.reservation?.email || '')}
                                disabled={sendingResendGiftId === gift.id}
                                className="px-3 py-2 border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 text-[11px] font-sans font-medium transition-colors disabled:opacity-50"
                                title="Reenviar e-mail de confirmação para o convidado e noivos"
                              >
                                {sendingResendGiftId === gift.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                                    <span>Enviando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Reenviar E-mail</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleCancelReservation(gift.id)}
                                className="px-3 py-2 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-650 dark:text-red-400 flex items-center gap-1.5 text-[11px] font-sans font-medium transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Liberar Item
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {gifts.filter((g) => g.status === 'RESERVED').length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400 font-light font-serif">
                          Nenhum presente reservado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Caixa de Automação e Teste de E-mails Brevo */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-zinc-900 dark:text-white" />
                    <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white">
                      Automação de E-mails & Lembretes (Brevo)
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    E-mails transacionais configurados com a API oficial da Brevo (<code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">coutinhonaila20@gmail.com</code>).
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[10px] font-sans font-semibold rounded-full uppercase tracking-wider w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" /> API Brevo Conectada
                </span>
              </div>

              {/* Grid dos 4 Tipos de E-mail Automáticos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] font-mono font-semibold tracking-wider text-brand-muted uppercase block">
                    ⚡ Imediato na Reserva
                  </span>
                  <h3 className="font-serif text-sm font-light text-zinc-900 dark:text-white">
                    Confirmação de Presente
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                    Enviado automaticamente no segundo em que o convidado escolhe o presente no site com detalhes da loja, PIX e endereço.
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] font-mono font-semibold tracking-wider text-brand-muted uppercase block">
                    ⏰ Faltando 7 Dias
                  </span>
                  <h3 className="font-serif text-sm font-light text-zinc-900 dark:text-white">
                    Lembrete de 1 Semana
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                    "Falta 1 semana! Lembre-se do seu presente: se ainda não comprou ainda dá tempo, se já comprou muito obrigado!"
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] font-mono font-semibold tracking-wider text-brand-muted uppercase block">
                    💖 Faltando 3 Dias
                  </span>
                  <h3 className="font-serif text-sm font-light text-zinc-900 dark:text-white">
                    Contagem Regressiva
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                    "Faltam apenas 3 dias! Última chamada para garantir o presente e rever detalhes de chegada."
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] font-mono font-semibold tracking-wider text-brand-muted uppercase block">
                    🎉 No Dia do Evento
                  </span>
                  <h3 className="font-serif text-sm font-light text-zinc-900 dark:text-white">
                    É Hoje! Esperamos Vocês
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                    "É hoje! Esperamos por você às 13:00 na ADVEC (Rua Montevidéu, 1191)". Sem falar de presentes.
                  </p>
                </div>
              </div>

              {/* Painel de Disparo de Teste Manual */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-base font-light text-zinc-900 dark:text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /> Testar Envio de Lembretes Agora
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Envie um e-mail de teste real para verificar a formatação na sua caixa de entrada.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailTarget}
                      onChange={(e) => setTestEmailTarget(e.target.value)}
                      placeholder="seu_email@gmail.com"
                      className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black w-60"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleSendTestReminder('14days')}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 rounded-xl text-xs font-sans font-medium text-zinc-700 dark:text-zinc-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> Disparar Teste: 14 Dias (Save the Date)
                  </button>

                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleSendTestReminder('7days')}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 rounded-xl text-xs font-sans font-medium text-zinc-700 dark:text-zinc-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> Disparar Teste: 7 Dias
                  </button>

                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleSendTestReminder('3days')}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 rounded-xl text-xs font-sans font-medium text-zinc-700 dark:text-zinc-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> Disparar Teste: 3 Dias
                  </button>

                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleSendTestReminder('today')}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-sans font-medium transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Disparar Teste: É Hoje!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Presenças (RSVP) */}
        {activeTab === 'rsvps' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
                  Presenças Confirmadas (RSVP)
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Lista de convidados confirmados, acompanhantes e recadinhos deixados para os noivos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDirectLink}
                  className="px-4 py-2.5 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-sans font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs"
                >
                  {copiedRsvpLink ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link className="w-3.5 h-3.5" />}
                  <span>{copiedRsvpLink ? 'Link Copiado!' : 'Copiar Link (/presenca)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyRsvpList}
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-sans font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                >
                  {copiedList ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedList ? 'Lista Copiada!' : 'Copiar Lista Completa'}</span>
                </button>
              </div>
            </div>

            {/* Cards de Métricas de Presença */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-5 shadow-sm">
                <span className="text-[10px] tracking-widest font-sans text-brand-muted uppercase block">
                  Total de Pessoas Confirmadas
                </span>
                <div className="font-serif text-3xl font-light mt-1 text-zinc-950 dark:text-white">
                  {totalAttendees}
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-light">
                  Titulares + Acompanhantes
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-5 shadow-sm">
                <span className="text-[10px] tracking-widest font-sans text-brand-muted uppercase block">
                  Convidados Titulares
                </span>
                <div className="font-serif text-3xl font-light mt-1 text-zinc-950 dark:text-white">
                  {totalRsvps}
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-light">
                  Formulários enviados
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-5 shadow-sm">
                <span className="text-[10px] tracking-widest font-sans text-brand-muted uppercase block">
                  Acompanhantes Adicionais
                </span>
                <div className="font-serif text-3xl font-light mt-1 text-zinc-950 dark:text-white">
                  {totalCompanionAttendees}
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-light">
                  Familiares / Convidados extras
                </p>
              </div>
            </div>

            {/* Tabela de Confirmações de Presença */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white">
                  Lista de Convidados ({rsvps.length})
                </h2>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={rsvpSearchQuery}
                    onChange={(e) => setRsvpSearchQuery(e.target.value)}
                    placeholder="Buscar por nome ou e-mail..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 pb-3 text-zinc-400 uppercase tracking-widest font-sans">
                      <th className="py-3 font-semibold">Convidado Titular</th>
                      <th className="py-3 font-semibold">Acompanhantes</th>
                      <th className="py-3 font-semibold">Nomes dos Acompanhantes</th>
                      <th className="py-3 font-semibold">Mensagem / Recado</th>
                      <th className="py-3 font-semibold">Data Confirmação</th>
                      <th className="py-3 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps
                      .filter((r) => {
                        const query = rsvpSearchQuery.toLowerCase();
                        return (
                          r.name.toLowerCase().includes(query) ||
                          r.email.toLowerCase().includes(query) ||
                          (r.companionNames && r.companionNames.toLowerCase().includes(query))
                        );
                      })
                      .map((rsvp) => (
                        <tr
                          key={rsvp.id}
                          className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
                        >
                          <td className="py-4">
                            <p className="font-medium text-zinc-900 dark:text-white">{rsvp.name}</p>
                            <p className="text-[10px] text-zinc-400 font-light mt-0.5">{rsvp.email}</p>
                          </td>
                          <td className="py-4">
                            {rsvp.hasCompanion && rsvp.companionCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                <Users className="w-3 h-3 text-zinc-500" />
                                +{rsvp.companionCount} pessoa{rsvp.companionCount > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-light">Apenas o titular</span>
                            )}
                          </td>
                          <td className="py-4 text-zinc-600 dark:text-zinc-300 font-light max-w-xs">
                            {rsvp.companionNames || '—'}
                          </td>
                          <td className="py-4 text-zinc-500 font-light max-w-xs truncate" title={rsvp.notes || ''}>
                            {rsvp.notes ? `"${rsvp.notes}"` : '—'}
                          </td>
                          <td className="py-4 text-zinc-400">
                            {rsvp.createdAt
                              ? new Date(rsvp.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleResendRsvp(rsvp.id, rsvp.email)}
                                disabled={sendingResendRsvpId === rsvp.id}
                                className="px-3 py-2 border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 text-[11px] font-sans font-medium transition-colors disabled:opacity-50"
                                title="Reenviar e-mail de confirmação de presença"
                              >
                                {sendingResendRsvpId === rsvp.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                                    <span>Enviando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                    <span>Reenviar</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteRsvp(rsvp.id)}
                                className="px-3 py-2 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-650 dark:text-red-400 flex items-center gap-1.5 text-[11px] font-sans font-medium transition-colors"
                                title="Remover esta confirmação de presença"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {rsvps.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400 font-light font-serif">
                          Nenhuma confirmação de presença registrada ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Schedule & Timeline Management */}
        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">Programação & Detalhes do Evento</h1>
              <p className="text-xs text-zinc-500 mt-1">Gerencie a timeline da festa ("O que vai acontecer") e as informações de local/horário ("O Grande Dia").</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form de Nova / Editar Atividade */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white">
                  {editingActivity ? 'Editar Atividade' : 'Nova Atividade da Programação'}
                </h2>

                <form onSubmit={handleSaveActivity} className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Horário (Ex: 15:00, 16:30) *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.time}
                      onChange={(e) => setActivityForm((p) => ({ ...p, time: e.target.value }))}
                      placeholder="Ex: 15:00"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Título da Atividade *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.title}
                      onChange={(e) => setActivityForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: Recepção & Drinks"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Descrição da Atividade (Opcional)
                    </label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Ex: Recepção dos convidados com coquetel de boas-vindas."
                      rows={3}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    {editingActivity && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingActivity(null);
                          setActivityForm({ id: '', time: '', title: '', description: '' });
                        }}
                        className="px-4 py-2.5 border border-zinc-200 text-zinc-600 text-xs font-sans rounded-xl hover:bg-zinc-50"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Salvando...' : editingActivity ? 'Atualizar Atividade' : 'Adicionar Atividade'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Atividades Cadastradas */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white">
                  Programação Atual ({activities.length})
                </h2>

                <div className="space-y-4">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-semibold tracking-wider text-brand-muted uppercase block">
                          ⏰ {act.time || 'Sem horário'}
                        </span>
                        <h3 className="font-serif text-base font-light text-zinc-900 dark:text-white">
                          {act.title}
                        </h3>
                        {act.description && (
                          <p className="text-xs text-zinc-500 font-light leading-relaxed">
                            {act.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditActivity(act)}
                          className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 text-xs"
                          title="Editar Atividade"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-2 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-600 dark:text-red-400 text-xs"
                          title="Excluir Atividade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <p className="py-8 text-center text-zinc-400 font-serif font-light text-xs">
                      Nenhuma atividade cadastrada ainda na programação.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Gallery Management */}
        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-7 h-7 text-zinc-400" /> Fotos do Casal ({photos.length})
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Personalize os textos e legendas exibidos em cada foto do ensaio no site.
                </p>
              </div>
            </div>

            {/* Grid de Edição de Fotos do Pré-Wedding */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-sans font-semibold uppercase tracking-wider text-white">
                        Foto #{photo.order || index + 1}
                      </div>
                    </div>

                    <div className="p-4 space-y-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex flex-col justify-between flex-grow">
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Texto / Legenda
                        </label>
                        <textarea
                          rows={2}
                          value={photoCaptions[photo.id] ?? photo.caption ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhotoCaptions((prev) => ({ ...prev, [photo.id]: val }));
                          }}
                          placeholder="Digite a legenda desta foto..."
                          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none leading-relaxed font-sans"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={savingPhotoId === photo.id}
                        onClick={() => handleUpdatePhotoCaption(photo)}
                        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] font-sans font-semibold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {savingPhotoId === photo.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                          </>
                        ) : (
                          'Salvar Legenda'
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {photos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-zinc-400 font-serif font-light">
                    Nenhuma foto encontrada.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Textos & Conteúdo */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-7 h-7 text-zinc-400" /> Textos & História do Casal
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Personalize com total liberdade a história do casal, os nomes e a mensagem de boas-vindas da capa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const suggestedText = `Tudo começou de forma leve e genuína, descobrindo aos poucos que o nosso lugar favorito no mundo era sempre ao lado um do outro. Entre conversas sem pressa, olhares cúmplices e sonhos compartilhados, fomos construindo dia após dia o amor que hoje nos guia.\n\nO nosso Chá de Panela é um capítulo muito especial no caminho até o altar. Mais do que montar o nosso futuro lar, queremos celebrar a vida e brindar este momento ao lado de quem realmente faz parte da nossa história. Preparem-se para uma tarde cheia de abraços, boas risadas e memórias que guardaremos para sempre!`;
                  setSettingsForm((p) => ({ ...p, historyText: suggestedText }));
                  toast.success('Sugestão de texto carregada no formulário!');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> Carregar Sugestão Emocionante
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Formulário de Textos */}
              <div className="lg:col-span-7 space-y-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSaving(true);
                    try {
                      const resSettings = await saveSettings(settingsForm);
                      const resEvent = await saveEvent(eventForm);
                      if (resSettings.success && resEvent.success) {
                        setSettings(resSettings.settings);
                        setEvent(resEvent.event);
                        toast.success('Todos os textos foram salvos com sucesso!');
                        router.refresh();
                      }
                    } catch (err) {
                      toast.error('Erro ao salvar os textos.');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6"
                >
                  {/* Identidade dos Noivos */}
                  <div className="space-y-4">
                    <h2 className="font-serif text-lg font-light text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      💍 Identidade & Capa (Hero)
                    </h2>

                    <div>
                      <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                        Nomes dos Noivos
                      </label>
                      <input
                        type="text"
                        value={settingsForm.coupleNames}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, coupleNames: e.target.value }))}
                        placeholder="Ex: Naila & Yuri"
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                        Mensagem de Boas-Vindas da Capa (Abaixo da contagem regressiva)
                      </label>
                      <textarea
                        rows={3}
                        value={eventForm.description}
                        onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Estamos preparando cada detalhe com muito amor para celebrar essa nova fase das nossas vidas com vocês!"
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Seção Nossa História */}
                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-lg font-light text-zinc-900 dark:text-white flex items-center gap-2">
                        📖 Texto da História do Casal
                      </h2>
                      <span className="text-[10px] text-zinc-400 font-light">Seção "O Início de Tudo"</span>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                        História Completa (Separe os parágrafos pulando uma linha)
                      </label>
                      <textarea
                        rows={8}
                        value={settingsForm.historyText}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, historyText: e.target.value }))}
                        placeholder="Escreva aqui a história de vocês com carinho e emoção..."
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-y leading-relaxed font-serif"
                      />
                      <p className="text-[11px] text-zinc-400 mt-1.5 font-light">
                        💡 Pule uma linha entre cada parágrafo para que eles apareçam organizados e elegantes no site.
                      </p>
                    </div>
                  </div>

                  {/* Endereço de Entrega */}
                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h2 className="font-serif text-lg font-light text-zinc-900 dark:text-white flex items-center gap-2">
                      📦 Endereço para Envio de Presentes Físicos
                    </h2>
                    <div>
                      <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1.5">
                        Instruções e Endereço de Entrega
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.deliveryAddress}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                        placeholder="Ex: Rua Montevidéu, 1191 - 4º andar..."
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    Salvar Todos os Textos
                  </button>
                </form>
              </div>

              {/* Live Preview Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6 sticky top-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] tracking-widest font-sans uppercase font-semibold text-zinc-400 flex items-center gap-1.5">
                      👁️ Pré-visualização no Site
                    </span>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                      Tempo Real
                    </span>
                  </div>

                  {/* Preview da Capa */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-400 block">Hero • Capa</span>
                    <h3 className="font-serif text-xl font-light text-zinc-900 dark:text-white">
                      Chá de Panela
                    </h3>
                    <p className="font-script text-2xl text-zinc-700 dark:text-zinc-300 italic">
                      {settingsForm.coupleNames || 'Naila & Yuri'}
                    </p>
                    <p className="text-xs text-zinc-500 font-light leading-relaxed pt-1">
                      {eventForm.description || 'Estamos preparando cada detalhe com muito amor para celebrar essa nova fase das nossas vidas com vocês!'}
                    </p>
                  </div>

                  {/* Preview da História */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-3">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-400 block">Seção • Nossa História</span>
                    <h4 className="font-serif text-lg font-light text-zinc-900 dark:text-white text-center">
                      O Início de Tudo
                    </h4>
                    <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 font-serif leading-relaxed text-center italic">
                      {(settingsForm.historyText ||
                        'Tudo começou de forma leve e genuína, descobrindo aos poucos que o nosso lugar favorito no mundo era sempre ao lado um do outro...\n\nO nosso Chá de Panela é um capítulo muito especial no caminho até o altar...')
                        .split('\n')
                        .filter((p: string) => p.trim().length > 0)
                        .map((p: string, i: number) => (
                          <p key={i}>"{p}"</p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">Configurações do Sistema</h1>
              <p className="text-xs text-zinc-500 mt-1">Configure os metadados do site, PIX e endereço de entrega.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Event Settings Form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-zinc-400" /> Detalhes do Evento
                </h2>

                <form onSubmit={handleSaveEvent} className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Título do Evento *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Data & Hora *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Local do Evento
                    </label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Ex: Salão de Festas Jardins"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      value={eventForm.address}
                      onChange={(e) => setEventForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Rua, número, bairro, cidade - UF"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Link do Google Maps
                    </label>
                    <input
                      type="url"
                      value={eventForm.mapsUrl}
                      onChange={(e) => setEventForm((p) => ({ ...p, mapsUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                      Descrição do Evento
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Mensagem explicativa sobre o chá de panela..."
                      rows={3}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    Salvar Evento
                  </button>
                </form>
              </div>

              {/* System & Billing Settings Form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-xl font-light text-zinc-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-zinc-400" /> Identidade do Casal & Opções
                </h2>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  {/* Identidade do Casal */}
                  <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold tracking-wider font-sans uppercase flex items-center gap-1.5 text-zinc-650">
                      💍 Identidade do Casal
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Nomes do Casal (Exibidos na Home)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.coupleNames}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, coupleNames: e.target.value }))}
                          placeholder="Ex: Naila & Yuri"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Título da Aba do Navegador
                        </label>
                        <input
                          type="text"
                          value={settingsForm.siteTitle}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, siteTitle: e.target.value }))}
                          placeholder="Ex: Naila & Yuri | Chá de Panela"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Opções de Exibição de Preço */}
                  <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold tracking-wider font-sans uppercase flex items-center gap-1.5 text-zinc-650">
                      <DollarSign className="w-4 h-4" /> Exibição de Preços dos Presentes
                    </h3>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block">Exibir valores dos produtos na lista pública</span>
                        <span className="text-[10px] text-zinc-400 font-light block">Se desativado, a lista mostrará apenas as fotos, nomes e o botão para presentear/ver na loja.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsForm((p) => ({ ...p, showPrices: !p.showPrices }))}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          settingsForm.showPrices ? 'bg-black dark:bg-white justify-end' : 'bg-zinc-200 dark:bg-zinc-800 justify-start'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shadow-md ${
                            settingsForm.showPrices ? 'bg-white dark:bg-black' : 'bg-zinc-400'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* PIX */}
                  <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold tracking-wider font-sans uppercase flex items-center gap-1.5 text-zinc-650">
                      <QrCode className="w-4 h-4" /> Configuração PIX
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Chave PIX (E-mail, Celular ou CPF)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.pixKey}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, pixKey: e.target.value }))}
                          placeholder="Ex: nailaeyuri@gmail.com"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Nome do Favorecido (Recebedor)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.pixReceiver}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, pixReceiver: e.target.value }))}
                          placeholder="Ex: Naila Souza"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Cidade do Recebedor
                        </label>
                        <input
                          type="text"
                          value={settingsForm.pixCity}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, pixCity: e.target.value }))}
                          placeholder="Ex: Sao Paulo"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endereço Entrega Restrito */}
                  <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold tracking-wider font-sans uppercase flex items-center gap-1.5 text-zinc-650">
                      <MapPin className="w-4 h-4" /> Endereço Seguro de Entrega
                    </h3>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Este endereço só será exibido ao convidado <strong>após</strong> ele concluir a reserva do presente.
                    </p>
                    <textarea
                      value={settingsForm.deliveryAddress}
                      onChange={(e) => setSettingsForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                      placeholder="Ex: Av. Brigadeiro Luís Antônio, 200 - Apto 42&#10;Bela Vista, São Paulo - SP&#10;CEP: 01317-000"
                      rows={3}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                    />
                  </div>

                  {/* SEO / Branding */}
                  <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold tracking-wider font-sans uppercase flex items-center gap-1.5 text-zinc-650">
                      <Globe className="w-4 h-4" /> Branding & SEO
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Título SEO do Site
                        </label>
                        <input
                          type="text"
                          value={settingsForm.siteTitle}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, siteTitle: e.target.value }))}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Descrição SEO
                        </label>
                        <input
                          type="text"
                          value={settingsForm.siteDescription}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, siteDescription: e.target.value }))}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] tracking-widest font-sans text-brand-muted uppercase mb-1">
                          Palavras-Chave SEO
                        </label>
                        <input
                          type="text"
                          value={settingsForm.siteKeywords}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, siteKeywords: e.target.value }))}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-sans tracking-wider uppercase font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    Salvar Configurações
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
