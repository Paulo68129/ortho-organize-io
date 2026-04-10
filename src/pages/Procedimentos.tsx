import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Procedimento } from '@/types';

export default function Procedimentos() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Procedimento | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', valor: '' });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('procedimentos').select('*').order('nome');
    setProcedimentos(data || []);
  }

  function openNew() {
    setEditing(null);
    setForm({ nome: '', descricao: '', valor: '' });
    setOpen(true);
  }

  function openEdit(p: Procedimento) {
    setEditing(p);
    setForm({ nome: p.nome, descricao: p.descricao || '', valor: String(p.valor) });
    setOpen(true);
  }

  async function handleSave() {
    try {
      const payload = { nome: form.nome, descricao: form.descricao, valor: parseFloat(form.valor) };
      if (editing) {
        await supabase.from('procedimentos').update(payload).eq('id', editing.id);
        toast({ title: 'Procedimento atualizado!' });
      } else {
        await supabase.from('procedimentos').insert(payload);
        toast({ title: 'Procedimento cadastrado!' });
      }
      setOpen(false);
      load();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir?')) return;
    await supabase.from('procedimentos').delete().eq('id', id);
    toast({ title: 'Procedimento excluído!' });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Procedimentos</h1>
          <p className="text-muted-foreground">Catálogo de procedimentos odontológicos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Procedimento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} Procedimento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedimentos.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum procedimento cadastrado.</TableCell></TableRow>
            ) : procedimentos.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-muted-foreground">{p.descricao}</TableCell>
                <TableCell>R$ {p.valor.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
