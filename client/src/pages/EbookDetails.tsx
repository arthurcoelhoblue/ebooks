import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, CheckCircle2, Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

// Guias de publicação para cada plataforma
const GUIDES = {
  amazon_kdp: {
    title: "Amazon Kindle Direct Publishing (KDP)",
    description: "Publique seu eBook na maior plataforma de livros digitais do mundo",
    steps: [
      {
        title: "Criar conta no KDP",
        description: "Acesse kdp.amazon.com e crie uma conta gratuita. Você precisará fornecer informações fiscais.",
        link: "https://kdp.amazon.com",
      },
      {
        title: "Iniciar novo projeto de eBook",
        description: "No painel do KDP, clique em 'Create' e escolha 'Kindle eBook'.",
      },
      {
        title: "Preencher metadados",
        description: "Título, autor, descrição (use palavras-chave relevantes), idioma (Português), e categorias.",
      },
      {
        title: "Escolher palavras-chave",
        description: "Selecione 7 palavras-chave que descrevem seu eBook. Pesquise termos populares no seu nicho.",
      },
      {
        title: "Fazer upload do arquivo EPUB",
        description: "Faça o upload do arquivo EPUB gerado pela nossa plataforma. Use a ferramenta de preview para verificar.",
      },
      {
        title: "Fazer upload da capa",
        description: "Faça o upload da imagem de capa (mínimo 1600x2560 pixels).",
      },
      {
        title: "Definir preço e royalties",
        description: "Escolha entre 35% ou 70% de royalty. Para 70%, o preço deve estar entre $2.99 e $9.99.",
      },
      {
        title: "Publicar",
        description: "Revise tudo e clique em 'Publish'. Seu eBook estará disponível em até 72 horas.",
      },
    ],
  },
  hotmart: {
    title: "Hotmart",
    description: "Venda seu eBook no maior marketplace de produtos digitais do Brasil",
    steps: [
      {
        title: "Criar conta gratuita",
        description: "Acesse hotmart.com e crie uma conta de produtor gratuitamente.",
        link: "https://hotmart.com",
      },
      {
        title: "Cadastrar produto",
        description: "Clique em 'Criar Produto' e escolha a opção 'eBook'.",
      },
      {
        title: "Preencher informações",
        description: "Nome do produto (título do eBook), descrição persuasiva e categoria.",
      },
      {
        title: "Upload do arquivo PDF",
        description: "Faça o upload do arquivo PDF gerado pela nossa plataforma.",
      },
      {
        title: "Configurar proteção DRM",
        description: "Ative a proteção DRM e escolha se permite impressão e cópia.",
      },
      {
        title: "Definir preço",
        description: "Defina o preço em reais. A Hotmart cobra 9.9% + R$1 por venda.",
      },
      {
        title: "Criar página de vendas",
        description: "Adicione a capa do eBook, crie uma descrição atraente e defina garantias.",
      },
      {
        title: "Ativar programa de afiliados",
        description: "Configure comissões para afiliados (recomendado: 50%) para aumentar as vendas.",
      },
      {
        title: "Publicar e promover",
        description: "Clique em 'Publicar' e use as ferramentas de marketing da Hotmart.",
      },
    ],
  },
  eduzz: {
    title: "Eduzz",
    description: "Plataforma brasileira com as menores taxas do mercado",
    steps: [
      {
        title: "Criar conta gratuita",
        description: "Acesse eduzz.com e crie uma conta de produtor.",
        link: "https://eduzz.com",
      },
      {
        title: "Cadastrar produto",
        description: "No painel, clique em 'Novo Produto' e escolha 'eBook/PDF'.",
      },
      {
        title: "Upload do arquivo",
        description: "Faça o upload do arquivo PDF do seu eBook.",
      },
      {
        title: "Configurar produto",
        description: "Preencha título, descrição, categoria e adicione a capa.",
      },
      {
        title: "Definir preço",
        description: "A Eduzz cobra apenas 4.9% + R$2.49 por venda direta.",
      },
      {
        title: "Configurar afiliados",
        description: "Ative o programa de afiliados para aumentar suas vendas.",
      },
      {
        title: "Publicar",
        description: "Revise e publique seu produto.",
      },
    ],
  },
  monetizze: {
    title: "Monetizze",
    description: "Plataforma completa para venda de produtos digitais",
    steps: [
      {
        title: "Criar conta",
        description: "Acesse monetizze.com.br e crie sua conta de produtor.",
        link: "https://monetizze.com.br",
      },
      {
        title: "Cadastrar produto",
        description: "Clique em 'Adicionar Produto' e escolha o tipo 'eBook'.",
      },
      {
        title: "Upload e configuração",
        description: "Faça o upload do PDF e preencha as informações do produto.",
      },
      {
        title: "Definir preço e comissões",
        description: "Configure o preço e as comissões para afiliados.",
      },
      {
        title: "Publicar",
        description: "Finalize e publique seu eBook.",
      },
    ],
  },
};

export default function EbookDetails() {
  const params = useParams();
  const ebookId = parseInt(params.id || "0");
  const { user } = useAuth();

  const { data: ebook, isLoading: ebookLoading } = trpc.ebooks.getById.useQuery({ id: ebookId });

  if (ebookLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container py-4">
            <Skeleton className="h-8 w-64" />
          </div>
        </header>
        <main className="container py-12">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container py-4">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>
        <main className="container py-12">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-2">eBook não encontrado</h2>
              <p className="text-muted-foreground">O eBook que você está procurando não existe ou foi removido.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* eBook Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                {ebook.coverUrl && (
                  <img
                    src={ebook.coverUrl}
                    alt={ebook.title}
                    className="w-48 h-64 object-cover rounded-lg shadow-lg"
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{ebook.title}</CardTitle>
                  <CardDescription className="text-lg mb-4">por {ebook.author}</CardDescription>
                  <div className="flex gap-3">
                    {ebook.epubUrl && (
                      <Button variant="outline" asChild>
                        <a href={ebook.epubUrl} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Download EPUB
                        </a>
                      </Button>
                    )}
                    {ebook.pdfUrl && (
                      <Button variant="outline" asChild>
                        <a href={ebook.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Publishing Guides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Guias de Monetização</CardTitle>
              <CardDescription>
                Siga os passos abaixo para publicar e vender seu eBook nas principais plataformas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="amazon_kdp" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="amazon_kdp">Amazon KDP</TabsTrigger>
                  <TabsTrigger value="hotmart">Hotmart</TabsTrigger>
                  <TabsTrigger value="eduzz">Eduzz</TabsTrigger>
                  <TabsTrigger value="monetizze">Monetizze</TabsTrigger>
                </TabsList>

                {Object.entries(GUIDES).map(([key, guide]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                      <p className="text-muted-foreground">{guide.description}</p>
                    </div>

                    <div className="space-y-4">
                      {guide.steps.map((step, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2">{step.title}</CardTitle>
                                <CardDescription>{step.description}</CardDescription>
                                {step.link && (
                                  <Button variant="link" className="px-0 mt-2" asChild>
                                    <a href={step.link} target="_blank" rel="noopener noreferrer">
                                      Acessar plataforma
                                      <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

