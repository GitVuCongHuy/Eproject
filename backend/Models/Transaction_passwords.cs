using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



public class Transaction_passwords
{
    [Key]
    public int id { get; set; }

    [ForeignKey("Customer")]
    public int customer_id { get; set; }
    public Customer customer { get; set; }

    public int transaction_password { get; set; }
}