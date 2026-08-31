import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const vogue = localFont({
  src: '../fonts/vogue.ttf',
  variable: '--font-vogue',
  display: 'swap',
});

const nautica = localFont({
  src: '../fonts/nautica.ttf',
  variable: '--font-nautica',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Naila & Yuri | Chá de Panela',
  description: 'Seja bem-vindo ao site de Chá de Panela e futura celebração de casamento de Naila & Yuri.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${vogue.variable} ${nautica.variable}`}>
      <body className="antialiased min-h-screen bg-white dark:bg-zinc-950 text-brand-black dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
        {children}
        <Toaster position="top-center" richColors theme="system" />
      </body>
    </html>
  );
}
