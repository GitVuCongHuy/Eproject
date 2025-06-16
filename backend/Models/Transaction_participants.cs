using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("transaction_participants")]
public class Transaction_Participants
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [ForeignKey("Transaction")]
    [Column("transaction_id")]
    public int TransactionId { get; set; }

    [ForeignKey("Account")]
    [Column("account_id")]
    public int AccountId { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("role")]
    public string Role { get; set; }  

}
