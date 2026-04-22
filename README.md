# 🦷 OdontoCare - Sistema de Gestão Odontológica

Sistema completo de gestão para clínicas odontológicas, desenvolvido com tecnologias modernas para facilitar o gerenciamento de pacientes, consultas, prontuários e financeiro.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)

## 📋 Funcionalidades

### 👤 Gestão de Pacientes
- Cadastro completo com CPF, telefone, e-mail e data de nascimento
- Pesquisa e listagem de pacientes
- Histórico médico vinculado

### 📅 Agendamento de Consultas
- Agendamento com seleção de dentista e paciente
- Controle de status (agendada, confirmada, concluída, cancelada)
- Observações e prescrições por consulta

### 🦷 Gestão de Dentistas
- Cadastro com CRO e especialidade
- Gerenciamento de horários disponíveis por dia da semana

### 📄 Prontuário Eletrônico
- **Anamnese**: queixa principal, histórico médico, alergias, medicamentos em uso e hábitos
- **Evolução Clínica**: registro cronológico de atendimentos e plano de tratamento
- **Prescrições**: medicamento, dosagem, frequência, duração e observações

### 💰 Módulo Financeiro
- Registro de receitas e despesas
- Formas de pagamento: PIX, Cartão de Crédito, Cartão de Débito, Dinheiro, Boleto
- Controle de status (pendente, pago, cancelado)
- Datas de vencimento e pagamento

### 🏥 Procedimentos
- Catálogo de procedimentos odontológicos com valores
- Vínculo de procedimentos realizados por consulta

### ⏰ Horários
- Configuração de disponibilidade por dentista
- Grade horária semanal

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| **React 18** | Biblioteca para construção da interface |
| **TypeScript 5** | Tipagem estática para JavaScript |
| **Vite 5** | Build tool e dev server |
| **Tailwind CSS 3** | Framework CSS utilitário |
| **shadcn/ui** | Componentes UI acessíveis e customizáveis |
| **React Router DOM** | Roteamento SPA |
| **React Query** | Gerenciamento de estado assíncrono |
| **Recharts** | Gráficos e visualizações |
| **React Hook Form + Zod** | Formulários com validação |
| **Supabase** | Backend (autenticação, banco de dados, RLS) |
| **Sonner** | Notificações toast |
| **Lucide React** | Ícones |
| **date-fns** | Manipulação de datas |

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── AppLayout.tsx     # Layout principal com sidebar
│   ├── AppSidebar.tsx    # Menu lateral de navegação
│   ├── NavLink.tsx       # Links de navegação
│   └── StatCard.tsx      # Cards de estatísticas
├── contexts/
│   └── AuthContext.tsx   # Contexto de autenticação
├── hooks/                # Hooks customizados
├── integrations/
│   └── supabase/         # Cliente e tipos do Supabase
├── pages/
│   ├── Dashboard.tsx     # Painel principal
│   ├── Pacientes.tsx     # Gestão de pacientes
│   ├── Consultas.tsx     # Agendamento de consultas
│   ├── Dentistas.tsx     # Cadastro de dentistas
│   ├── Prontuario.tsx    # Prontuário eletrônico
│   ├── Financeiro.tsx    # Módulo financeiro
│   ├── Procedimentos.tsx # Catálogo de procedimentos
│   ├── Horarios.tsx      # Grade de horários
│   └── Login.tsx         # Tela de autenticação
├── types/                # Tipos TypeScript
└── lib/                  # Utilitários
```

## 🚀 Como Executar

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`.

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Acesso restrito a usuários autenticados

## 📊 Banco de Dados

O sistema utiliza as seguintes tabelas:

- `pacientes` — Cadastro de pacientes
- `dentistas` — Cadastro de dentistas
- `consultas` — Agendamentos e consultas
- `procedimentos` — Catálogo de procedimentos
- `procedimentos_realizados` — Procedimentos executados por consulta
- `anamneses` — Fichas de anamnese
- `evolucoes_clinicas` — Evoluções clínicas
- `prescricoes` — Prescrições médicas
- `financeiro` — Registros financeiros
- `horarios` — Horários de atendimento

## ✍️ Autor

**Paulo Roberto Silva de Oliveira Junior**

---

Desenvolvido com ❤️
