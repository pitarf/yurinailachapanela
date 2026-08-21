'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, Heart, Calendar, Gift, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fecha o menu mobile quando a tela é redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bloqueia o scroll do body quando o menu está aberto no celular
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { href: '#historia', label: 'Nossa História', icon: Heart },
    { href: '#galeria', label: 'Galeria de Fotos', icon: ImageIcon },
    { href: '#evento', label: 'O Evento', icon: Calendar },
    { href: '#presentes', label: 'Lista de Presentes', icon: Gift },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className="w-full py-3 sm:py-4 px-5 sm:px-8 md:px-12 border-b border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between z-40 sticky top-0 bg-cover bg-center shadow-xs transition-all relative overflow-hidden"
        style={{ backgroundImage: "url('/bgnavbar.jpeg')" }}
      >
        {/* Overlay sutil para garantir legibilidade e contraste premium */}
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/70 backdrop-blur-[2px] pointer-events-none" />

        {/* Logo Oficial Completa */}
        <a href="#" className="relative z-10 flex items-center group transition-transform active:scale-95">
          <Image
            src="/logocompleta_yn.png"
            alt="Naila & Yuri"
            width={240}
            height={80}
            className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs"
            priority
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="relative z-10 hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-sans tracking-widest font-medium text-zinc-800 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white uppercase transition-colors drop-shadow-xs"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/admin"
            className="text-xs font-sans tracking-widest font-semibold text-zinc-900 dark:text-white uppercase border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs px-4 py-2 rounded-full transition-all hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 shadow-xs"
          >
            Painel Admin
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="relative z-10 flex md:hidden items-center gap-2">
          <a
            href="#presentes"
            className="px-3.5 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-sans font-semibold uppercase tracking-wider rounded-full shadow-sm"
          >
            Presentear
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="p-2 text-zinc-900 dark:text-white bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-colors active:scale-95 border border-zinc-200/60 dark:border-zinc-750"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Fullscreen Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-fade-in flex flex-col justify-end">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Image
                  src="/logocompleta_yn.png"
                  alt="Naila & Yuri"
                  width={160}
                  height={50}
                  className="h-8 sm:h-9 w-auto object-contain"
                  priority
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-6 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all font-sans text-sm tracking-wide font-medium active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Admin Login Link */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href="/admin"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-sans text-xs font-semibold uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                Painel do Administrador
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
