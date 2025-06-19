using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;




public class Login_attempts
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int id { get; set; }

    // [ForeignKey("Customer")]
    public int customer_id { get; set; }
    
    [ForeignKey(nameof(customer_id))] 
    public Customer customer { get; set; }

    public string device{ get; set; }
    
    public bool success { get; set; }
}