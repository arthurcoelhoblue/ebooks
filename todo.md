# Project TODO

## Completed Features
- [x] Schema do banco de dados (eBooks, publishing guides)
- [x] Sistema de autenticação com Manus OAuth
- [x] Geração de conteúdo com OpenAI (Function Calling)
- [x] Geração de capas com IA
- [x] Compilação de HTML para EPUB/PDF
- [x] Landing page moderna
- [x] Dashboard de gerenciamento de eBooks
- [x] Modal de criação de eBooks
- [x] Página de detalhes com guias de monetização
- [x] Guias básicos para Amazon KDP, Hotmart, Eduzz, Monetizze

## New Features Implemented (Sistema Híbrido Confirmado)
- [x] Sistema híbrido: 95% automatizado + interface copiar-colar
- [x] Sistema de agendamento automático de geração de eBooks
- [x] Interface para configurar periodicidade (diária, semanal, mensal)
- [x] Opção de lista de temas personalizados
- [x] Opção de tema único para todos os eBooks
- [x] Pesquisa automática de temas em alta (trending topics)
- [x] Geração automática de metadados otimizados (título, descrição, palavras-chave, categorias)
- [x] Interface "copiar e colar" para metadados por plataforma
- [x] Checklist interativo nos guias de monetização
- [x] Campos preenchidos automaticamente nos guias
- [x] Sugestões de preço por plataforma
- [x] Sugestões de categorias por tema

## Pending Features
- [ ] Dashboard com estatísticas de eBooks gerados
- [ ] Execução automática dos agendamentos via cron job (requer configuração de servidor)

## In Progress

## Recently Added
- [x] Worker de processamento de agendamentos (schedulerWorker.ts)
- [x] Botão "Gerar Agora" para trigger manual de agendamentos
- [x] Processamento assíncrono de geração de eBooks
- [x] Campo para escolher horário específico de geração (formato HH:MM)
- [x] Cálculo inteligente do próximo horário considerando hora escolhida
- [x] Badges de status em tempo real (Gerando/Concluído/Erro)
- [x] Contador de eBooks em processamento no Dashboard
- [x] Auto-refresh a cada 5s quando há eBooks sendo gerados
- [x] Indicador visual na página de Agendamentos
- [x] Sistema completo de controle de publicações
- [x] Marcar eBooks como publicados em múltiplas plataformas
- [x] Badges coloridos mostrando onde cada eBook foi publicado
- [x] Dialog para adicionar publicações com URL
- [x] Remover publicações com um clique
- [x] Tabela publications no banco de dados

