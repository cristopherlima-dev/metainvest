# MetaInvest 📈

App web para controle de aportes mensais em investimentos com sistema de metas progressivas.

## 💡 Sobre o projeto

O MetaInvest foi criado para quem faz aportes mensais de valores baixos e prefere concentrar os investimentos em um ativo por vez, atingindo metas progressivas (ex: R$ 1.000,00 por ativo) antes de partir para o próximo. A estratégia mantém metas alcançáveis e o controle simples.

## ✨ Funcionalidades

- Cadastro de saldo inicial por ativo
- Criação de metas com valor configurável (padrão: R$ 1.000,00)
- Apenas uma meta ativa por vez
- Registro de aportes na meta atual
- Fechamento automático ao atingir o valor da meta
- Histórico de metas concluídas
- Suporte a múltiplos tipos de ativo:
  - Caixinhas Nubank (com nome customizável)
  - Tesouro Direto
  - Ações BR
  - ETFs nacionais
  - FIIs

## 🛠️ Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + Prisma
- **Banco de dados:** SQLite
- **Versionamento:** Git + GitHub

## 📁 Estrutura

metainvest/
├── backend/ # API Node.js + Express + Prisma
├── frontend/ # Aplicação React + Vite
└── README.md

## 🚧 Status

Em desenvolvimento.

## 📄 Licença

MIT
