using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("transactions")]
public class Transaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("transaction_id")]
    public int TransactionId { get; set; }

    [Required]
    [ForeignKey("FromAccount")]
    [Column("from_account")]
    public int FromAccountId { get; set; }

    [Required]
    [ForeignKey("ToAccount")]
    [Column("to_account")]
    public int ToAccountId { get; set; }

    [Required]
    [Column("amount", TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("transaction_type")]
    public string TransactionType { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; }

    [Required]
    [Column("transaction_date")]
    public DateTime TransactionDate { get; set; }

    [Column("description")]
    public string Description { get; set; }

}
