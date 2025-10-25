import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, BookOpen, ShoppingCart, Trophy, Medal, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const { user, loading: authLoading } = useAuth();
  const { data: ebooks, isLoading } = trpc.ebooks.list.useQuery();
  const { data: allPublications } = trpc.publications.listAll.useQuery();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Calculate metrics
  const ebooksWithMetrics = (ebooks || []).map(ebook => {
    const pubs: any[] = (allPublications || []).filter((p: any) => p.ebookId === ebook.id);
    const totalRevenue = pubs.reduce((sum: number, p: any) => sum + parseFloat(p.revenue || "0"), 0);
    const totalCosts = pubs.reduce((sum: number, p: any) => 
      sum + parseFloat(p.trafficCost || "0") + parseFloat(p.otherCosts || "0"), 0
    );
    const totalSales = pubs.reduce((sum: number, p: any) => sum + (p.salesCount || 0), 0);
    const profit = totalRevenue - totalCosts;
    const roi = totalCosts > 0 ? ((profit / totalCosts) * 100) : 0;
    const avgTicket = totalSales > 0 ? (totalRevenue / totalSales) : 0;

    return {
      ...ebook,
      totalRevenue,
      totalCosts,
      totalSales,
      profit,
      roi,
      avgTicket,
      platforms: pubs.length
    };
  });

  // Sort by profit (default)
  const rankedEbooks = [...ebooksWithMetrics].sort((a, b) => b.profit - a.profit);

  // Global totals
  const globalRevenue = ebooksWithMetrics.reduce((sum, e) => sum + e.totalRevenue, 0);
  const globalCosts = ebooksWithMetrics.reduce((sum, e) => sum + e.totalCosts, 0);
  const globalProfit = globalRevenue - globalCosts;
  const globalSales = ebooksWithMetrics.reduce((sum, e) => sum + e.totalSales, 0);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      <main className="container py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Analytics & Ranking</h2>
              <p className="text-muted-foreground mt-2">Acompanhe a performance dos seus eBooks</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
          </div>

          {/* Global Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {globalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${globalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {globalProfit.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalSales}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">eBooks Publicados</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ebooksWithMetrics.filter(e => e.platforms > 0).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Performance</CardTitle>
              <CardDescription>
                eBooks ordenados por lucro total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rankedEbooks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum eBook com dados financeiros ainda</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>eBook</TableHead>
                      <TableHead className="text-right">Vendas</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-right">Custos</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedEbooks.map((ebook, index) => (
                      <TableRow key={ebook.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(index)}
                            <span>{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/ebook/${ebook.id}`}>
                            <div className="hover:underline cursor-pointer">
                              <div className="font-medium">{ebook.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {ebook.platforms} plataforma{ebook.platforms !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {ebook.totalSales}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          R$ {ebook.totalRevenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          R$ {ebook.totalCosts.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${ebook.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {ebook.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${ebook.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {ebook.roi.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {ebook.avgTicket.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

