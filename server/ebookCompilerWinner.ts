import { WinnerEbookContent, GeneratedWinnerChapter } from "./ebookGeneratorWinner";

/**
 * Compila eBook vencedor em HTML profissional para EPUB reflowable
 */
export function compileWinnerToHTML(ebook: WinnerEbookContent): string {
  const toc = generateTOC(ebook.chapters);
  const chaptersHTML = ebook.chapters.map(ch => compileChapter(ch)).join('\n');
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ebook.title}</title>
  ${getWinnerStyles()}
</head>
<body>
  
  <!-- CAPA -->
  <div class="cover" style="page-break-after: always;">
    <h1 class="cover-title">${ebook.title}</h1>
    <p class="cover-subtitle">${ebook.subtitle}</p>
    <p class="cover-author">por ${ebook.author}</p>
  </div>

  <!-- DIREITOS -->
  <div class="rights" style="page-break-after: always;">
    <h2>Direitos Autorais</h2>
    <p>© ${new Date().getFullYear()} ${ebook.author}. Todos os direitos reservados.</p>
    <p>Nenhuma parte deste eBook pode ser reproduzida, armazenada em sistema de recuperação ou transmitida de qualquer forma ou por qualquer meio sem a permissão prévia por escrito do autor.</p>
    <p><strong>Primeira edição:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    <p><strong>ISBN:</strong> Aguardando registro</p>
  </div>

  <!-- SUMÁRIO -->
  <div class="toc" style="page-break-after: always;">
    <h1>Sumário</h1>
    ${toc}
  </div>

  <!-- CARTA AO LEITOR -->
  <div class="reader-letter" style="page-break-after: always;">
    <h1>Carta ao Leitor</h1>
    ${formatContent(ebook.frontMatter.readerLetter)}
  </div>

  <!-- CAPÍTULOS -->
  ${chaptersHTML}

  <!-- BÔNUS -->
  <div class="bonus" style="page-break-before: always;">
    <h1>Bônus Exclusivos</h1>
    ${formatContent(ebook.backMatter.bonus)}
  </div>

  <!-- SOBRE O AUTOR -->
  <div class="about-author" style="page-break-before: always;">
    <h1>Sobre o Autor</h1>
    ${formatContent(ebook.backMatter.aboutAuthor)}
  </div>

  <!-- CTA PRÓXIMO PASSO -->
  <div class="cta-next" style="page-break-before: always;">
    <h1>Próximo Passo</h1>
    ${formatContent(ebook.backMatter.ctaNext)}
  </div>

  <!-- AGRADECIMENTOS -->
  <div class="acknowledgments" style="page-break-before: always;">
    <h1>Agradecimentos</h1>
    <p>Obrigado por investir seu tempo na leitura deste eBook. Sua jornada de transformação começa agora!</p>
    <p>Se este conteúdo agregou valor, por favor deixe uma avaliação honesta na loja onde adquiriu. Sua opinião ajuda outros leitores a descobrir este trabalho.</p>
    <p>Para mais conteúdos, atualizações e recursos exclusivos, conecte-se comigo nas redes sociais ou visite meu site.</p>
    <p class="signature">— ${ebook.author}</p>
  </div>

</body>
</html>
  `.trim();
}

/**
 * Gera sumário navegável com links internos
 */
function generateTOC(chapters: GeneratedWinnerChapter[]): string {
  const items = chapters.map(ch => 
    `<li><a href="#chapter-${ch.number}">${ch.fullTitle}</a></li>`
  ).join('\n');
  
  return `
    <nav class="toc-nav">
      <ol class="toc-list">
        ${items}
      </ol>
    </nav>
  `;
}

/**
 * Compila um capítulo com formatação profissional
 */
function compileChapter(chapter: GeneratedWinnerChapter): string {
  return `
  <div class="chapter" id="chapter-${chapter.number}" style="page-break-before: always;">
    <h1 class="chapter-title">${chapter.fullTitle}</h1>
    <div class="chapter-content">
      ${formatContent(chapter.content)}
    </div>
    <div class="chapter-footer">
      <p class="word-count"><em>${chapter.wordCount} palavras</em></p>
    </div>
  </div>
  `;
}

/**
 * Formata conteúdo de texto em HTML semântico
 */
function formatContent(text: string): string {
  // Converte markdown-like para HTML
  let html = text;
  
  // Headers H2
  html = html.replace(/^## (.+)$/gm, '<h2 class="section-title">$1</h2>');
  
  // Headers H3
  html = html.replace(/^### (.+)$/gm, '<h3 class="subsection-title">$1</h3>');
  
  // Listas numeradas
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ol class="numbered-list">$1</ol>');
  
  // Listas com marcadores
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul class="bullet-list">$1</ul>');
  
  // Negrito
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Itálico
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Citações
  html = html.replace(/^> (.+)$/gm, '<blockquote class="quote">$1</blockquote>');
  
  // Parágrafos (linhas que não são tags HTML)
  html = html.split('\n').map(line => {
    if (line.trim() === '') return '';
    if (line.trim().startsWith('<')) return line;
    return `<p>${line}</p>`;
  }).join('\n');
  
  return html;
}

/**
 * Estilos CSS profissionais para EPUB reflowable
 */
function getWinnerStyles(): string {
  return `
  <style>
    /* Reset e Base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.3;
      color: #1a1a1a;
      text-align: left;
      hyphens: auto;
      -webkit-hyphens: auto;
      -moz-hyphens: auto;
    }
    
    /* Indentação de parágrafos (padrão EPUB) */
    p {
      text-indent: 0.9em;
      margin-bottom: 0;
      text-align: justify;
    }
    
    /* Primeiro parágrafo de seção sem indentação */
    h1 + p,
    h2 + p,
    h3 + p,
    .chapter-content > p:first-child {
      text-indent: 0;
    }
    
    /* Quebra de cena/assunto */
    p + p.scene-break {
      margin-top: 1em;
      text-indent: 0;
    }
    
    /* Títulos H1 (Capítulos) */
    h1 {
      font-size: 1.8em;
      font-weight: bold;
      margin-top: 2em;
      margin-bottom: 1em;
      text-align: center;
      page-break-before: always;
      page-break-after: avoid;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .chapter-title {
      font-size: 1.6em;
      margin-top: 1.5em;
    }
    
    /* Títulos H2 (Seções) */
    h2 {
      font-size: 1.3em;
      font-weight: bold;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      page-break-after: avoid;
      color: #2c3e50;
    }
    
    .section-title {
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.3em;
    }
    
    /* Títulos H3 (Subseções) */
    h3 {
      font-size: 1.1em;
      font-weight: bold;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      page-break-after: avoid;
      color: #34495e;
    }
    
    /* Listas */
    ol, ul {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    li {
      margin-bottom: 0.5em;
      line-height: 1.4;
    }
    
    .numbered-list {
      list-style-type: decimal;
    }
    
    .bullet-list {
      list-style-type: disc;
    }
    
    /* Citações */
    blockquote {
      margin: 1.5em 2em;
      padding: 1em;
      border-left: 4px solid #3498db;
      background-color: #f8f9fa;
      font-style: italic;
      text-indent: 0;
    }
    
    .quote {
      font-size: 0.95em;
      color: #555;
    }
    
    /* Ênfase */
    strong {
      font-weight: bold;
      color: #2c3e50;
    }
    
    em {
      font-style: italic;
    }
    
    /* Links */
    a {
      color: #3498db;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Capa */
    .cover {
      text-align: center;
      padding: 4em 2em;
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .cover-title {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      line-height: 1.2;
      color: #1a1a1a;
    }
    
    .cover-subtitle {
      font-size: 1.3em;
      margin-bottom: 2em;
      color: #555;
      font-style: italic;
      text-indent: 0;
    }
    
    .cover-author {
      font-size: 1.2em;
      margin-top: 3em;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-indent: 0;
    }
    
    /* Direitos */
    .rights {
      padding: 2em;
      font-size: 0.9em;
      color: #666;
    }
    
    .rights p {
      margin-bottom: 1em;
      text-indent: 0;
    }
    
    /* Sumário */
    .toc {
      padding: 2em;
    }
    
    .toc h1 {
      margin-bottom: 1.5em;
    }
    
    .toc-nav {
      margin: 2em 0;
    }
    
    .toc-list {
      list-style: none;
      padding: 0;
    }
    
    .toc-list li {
      margin-bottom: 0.8em;
      padding-left: 1em;
      text-indent: -1em;
    }
    
    .toc-list a {
      color: #2c3e50;
      font-size: 1.05em;
    }
    
    /* Carta ao Leitor */
    .reader-letter {
      padding: 2em;
    }
    
    /* Capítulos */
    .chapter {
      padding: 1em 0;
    }
    
    .chapter-content {
      margin-top: 2em;
    }
    
    .chapter-footer {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #ddd;
      text-align: center;
    }
    
    .word-count {
      font-size: 0.85em;
      color: #999;
      text-indent: 0;
    }
    
    /* Back Matter */
    .bonus,
    .about-author,
    .cta-next,
    .acknowledgments {
      padding: 2em;
    }
    
    .signature {
      text-align: right;
      font-style: italic;
      margin-top: 2em;
      text-indent: 0;
    }
    
    /* Tabelas (para plano de 30 dias) */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      font-size: 0.9em;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.8em;
      text-align: left;
      vertical-align: top;
    }
    
    th {
      background-color: #3498db;
      color: white;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    /* Responsivo para mobile */
    @media (max-width: 600px) {
      body {
        font-size: 10pt;
        line-height: 1.4;
      }
      
      h1 {
        font-size: 1.5em;
      }
      
      h2 {
        font-size: 1.2em;
      }
      
      h3 {
        font-size: 1.05em;
      }
      
      .cover-title {
        font-size: 2em;
      }
      
      blockquote {
        margin: 1em 1em;
        padding: 0.8em;
      }
    }
    
    /* Impressão / PDF */
    @media print {
      body {
        font-size: 11pt;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      .chapter {
        page-break-before: always;
      }
      
      a {
        color: #000;
        text-decoration: none;
      }
    }
  </style>
  `;
}

