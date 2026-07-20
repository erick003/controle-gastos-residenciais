# Controle de Gastos Residenciais

Este projeto é uma aplicação simples para organizar o controle financeiro da casa. A proposta é permitir cadastrar pessoas, registrar receitas e despesas e acompanhar os saldos de forma prática.

## Visão geral

A aplicação foi pensada como um pequeno sistema full-stack com foco em:

- cadastro e organização de membros da residência;
- lançamento de movimentações financeiras;
- visualização de totais por pessoa e no geral;
- aplicação de regras de negócio simples, como a restrição para menores de idade.

## Funcionalidades principais

- Cadastro de pessoas com nome e idade
- Cadastro de transações do tipo receita ou despesa
- Cálculo de totais e saldo geral
- Listagem de integrantes e movimentações
- Exclusão de pessoa com remoção em cascata das transações relacionadas
- Validação de regra de negócio: menores de 18 anos só podem registrar despesas

## Stack utilizada

- Back-end: .NET 8, ASP.NET Core, Entity Framework Core e SQLite
- Front-end: React, TypeScript e Vite
- Testes: xUnit com Entity Framework Core InMemory

## Fluxo do projeto

1. O usuário acessa a interface web.
2. O front-end consome os endpoints da API.
3. O back-end valida os dados e aplica as regras de negócio.
4. As informações são persistidas no banco SQLite.
5. O resumo financeiro é recalculado e exibido na tela.

## Decisões de implementação

- Foi escolhido SQLite para manter a solução leve e fácil de rodar localmente.
- O back-end foi estruturado com controllers simples para facilitar a leitura e manutenção.
- O front-end foi organizado em uma tela única para concentrar a experiência do usuário.
- A regra de negócio para menores de idade foi implementada no back-end para garantir consistência dos dados.

## Como rodar localmente

### Backend

```bash
cd backend/GastosResidenciais.API
dotnet run
```

A API ficará disponível em http://localhost:5094.

### Frontend

```bash
cd frontend/gastos-web
npm install
npm run dev
```

O front-end ficará disponível em http://localhost:7123.

## Como executar os testes

```bash
cd backend/GastosResidenciais.API
 dotnet test GastosResidenciais.API.Tests/GastosResidenciais.API.Tests.csproj
```

## Persistência dos dados

Os registros ficam salvos em SQLite no arquivo gastos.db, criado automaticamente na primeira execução.

## Observações de negócio

- Cada pessoa recebe um identificador único automaticamente.
- Cada transação também recebe um identificador único.
- A relação entre pessoa e transação é persistida no banco.
- Os totais são calculados a partir das receitas e despesas registradas.
