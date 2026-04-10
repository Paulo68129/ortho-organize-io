import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Horario, Dentista } from '@/types';

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Horarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ dentista_id: '', dia_semana: '1', hora_inicio: '08:00', hora_fim: '18:00' });
  const { toast } = useToast();

  useEffect(() => { load(); loadDentistas(); }, []);

  async function load() {
    const { data } = await supabase.from('horarios').select('*, dentista:dentistas(*)').order('dia_semana').order('hora_inicio');
    setHorarios(data || []);
  }

  async function loadDentistas() {
    const { data } = await supabase.from('dentistas').select('*').order('nome');
    setDentistas(data || []);
  }

  async function handleSave() {
    try {
      await supabase.from('horarios').insert({ ...form, dia_semana: parseInt(form.dia_semana), disponivel: true });
      toast({ title: 'Horário cadastrado!' });
      setOpen(false);
      load();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  }

  async function toggleDisponivel(id: string, disponivel: boolean) {
    await supabase.from('horarios').update({ disponivel: !disponivel }).eq('id', id);
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from('horarios').delete().eq('id', id);
    toast({ title: 'Horário removido!' });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Horários</h1>
          <p className="text-muted-foreground">Gerencie a agenda dos dentistas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm({ dentista_id: '', dia_semana: '1', hora_inicio: '08:00', hora_fim: '18:00' }); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Novo Horário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Horário</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dentista</Label>
                <Select value={form.dentista_id} onValueChange={v => setForm({ ...form, dentista_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{dentistas.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select value={form.dia_semana} onValueChange={v => setForm({ ...form, dia_semana: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{diasSemana.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Início</Label><Input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} /></div>
                <div className="space-y-2"><Label>Fim</Label><Input type="time" value={form.hora_fim} onChange={e => setForm({ ...form, hora_fim: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dentista</TableHead>
              <TableHead>Dia</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Disponível</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {horarios.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum horário cadastrado.</TableCell></TableRow>
            ) : horarios.map(h => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.dentista?.nome}</TableCell>
                <TableCell>{diasSemana[h.dia_semana]}</TableCell>
                <TableCell>{h.hora_inicio}</TableCell>
                <TableCell>{h.hora_fim}</TableCell>
                <TableCell><Switch checked={h.disponivel} onCheckedChange={() => toggleDisponivel(h.id, h.disponivel)} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
