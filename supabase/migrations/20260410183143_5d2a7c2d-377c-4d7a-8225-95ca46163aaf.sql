
-- Anamneses table
CREATE TABLE public.anamneses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  queixa_principal TEXT,
  historico_medico TEXT,
  alergias TEXT,
  medicamentos_em_uso TEXT,
  habitos TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage anamneses" ON public.anamneses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_anamneses_updated_at
  BEFORE UPDATE ON public.anamneses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Evoluções clínicas table
CREATE TABLE public.evolucoes_clinicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  plano_tratamento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.evolucoes_clinicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage evolucoes" ON public.evolucoes_clinicas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Prescrições table
CREATE TABLE public.prescricoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  medicamento TEXT NOT NULL,
  dosagem TEXT,
  frequencia TEXT,
  duracao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage prescricoes" ON public.prescricoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
