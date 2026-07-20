using GastosResidenciais.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace GastosResidenciais.API.Controllers
{
    [ApiController]
    [Route("api/totais")]
    public class TotaisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TotaisController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/totais
        // Calcula receitas, despesas e o saldo líquido por pessoa e também o consolidado do sistema.
        [HttpGet]
        public async Task<IActionResult> ObterResumoFinanceiro()
        {
            var pessoasDoBanco = await _context.Pessoas
                .Include(p => p.Transacoes)
                .ToListAsync();

            // REGRA DE NEGÓCIO: Calcula receitas, despesas e saldo líquido de cada pessoa
            var listagemPessoas = pessoasDoBanco.Select(p => new
            {
                p.Id,
                p.Nome,
                p.Idade,
                TotalReceitas = p.Transacoes.Where(t => t.Tipo == "Receita").Sum(t => t.Valor),
                TotalDespesas = p.Transacoes.Where(t => t.Tipo == "Despesa").Sum(t => t.Valor),
                Saldo = p.Transacoes.Where(t => t.Tipo == "Receita").Sum(t => t.Valor) - 
                        p.Transacoes.Where(t => t.Tipo == "Despesa").Sum(t => t.Valor)
            }).ToList();

            // REGRA DE NEGÓCIO: Calcula os valores consolidados de todo o sistema
            var totalGeralReceitas = listagemPessoas.Sum(p => p.TotalReceitas);
            var totalGeralDespesas = listagemPessoas.Sum(p => p.TotalDespesas);
            var saldoLiquidoGeral = totalGeralReceitas - totalGeralDespesas;

            return Ok(new
            {
                Pessoas = listagemPessoas,
                TotalGeralReceitas = totalGeralReceitas,
                TotalGeralDespesas = totalGeralDespesas,
                SaldoLiquidoGeral = saldoLiquidoGeral
            });
        }
    }
}