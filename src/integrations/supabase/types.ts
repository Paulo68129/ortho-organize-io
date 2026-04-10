export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anamneses: {
        Row: {
          alergias: string | null
          created_at: string
          habitos: string | null
          historico_medico: string | null
          id: string
          medicamentos_em_uso: string | null
          observacoes: string | null
          paciente_id: string
          queixa_principal: string | null
          updated_at: string
        }
        Insert: {
          alergias?: string | null
          created_at?: string
          habitos?: string | null
          historico_medico?: string | null
          id?: string
          medicamentos_em_uso?: string | null
          observacoes?: string | null
          paciente_id: string
          queixa_principal?: string | null
          updated_at?: string
        }
        Update: {
          alergias?: string | null
          created_at?: string
          habitos?: string | null
          historico_medico?: string | null
          id?: string
          medicamentos_em_uso?: string | null
          observacoes?: string | null
          paciente_id?: string
          queixa_principal?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          created_at: string
          data_hora: string
          dentista_id: string
          id: string
          observacoes: string | null
          paciente_id: string
          prescricao: string | null
          status: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          dentista_id: string
          id?: string
          observacoes?: string | null
          paciente_id: string
          prescricao?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          dentista_id?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string
          prescricao?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_dentista_id_fkey"
            columns: ["dentista_id"]
            isOneToOne: false
            referencedRelation: "dentistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      dentistas: {
        Row: {
          created_at: string
          cro: string
          email: string | null
          especialidade: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          cro: string
          email?: string | null
          especialidade?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          cro?: string
          email?: string | null
          especialidade?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      evolucoes_clinicas: {
        Row: {
          consulta_id: string | null
          created_at: string
          descricao: string
          id: string
          paciente_id: string
          plano_tratamento: string | null
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string
          descricao: string
          id?: string
          paciente_id: string
          plano_tratamento?: string | null
        }
        Update: {
          consulta_id?: string | null
          created_at?: string
          descricao?: string
          id?: string
          paciente_id?: string
          plano_tratamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolucoes_clinicas_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolucoes_clinicas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          consulta_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          forma_pagamento: string | null
          id: string
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          forma_pagamento?: string | null
          id?: string
          status?: string
          tipo: string
          valor?: number
        }
        Update: {
          consulta_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          forma_pagamento?: string | null
          id?: string
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios: {
        Row: {
          created_at: string
          dentista_id: string
          dia_semana: number
          disponivel: boolean
          hora_fim: string
          hora_inicio: string
          id: string
        }
        Insert: {
          created_at?: string
          dentista_id: string
          dia_semana: number
          disponivel?: boolean
          hora_fim: string
          hora_inicio: string
          id?: string
        }
        Update: {
          created_at?: string
          dentista_id?: string
          dia_semana?: number
          disponivel?: boolean
          hora_fim?: string
          hora_inicio?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_dentista_id_fkey"
            columns: ["dentista_id"]
            isOneToOne: false
            referencedRelation: "dentistas"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          cpf: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco_id: string | null
          historico_medico: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco_id?: string | null
          historico_medico?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco_id?: string | null
          historico_medico?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescricoes: {
        Row: {
          consulta_id: string | null
          created_at: string
          dosagem: string | null
          duracao: string | null
          frequencia: string | null
          id: string
          medicamento: string
          observacoes: string | null
          paciente_id: string
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string
          dosagem?: string | null
          duracao?: string | null
          frequencia?: string | null
          id?: string
          medicamento: string
          observacoes?: string | null
          paciente_id: string
        }
        Update: {
          consulta_id?: string | null
          created_at?: string
          dosagem?: string | null
          duracao?: string | null
          frequencia?: string | null
          id?: string
          medicamento?: string
          observacoes?: string | null
          paciente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimentos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          valor?: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          valor?: number
        }
        Relationships: []
      }
      procedimentos_realizados: {
        Row: {
          consulta_id: string
          created_at: string
          id: string
          observacoes: string | null
          procedimento_id: string
          valor_cobrado: number
        }
        Insert: {
          consulta_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          procedimento_id: string
          valor_cobrado?: number
        }
        Update: {
          consulta_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          procedimento_id?: string
          valor_cobrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "procedimentos_realizados_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_realizados_procedimento_id_fkey"
            columns: ["procedimento_id"]
            isOneToOne: false
            referencedRelation: "procedimentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
