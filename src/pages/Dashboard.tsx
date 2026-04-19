import { useEffect, useState } from 'react';
import { Users, Stethoscope, Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, Consulta } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    totalDentistas: 0,
    consultasHoje: 0,
    consultasMes: 0,
    receitaMes: 0,
    procedimentosMes: 0,
  });
  const [proximasConsultas, setProximasConsultas] = useState<Consulta[]>([]);

  useEffect(() => {
    loadStats();
    loadProximasConsultas();
  }, []);

  async function loadStats() {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [pacientes, dentistas, consultasHoje, consultasMes, financeiro, procedimentos] = await Promise.all([
      supabase.from('pacientes').select('id', { count: 'exact', head: true }),
      supabase.from('dentistas').select('id', { count: 'exact', head: true }),
      supabase.from('consultas').select('id', { count: 'exact', head: true }).gte('data_hora', today).lt('data_hora', today + 'T23:59:59'),
      supabase.from('consultas').select('id', { count: 'exact', head: true }).gte('data_hora', startOfMonth),
      supabase.from('financeiro').select('valor').eq('tipo', 'recebimento').eq('status', 'pago').gte('created_at', startOfMonth),
      supabase.from('procedimentos_realizados').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    ]);

    const receitaTotal = financeiro.data?.reduce((sum, f) => sum + (f.valor || 0), 0) || 0;

    setStats({
      totalPacientes: pacientes.count || 0,
      totalDentistas: dentistas.count || 0,
      consultasHoje: consultasHoje.count || 0,
      consultasMes: consultasMes.count || 0,
      receitaMes: receitaTotal,
      procedimentosMes: procedimentos.count || 0,
    });
  }

  async function loadProximasConsultas() {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('consultas')
      .select('*, paciente:pacientes(*), dentista:dentistas(*)')
      .gte('data_hora', now)
      .eq('status', 'agendada')
      .order('data_hora', { ascending: true })
      .limit(5);
    setProximasConsultas((data as any) || []);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Pacientes" value={stats.totalPacientes} icon={<Users className="h-6 w-6" />} variant="primary" />
        <StatCard title="Dentistas" value={stats.totalDentistas} icon={<Stethoscope className="h-6 w-6" />} variant="info" />
        <StatCard title="Consultas Hoje" value={stats.consultasHoje} icon={<Calendar className="h-6 w-6" />} variant="success" />
        <StatCard title="Consultas no Mês" value={stats.consultasMes} icon={<TrendingUp className="h-6 w-6" />} variant="warning" />
        <StatCard title="Receita do Mês" value={`R$ ${stats.receitaMes.toFixed(2)}`} icon={<DollarSign className="h-6 w-6" />} variant="success" />
        <StatCard title="Procedimentos" value={stats.procedimentosMes} icon={<FileText className="h-6 w-6" />} variant="info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {proximasConsultas.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma consulta agendada.</p>
          ) : (
            <div className="space-y-3">
              {proximasConsultas.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{c.paciente?.nome}</p>
                    <p className="text-sm text-muted-foreground">Dr(a). {c.dentista?.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(c.data_hora).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
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
