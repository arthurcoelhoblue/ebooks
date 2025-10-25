import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Plus,
  X,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

// Platform configurations
const PLATFORMS = [
  { value: "amazon_kdp", label: "Amazon KDP", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "hotmart", label: "Hotmart", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "eduzz", label: "Eduzz", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "monetizze", label: "Monetizze", color: "bg-purple-100 text-purple-700 border-purple-200" },
];

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label || "Texto"} copiado!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copiado!" : "Copiar"}
    </Button>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <CopyButton value={value} label={label} />
      </div>
      <div className="p-3 bg-muted rounded-lg text-sm break-words">{value}</div>
    </div>
  );
}

export default function EbookDetails() {
  const params = useParams();
  const ebookId = parseInt(params.id || "0");
  const { user } = useAuth();

  const { data: ebook, isLoading: ebookLoading } = trpc.ebooks.getById.useQuery({ id: ebookId });
  const { data: metadata, isLoading: metadataLoading } = trpc.metadata.getByEbookId.useQuery({ ebookId });
  const { data: publications, refetch: refetchPublications } = trpc.publications.getByEbookId.useQuery({ ebookId });

  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"amazon_kdp" | "hotmart" | "eduzz" | "monetizze">("amazon_kdp");
  const [publicationUrl, setPublicationUrl] = useState("");

  const publishMutation = trpc.publications.create.useMutation({
    onSuccess: () => {
      toast.success("Publicação registrada!");
      setShowPublishDialog(false);
      setPublicationUrl("");
      refetchPublications();
    },
  });

  const unpublishMutation = trpc.publications.delete.useMutation({
    onSuccess: () => {
      toast.success("Publicação removida!");
      refetchPublications();
    },
  });

  const getPlatformConfig = (platform: string) => {
    return PLATFORMS.find(p => p.value === platform);
  };

  const isPublishedOn = (platform: string) => {
    return publications?.some(p => p.platform === platform);
  };

  // Parse keywords and categories
  const keywords = metadata?.keywords ? JSON.parse(metadata.keywords) : [];
  const categories = metadata?.categories ? JSON.parse(metadata.categories) : [];

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
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">eBook não encontrado</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* eBook Header */}
          <div className="flex items-start gap-6">
            {ebook.coverUrl && (
              <img
                src={ebook.coverUrl}
                alt={ebook.title}
                className="w-48 h-64 object-cover rounded-lg shadow-lg"
              />
            )}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold">{ebook.title}</h1>
                <p className="text-xl text-muted-foreground mt-2">por {ebook.author}</p>
              </div>

              {/* Publication Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Status de Publicação:</span>
                  {publications && publications.length > 0 ? (
                    publications.map(pub => {
                      const config = getPlatformConfig(pub.platform);
                      return (
                        <Badge key={pub.id} className={config?.color} variant="outline">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {config?.label}
                          <button
                            onClick={() => unpublishMutation.mutate({ ebookId, platform: pub.platform })}
                            className="ml-2 hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-muted-foreground">Não publicado</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPublishDialog(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Marcar Publicação
                  </Button>
                </div>
              </div>

              {/* Download Links */}
              <div className="flex gap-3">
                {ebook.epubUrl && (
                  <Button variant="default" asChild>
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

          {/* Guias de Publicação */}
          <Tabs defaultValue="amazon_kdp" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="amazon_kdp">Amazon KDP</TabsTrigger>
              <TabsTrigger value="hotmart">Hotmart</TabsTrigger>
              <TabsTrigger value="eduzz">Eduzz</TabsTrigger>
              <TabsTrigger value="monetizze">Monetizze</TabsTrigger>
            </TabsList>

            {/* Amazon KDP */}
            <TabsContent value="amazon_kdp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Guia de Publicação - Amazon KDP</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://kdp.amazon.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir KDP
                      </a>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Publique na maior plataforma de eBooks do mundo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="step1">
                      <AccordionTrigger>1. Criar conta no KDP</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Acesse <a href="https://kdp.amazon.com" target="_blank" className="text-blue-600 underline">kdp.amazon.com</a> e clique em "Sign up"</p>
                        <p>Você precisará de:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Conta Amazon existente ou criar uma nova</li>
                          <li>Informações fiscais (CPF/CNPJ)</li>
                          <li>Dados bancários para receber royalties</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step2">
                      <AccordionTrigger>2. Iniciar novo projeto de eBook</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>No painel do KDP, clique em "+ Create" e selecione "Kindle eBook"</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step3">
                      <AccordionTrigger>3. Preencher metadados</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <CopyField label="Título" value={metadata?.optimizedTitle || ebook.title} />
                        <CopyField label="Descrição" value={metadata?.longDescription || metadata?.shortDescription || ""} />
                        <CopyField label="Autor" value={ebook.author} />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step4">
                      <AccordionTrigger>4. Escolher palavras-chave (7 sugeridas)</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">Cole cada palavra-chave nos 7 campos disponíveis:</p>
                        <div className="space-y-2">
                          {keywords.map((keyword: string, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{index + 1}. {keyword}</span>
                              <CopyButton value={keyword} label={`Palavra-chave ${index + 1}`} />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step5">
                      <AccordionTrigger>5. Selecionar categorias</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">Categorias sugeridas (escolha até 2):</p>
                        <div className="space-y-2">
                          {categories.map((category: string, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{category}</span>
                              <CopyButton value={category} label="Categoria" />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step6">
                      <AccordionTrigger>6. Upload do arquivo EPUB</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Na seção "Manuscript", clique em "Upload eBook manuscript"</p>
                        {ebook.epubUrl && (
                          <Button variant="outline" asChild>
                            <a href={ebook.epubUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar EPUB para upload
                            </a>
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step7">
                      <AccordionTrigger>7. Upload da capa</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Na seção "Cover", clique em "Upload a cover you already have"</p>
                        {ebook.coverUrl && (
                          <div className="space-y-2">
                            <img src={ebook.coverUrl} alt="Capa" className="w-32 h-auto rounded" />
                            <Button variant="outline" asChild>
                              <a href={ebook.coverUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Baixar capa para upload
                              </a>
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step8">
                      <AccordionTrigger>8. Definir preço e royalties</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <CopyField label="Preço sugerido" value={metadata?.suggestedPrice || "R$ 29,90"} />
                        <p className="text-sm text-muted-foreground mt-2">
                          Recomendação: Escolha royalty de 70% para preços entre $2.99 e $9.99 USD
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step9">
                      <AccordionTrigger>9. Publicar</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Revise todas as informações e clique em "Publish your Kindle eBook"</p>
                        <p className="text-sm text-muted-foreground">
                          Seu eBook estará disponível em até 72 horas após aprovação
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hotmart */}
            <TabsContent value="hotmart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Guia de Publicação - Hotmart</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://hotmart.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Hotmart
                      </a>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Venda no maior marketplace de produtos digitais do Brasil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="step1">
                      <AccordionTrigger>1. Criar conta gratuita</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Acesse <a href="https://hotmart.com" target="_blank" className="text-blue-600 underline">hotmart.com</a> e clique em "Cadastre-se grátis"</p>
                        <p>Complete o cadastro como Produtor</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step2">
                      <AccordionTrigger>2. Cadastrar produto</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>No painel, vá em "Produtos" → "Criar novo produto"</p>
                        <p>Selecione tipo: "eBook/Livro Digital"</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step3">
                      <AccordionTrigger>3. Preencher informações</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <CopyField label="Nome do Produto" value={metadata?.optimizedTitle || ebook.title} />
                        <CopyField label="Descrição" value={metadata?.longDescription || metadata?.shortDescription || ""} />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step4">
                      <AccordionTrigger>4. Upload do arquivo PDF</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Na seção "Conteúdo", faça upload do arquivo PDF</p>
                        {ebook.pdfUrl && (
                          <Button variant="outline" asChild>
                            <a href={ebook.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar PDF para upload
                            </a>
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step5">
                      <AccordionTrigger>5. Definir preço</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <CopyField label="Preço sugerido" value={metadata?.suggestedPrice || "R$ 29,90"} />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step6">
                      <AccordionTrigger>6. Configurar programa de afiliados</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Defina comissão para afiliados (sugestão: 50-70%)</p>
                        <p className="text-sm text-muted-foreground">
                          Afiliados ajudarão a divulgar seu eBook
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step7">
                      <AccordionTrigger>7. Publicar e promover</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>Clique em "Publicar produto"</p>
                        <p>Use as ferramentas de marketing da Hotmart para divulgar</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Eduzz e Monetizze com estrutura similar */}
            <TabsContent value="eduzz">
              <Card>
                <CardHeader>
                  <CardTitle>Guia de Publicação - Eduzz</CardTitle>
                  <CardDescription>Em breve - guia detalhado</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="monetizze">
              <Card>
                <CardHeader>
                  <CardTitle>Guia de Publicação - Monetizze</CardTitle>
                  <CardDescription>Em breve - guia detalhado</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Publicado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={selectedPlatform} onValueChange={(v: any) => setSelectedPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.filter(p => !isPublishedOn(p.value)).map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL da Publicação (opcional)</Label>
              <Input
                placeholder="https://..."
                value={publicationUrl}
                onChange={(e) => setPublicationUrl(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => publishMutation.mutate({
                ebookId,
                platform: selectedPlatform,
                publicationUrl: publicationUrl || undefined,
                notes: undefined,
              })}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? "Salvando..." : "Marcar como Publicado"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
