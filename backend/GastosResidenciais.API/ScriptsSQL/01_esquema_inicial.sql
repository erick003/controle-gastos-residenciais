-- Script de referência para criação das tabelas no banco de dados
CREATE TABLE Pessoas (
    Id TEXT PRIMARY KEY,
    Nome TEXT NOT NULL,
    Idade INTEGER NOT NULL
);

CREATE TABLE Transacoes (
    Id TEXT PRIMARY KEY,
    Descricao TEXT NOT NULL,
    Valor REAL NOT NULL,
    Tipo TEXT NOT NULL, -- Valores aceitos: 'Despesa' ou 'Receita'
    PessoaId TEXT NOT NULL,
    FOREIGN KEY (PessoaId) REFERENCES Pessoas(Id) ON DELETE CASCADE
);