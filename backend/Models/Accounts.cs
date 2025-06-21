using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



public class Accounts
{
    [Key]
    public int account_id { get; set; }

    public int customer_id { get; set; }

    [ForeignKey("customer_id")]
    public Customer customer { get; set; }

    [Required]
    [StringLength(10, MinimumLength = 10)]
    public string CardNumber { get; set; }


    [Column(TypeName = "decimal(18,2)")]
    public decimal Balance { get; set; }

    [MaxLength(20)]
    public string Status { get; set; }
}
