import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Clock, Loader2, Plus, Sparkles, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Schedules() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [totalEbooks, setTotalEbooks] = useState(30);
  const [themeMode, setThemeMode] = useState<"custom_list" | "single_theme" | "trending">("trending");
  const [themes, setThemes] = useState("");
  const [singleTheme, setSingleTheme] = useState("");
  const [author, setAuthor] = useState(user?.name || "");
  const [scheduledTime, setScheduledTime] = useState("");

  const { data: schedules, isLoading, refetch } = trpc.schedules.list.useQuery();
  const createMutation = trpc.schedules.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
  });

  const deleteMutation = trpc.schedules.delete.useMutation({
    onSuccess: () => {
      toast.success("Agendamento removido!");
      refetch();
    },
  });

  const triggerMutation = trpc.schedules.triggerNow.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setFrequency("daily");
    setTotalEbooks(30);
    setThemeMode("trending");
    setThemes("");
    setSingleTheme("");
    setScheduledTime("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para o agendamento");
      return;
    }
    if (!author.trim()) {
      toast.error("Por favor, insira o nome do autor");
      return;
    }
    if (themeMode === "custom_list" && !themes.trim()) {
      toast.error("Por favor, insira os temas (um por linha)");
      return;
    }
    if (themeMode === "single_theme" && !singleTheme.trim()) {
      toast.error("Por favor, insira o tema único");
      return;
    }

    createMutation.mutate({
      name,
      frequency,
      totalEbooks,
      themeMode,
      themes: themeMode === "custom_list" ? JSON.stringify(themes.split("\n").filter((t) => t.trim())) : undefined,
      singleTheme: themeMode === "single_theme" ? singleTheme : undefined,
      author,
      scheduledTime: scheduledTime || undefined,
    });
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "daily":
        return "Diário";
      case "weekly":
        return "Semanal";
      case "monthly":
        return "Mensal";
      default:
        return freq;
    }
  };

  const getThemeModeLabel = (mode: string) => {
    switch (mode) {
      case "custom_list":
        return "Lista personalizada";
      case "single_theme":
        return "Tema único";
      case "trending":
        return "Temas em alta";
      default:
        return mode;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header with CTA */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Agendamentos Automáticos</h2>
              <p className="text-muted-foreground mt-2">Configure a geração automática de eBooks</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Agendamento Automático</DialogTitle>
                  <DialogDescription>
                    Configure a geração automática de eBooks na periodicidade desejada
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Agendamento *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: eBooks de Marketing Digital"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequência *</Label>
                      <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalEbooks">Total de eBooks *</Label>
                      <Input
                        id="totalEbooks"
                        type="number"
                        min="1"
                        max="365"
                        value={totalEbooks}
                        onChange={(e) => setTotalEbooks(parseInt(e.target.value) || 1)}
                      />
                    </div>
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
                    <Label htmlFor="scheduledTime">Horário de Geração (opcional)</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se não especificado, será gerado imediatamente após o intervalo
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Modo de Seleção de Temas *</Label>
                    <RadioGroup value={themeMode} onValueChange={(v: any) => setThemeMode(v)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trending" id="trending" />
                        <Label htmlFor="trending" className="font-normal cursor-pointer">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>Temas em alta (IA escolhe automaticamente)</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single_theme" id="single_theme" />
                        <Label htmlFor="single_theme" className="font-normal cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span>Tema único (mesmo tema para todos)</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom_list" id="custom_list" />
                        <Label htmlFor="custom_list" className="font-normal cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>Lista personalizada (você escolhe os temas)</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {themeMode === "single_theme" && (
                    <div className="space-y-2">
                      <Label htmlFor="singleTheme">Tema Único *</Label>
                      <Input
                        id="singleTheme"
                        placeholder="Ex: Marketing Digital para Iniciantes"
                        value={singleTheme}
                        onChange={(e) => setSingleTheme(e.target.value)}
                      />
                    </div>
                  )}

                  {themeMode === "custom_list" && (
                    <div className="space-y-2">
                      <Label htmlFor="themes">Lista de Temas *</Label>
                      <Textarea
                        id="themes"
                        placeholder="Digite um tema por linha&#10;Ex:&#10;Marketing Digital&#10;Finanças Pessoais&#10;Produtividade"
                        value={themes}
                        onChange={(e) => setThemes(e.target.value)}
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground">Um tema por linha</p>
                    </div>
                  )}
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
                        <Calendar className="w-4 h-4 mr-2" />
                        Criar Agendamento
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Schedules List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : schedules && schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{schedule.name}</CardTitle>
                        <CardDescription className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Frequência: {getFrequencyLabel(schedule.frequency)}
                              {schedule.scheduledTime && ` às ${schedule.scheduledTime}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Modo: {getThemeModeLabel(schedule.themeMode)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Progresso: {schedule.generatedCount} / {schedule.totalEbooks} eBooks
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerMutation.mutate({ scheduleId: schedule.id })}
                          disabled={triggerMutation.isPending}
                        >
                          {triggerMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Gerar Agora
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate({ id: schedule.id })}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(schedule.generatedCount / schedule.totalEbooks) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum agendamento criado</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Crie um agendamento automático para gerar eBooks na periodicidade que desejar.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Agendamento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

