import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar, Download, FileText, Loader2, Plus, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [author, setAuthor] = useState(user?.name || "");
  const [numChapters, setNumChapters] = useState(5);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["pt"]);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [selectedEbookForFiles, setSelectedEbookForFiles] = useState<number | null>(null);

  const languages = [
    { code: "pt", name: "Portugu\u00eas", flag: "\ud83c\udde7\ud83c\uddf7" },
    { code: "en", name: "English", flag: "\ud83c\uddec\ud83c\udde7" },
    { code: "es", name: "Espa\u00f1ol", flag: "\ud83c\uddea\ud83c\uddf8" },
    { code: "zh", name: "\u4e2d\u6587", flag: "\ud83c\udde8\ud83c\uddf3" },
    { code: "hi", name: "\u0939\u093f\u0928\u094d\u0926\u0940", flag: "\ud83c\uddee\ud83c\uddf3" },
    { code: "ar", name: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", flag: "\ud83c\uddf8\ud83c\udde6" },
    { code: "bn", name: "\u09ac\u09be\u0982\u09b2\u09be", flag: "\ud83c\udde7\ud83c\udde9" },
    { code: "ru", name: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", flag: "\ud83c\uddf7\ud83c\uddfa" },
    { code: "ja", name: "\u65e5\u672c\u8a9e", flag: "\ud83c\uddef\ud83c\uddf5" },
    { code: "de", name: "Deutsch", flag: "\ud83c\udde9\ud83c\uddea" },
    { code: "fr", name: "Fran\u00e7ais", flag: "\ud83c\uddeb\ud83c\uddf7" },
  ];

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(l => l !== code)
        : [...prev, code]
    );
  };

  const { data: ebooks, isLoading, refetch } = trpc.ebooks.list.useQuery();
  const { data: allPublications } = trpc.publications.getByEbookId.useQuery({ ebookId: 0 }); // Placeholder

  const getPlatformBadge = (platform: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      amazon_kdp: { label: "KDP", color: "bg-orange-100 text-orange-700" },
      hotmart: { label: "Hot", color: "bg-blue-100 text-blue-700" },
      eduzz: { label: "Edz", color: "bg-green-100 text-green-700" },
      monetizze: { label: "Mon", color: "bg-purple-100 text-purple-700" },
    };
    return configs[platform] || { label: platform, color: "bg-gray-100 text-gray-700" };
  };

  // Auto-refresh every 5 seconds if there are processing ebooks
  useEffect(() => {
    if (ebooks && ebooks.some(e => e.status === "processing")) {
      const interval = setInterval(() => {
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ebooks, refetch]);
  const createMutation = trpc.ebooks.create.useMutation({
    onSuccess: () => {
      toast.success("eBook em geração! Aguarde alguns minutos...");
      setIsDialogOpen(false);
      setTheme("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar eBook: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema para o eBook");
      return;
    }
    if (!author.trim()) {
      toast.error("Por favor, insira o nome do autor");
      return;
    }
    if (selectedLanguages.length === 0) {
      toast.error("Por favor, selecione pelo menos um idioma");
      return;
    }
    createMutation.mutate({ 
      theme, 
      author, 
      numChapters,
      languages: selectedLanguages.join(",")
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header with CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">Meus eBooks</h2>
                {ebooks && ebooks.filter(e => e.status === "processing").length > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {ebooks.filter(e => e.status === "processing").length} gerando agora
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mt-2">Gerencie seus eBooks criados com IA</p>
            </div>
            <div className="flex gap-3">
              <Link href="/schedules">
                <Button variant="outline" size="lg" className="gap-2">
                  <Calendar className="w-5 h-5" />
                  Agendamentos
                </Button>
              </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Criar Novo eBook
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo eBook</DialogTitle>
                  <DialogDescription>
                    Preencha as informações abaixo e nossa IA criará seu eBook completo em minutos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema do eBook *</Label>
                    <Input
                      id="theme"
                      placeholder="Ex: Marketing Digital para Iniciantes"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Nome do Autor *</Label>
                    <Input
                      id="author"
                      placeholder="Seu nome"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapters">N\u00famero de Cap\u00edtulos</Label>
                    <Input
                      id="chapters"
                      type="number"
                      min="3"
                      max="10"
                      value={numChapters}
                      onChange={(e) => setNumChapters(parseInt(e.target.value) || 5)}
                    />
                    <p className="text-xs text-muted-foreground">Entre 3 e 10 cap\u00edtulos</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Idiomas *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => toggleLanguage(lang.code)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                            selectedLanguages.includes(lang.code)
                              ? 'bg-purple-100 border-purple-500 text-purple-900'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="text-sm">{lang.name}</span>
                          {selectedLanguages.includes(lang.code) && (
                            <CheckCircle2 className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedLanguages.length} idioma(s) selecionado(s)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Criar com IA
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* eBooks Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ebooks && ebooks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ebooks.map((ebook) => (
                <Card key={ebook.id} className="hover:shadow-lg transition-shadow relative">
                  {ebook.status === "processing" && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gerando eBook...
                      </div>
                    </div>
                  )}
                  {ebook.status === "completed" && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        ✓ Concluído
                      </div>
                    </div>
                  )}
                  {ebook.status === "failed" && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        ✗ Erro
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-32">
                        <CardTitle className="line-clamp-2">{ebook.title}</CardTitle>
                        <CardDescription className="mt-2">por {ebook.author}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ebook.coverUrl && (
                      <img
                        src={ebook.coverUrl}
                        alt={ebook.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="space-y-2">
                      {ebook.status === "completed" ? (
                        <>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedEbookForFiles(ebook.id);
                                setShowFilesDialog(true);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Arquivos
                            </Button>
                          </div>
                          <Link href={`/ebook/${ebook.id}`}>
                            <Button className="w-full" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Ver Guias de Monetização
                            </Button>
                          </Link>
                        </>
                      ) : ebook.status === "processing" ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Gerando eBook...</p>
                          <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns minutos</p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-destructive">Erro na geração</p>
                          {ebook.errorMessage && (
                            <p className="text-xs text-muted-foreground mt-1">{ebook.errorMessage}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum eBook criado ainda</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Clique no botão "Criar Novo eBook" para começar a gerar seu primeiro eBook com IA.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro eBook
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Dialog de arquivos por idioma */}
      <FilesDialog
        open={showFilesDialog}
        onOpenChange={setShowFilesDialog}
        ebookId={selectedEbookForFiles}
      />
    </div>
  );
}

// Componente separado para dialog de arquivos
function FilesDialog({ open, onOpenChange, ebookId }: { open: boolean; onOpenChange: (open: boolean) => void; ebookId: number | null }) {
  const { data: files, isLoading } = trpc.ebooks.getFiles.useQuery(
    { id: ebookId! },
    { enabled: !!ebookId }
  );

  const languages: Record<string, { name: string; flag: string }> = {
    pt: { name: "Português", flag: "🇧🇷" },
    en: { name: "English", flag: "🇬🇧" },
    es: { name: "Español", flag: "🇪🇸" },
    zh: { name: "中文", flag: "🇨🇳" },
    hi: { name: "हिन्दी", flag: "🇮🇳" },
    ar: { name: "العربية", flag: "🇸🇦" },
    bn: { name: "বাংলা", flag: "🇧🇩" },
    ru: { name: "Русский", flag: "🇷🇺" },
    ja: { name: "日本語", flag: "🇯🇵" },
    de: { name: "Deutsch", flag: "🇩🇪" },
    fr: { name: "Français", flag: "🇫🇷" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Arquivos do eBook</DialogTitle>
          <DialogDescription>
            Baixe os arquivos nos idiomas disponíveis
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Carregando arquivos...</p>
          </div>
        ) : files && files.length > 0 ? (
          <div className="space-y-4">
            {files.map((file) => {
              const lang = languages[file.languageCode] || { name: file.languageCode, flag: "🌐" };
              return (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <h4 className="font-medium">{lang.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {file.status === "completed" ? "Pronto para download" : "Processando..."}
                          </p>
                        </div>
                      </div>
                      {file.status === "completed" && (
                        <div className="flex gap-2">
                          {file.epubUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.epubUrl} target="_blank" rel="noopener noreferrer">
                                <BookOpen className="w-4 h-4 mr-2" />
                                EPUB
                              </a>
                            </Button>
                          )}
                          {file.pdfUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                PDF
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Nenhum arquivo disponível</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

