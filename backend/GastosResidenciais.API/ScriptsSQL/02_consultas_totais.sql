-- Script estruturado para o cálculo consolidado de totais por pessoa
SELECT 
    p.Id,
    p.Nome,
    COALESCE(SUM(CASE WHEN t.Tipo = 'Receita' THEN t.Valor ELSE 0 END), 0) AS TotalReceitas,
    COALESCE(SUM(CASE WHEN t.Tipo = 'Despesa' THEN t.Valor ELSE 0 END), 0) AS TotalDespesas,
    COALESCE(SUM(CASE WHEN t.Tipo = 'Receita' THEN t.Valor ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.Tipo = 'Despesa' THEN t.Valor ELSE 0 END), 0) AS Saldo
FROM Pessoas p
LEFT JOIN Transacoes t ON p.Id = t.PessoaId
GROUP BY p.Id, p.Nome;