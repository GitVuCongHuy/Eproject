using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("transactions")]
public class Transactions
{
    [Key]
    [Column("transaction_id")]
    public int TransactionId { get; set; }

    [Required]
    [Column("amount", TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("transaction_type")]
    public string TransactionType { get; set; }  // e.g., transfer, deposit

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; }  // e.g., success, failed

    [Required]
    [Column("transaction_date")]
    public DateTime TransactionDate { get; set; }

    [Column("description", TypeName = "text")]
 
}
