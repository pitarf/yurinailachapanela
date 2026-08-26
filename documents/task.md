# Roadmap de Tarefas - Plataforma Naila & Yuri

## Pendentes
*(Nenhuma tarefa pendente! A primeira versão da plataforma está totalmente concluída.)*

## Fazendo
- [x] Análise da Documentação Base e PDF de Identidade Visual (`ID_NAIEYURI.pdf` & `monograma_popyn.pdf`)
- [x] Definição de Arquitetura Modular e Estrutura de Subagentes

## Concluído
- [x] Análise detalhada dos requisitos do casal Naila & Yuri
- [x] Inicialização da aplicação Next.js com TypeScript e Tailwind CSS
- [x] Construção do Design System Editorial em Preto & Branco baseado no PDF de ID Visual
- [x] Otimização e compressão das 16 fotos de pré-wedding em formato WebP
- [x] Atualização das informações oficiais do evento (ADVEC Templo Auxiliar, 11/10/2026, 13h)
- [x] Importação da lista oficial de presentes e links da Shopee
- [x] Web Scraping automatizado com extração das imagens reais dos produtos
- [x] Ordenação alfabética (A-Z) e controles manuais de posição (⬆️/⬇️) para presentes
- [x] Ajuste do layout do catálogo para 5 colunas no Desktop
- [x] Integração completa com **Neon PostgreSQL** e fallback JSON autônomo
- [x] Sistema de e-mails transacionais e lembretes inteligentes via **Brevo API** com cópia para os noivos (`coutinhonaila20@gmail.com`)
- [x] Disparos automáticos em marcos cronológicos: 14 dias (Save the Date), 7 dias (1 semana), 3 dias (Reta final) e Dia do Evento (É Hoje!) com deduplicação de convidados
- [x] Sistema de **Confirmação de Presença (RSVP)** completo:
  - Seção `#presenca` na Home com campos para titular, acompanhantes, quantidade (1-5), nomes e recado
  - Modelo `Rsvp` no banco de dados e persistência
  - Gestão de presenças no Painel Admin (`/admin`), reenvio de e-mail, cópia formatada de lista para WhatsApp e exclusão
- [x] Validação completa de TypeScript e compilação de produção com 0 erros
