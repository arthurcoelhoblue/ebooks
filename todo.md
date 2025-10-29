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

## Bugs Reportados
- [x] Agendamentos não estão sendo executados automaticamente (RESOLVIDO - worker automático implementado com setInterval a cada 60s)
- [x] Falta opção de selecionar idiomas nos agendamentos (RESOLVIDO)
- [x] Erro ao baixar PDF: JSON parse error (RESOLVIDO - implementado sistema multi-idioma)
- [x] Agendamentos não estão gerando arquivos multi-idioma (RESOLVIDO - schedulerWorker atualizado)
- [x] eBooks antigos sem arquivos traduzidos (RESOLVIDO - botão "Reprocessar Todos" adicionado)

## In Progress
- [x] Campo languages adicionado ao banco de dados
- [x] Seletor visual de 11 idiomas no formulário de criação
- [x] Helper de tradução com IA (translator.ts)
- [x] Backend atualizado para receber idiomas selecionados
- [x] Campo languages adicionado à tabela schedules
- [x] Seletor de 11 idiomas no formulário de agendamento
- [x] Backend atualizado para salvar idiomas do agendamento
## Implementação Multi-Idioma Completa
- [x] Tabela ebookFiles criada no banco de dados
- [x] Helper multiLanguageGenerator.ts para geração multi-idioma
- [x] Helper translator.ts para tradução com IA
- [x] Helpers de banco (createEbookFile, getEbookFilesByEbookId)
- [x] Router ebooks.getFiles para buscar arquivos por idioma
- [x] Backend atualizado para gerar arquivo por idioma
- [x] Dialog de arquivos por idioma no Dashboard
- [x] Interface com bandeiras e botões de download por idioma
- [x] Suporte a 11 idiomas (PT, EN, ES, ZH, HI, AR, BN, RU, JA, DE, FR)

## Em Implementação Agora
- [ ] Execução automática de agendamentos (worker em desenvolvimento)
- [x] Campo de número de vendas nas publicações (salesCount)
- [x] Dashboard financeiro com ranking de eBooks (/analytics)
- [x] Ranking por lucro, ROI, vendas e receita
- [x] Totalizadores gerais (receita total, lucro total, etc.)
- [x] Tabela de ranking com badges (top 3)
- [ ] Adicionar campo salesCount no formulário de publicações
- [ ] Badges de vendas nos cards de eBooks do Dashboard
- [ ] Tutoriais detalhados por plataforma (modal/página separada)
- [ ] Botão "Ver Tutorial Completo" em cada guia
- [ ] Requisitos, documentação e passo a passo com exemplos
- [ ] Recomendação inteligente de plataformas por tema
- [ ] Análise do nicho do eBook com IA
- [ ] Badge visual mostrando potencial (alta/média/baixa) por plataforma
- [ ] Dados financeiros por plataforma (ao invés de geral)
- [ ] Cada publicação com tráfego, custos e receita próprios
- [ ] Comparação de performance entre plataformas
- [ ] Ranking de eBooks por performance
- [ ] Ordenação por lucro, ROI, receita
- [ ] Gráficos de performance
- [ ] Badges de destaque (top 3)
- [ ] Filtros por período e status

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
- [x] Guias de publicação interativos com accordion
- [x] Instruções detalhadas em cada passo do checklist
- [x] Campos prontos para copiar dentro de cada passo
- [x] Lista completa de palavras-chave com botão copiar individual
- [x] Categorias sugeridas com botão copiar
- [x] Botões para baixar arquivos (EPUB, PDF, capa)
- [x] Links diretos para abrir plataformas
- [x] Guia completo Amazon KDP (9 passos)
- [x] Guia completo Hotmart (7 passos)
- [x] Permitir múltiplas publicações visíveis simultaneamente
- [x] Mostrar URL de cada plataforma publicada com link direto
- [x] Sistema completo de controle financeiro por eBook
- [x] Campos: investimento em tráfego, outros custos, receita
- [x] Cálculo automático de lucro/prejuízo em tempo real
- [x] Tabela financialMetrics no banco de dados
- [x] Interface de publicações melhorada (card com lista)
- [x] Botão para remover publicações individualmente
- [x] Redirecionamento automático para Dashboard após login
- [x] Landing Page vencedora focada em conversão
- [x] Hero section com CTA forte
- [x] Social proof (1000+ eBooks gerados)
- [x] Seção de benefícios (4 cards)
- [x] Como funciona (4 passos)
- [x] CTA final com urgência
- [x] Logo do EbookStudio criada (2 versões)
- [x] Componente Header com logo e botão de logout
- [x] Header adicionado no Dashboard
- [x] Landing Page atualizada com logo e nome EbookStudio




## Novas Funcionalidades Solicitadas
- [x] Botão para excluir eBooks do Dashboard
- [x] Confirmação antes de excluir
- [x] Deletar eBook e todos os arquivos relacionados (ebookFiles, metadata, publications, financialMetrics)
- [x] Filtros no Dashboard (status, data, idiomas, autor)
- [x] Busca por título/tema
- [x] Ordenação (mais recentes, mais antigos, alfabética)




## Novo Modelo Vencedor de eBook (Baseado em Pesquisa) ✅ IMPLEMENTADO
- [x] Implementar estrutura de não-ficção transformacional (10 capítulos)
- [x] Capítulos otimizados (1200-2500 palavras cada)
- [x] Ganchos no final de cada capítulo (pergunta/promessa/cliffhanger)
- [x] Front matter: capa, direitos, sumário clicável, carta ao leitor
- [x] Cap 1: Big Promise & Gap (história + objetivo + obstáculo)
- [x] Cap 2: Novo Modelo Mental (desmonte crenças + framework)
- [x] Cap 3-7: 5 Pilares (mini-história + conceito + checklist + erro comum + micro-desafio)
- [x] Cap 8: Plano de 30 dias (tabela executável)
- [x] Cap 9: Casos de uso e FAQs
- [x] Cap 10: Conclusão com carta de compromisso
- [x] Back matter: bônus (templates), sobre autor, CTA próximo passo
- [x] Formatação EPUB reflowable profissional
- [x] TOC navegável com links internos
- [x] Quebras de página antes de cada H1
- [x] Estilos CSS corretos (indent 0.9em, line-height 1.3)
- [x] H1 format: "CAPÍTULO {n} — {Título Promissor}"
- [x] Novo gerador integrado ao fluxo principal (multiLanguageGeneratorWinner.ts)

