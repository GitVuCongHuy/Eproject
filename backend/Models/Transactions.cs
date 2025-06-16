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

    // [Required]
    // [Column("from_account")]
    // public int FromAccountId { get; set; }
    // public Accounts FromAccount { get; set; }  // dùng class Accounts

    // [Required]
    // [Column("to_account")]
    // [ForeignKey("Accounts")]
    // public int ToAccountId { get; set; }
    // public Accounts ToAccount { get; set; }

    // [Required]
    // [Column("amount", TypeName = "decimal(18,2)")]
    // public decimal Amount { get; set; }

    // [Required]
    // [MaxLength(20)]
    // [Column("transaction_type")]
    // public string TransactionType { get; set; }

    // [Required]
    // [MaxLength(20)]
    // [Column("status")]
    // public string Status { get; set; }

    // [Required]
    // [Column("transaction_date")]
    // public DateTime TransactionDate { get; set; }

    [Column("description")]
    public string Description { get; set; }

}
