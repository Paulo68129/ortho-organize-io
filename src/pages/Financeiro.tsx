import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import type { Financeiro as FinanceiroType } from '@/types';

const statusColors: Record<string, string> = {
  pendente: 'bg-warning/20 text-warning border-warning/30',
  pago: 'bg-success/20 text-success border-success/30',
  cancelado: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function Financeiro() {
  const [registros, setRegistros] = useState<FinanceiroType[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('financeiro')
      .select('*, consulta:consultas(*, paciente:pacientes(nome), dentista:dentistas(nome))')
      .order('created_at', { ascending: false });
    setRegistros(data || []);
  }

  const filtered = registros.filter(r => statusFilter === 'all' || r.status === statusFilter);

  const totalRecebido = registros.filter(r => r.status === 'pago' && r.tipo === 'recebimento').reduce((s, r) => s + r.valor, 0);
  const totalPendente = registros.filter(r => r.status === 'pendente').reduce((s, r) => s + r.valor, 0);
  const totalCobrado = registros.filter(r => r.tipo === 'cobranca').reduce((s, r) => s + r.valor, 0);

  async function updateStatus(id: string, status: string) {
    const update: Record<string, any> = { status };
    if (status === 'pago') update.data_pagamento = new Date().toISOString();
    await supabase.from('financeiro').update(update).eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Controle financeiro da clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Recebido" value={`R$ ${totalRecebido.toFixed(2)}`} icon={<TrendingUp className="h-6 w-6" />} variant="success" />
        <StatCard title="Pendente" value={`R$ ${totalPendente.toFixed(2)}`} icon={<Clock className="h-6 w-6" />} variant="warning" />
        <StatCard title="Total Cobrado" value={`R$ ${totalCobrado.toFixed(2)}`} icon={<DollarSign className="h-6 w-6" />} variant="info" />
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="capitalize font-medium">{r.tipo}</TableCell>
                <TableCell>R$ {r.valor.toFixed(2)}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                <TableCell>{r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '-'}</TableCell>
                <TableCell>{r.data_pagamento ? new Date(r.data_pagamento).toLocaleDateString('pt-BR') : '-'}</TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={v => updateStatus(r.id, v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
