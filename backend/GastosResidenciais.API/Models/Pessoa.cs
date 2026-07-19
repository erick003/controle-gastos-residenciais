using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models
{
    public class Pessoa
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public int Idade { get; set; }

        public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}
