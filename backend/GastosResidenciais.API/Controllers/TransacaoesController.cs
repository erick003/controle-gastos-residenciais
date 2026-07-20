using GastosResidenciais.API.Data;
using GastosResidenciais.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace GastosResidenciais.API.Controllers
{
    [ApiController]
    [Route("api/transacoes")]
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/transacoes
        // Lista as transações e inclui a pessoa vinculada para exibição no front-end.
        [HttpGet]
        public async Task<IActionResult> ListarTodas()
        {
            // Retorna as transações com os dados básicos da pessoa vinculada, sem criar referência circular.
            var transacoes = await _context.Transacoes
                .Include(t => t.Pessoa)
                .Select(t => new
                {
                    t.Id,
                    t.Descricao,
                    t.Valor,
                    t.Tipo,
                    t.PessoaId,
                    Pessoa = t.Pessoa == null ? null : new
                    {
                        t.Pessoa.Id,
                        t.Pessoa.Nome,
                        t.Pessoa.Idade
                    }
                })
                .ToListAsync();

            return Ok(transacoes);
        }

        // POST: api/transacoes
        // Cria uma transação após validar a existência da pessoa e aplicar a regra de negócio.
        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] Transacao transacao)
        {
            // REGRA DE NEGÓCIO: Valida se a pessoa vinculada realmente existe no banco
            var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest("A pessoa informada não existe no cadastro.");
            }

            // Valida se o tipo enviado é um dos dois permitidos
            if (transacao.Tipo != "Despesa" && transacao.Tipo != "Receita")
            {
                return BadRequest("O tipo da transação deve ser 'Despesa' ou 'Receita'.");
            }

            // REGRA DE NEGÓCIO: Se for menor de 18 anos, barra cadastros de Receita
            if (pessoa.Idade < 18 && transacao.Tipo == "Receita")
            {
                return BadRequest("Menores de 18 anos só podem registrar transações do tipo Despesa.");
            }

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ListarTodas), new { id = transacao.Id }, new
            {
                transacao.Id,
                transacao.Descricao,
                transacao.Valor,
                transacao.Tipo,
                transacao.PessoaId
            });
        }
    }
}