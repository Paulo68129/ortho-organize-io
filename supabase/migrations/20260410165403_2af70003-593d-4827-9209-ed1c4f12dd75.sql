CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  data_nascimento DATE,
  telefone TEXT,
  email TEXT,
  endereco_id UUID,
  historico_medico TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage pacientes" ON public.pacientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.dentistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cro TEXT UNIQUE NOT NULL,
  especialidade TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dentistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage dentistas" ON public.dentistas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.horarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentista_id UUID NOT NULL REFERENCES public.dentistas(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage horarios" ON public.horarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES public.dentistas(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'cancelada', 'realizada', 'ausente')),
  observacoes TEXT,
  prescricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage consultas" ON public.consultas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.procedimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage procedimentos" ON public.procedimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.procedimentos_realizados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consulta_id UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
  procedimento_id UUID NOT NULL REFERENCES public.procedimentos(id) ON DELETE CASCADE,
  valor_cobrado NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procedimentos_realizados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage procedimentos_realizados" ON public.procedimentos_realizados FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.financeiro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL CHECK (tipo IN ('cobranca', 'recebimento')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  data_vencimento DATE,
  data_pagamento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage financeiro" ON public.financeiro FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_consultas_data ON public.consultas(data_hora);
CREATE INDEX idx_consultas_status ON public.consultas(status);
CREATE INDEX idx_consultas_paciente ON public.consultas(paciente_id);
CREATE INDEX idx_consultas_dentista ON public.consultas(dentista_id);
CREATE INDEX idx_horarios_dentista ON public.horarios(dentista_id);
CREATE INDEX idx_financeiro_status ON public.financeiro(status);
CREATE INDEX idx_financeiro_tipo ON public.financeiro(tipo);