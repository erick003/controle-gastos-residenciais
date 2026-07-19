using GastosResidenciais.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Define as tabelas que serão criadas no banco de dados
        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<Transacao> Transacoes { get; set; }

        // Fluent API: Usada para configurar regras avançadas do banco de dados
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração explícita da Deleção em Cascata (Cascade Delete)
            modelBuilder.Entity<Transacao>()
                .HasOne(t => t.Pessoa)          // Uma Transação tem uma Pessoa
                .WithMany(p => p.Transacoes)    // Uma Pessoa tem muitas Transações
                .HasForeignKey(t => t.PessoaId) // A chave estrangeira é PessoaId
                .OnDelete(DeleteBehavior.Cascade); // Se apagar a pessoa, apaga as transações
        }
    }
}