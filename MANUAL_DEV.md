# MANUAL DO DESENVOLVEDOR - PLATAFORMA NAILA & YURI

Este manual descreve a arquitetura, estrutura de pastas, modelos de dados e instruções de deploy para a plataforma de Chá de Panela e Casamento do casal **Naila & Yuri**.

---

## 1. Visão Geral da Arquitetura

* **Framework:** Next.js (App Router) com TypeScript
* **Estilização:** Tailwind CSS (Design System Editorial Monocromático)
* **Camada de Dados:** Gerenciador desacoplado em JSON (`src/lib/json-db.ts` lendo de `src/data/database.json`), permitindo execução imediata na **Vercel** com zero configuração de infraestrutura ou banco externo.
* **Componentes Principais:**
  * `HeroSlider.tsx`: Slider fotográfico de capa com fotos de pré-wedding otimizadas em WebP.
  * `Countdown.tsx`: Contador regressivo em tempo real para a data do evento.
  * `GiftsList.tsx`: Catálogo interativo de presentes em 5 colunas no Desktop com busca e filtros por categoria.
  * `GiftReservationModal.tsx`: Modal elegante para reservas e exibição do endereço de entrega / chave PIX.
  * `AdminPanel.tsx`: Painel administrativo completo para controle de presentes, atividades, fotos, textos e configurações.

---

## 2. Estrutura de Pastas

```
c:/Git/React/YURIeNAIsite/
├── public/
│   ├── pre-wedding/         # 16 fotos de pré-wedding do casal otimizadas em WebP
│   └── monograma_popyn.png  # Identidade visual oficial
├── src/
│   ├── app/
│   │   ├── admin/           # Rotas do painel administrativo (/admin e /admin/login)
│   │   ├── api/             # Endpoints de API (/api/reservations e /api/og)
│   │   ├── layout.tsx       # Layout raiz com fontes e tema
│   │   └── page.tsx         # Landing Page principal
│   ├── components/          # Componentes reutilizáveis de UI
│   ├── data/
│   │   └── database.json    # Base de dados estática completa (112 presentes, fotos, evento)
│   └── lib/
│       ├── json-db.ts       # Módulo de persistência e operações CRUD
│       └── prisma.ts        # Adaptador Prisma (opcional para conexão PostgreSQL)
├── scripts/                 # Scripts utilitários de scraping, importação e exportação
├── CHANGELOG.md             # Histórico de alterações e versões
└── MANUAL_DEV.md            # Este manual técnico
```

---

## 3. Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build
```

---

## 4. Deploy na Vercel

1. Suba o repositório para o GitHub / GitLab.
2. Importe o projeto diretamente na **Vercel**.
3. Defina a variável de ambiente opcional:
   * `ADMIN_PASSWORD`: Senha de acesso ao painel `/admin` (Padrão: `yurienaila2026`).
4. Clique em **Deploy**. O projeto compilará e funcionará perfeitamente com todas as fotos, 112 presentes e textos pré-carregados!
