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

  const getPublicationUrl = (platform: string) => {
    return publications?.find(p => p.platform === platform)?.publicationUrl;
  };

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

          {/* Metadata Section */}
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Metadados Otimizados para Publicação
                </CardTitle>
                <CardDescription>
                  Copie e cole estes campos nas plataformas de publicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CopyField label="Título" value={metadata.optimizedTitle || ebook.title} />
                <CopyField label="Descrição" value={metadata.longDescription || metadata.shortDescription || ""} />
                <CopyField
                  label="Palavras-chave"
                  value={metadata.keywords ? JSON.parse(metadata.keywords).join(", ") : ""}
                />
                <CopyField
                  label="Categorias"
                  value={metadata.categories ? JSON.parse(metadata.categories).join(", ") : ""}
                />
                <CopyField label="Preço Sugerido" value={metadata.suggestedPrice || "R$ 29,90"} />
              </CardContent>
            </Card>
          )}
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
