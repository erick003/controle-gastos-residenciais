using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GastosResidenciais.API.Models
{
    public class Transacao
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        public decimal Valor { get; set; }

        [Required]
        public string Tipo { get; set; } = string.Empty;

        [Required]
        public Guid PessoaId { get; set; }

        [ForeignKey("PessoaId")]
        public Pessoa? Pessoa { get; set; }
    }
}
