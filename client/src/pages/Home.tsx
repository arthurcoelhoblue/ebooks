import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BookOpen, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
                <Link href="/dashboard">
                  <Button>Meus eBooks</Button>
                </Link>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Geração 100% Automática com IA
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Crie eBooks Profissionais em{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Minutos
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nossa plataforma usa Inteligência Artificial para gerar eBooks completos sobre qualquer tema. 
              Você só escolhe o assunto, e nós cuidamos do resto: conteúdo, capa e formatação profissional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8">
                    <Zap className="w-5 h-5 mr-2" />
                    Criar Meu Primeiro eBook
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="text-lg px-8" asChild>
                  <a href={getLoginUrl()}>
                    <Zap className="w-5 h-5 mr-2" />
                    Começar Gratuitamente
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Geração Automática</CardTitle>
                <CardDescription>
                  Escolha um tema e nossa IA gera o conteúdo completo do eBook, incluindo capítulos estruturados e capa profissional.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Formatos Prontos</CardTitle>
                <CardDescription>
                  Receba seu eBook em formatos EPUB e PDF, prontos para publicar no Amazon KDP, Hotmart e outras plataformas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Guias de Monetização</CardTitle>
                <CardDescription>
                  Aprenda passo a passo como publicar e vender seu eBook nas principais plataformas e começar a lucrar.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="container py-20 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Como Funciona</h3>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Escolha o Tema</h4>
                  <p className="text-muted-foreground">
                    Digite o assunto do seu eBook. Pode ser qualquer coisa: marketing digital, culinária, finanças, autoajuda, etc.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">IA Gera o Conteúdo</h4>
                  <p className="text-muted-foreground">
                    Nossa inteligência artificial cria o conteúdo completo, com capítulos estruturados, introdução, desenvolvimento e conclusão.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Baixe e Publique</h4>
                  <p className="text-muted-foreground">
                    Receba os arquivos prontos (EPUB e PDF) e siga nossos guias para publicar no Amazon KDP, Hotmart ou outras plataformas.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Comece a Lucrar</h4>
                  <p className="text-muted-foreground">
                    Com nossos guias de monetização, você aprende a vender seu eBook e transformar conhecimento em renda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="container py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h3 className="text-4xl font-bold">Pronto para Criar Seu eBook?</h3>
            <p className="text-lg opacity-90">
              Junte-se a centenas de empreendedores que já estão criando e vendendo eBooks com nossa plataforma.
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Ir para o Painel
                </Button>
              </Link>
            ) : (
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <a href={getLoginUrl()}>Começar Agora</a>
              </Button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

