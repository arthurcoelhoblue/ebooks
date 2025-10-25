import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BookOpen, Sparkles, TrendingUp, Zap, CheckCircle2, DollarSign, Clock, Target } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useLocation()[1];

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-white">
              {APP_TITLE}
            </h1>
          </div>
          <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
            <a href={getLoginUrl()}>Começar Agora</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              Geração 100% Automática com IA
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Crie e Venda eBooks
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Sem Escrever Uma Linha
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto">
              Nossa IA gera eBooks profissionais completos em minutos. Você escolhe o tema, nós cuidamos do resto: conteúdo, capa e guias de monetização.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 h-auto">
                <a href={getLoginUrl()}>
                  <Zap className="mr-2 h-5 w-5" />
                  Criar Meu Primeiro eBook Grátis
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                <a href="#como-funciona">Ver Como Funciona</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center items-center pt-8 text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>Sem mensalidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>100% automatizado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>Pronto para vender</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-purple-200">eBooks Gerados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-purple-200">Automação</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4</div>
              <div className="text-purple-200">Plataformas de Venda</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Por Que Escolher Nossa Plataforma?
            </h3>
            <p className="text-xl text-purple-200">
              Tudo que você precisa para criar e monetizar eBooks profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold">Geração Automática</h4>
                <p className="text-purple-200">
                  IA cria conteúdo completo, estruturado e profissional em minutos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold">Agendamento Inteligente</h4>
                <p className="text-purple-200">
                  Programe geração diária, semanal ou mensal de eBooks automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold">Guias de Monetização</h4>
                <p className="text-purple-200">
                  Passo a passo completo para publicar na Amazon KDP, Hotmart e mais
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold">Temas em Alta</h4>
                <p className="text-purple-200">
                  IA pesquisa trending topics e sugere os melhores temas para lucrar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-black/20">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Como Funciona
            </h3>
            <p className="text-xl text-purple-200">
              4 passos simples para começar a lucrar com eBooks
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Escolha o Tema</h4>
                <p className="text-lg text-purple-200">
                  Digite o assunto do seu eBook ou deixe a IA sugerir temas em alta. Pode ser qualquer coisa: marketing digital, culinária, finanças, autoajuda, etc.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">IA Gera o Conteúdo</h4>
                <p className="text-lg text-purple-200">
                  Nossa inteligência artificial cria o conteúdo completo, com capítulos estruturados, introdução, desenvolvimento e conclusão. Também gera a capa profissional automaticamente.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Baixe e Publique</h4>
                <p className="text-lg text-purple-200">
                  Receba os arquivos prontos em EPUB e PDF. Use nossos guias passo a passo para publicar na Amazon KDP, Hotmart, Eduzz ou Monetizze.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Comece a Lucrar</h4>
                <p className="text-lg text-purple-200">
                  Com nossos guias de monetização, você aprende a vender seu eBook e transformar conhecimento em renda. Acompanhe seus resultados financeiros direto na plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              Pronto para Criar Seu eBook?
            </h3>
            <p className="text-xl text-purple-100">
              Junte-se a centenas de empreendedores que já estão criando e vendendo eBooks com nossa plataforma.
            </p>
            <Button asChild size="lg" className="bg-white text-purple-900 hover:bg-gray-100 font-bold text-lg px-8 py-6 h-auto">
              <a href={getLoginUrl()}>
                <Zap className="mr-2 h-5 w-5" />
                Começar Gratuitamente Agora
              </a>
            </Button>
            <p className="text-sm text-purple-200">
              Sem cartão de crédito • Sem mensalidade • Comece em 2 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8">
        <div className="container text-center text-purple-200">
          <p>© 2025 {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

