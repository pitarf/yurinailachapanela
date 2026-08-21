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
      <body className="antialiased min-h-screen bg-white text-brand-black">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
