import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Consulta, Paciente, Dentista } from '@/types';

const statusColors: Record<string, string> = {
  agendada: 'bg-info/20 text-info border-info/30',
  realizada: 'bg-success/20 text-success border-success/30',
  cancelada: 'bg-destructive/20 text-destructive border-destructive/30',
  ausente: 'bg-warning/20 text-warning border-warning/30',
};

export default function Consultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ paciente_id: '', dentista_id: '', data_hora: '', status: 'agendada', observacoes: '' });
  const { toast } = useToast();

  useEffect(() => { load(); loadRefs(); }, []);

  async function load() {
    const { data } = await supabase
      .from('consultas')
      .select('*, paciente:pacientes(*), dentista:dentistas(*)')
      .order('data_hora', { ascending: false });
    setConsultas((data as any) || []);
  }

  async function loadRefs() {
    const [p, d] = await Promise.all([
      supabase.from('pacientes').select('*').order('nome'),
      supabase.from('dentistas').select('*').order('nome'),
    ]);
    setPacientes(p.data || []);
    setDentistas(d.data || []);
  }

  const filtered = consultas.filter(c => {
    const matchSearch = c.paciente?.nome?.toLowerCase().includes(search.toLowerCase()) || c.dentista?.nome?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleSave() {
    if (!form.paciente_id || !form.dentista_id || !form.data_hora) {
      toast({ title: 'Preencha paciente, dentista e data/hora', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase
      .from('consultas')
      .insert(form)
      .select('*, paciente:pacientes(*), dentista:dentistas(*)')
      .single();
    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' });
      return;
    }
    if (data) {
      setConsultas(prev => [data as any, ...prev]);
    }
    toast({ title: 'Consulta agendada!' });
    setOpen(false);
    load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('consultas').update({ status }).eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultas</h1>
          <p className="text-muted-foreground">Gerencie as consultas da clínica</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm({ paciente_id: '', dentista_id: '', data_hora: '', status: 'agendada', observacoes: '' }); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Consulta</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={form.paciente_id} onValueChange={v => setForm({ ...form, paciente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{pacientes.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dentista</Label>
                <Select value={form.dentista_id} onValueChange={v => setForm({ ...form, dentista_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{dentistas.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input type="datetime-local" value={form.data_hora} onChange={e => setForm({ ...form, data_hora: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
              </div>
              <Button onClick={handleSave} className="w-full">Agendar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="agendada">Agendada</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="ausente">Ausente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Dentista</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma consulta encontrada.</TableCell></TableRow>
            ) : filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{c.paciente?.nome ?? '—'}</span>
                    {c.paciente?.cpf && <span className="text-xs text-muted-foreground">CPF: {c.paciente.cpf}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    {c.paciente?.telefone && <span>{c.paciente.telefone}</span>}
                    {c.paciente?.email && <span>{c.paciente.email}</span>}
                  </div>
                </TableCell>
                <TableCell>{c.dentista?.nome ?? '—'}</TableCell>
                <TableCell>
                  {new Date(c.data_hora).toLocaleDateString('pt-BR')} {new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[c.status]}>{c.status}</Badge>
                </TableCell>
                <TableCell>
                  <Select value={c.status} onValueChange={v => updateStatus(c.id, v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendada">Agendada</SelectItem>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="ausente">Ausente</SelectItem>
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
