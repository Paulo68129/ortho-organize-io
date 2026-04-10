import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Plus, ClipboardList, Activity, Pill, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
}

interface Anamnese {
  id: string;
  paciente_id: string;
  queixa_principal: string | null;
  historico_medico: string | null;
  alergias: string | null;
  medicamentos_em_uso: string | null;
  habitos: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

interface EvolucaoClinica {
  id: string;
  paciente_id: string;
  consulta_id: string | null;
  descricao: string;
  plano_tratamento: string | null;
  created_at: string;
}

interface Prescricao {
  id: string;
  paciente_id: string;
  consulta_id: string | null;
  medicamento: string;
  dosagem: string | null;
  frequencia: string | null;
  duracao: string | null;
  observacoes: string | null;
  created_at: string;
}

export default function Prontuario() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anamnese, setAnamnese] = useState<Anamnese | null>(null);
  const [evolucoes, setEvolucoes] = useState<EvolucaoClinica[]>([]);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [anamneseOpen, setAnamneseOpen] = useState(false);
  const [evolucaoOpen, setEvolucaoOpen] = useState(false);
  const [prescricaoOpen, setPrescricaoOpen] = useState(false);

  // Forms
  const [anamneseForm, setAnamneseForm] = useState({
    queixa_principal: '',
    historico_medico: '',
    alergias: '',
    medicamentos_em_uso: '',
    habitos: '',
    observacoes: '',
  });

  const [evolucaoForm, setEvolucaoForm] = useState({
    descricao: '',
    plano_tratamento: '',
  });

  const [prescricaoForm, setPrescricaoForm] = useState({
    medicamento: '',
    dosagem: '',
    frequencia: '',
    duracao: '',
    observacoes: '',
  });

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (selectedPaciente) {
      fetchProntuario(selectedPaciente.id);
    }
  }, [selectedPaciente]);

  async function fetchPacientes() {
    const { data } = await supabase.from('pacientes').select('id, nome, cpf').order('nome');
    if (data) setPacientes(data);
  }

  async function fetchProntuario(pacienteId: string) {
    setLoading(true);
    const [anamneseRes, evolucoesRes, prescricoesRes] = await Promise.all([
      supabase.from('anamneses').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }).limit(1),
      supabase.from('evolucoes_clinicas').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }),
      supabase.from('prescricoes').select('*').eq('paciente_id', pacienteId).order('created_at', { ascending: false }),
    ]);

    if (anamneseRes.data && anamneseRes.data.length > 0) {
      setAnamnese(anamneseRes.data[0] as Anamnese);
      const a = anamneseRes.data[0];
      setAnamneseForm({
        queixa_principal: a.queixa_principal || '',
        historico_medico: a.historico_medico || '',
        alergias: a.alergias || '',
        medicamentos_em_uso: a.medicamentos_em_uso || '',
        habitos: a.habitos || '',
        observacoes: a.observacoes || '',
      });
    } else {
      setAnamnese(null);
      setAnamneseForm({ queixa_principal: '', historico_medico: '', alergias: '', medicamentos_em_uso: '', habitos: '', observacoes: '' });
    }

    if (evolucoesRes.data) setEvolucoes(evolucoesRes.data as EvolucaoClinica[]);
    if (prescricoesRes.data) setPrescricoes(prescricoesRes.data as Prescricao[]);
    setLoading(false);
  }

  async function saveAnamnese() {
    if (!selectedPaciente) return;
    const payload = { ...anamneseForm, paciente_id: selectedPaciente.id };

    let error;
    if (anamnese) {
      ({ error } = await supabase.from('anamneses').update(payload).eq('id', anamnese.id));
    } else {
      ({ error } = await supabase.from('anamneses').insert(payload));
    }

    if (error) {
      toast.error('Erro ao salvar anamnese');
    } else {
      toast.success('Anamnese salva com sucesso');
      setAnamneseOpen(false);
      fetchProntuario(selectedPaciente.id);
    }
  }

  async function addEvolucao() {
    if (!selectedPaciente || !evolucaoForm.descricao.trim()) return;
    const { error } = await supabase.from('evolucoes_clinicas').insert({
      paciente_id: selectedPaciente.id,
      descricao: evolucaoForm.descricao,
      plano_tratamento: evolucaoForm.plano_tratamento || null,
    });

    if (error) {
      toast.error('Erro ao adicionar evolução');
    } else {
      toast.success('Evolução adicionada');
      setEvolucaoForm({ descricao: '', plano_tratamento: '' });
      setEvolucaoOpen(false);
      fetchProntuario(selectedPaciente.id);
    }
  }

  async function addPrescricao() {
    if (!selectedPaciente || !prescricaoForm.medicamento.trim()) return;
    const { error } = await supabase.from('prescricoes').insert({
      paciente_id: selectedPaciente.id,
      medicamento: prescricaoForm.medicamento,
      dosagem: prescricaoForm.dosagem || null,
      frequencia: prescricaoForm.frequencia || null,
      duracao: prescricaoForm.duracao || null,
      observacoes: prescricaoForm.observacoes || null,
    });

    if (error) {
      toast.error('Erro ao adicionar prescrição');
    } else {
      toast.success('Prescrição adicionada');
      setPrescricaoForm({ medicamento: '', dosagem: '', frequencia: '', duracao: '', observacoes: '' });
      setPrescricaoOpen(false);
      fetchProntuario(selectedPaciente.id);
    }
  }

  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(searchTerm)
  );

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Prontuário Eletrônico</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pacientes</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto space-y-1 p-3">
            {filteredPacientes.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPaciente(p)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedPaciente?.id === p.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium">{p.nome}</div>
                <div className={`text-xs ${selectedPaciente?.id === p.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  CPF: {p.cpf}
                </div>
              </button>
            ))}
            {filteredPacientes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum paciente encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Prontuário Content */}
        <div className="lg:col-span-3">
          {!selectedPaciente ? (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Selecione um paciente para ver o prontuário</p>
              </div>
            </Card>
          ) : loading ? (
            <Card className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando prontuário...</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {selectedPaciente.nome}
                    </CardTitle>
                    <Badge variant="outline">CPF: {selectedPaciente.cpf}</Badge>
                  </div>
                </CardHeader>
              </Card>

              <Tabs defaultValue="anamnese">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="anamnese" className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" />
                    Anamnese
                  </TabsTrigger>
                  <TabsTrigger value="evolucao" className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Evolução
                  </TabsTrigger>
                  <TabsTrigger value="prescricoes" className="flex items-center gap-1">
                    <Pill className="h-4 w-4" />
                    Prescrições
                  </TabsTrigger>
                </TabsList>

                {/* Anamnese Tab */}
                <TabsContent value="anamnese">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-base">Anamnese</CardTitle>
                      <Dialog open={anamneseOpen} onOpenChange={setAnamneseOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            {anamnese ? 'Editar' : 'Nova Anamnese'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{anamnese ? 'Editar' : 'Nova'} Anamnese</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Queixa Principal</Label>
                              <Textarea value={anamneseForm.queixa_principal} onChange={(e) => setAnamneseForm({ ...anamneseForm, queixa_principal: e.target.value })} />
                            </div>
                            <div>
                              <Label>Histórico Médico</Label>
                              <Textarea value={anamneseForm.historico_medico} onChange={(e) => setAnamneseForm({ ...anamneseForm, historico_medico: e.target.value })} />
                            </div>
                            <div>
                              <Label>Alergias</Label>
                              <Textarea value={anamneseForm.alergias} onChange={(e) => setAnamneseForm({ ...anamneseForm, alergias: e.target.value })} />
                            </div>
                            <div>
                              <Label>Medicamentos em Uso</Label>
                              <Textarea value={anamneseForm.medicamentos_em_uso} onChange={(e) => setAnamneseForm({ ...anamneseForm, medicamentos_em_uso: e.target.value })} />
                            </div>
                            <div>
                              <Label>Hábitos</Label>
                              <Textarea value={anamneseForm.habitos} onChange={(e) => setAnamneseForm({ ...anamneseForm, habitos: e.target.value })} />
                            </div>
                            <div>
                              <Label>Observações</Label>
                              <Textarea value={anamneseForm.observacoes} onChange={(e) => setAnamneseForm({ ...anamneseForm, observacoes: e.target.value })} />
                            </div>
                            <Button onClick={saveAnamnese} className="w-full">Salvar Anamnese</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {anamnese ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: 'Queixa Principal', value: anamnese.queixa_principal },
                            { label: 'Histórico Médico', value: anamnese.historico_medico },
                            { label: 'Alergias', value: anamnese.alergias },
                            { label: 'Medicamentos em Uso', value: anamnese.medicamentos_em_uso },
                            { label: 'Hábitos', value: anamnese.habitos },
                            { label: 'Observações', value: anamnese.observacoes },
                          ].map((field) => (
                            <div key={field.label} className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</p>
                              <p className="text-sm text-foreground">{field.value || '—'}</p>
                            </div>
                          ))}
                          <div className="col-span-full text-xs text-muted-foreground">
                            Última atualização: {formatDate(anamnese.updated_at)}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma anamnese registrada</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Evolução Tab */}
                <TabsContent value="evolucao">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-base">Evolução Clínica</CardTitle>
                      <Dialog open={evolucaoOpen} onOpenChange={setEvolucaoOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Evolução</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nova Evolução Clínica</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Descrição *</Label>
                              <Textarea value={evolucaoForm.descricao} onChange={(e) => setEvolucaoForm({ ...evolucaoForm, descricao: e.target.value })} placeholder="Descreva a evolução clínica..." />
                            </div>
                            <div>
                              <Label>Plano de Tratamento</Label>
                              <Textarea value={evolucaoForm.plano_tratamento} onChange={(e) => setEvolucaoForm({ ...evolucaoForm, plano_tratamento: e.target.value })} placeholder="Plano de tratamento..." />
                            </div>
                            <Button onClick={addEvolucao} className="w-full">Adicionar Evolução</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {evolucoes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma evolução registrada</p>
                      ) : (
                        <div className="space-y-4">
                          {evolucoes.map((ev) => (
                            <div key={ev.id} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(ev.created_at)}
                              </div>
                              <p className="text-sm text-foreground">{ev.descricao}</p>
                              {ev.plano_tratamento && (
                                <div className="pt-2 border-t">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Plano de Tratamento</p>
                                  <p className="text-sm text-foreground">{ev.plano_tratamento}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Prescrições Tab */}
                <TabsContent value="prescricoes">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-base">Prescrições</CardTitle>
                      <Dialog open={prescricaoOpen} onOpenChange={setPrescricaoOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Prescrição</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nova Prescrição</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Medicamento *</Label>
                              <Input value={prescricaoForm.medicamento} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, medicamento: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Dosagem</Label>
                                <Input value={prescricaoForm.dosagem} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, dosagem: e.target.value })} placeholder="Ex: 500mg" />
                              </div>
                              <div>
                                <Label>Frequência</Label>
                                <Input value={prescricaoForm.frequencia} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, frequencia: e.target.value })} placeholder="Ex: 8/8h" />
                              </div>
                            </div>
                            <div>
                              <Label>Duração</Label>
                              <Input value={prescricaoForm.duracao} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, duracao: e.target.value })} placeholder="Ex: 7 dias" />
                            </div>
                            <div>
                              <Label>Observações</Label>
                              <Textarea value={prescricaoForm.observacoes} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, observacoes: e.target.value })} />
                            </div>
                            <Button onClick={addPrescricao} className="w-full">Adicionar Prescrição</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {prescricoes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma prescrição registrada</p>
                      ) : (
                        <div className="space-y-3">
                          {prescricoes.map((pr) => (
                            <div key={pr.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-foreground">{pr.medicamento}</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {pr.dosagem && <Badge variant="secondary">{pr.dosagem}</Badge>}
                                    {pr.frequencia && <Badge variant="secondary">{pr.frequencia}</Badge>}
                                    {pr.duracao && <Badge variant="outline">{pr.duracao}</Badge>}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{formatDate(pr.created_at)}</span>
                              </div>
                              {pr.observacoes && <p className="text-sm text-muted-foreground mt-2">{pr.observacoes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
