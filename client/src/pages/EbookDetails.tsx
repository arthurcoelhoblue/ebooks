import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

// Guias de publicação para cada plataforma
const GUIDES = {
  amazon_kdp: {
    title: "Amazon Kindle Direct Publishing (KDP)",
    description: "Publique seu eBook na maior plataforma de livros digitais do mundo",
    link: "https://kdp.amazon.com",
    steps: [
      "Criar conta no KDP",
      "Iniciar novo projeto de eBook",
      "Preencher metadados (use os campos abaixo)",
      "Escolher palavras-chave",
      "Fazer upload do arquivo EPUB",
      "Fazer upload da capa",
      "Definir preço e royalties",
      "Publicar",
    ],
  },
  hotmart: {
    title: "Hotmart",
    description: "Venda seu eBook no maior marketplace de produtos digitais do Brasil",
    link: "https://hotmart.com",
    steps: [
      "Criar conta gratuita",
      "Cadastrar produto",
      "Preencher informações (use os campos abaixo)",
      "Upload do arquivo PDF",
      "Configurar proteção DRM",
      "Definir preço",
      "Criar página de vendas",
      "Ativar programa de afiliados",
      "Publicar e promover",
    ],
  },
  eduzz: {
    title: "Eduzz",
    description: "Plataforma brasileira com as menores taxas do mercado",
    link: "https://eduzz.com",
    steps: [
      "Criar conta gratuita",
      "Cadastrar produto",
      "Upload do arquivo",
      "Configurar produto (use os campos abaixo)",
      "Definir preço",
      "Configurar afiliados",
      "Publicar",
    ],
  },
  monetizze: {
    title: "Monetizze",
    description: "Plataforma completa para venda de produtos digitais",
    link: "https://monetizze.com.br",
    steps: [
      "Criar conta",
      "Cadastrar produto",
      "Upload e configuração (use os campos abaixo)",
      "Definir preço e comissões",
      "Publicar",
    ],
  },
};

function CopyField({ label, value }: { label: string; value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2">
          <Copy className="w-4 h-4" />
          Copiar
        </Button>
      </div>
      <div className="p-3 bg-muted rounded-lg text-sm font-mono break-words">{value}</div>
    </div>
  );
}

export default function EbookDetails() {
  const params = useParams();
  const ebookId = parseInt(params.id || "0");
  const { user } = useAuth();

  const { data: ebook, isLoading: ebookLoading } = trpc.ebooks.getById.useQuery({ id: ebookId });
  const { data: metadata, isLoading: metadataLoading } = trpc.metadata.getByEbookId.useQuery({ ebookId });

  if (ebookLoading || metadataLoading) {
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

          {/* Metadata Section */}
          {metadata && (
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-2xl">Metadados Otimizados</CardTitle>
                </div>
                <CardDescription>
                  Copie e cole estes campos nas plataformas de publicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CopyField label="Título Otimizado" value={metadata.optimizedTitle || ebook.title} />
                <CopyField
                  label="Descrição Curta"
                  value={metadata.shortDescription || "Descrição não disponível"}
                />
                <CopyField
                  label="Descrição Longa"
                  value={metadata.longDescription || "Descrição não disponível"}
                />
                <CopyField
                  label="Palavras-chave (separadas por vírgula)"
                  value={metadata.keywords?.join(", ") || ""}
                />
                <CopyField label="Categorias" value={metadata.categories?.join(", ") || ""} />
                <CopyField label="Preço Sugerido" value={metadata.suggestedPrice || "R$ 27,00"} />
                <CopyField
                  label="Público-alvo"
                  value={metadata.targetAudience || "Público geral interessado no tema"}
                />
              </CardContent>
            </Card>
          )}

          {/* Publishing Guides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Guias de Publicação</CardTitle>
              <CardDescription>
                Siga os passos abaixo para publicar seu eBook nas principais plataformas
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
                      <p className="text-muted-foreground mb-4">{guide.description}</p>
                      <Button asChild>
                        <a href={guide.link} target="_blank" rel="noopener noreferrer">
                          Acessar {guide.title}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Checklist de Publicação:</h4>
                      {guide.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {index + 1}. {step}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Dica:</strong> Use os metadados otimizados acima para preencher os campos nas
                        plataformas. Basta clicar em "Copiar" e colar no campo correspondente.
                      </p>
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

