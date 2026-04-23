🦷 OdontoCare — Sistema de Gestão para Clínicas Odontológicas
OdontoCare é um sistema web completo para gestão de clínicas odontológicas, desenvolvido para organizar pacientes, consultas, prontuários clínicos e controles financeiros, com foco em usabilidade, segurança de dados e escalabilidade.
O projeto foi concebido para uso real em clínicas, lidando com dados sensíveis de saúde, múltiplos usuários e regras de negócio específicas do setor odontológico.

🎯 Problema Resolvido
Clínicas odontológicas frequentemente enfrentam:

Falta de centralização de informações clínicas
Controle manual de agendas e atendimentos
Dificuldades no gerenciamento financeiro
Risco no tratamento de dados sensíveis de pacientes

O OdontoCare resolve esses problemas através de uma plataforma única, digital e segura.

✅ Funcionalidades Principais
👤 Gestão de Pacientes

Cadastro completo (CPF, telefone, e‑mail, data de nascimento)
Pesquisa e listagem de pacientes
Histórico médico vinculado

📅 Agendamento de Consultas

Agendamento com seleção de dentista e paciente
Controle de status: agendada, concluída, cancelada
Observações clínicas e prescrições por consulta

🦷 Gestão de Dentistas

Cadastro com CRO e especialidade
Configuração de horários de atendimento por dia da semana

📄 Prontuário Eletrônico

Anamnese: queixa principal, histórico médico, alergias, medicamentos e hábitos
Evolução clínica: registro cronológico de atendimentos e planos de tratamento
Prescrições: medicamento, dosagem, frequência, duração e observações

💰 Módulo Financeiro

Registro de receitas e despesas
Formas de pagamento: PIX, crédito, débito, dinheiro e boleto
Controle de status: pendente, pago, cancelado
Datas de vencimento e pagamento

🏥 Procedimentos

Catálogo de procedimentos odontológicos com valores
Vínculo de procedimentos realizados por consulta


🛠️ Arquitetura e Tecnologias
Frontend

React 18
TypeScript
Vite
Tailwind CSS
shadcn/ui
React Router DOM
React Query
React Hook Form + Zod
Recharts
date-fns

Backend / Infraestrutura

Supabase

Autenticação
Banco de dados PostgreSQL
Row Level Security (RLS)




🔐 Segurança

Autenticação via Supabase Auth
Row Level Security (RLS) aplicada em todas as tabelas
Isolamento de dados por usuário
Acesso restrito a usuários autenticados


O projeto foi desenvolvido considerando boas práticas de segurança para sistemas que lidam com informações clínicas sensíveis.


📊 Estrutura do Banco de Dados

pacientes
dentistas
consultas
procedimentos
procedimentos_realizados
anamneses
evolucoes_clinicas
prescricoes
financeiro
horarios


📁 Estrutura do Projeto
Plain Textsrc/├── components/│   ├── ui/                # Componentes shadcn/ui│   ├── AppLayout.tsx      # Layout principal│   ├── AppSidebar.tsx     # Navegação lateral│   └── StatCard.tsx       # Cards de estatísticas├── contexts/│   └── AuthContext.tsx    # Autenticação├── hooks/                 # Hooks customizados├── integrations/│   └── supabase/          # Cliente e tipos Supabase├── pages/│   ├── Dashboard.tsx│   ├── Pacientes.tsx│   ├── Consultas.tsx│   ├── Dentistas.tsx│   ├── Prontuario.tsx│   ├── Financeiro.tsx│   ├── Procedimentos.tsx│   ├── Horarios.tsx│   └── Login.tsx├── types/                 # Tipos globais└── lib/                   # UtilitáriosMostrar mais linhas

🚀 Executando Localmente
Plain Textgit clone <url-do-repositorio>npm installnpm run dev``Mostrar mais linhas
A aplicação estará disponível em:
👉 http://localhost:5173

📌 Status do Projeto
✅ Aplicação funcional
✅ Arquitetura preparada para evolução
✅ Em uso / pronta para produção

✍️ Autor
Paulo Roberto Silva de Oliveira Júnior
Desenvolvido com foco em engenharia de software, segurança e sistemas de gestão reais.
