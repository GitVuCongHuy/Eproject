using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


public class Customer
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int customer_id { get; set; }


    public int bank_id { get; set; }
    
    [ForeignKey(nameof(bank_id))] // hoặc "bank_id"
    public Bank bank { get; set; }


    

    [MaxLength(50)]
    public string username { get; set; }


    [Required] //không nulll
    public string password { get; set; }

    [MaxLength(100)]

    public string full_name { get; set; }

    [MaxLength(100)]
    [Required]
    public string email { get; set; }

    [MaxLength(15)]
    public string mobile { get; set; }

    public int number_login  { get; set; }

    public bool locked { get; set; }

    


}