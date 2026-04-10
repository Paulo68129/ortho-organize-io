export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  endereco_id?: string;
  historico_medico?: string;
  created_at: string;
  updated_at: string;
}

export interface Dentista {
  id: string;
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
  email: string;
  created_at: string;
}

export interface Consulta {
  id: string;
  paciente_id: string;
  dentista_id: string;
  data_hora: string;
  status: 'agendada' | 'cancelada' | 'realizada' | 'ausente';
  observacoes?: string;
  prescricao?: string;
  created_at: string;
  paciente?: Paciente;
  dentista?: Dentista;
}

export interface Horario {
  id: string;
  dentista_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  disponivel: boolean;
  dentista?: Dentista;
}

export interface Procedimento {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  created_at: string;
}

export interface ProcedimentoRealizado {
  id: string;
  consulta_id: string;
  procedimento_id: string;
  valor_cobrado: number;
  observacoes?: string;
  procedimento?: Procedimento;
  consulta?: Consulta;
}

export interface Financeiro {
  id: string;
  consulta_id: string;
  valor: number;
  tipo: 'cobranca' | 'recebimento';
  status: 'pendente' | 'pago' | 'cancelado';
  data_vencimento?: string;
  data_pagamento?: string;
  created_at: string;
  consulta?: Consulta;
}

export interface DashboardStats {
  totalPacientes: number;
  totalDentistas: number;
  consultasHoje: number;
  consultasMes: number;
  receitaMes: number;
  procedimentosMes: number;
}
