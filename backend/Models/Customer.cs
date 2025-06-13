using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


public class Customer
{
    [Key]
    public int customer_id { get; set; }


    [ForeignKey("Bank")]
    public int bank_id  { get; set; }
    public Bank bank  { get; set; }
    
    [MaxLength(50)]
    public string username { get; set; }

    [MaxLength(50)] //vachar(50)
    [Required] //không nulll
    public string password { get; set; }

    [MaxLength(100)]
    
    public string full_name { get; set; }

    [MaxLength(100)]
    [Required] 
    public string email { get; set; }

    [MaxLength(15)]
    public string mobile { get; set; }

    public bool locked { get; set; }

}