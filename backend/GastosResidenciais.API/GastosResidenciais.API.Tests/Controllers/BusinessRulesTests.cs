using GastosResidenciais.API.Controllers;
using GastosResidenciais.API.Data;
using GastosResidenciais.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Tests.Controllers
{
    public class BusinessRulesTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly PessoasController _pessoasController;
        private readonly TransacoesController _transacoesController;

        public BusinessRulesTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _pessoasController = new PessoasController(_context);
            _transacoesController = new TransacoesController(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task CriarPessoa_ComDadosValidos_RetornaCreated()
        {
            var result = await _pessoasController.Criar(new Pessoa
            {
                Nome = "Maria",
                Idade = 32
            });

            var created = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(1, await _context.Pessoas.CountAsync());
        }

        [Fact]
        public async Task CriarPessoa_ComNomeVazio_RetornaBadRequest()
        {
            var result = await _pessoasController.Criar(new Pessoa
            {
                Nome = "   ",
                Idade = 20
            });

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("O nome da pessoa é obrigatório.", badRequest.Value);
        }

        [Fact]
        public async Task CriarTransacao_ReceitaParaMenorDe18_RetornaBadRequest()
        {
            var pessoa = new Pessoa { Nome = "João", Idade = 17 };
            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            var result = await _transacoesController.Criar(new Transacao
            {
                Descricao = "Mesada",
                Valor = 100,
                Tipo = "Receita",
                PessoaId = pessoa.Id
            });

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Menores de 18 anos só podem registrar transações do tipo Despesa.", badRequest.Value);
        }

        [Fact]
        public async Task CriarTransacao_ReceitaParaMaiorDe18_RetornaCreated()
        {
            var pessoa = new Pessoa { Nome = "Ana", Idade = 25 };
            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            var result = await _transacoesController.Criar(new Transacao
            {
                Descricao = "Salário",
                Valor = 2500,
                Tipo = "Receita",
                PessoaId = pessoa.Id
            });

            var created = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(201, created.StatusCode);
            Assert.Equal(1, await _context.Transacoes.CountAsync());
        }

        [Fact]
        public async Task DeletarPessoa_RemovePessoaETransacoesRelacionadas()
        {
            var pessoa = new Pessoa { Nome = "Carlos", Idade = 40 };
            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            _context.Transacoes.Add(new Transacao
            {
                Descricao = "Conta",
                Valor = 80,
                Tipo = "Despesa",
                PessoaId = pessoa.Id
            });
            await _context.SaveChangesAsync();

            var result = await _pessoasController.Deletar(pessoa.Id);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, await _context.Pessoas.CountAsync());
            Assert.Equal(0, await _context.Transacoes.CountAsync());
        }
    }
}
