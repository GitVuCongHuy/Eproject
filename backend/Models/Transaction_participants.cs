using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("transaction_participants")]
public class Transaction_Participants
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

   
    [Column("transaction_id")]
    public int TransactionId { get; set; }
    [ForeignKey(nameof(TransactionId))] 
    public Transactions transactions { get; set; }

    [Column("account_id")]
    public int AccountId { get; set; }
    [ForeignKey(nameof(AccountId))] 
    public Accounts accounts { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("role")]
    public string Role { get; set; }  

}
