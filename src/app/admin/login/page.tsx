'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login } from '../actions';
import Logo from '@/components/Logo';
import Head from 'next/head';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    try {
      const result = await login(password);
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(result.error || 'Senha inválida.');
      }
    } catch (err) {
      toast.error('Erro ao realizar login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-900 dark:text-white">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-popyn shadow-xl p-8 md:p-10 space-y-8 animate-fade-in">
          
          <div className="flex flex-col items-center space-y-4">
            <Logo variant="monogram" size={80} className="opacity-80" />
            <div className="text-center">
              <h1 className="font-serif text-2xl font-light text-zinc-900 dark:text-white">
                Área Restrita
              </h1>
              <p className="text-xs text-zinc-400 font-light mt-1 uppercase tracking-widest font-sans">
                Painel Administrativo
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] tracking-widest font-sans text-brand-muted uppercase">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira a senha de acesso"
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-sans text-xs tracking-widest font-semibold uppercase rounded-xl transition-all disabled:opacity-50 shadow-md flex items-center justify-center"
            >
              {isSubmitting ? 'Acessando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center pt-2">
            <a
              href="/"
              className="text-xs font-sans tracking-wide text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors uppercase"
            >
              Voltar ao Site Público
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
