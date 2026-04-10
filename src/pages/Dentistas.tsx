import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Dentista } from '@/types';

export default function Dentistas() {
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dentista | null>(null);
  const [form, setForm] = useState({ nome: '', cro: '', especialidade: '', telefone: '', email: '' });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('dentistas').select('*').order('nome');
    setDentistas(data || []);
  }

  const filtered = dentistas.filter(d =>
    d.nome.toLowerCase().includes(search.toLowerCase()) || d.cro.includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm({ nome: '', cro: '', especialidade: '', telefone: '', email: '' });
    setOpen(true);
  }

  function openEdit(d: Dentista) {
    setEditing(d);
    setForm({ nome: d.nome, cro: d.cro, especialidade: d.especialidade || '', telefone: d.telefone || '', email: d.email || '' });
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await supabase.from('dentistas').update(form).eq('id', editing.id);
        toast({ title: 'Dentista atualizado!' });
      } else {
        await supabase.from('dentistas').insert(form);
        toast({ title: 'Dentista cadastrado!' });
      }
      setOpen(false);
      load();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir este dentista?')) return;
    await supabase.from('dentistas').delete().eq('id', id);
    toast({ title: 'Dentista excluído!' });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dentistas</h1>
          <p className="text-muted-foreground">Gerencie os dentistas da clínica</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Dentista</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Dentista' : 'Novo Dentista'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="space-y-2"><Label>CRO</Label><Input value={form.cro} onChange={e => setForm({ ...form, cro: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Especialidade</Label><Input value={form.especialidade} onChange={e => setForm({ ...form, especialidade: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou CRO..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CRO</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum dentista encontrado.</TableCell></TableRow>
            ) : filtered.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.nome}</TableCell>
                <TableCell>{d.cro}</TableCell>
                <TableCell>{d.especialidade}</TableCell>
                <TableCell>{d.telefone}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
