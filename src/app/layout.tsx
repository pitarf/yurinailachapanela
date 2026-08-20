import type { Metadata } from 'next';
import { Inter, Playfair_Display, Alex_Brush } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const alexBrush = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alex-brush',
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
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} ${alexBrush.variable}`}>
      <body className="antialiased min-h-screen bg-white text-brand-black">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
