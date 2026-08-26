# CHANGELOG - Plataforma Naila & Yuri

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

## [1.4.0] - 2026-08-26
### Adicionado
- **Sistema de Confirmação de Presença (RSVP) & Link Direto**:
  - Nova página direta `/presenca` com SEO completo, cards informativos do evento, contador regressivo e formulário focado para envio no WhatsApp/redes sociais.
  - Slugs alternativos de redirecionamento automático: `/rsvp` e `/confirmar-presenca`.
  - Botão **"Copiar Link (/presenca)"** adicionado no cabeçalho da aba de Presenças no Painel Administrativo.
  - Seção `#presenca` na Landing Page com formulário mobile-first sofisticado: titular, acompanhantes, quantidade (1 a 5), nomes e recadinho aos noivos.
  - Modelo `Rsvp` no Neon PostgreSQL (`prisma/schema.prisma`) e persistência JSON (`src/lib/json-db.ts`).
  - Nova aba **"Presenças (RSVP)"** no Painel Admin com busca, reenvio de e-mail e cópia formatada da lista.

## [1.3.0] - 2026-08-21
### Adicionado
- Integração oficial com **Brevo API** para envio de e-mails transacionais.
- Disparo imediato de e-mail de confirmação de presente com cópia para os noivos (`coutinhonaila20@gmail.com`).
- Botão de reenvio manual de e-mail de reserva no painel administrativo.
- Botão de ordenação alfabética (A-Z) e controles de posição (⬆️/⬇️) para os presentes da lista.
- Atualização das capas oficiais dos pratos Nadir Pétala e Bomboniere de vidro.

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
