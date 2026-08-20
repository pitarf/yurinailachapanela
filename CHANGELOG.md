# CHANGELOG - Plataforma Naila & Yuri

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.2.0] - 2026-08-20
### Alterado & Aprimorado
- Integração e migração completa para o banco de dados **Neon PostgreSQL** no schema isolado `yuri_naila`.
- Aba "Galeria" do Painel Administrativo reformulada: removido o formulário de adicionar novas fotos avulsas e implementada a edição individual das legendas e textos de cada uma das 16 fotos de pré-wedding.

## [1.1.0] - 2026-08-20
### Adicionado
- Camada de persistência desacoplada em JSON (`src/lib/json-db.ts` e `src/data/database.json`) garantindo funcionamento 100% autônomo e sem dependência de banco de dados externo para deploy imediato na Vercel.
- Otimização e compressão das 16 fotos de pré-wedding reais do casal para formato WebP.
- Importação da lista oficial com 112 presentes organizados em 6 categorias.
- Web Scraping automatizado com extração das imagens reais oficiais de capa de todos os 112 produtos.
- Nova aba "Textos & História" no Painel Administrativo com live preview em tempo real.
- Grid de presentes ajustado para 5 colunas no Desktop com largura máxima expandida para 1600px.
- Limpeza e refinamento da interface do modal de reservas, eliminando redundâncias.

## [1.0.0] - 2026-08-08
### Adicionado
- Análise completa de requisitos do `documento_base.txt`.
- Análise da Identidade Visual (`ID_NAIEYURI.pdf` e `monograma_popyn.pdf`).
- Inicialização do Next.js com TypeScript e Tailwind CSS.
- Landing page interativa com contagem regressiva, história, timeline do evento e grid de presentes.
- Painel Administrativo `/admin` completo com KPIs de reservas, CRUD de presentes, gestão de convidados e configurações de SEO, PIX e endereço restrito.
