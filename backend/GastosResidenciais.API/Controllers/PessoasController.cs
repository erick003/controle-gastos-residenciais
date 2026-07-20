using GastosResidenciais.API.Data;
using GastosResidenciais.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace GastosResidenciais.API.Controllers
{
    [ApiController]
    [Route("api/pessoas")]
    public class PessoasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PessoasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/pessoas
        // Lista todas as pessoas cadastradas para alimentar a interface e os totais.
        [HttpGet]
        public async Task<IActionResult> ListarTodos()
        {
            // Busca e retorna apenas os dados básicos das pessoas para evitar referências circulares.
            var pessoas = await _context.Pessoas
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Idade
                })
                .ToListAsync();

            return Ok(pessoas);
        }

        // POST: api/pessoas
        // Cria uma pessoa com nome e idade válidos. O identificador é gerado automaticamente.
        [HttpPost]
        public async Task<IActionResult> Criar([FromBody] Pessoa pessoa)
        {
            if (pessoa == null)
            {
                return BadRequest("Dados inválidos para cadastro de pessoa.");
            }

            var nome = pessoa.Nome?.Trim() ?? string.Empty;
            var idade = pessoa.Idade;

            if (string.IsNullOrWhiteSpace(nome))
            {
                return BadRequest("O nome da pessoa é obrigatório.");
            }

            if (idade <= 0 || idade > 150)
            {
                return BadRequest("A idade deve ser um valor válido.");
            }

            var entidade = new Pessoa
            {
                Nome = nome,
                Idade = idade
            };

            _context.Pessoas.Add(entidade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ListarTodos), new { id = entidade.Id }, new
            {
                entidade.Id,
                entidade.Nome,
                entidade.Idade
            });
        }

        // DELETE: api/pessoas/{id}
        // Remove a pessoa e, por configuração de cascata, suas transações vinculadas.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(Guid id)
        {
            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null)
            {
                return NotFound("Pessoa não encontrada.");
            }

            // REGRA DE NEGÓCIO: Devido à deleção em cascata configurada no AppDbContext,
            // ao remover a pessoa, todas as transações ligadas a ela caem automaticamente.
            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}