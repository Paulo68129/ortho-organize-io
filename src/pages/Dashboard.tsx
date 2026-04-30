import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  CalendarClock,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import type { Consulta } from '@/types';

interface DashboardData {
  totalPacientes: number;
  totalDentistas: number;
  consultasHoje: number;
  consultasMes: number;
  receitaMes: number;
  receitaPendente: number;
  procedimentosMes: number;
  taxaConclusao: number;
  ticketMedio: number;
  novosUltimos30: number;
}

const STATUS_COLORS: Record<string, string> = {
  agendada: 'hsl(var(--info))',
  confirmada: 'hsl(var(--primary))',
  em_andamento: 'hsl(var(--warning))',
  concluida: 'hsl(var(--success))',
  cancelada: 'hsl(var(--destructive))',
};

const PIE_COLORS = [
  'hsl(330, 81%, 58%)',
  'hsl(280, 70%, 60%)',
  'hsl(199, 89%, 55%)',
  'hsl(142, 71%, 50%)',
  'hsl(38, 92%, 55%)',
  'hsl(0, 72%, 55%)',
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function monthLabel(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData>({
    totalPacientes: 0,
    totalDentistas: 0,
    consultasHoje: 0,
    consultasMes: 0,
    receitaMes: 0,
    receitaPendente: 0,
    procedimentosMes: 0,
    taxaConclusao: 0,
    ticketMedio: 0,
    novosUltimos30: 0,
  });
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([]);
  const [serieConsultas, setSerieConsultas] = useState<{ mes: string; agendadas: number; concluidas: number }[]>([]);
  const [serieReceita, setSerieReceita] = useState<{ mes: string; recebido: number; pendente: number }[]>([]);
  const [statusDist, setStatusDist] = useState<{ name: string; value: number }[]>([]);
  const [topProcedimentos, setTopProcedimentos] = useState<{ nome: string; total: number; receita: number }[]>([]);
  const [topDentistas, setTopDentistas] = useState<{ nome: string; consultas: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultas' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pacientes' }, () => loadAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadStats(), loadProximasConsultas(), loadCharts()]);
    setLoading(false);
  }

  async function loadStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [pacientes, dentistas, consultasHoje, consultasMes, consultasMesAll, financeiroPago, financeiroPend, procedimentos, novosPac] =
      await Promise.all([
        supabase.from('pacientes').select('id', { count: 'exact', head: true }),
        supabase.from('dentistas').select('id', { count: 'exact', head: true }),
        supabase
          .from('consultas')
          .select('id', { count: 'exact', head: true })
          .gte('data_hora', today)
          .lt('data_hora', today + 'T23:59:59'),
        supabase.from('consultas').select('id', { count: 'exact', head: true }).gte('data_hora', startOfMonth),
        supabase.from('consultas').select('status').gte('data_hora', startOfMonth),
        supabase.from('financeiro').select('valor').eq('status', 'pago').gte('created_at', startOfMonth),
        supabase.from('financeiro').select('valor').eq('status', 'pendente'),
        supabase.from('procedimentos_realizados').select('id, valor_cobrado').gte('created_at', startOfMonth),
        supabase.from('pacientes').select('id', { count: 'exact', head: true }).gte('created_at', last30),
      ]);

    const recebido = financeiroPago.data?.reduce((s, f: any) => s + Number(f.valor || 0), 0) || 0;
    const pendente = financeiroPend.data?.reduce((s, f: any) => s + Number(f.valor || 0), 0) || 0;
    const procedimentosCount = procedimentos.data?.length || 0;
    const procedimentosReceita = procedimentos.data?.reduce((s, p: any) => s + Number(p.valor_cobrado || 0), 0) || 0;
    const ticket = procedimentosCount > 0 ? procedimentosReceita / procedimentosCount : 0;

    const concluidas = (consultasMesAll.data || []).filter((c: any) => c.status === 'concluida').length;
    const totalConsultasMes = consultasMesAll.data?.length || 0;
    const taxaConclusao = totalConsultasMes ? (concluidas / totalConsultasMes) * 100 : 0;

    setStats({
      totalPacientes: pacientes.count || 0,
      totalDentistas: dentistas.count || 0,
      consultasHoje: consultasHoje.count || 0,
      consultasMes: consultasMes.count || 0,
      receitaMes: recebido,
      receitaPendente: pendente,
      procedimentosMes: procedimentosCount,
      taxaConclusao,
      ticketMedio: ticket,
      novosUltimos30: novosPac.count || 0,
    });
  }

  async function loadProximasConsultas() {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('consultas')
      .select('*, paciente:pacientes(*), dentista:dentistas(*)')
      .gte('data_hora', now)
      .in('status', ['agendada', 'confirmada'])
      .order('data_hora', { ascending: true })
      .limit(6);
    setProximasConsultas((data as any) || []);
  }

  async function loadCharts() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [consultasRes, financeiroRes, procRealRes, dentistasRes] = await Promise.all([
      supabase.from('consultas').select('data_hora, status').gte('data_hora', sixMonthsAgo.toISOString()),
      supabase.from('financeiro').select('valor, status, created_at').gte('created_at', sixMonthsAgo.toISOString()),
      supabase
        .from('procedimentos_realizados')
        .select('valor_cobrado, procedimento:procedimentos(nome), consulta:consultas(dentista_id, dentista:dentistas(nome))')
        .gte('created_at', sixMonthsAgo.toISOString()),
      supabase.from('dentistas').select('id, nome'),
    ]);

    // Series por mês
    const meses: { key: string; label: string; date: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      meses.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), date: d });
    }

    const consultasMap = new Map(meses.map((m) => [m.key, { mes: m.label, agendadas: 0, concluidas: 0 }]));
    (consultasRes.data || []).forEach((c: any) => {
      const d = new Date(c.data_hora);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const item = consultasMap.get(k);
      if (item) {
        item.agendadas += 1;
        if (c.status === 'concluida') item.concluidas += 1;
      }
    });
    setSerieConsultas(Array.from(consultasMap.values()));

    const financeiroMap = new Map(meses.map((m) => [m.key, { mes: m.label, recebido: 0, pendente: 0 }]));
    (financeiroRes.data || []).forEach((f: any) => {
      const d = new Date(f.created_at);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const item = financeiroMap.get(k);
      if (item) {
        if (f.status === 'pago') item.recebido += Number(f.valor || 0);
        else if (f.status === 'pendente') item.pendente += Number(f.valor || 0);
      }
    });
    setSerieReceita(Array.from(financeiroMap.values()));

    // Distribuição por status (mês corrente)
    const statusCount: Record<string, number> = {};
    (consultasRes.data || []).forEach((c: any) => {
      const d = new Date(c.data_hora);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        statusCount[c.status] = (statusCount[c.status] || 0) + 1;
      }
    });
    setStatusDist(
      Object.entries(statusCount).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
      })),
    );

    // Top procedimentos
    const procMap: Record<string, { nome: string; total: number; receita: number }> = {};
    (procRealRes.data || []).forEach((p: any) => {
      const nome = p.procedimento?.nome || 'Sem nome';
      if (!procMap[nome]) procMap[nome] = { nome, total: 0, receita: 0 };
      procMap[nome].total += 1;
      procMap[nome].receita += Number(p.valor_cobrado || 0);
    });
    setTopProcedimentos(
      Object.values(procMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    );

    // Top dentistas (por consultas no período)
    const dentMap: Record<string, number> = {};
    const dentistasNomes = new Map((dentistasRes.data || []).map((d: any) => [d.id, d.nome]));
    // contagem via procedimentos_realizados → consulta.dentista_id
    (procRealRes.data || []).forEach((p: any) => {
      const id = p.consulta?.dentista_id;
      if (id) dentMap[id] = (dentMap[id] || 0) + 1;
    });
    setTopDentistas(
      Object.entries(dentMap)
        .map(([id, consultas]) => ({ nome: dentistasNomes.get(id) || 'Sem nome', consultas }))
        .sort((a, b) => b.consultas - a.consultas)
        .slice(0, 5),
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; icon: any; className: string }> = {
      agendada: { label: 'Agendada', icon: Clock, className: 'bg-info/15 text-info border-info/30' },
      confirmada: { label: 'Confirmada', icon: CheckCircle2, className: 'bg-primary/15 text-primary border-primary/30' },
      em_andamento: { label: 'Em andamento', icon: Activity, className: 'bg-warning/15 text-warning border-warning/30' },
      concluida: { label: 'Concluída', icon: CheckCircle2, className: 'bg-success/15 text-success border-success/30' },
      cancelada: { label: 'Cancelada', icon: XCircle, className: 'bg-destructive/15 text-destructive border-destructive/30' },
    };
    const cfg = map[status] || map.agendada;
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${cfg.className}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const totalReceitaPrevista = useMemo(() => stats.receitaMes + stats.receitaPendente, [stats]);
  const percentualRecebido = totalReceitaPrevista > 0 ? (stats.receitaMes / totalReceitaPrevista) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Visão geral em tempo real da clínica</p>
        </div>
        <Badge variant="outline" className="gap-1 border-success/40 text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          {loading ? 'Atualizando...' : 'Ao vivo'}
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pacientes" value={stats.totalPacientes} icon={<Users className="h-6 w-6" />} variant="primary" />
        <StatCard
          title="Consultas Hoje"
          value={stats.consultasHoje}
          icon={<Calendar className="h-6 w-6" />}
          variant="info"
        />
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(stats.receitaMes)}
          icon={<DollarSign className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(stats.ticketMedio)}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Dentistas</p>
                <p className="text-2xl font-bold">{stats.totalDentistas}</p>
              </div>
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Consultas/mês</p>
                <p className="text-2xl font-bold">{stats.consultasMes}</p>
              </div>
              <CalendarClock className="h-5 w-5 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Procedimentos</p>
                <p className="text-2xl font-bold">{stats.procedimentosMes}</p>
              </div>
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Novos pacientes (30d)</p>
                <p className="text-2xl font-bold">{stats.novosUltimos30}</p>
              </div>
              <Users className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receita & taxa conclusão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Saúde financeira</CardTitle>
            <CardDescription>Recebido x pendente neste mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recebido</span>
              <span className="font-semibold text-success">{formatCurrency(stats.receitaMes)}</span>
            </div>
            <Progress value={percentualRecebido} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-warning" /> Pendente
              </span>
              <span className="font-semibold text-warning">{formatCurrency(stats.receitaPendente)}</span>
            </div>
            <div className="pt-2 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Previsto total</span>
              <span className="font-bold">{formatCurrency(totalReceitaPrevista)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de conclusão</CardTitle>
            <CardDescription>Consultas concluídas no mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-primary">{stats.taxaConclusao.toFixed(0)}%</span>
            </div>
            <Progress value={stats.taxaConclusao} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-2">Meta sugerida: 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts tabs */}
      <Tabs defaultValue="consultas" className="w-full">
        <TabsList>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="ranking">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="consultas">
          <Card>
            <CardHeader>
              <CardTitle>Consultas nos últimos 6 meses</CardTitle>
              <CardDescription>Total agendadas vs concluídas</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serieConsultas}>
                  <defs>
                    <linearGradient id="agendadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="concluidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="agendadas" stroke="hsl(var(--primary))" fill="url(#agendadas)" />
                  <Area type="monotone" dataKey="concluidas" stroke="hsl(var(--success))" fill="url(#concluidas)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receita">
          <Card>
            <CardHeader>
              <CardTitle>Receita nos últimos 6 meses</CardTitle>
              <CardDescription>Recebido vs pendente</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serieReceita}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    formatter={(v: any) => formatCurrency(Number(v))}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="recebido" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pendente" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por status</CardTitle>
              <CardDescription>Consultas do mês corrente</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {statusDist.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados para o mês atual.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                      {statusDist.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top procedimentos</CardTitle>
                <CardDescription>Mais realizados no período</CardDescription>
              </CardHeader>
              <CardContent>
                {topProcedimentos.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem dados.</p>
                ) : (
                  <div className="space-y-3">
                    {topProcedimentos.map((p, i) => {
                      const max = topProcedimentos[0].total || 1;
                      return (
                        <div key={p.nome}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {i + 1}. {p.nome}
                            </span>
                            <span className="text-muted-foreground">
                              {p.total}× · {formatCurrency(p.receita)}
                            </span>
                          </div>
                          <Progress value={(p.total / max) * 100} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top dentistas</CardTitle>
                <CardDescription>Por procedimentos realizados</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {topDentistas.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem dados.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDentistas} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="nome" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="consultas" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Próximas consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas consultas</CardTitle>
          <CardDescription>Agendadas e confirmadas</CardDescription>
        </CardHeader>
        <CardContent>
          {proximasConsultas.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma consulta agendada.</p>
          ) : (
            <div className="space-y-3">
              {proximasConsultas.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center text-primary-foreground font-semibold">
                      {(c.paciente?.nome || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{c.paciente?.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.paciente?.telefone || 'sem telefone'} · Dr(a). {c.dentista?.nome}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(c.status)}
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(c.data_hora).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.data_hora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
